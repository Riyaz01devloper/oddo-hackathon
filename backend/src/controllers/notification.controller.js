const Driver = require("../models/driver.model.js");
const Vehicle = require("../models/vehicle.model.js");
const Trip = require("../models/trip.model.js");
const Maintenance = require("../models/maintenance.model.js");
const Notification = require("../models/notification.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Concurrently fetch operational conditions
    const [
        expiringDrivers,
        maintenanceVehicles,
        dispatchedTrips,
        lowSafetyDrivers,
        readRecords,
    ] = await Promise.all([
        Driver.find({ licenseExpiry: { $lte: thirtyDaysFromNow } })
            .select("name licenseNumber licenseExpiry status")
            .lean(),
        Maintenance.find({ status: "InShop" })
            .populate("vehicle", "name registrationNumber")
            .select("vehicle issue cost serviceDate")
            .lean(),
        Trip.find({ status: "Dispatched" })
            .populate("vehicle", "name registrationNumber")
            .populate("driver", "name phone")
            .select("vehicle driver source destination plannedDistance createdAt")
            .lean(),
        Driver.find({ safetyScore: { $lt: 75 } })
            .select("name licenseNumber safetyScore status")
            .lean(),
        Notification.find({ userId }).select("notificationId read").lean(),
    ]);

    const readMap = new Set(
        readRecords.filter((r) => r.read).map((r) => r.notificationId)
    );

    const notifications = [];

    // 1. License Expiry Notifications
    for (const d of expiringDrivers) {
        const expiry = new Date(d.licenseExpiry);
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        const isExpired = daysLeft <= 0;
        const id = `driver-license-${d._id}`;

        notifications.push({
            id,
            category: "LICENSE",
            severity: isExpired ? "CRITICAL" : daysLeft <= 7 ? "HIGH" : "MEDIUM",
            title: isExpired ? `License Expired: ${d.name}` : `License Expiring Soon: ${d.name}`,
            message: isExpired
                ? `Driver ${d.name}'s license (${d.licenseNumber}) expired ${Math.abs(daysLeft)} day(s) ago.`
                : `Driver ${d.name}'s license (${d.licenseNumber}) will expire in ${daysLeft} days.`,
            entityType: "Driver",
            entityId: d._id,
            timestamp: d.licenseExpiry,
            read: readMap.has(id),
            actionLink: "/drivers",
        });
    }

    // 2. Maintenance Notifications
    for (const m of maintenanceVehicles) {
        const id = `maintenance-inshop-${m._id}`;
        const vehicleName = m.vehicle?.name || "Vehicle";
        const regNo = m.vehicle?.registrationNumber || "";

        notifications.push({
            id,
            category: "MAINTENANCE",
            severity: "MEDIUM",
            title: `Vehicle In Shop: ${vehicleName}`,
            message: `${vehicleName} (${regNo}) is currently in maintenance. Issue: ${m.issue || "Scheduled service"}`,
            entityType: "Maintenance",
            entityId: m._id,
            timestamp: m.serviceDate || m.createdAt,
            read: readMap.has(id),
            actionLink: "/maintenance",
        });
    }

    // 3. Active Trips Dispatched
    for (const t of dispatchedTrips) {
        const id = `trip-active-${t._id}`;
        const driverName = t.driver?.name || "Unassigned";
        const vehicleName = t.vehicle?.name || "Vehicle";

        notifications.push({
            id,
            category: "TRIP",
            severity: "INFO",
            title: `Trip Dispatched: #${String(t._id).slice(-6)}`,
            message: `Trip to ${t.destination || "Destination"} is en route with ${driverName} in ${vehicleName}.`,
            entityType: "Trip",
            entityId: t._id,
            timestamp: t.createdAt,
            read: readMap.has(id),
            actionLink: "/trips",
        });
    }

    // 4. Low Safety Scores
    for (const s of lowSafetyDrivers) {
        const id = `driver-safety-${s._id}`;

        notifications.push({
            id,
            category: "SAFETY",
            severity: "HIGH",
            title: `Low Safety Score Alert: ${s.name}`,
            message: `Driver ${s.name} has a critical safety score of ${s.safetyScore}/100. Review driving history.`,
            entityType: "Driver",
            entityId: s._id,
            timestamp: s.updatedAt || now,
            read: readMap.has(id),
            actionLink: "/drivers",
        });
    }

    // Sort: unread first, then severity (CRITICAL > HIGH > MEDIUM > INFO), then timestamp descending
    const severityRank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, INFO: 1 };
    notifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        if (severityRank[b.severity] !== severityRank[a.severity]) {
            return severityRank[b.severity] - severityRank[a.severity];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notifications,
                total: notifications.length,
                unreadCount,
            },
            "Notifications retrieved successfully"
        )
    );
});

// PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    await Notification.findOneAndUpdate(
        { userId, notificationId: id },
        { $set: { read: true } },
        { upsert: true, new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, { id, read: true }, "Notification marked as read")
    );
});

// PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { notificationIds = [] } = req.body;

    const operations = notificationIds.map((id) => ({
        updateOne: {
            filter: { userId, notificationId: id },
            update: { $set: { read: true } },
            upsert: true,
        },
    }));

    if (operations.length > 0) {
        await Notification.bulkWrite(operations);
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications marked as read")
    );
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
};

