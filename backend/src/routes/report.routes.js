const express = require("express");
const router = express.Router();

const Vehicle = require("../models/vehicle.model.js");
const Driver = require("../models/driver.model.js");
const Trip = require("../models/trip.model.js");
const Maintenance = require("../models/maintenance.model.js");

const {
  fuelEfficiency,
  fleetUtilization,
  operationalCost,
  vehicleROI,
  vehicleCosts,
} = require("../controllers/analytics.controller.js");

const verifyJWT = require("../middlewares/auth.middleware.js");
const authorizeRoles = require("../middlewares/role.middleware.js");
const {
  validateObjectId,
} = require("../middlewares/validator.middleware.js");
const ApiResponse = require("../utils/ApiResponse.js");

// ANALYTICS ROLES
const analyticsRoles = [
  "Fleet Manager",
  "Safety Officer",
  "Financial Analyst",
  "Driver",
];

router.get(
  "/analytics/fuel-efficiency",
  verifyJWT,
  authorizeRoles(...analyticsRoles),
  fuelEfficiency
);

router.get(
  "/analytics/fuel-efficiency/:vehicleId",
  verifyJWT,
  authorizeRoles(...analyticsRoles),
  validateObjectId("vehicleId"),
  fuelEfficiency
);

router.get(
  "/analytics/fleet-utilization",
  verifyJWT,
  authorizeRoles(...analyticsRoles),
  fleetUtilization
);

router.get(
  "/analytics/operational-cost",
  verifyJWT,
  authorizeRoles(...analyticsRoles),
  operationalCost
);

router.get(
  "/analytics/vehicle-roi",
  verifyJWT,
  authorizeRoles(...analyticsRoles),
  vehicleROI
);

router.get(
  "/analytics/vehicle-roi/:vehicleId",
  verifyJWT,
  authorizeRoles(...analyticsRoles),
  validateObjectId("vehicleId"),
  vehicleROI
);

router.get(
  "/analytics/vehicle-costs",
  verifyJWT,
  authorizeRoles(...analyticsRoles),
  vehicleCosts
);

// DASHBOARD OVERVIEW (Optimized with parallel MongoDB aggregations)
router.get(
  "/",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  async (req, res) => {
    try {
      const [vehicleStats, tripStats, driversOnDuty, maintenancePending] = await Promise.all([
        // Single aggregation for all vehicle statuses
        Vehicle.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),

        // Single aggregation for all trip statuses
        Trip.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),

        // Active drivers on duty
        Driver.countDocuments({ status: "OnTrip" }),

        // Pending maintenance in shop
        Maintenance.countDocuments({ status: "InShop" })
      ]);

      // Map vehicle counts
      const vehicleMap = new Map(vehicleStats.map(item => [item._id, item.count]));
      const activeVehicles = vehicleMap.get("OnTrip") || 0;
      const availableVehicles = vehicleMap.get("Available") || 0;
      const maintenanceVehicles = vehicleMap.get("InShop") || 0;
      const retiredVehicles = vehicleMap.get("Retired") || 0;
      const totalVehicles = activeVehicles + availableVehicles + maintenanceVehicles + retiredVehicles;

      // Map trip counts
      const tripMap = new Map(tripStats.map(item => [item._id, item.count]));
      const activeTrips = tripMap.get("Dispatched") || 0;
      const pendingTrips = tripMap.get("Draft") || 0;

      // Fleet utilization: active operational vehicles / total operational vehicles
      const operationalVehicles = availableVehicles + activeVehicles + maintenanceVehicles;
      const utilization = operationalVehicles > 0
        ? Number(((activeVehicles / operationalVehicles) * 100).toFixed(2))
        : 0;

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            totalVehicles,
            activeVehicles,
            availableVehicles,
            vehiclesInMaintenance: maintenanceVehicles,
            retiredVehicles,
            activeTrips,
            pendingTrips,
            driversOnDuty,
            maintenancePending,
            fleetUtilization: utilization,
            vehicleStatus: {
              active: activeVehicles,
              available: availableVehicles,
              maintenance: maintenanceVehicles,
              inactive: retiredVehicles,
            },
          },
          "Dashboard stats fetched successfully"
        )
      );
    } catch (error) {
      console.error("Dashboard error:", error);
      return res.status(500).json({
        statusCode: 500,
        success: false,
        data: null,
        message: "Failed to fetch dashboard data",
        errors: [error.message],
      });
    }
  }
);

module.exports = router;