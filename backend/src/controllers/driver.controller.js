const Driver = require("../models/driver.model.js");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// REGISTER DRIVER
const registerDriver = asyncHandler(async (req, res) => {
    const { name, licenseNumber, licenseCategory, licenseExpiry, phone, safetyScore = 100 } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiry || !phone) {
        throw new ApiError(400, "All fields (name, licenseNumber, licenseCategory, licenseExpiry, phone) are required");
    }

    const cleanLicense = String(licenseNumber).trim().toUpperCase();

    if (Number(safetyScore) < 0 || Number(safetyScore) > 100) {
        throw new ApiError(400, "Safety score must be between 0 and 100");
    }

    const driverExists = await Driver.findOne({ licenseNumber: cleanLicense });
    if (driverExists) {
        throw new ApiError(409, "Driver with this license number already exists");
    }

    const parsedExpiry = new Date(licenseExpiry);
    if (Number.isNaN(parsedExpiry.getTime())) {
        throw new ApiError(400, "Invalid license expiry date format");
    }

    const driver = await Driver.create({
        name: String(name).trim(),
        licenseNumber: cleanLicense,
        licenseCategory: String(licenseCategory).trim(),
        licenseExpiry: parsedExpiry,
        phone: String(phone).trim(),
        safetyScore: Number(safetyScore),
        status: "Available"
    });

    return res.status(201).json(
        new ApiResponse(201, driver, "Driver registered successfully")
    );
});

// GET ALL DRIVERS (with optional pagination)
const getAllDrivers = asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query;

    const query = {};
    if (status && status !== "All") query.status = status;

    if (page) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const [drivers, total] = await Promise.all([
            Driver.find(query).select('-__v').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            Driver.countDocuments(query)
        ]);

        return res.status(200).json({
            statusCode: 200,
            success: true,
            data: drivers,
            drivers,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }

    const drivers = await Driver.find(query).select('-__v').sort({ createdAt: -1 }).lean();
    return res.status(200).json(
        new ApiResponse(200, drivers, "Drivers fetched successfully")
    );
});

// GET DRIVER BY ID
const getDriverById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findById(id).select('-__v').lean();
    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }
    return res.status(200).json(
        new ApiResponse(200, driver, "Driver fetched successfully")
    );
});

// AVAILABLE DRIVERS
const getAvailableDrivers = asyncHandler(async (req, res) => {
    const availableDrivers = await Driver.find({ status: 'Available' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, availableDrivers, "Available drivers fetched successfully")
    );
});

// ON TRIP DRIVERS
const getOnTripDrivers = asyncHandler(async (req, res) => {
    const onTripDrivers = await Driver.find({ status: 'OnTrip' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, onTripDrivers, "On trip drivers fetched successfully")
    );
});

// OFF DUTY DRIVERS
const getOffDutyDrivers = asyncHandler(async (req, res) => {
    const offDutyDrivers = await Driver.find({ status: 'OffDuty' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, offDutyDrivers, "Off duty drivers fetched successfully")
    );
});

// SUSPENDED DRIVERS
const getSuspendedDrivers = asyncHandler(async (req, res) => {
    const suspendedDrivers = await Driver.find({ status: 'Suspended' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, suspendedDrivers, "Suspended drivers fetched successfully")
    );
});

// DELETE DRIVER
const deleteDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findById(id);
    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }

    if (driver.status === "OnTrip") {
        throw new ApiError(400, "Cannot delete a driver who is currently on a trip");
    }

    await Driver.findByIdAndDelete(id);
    return res.status(200).json(
        new ApiResponse(200, {}, "Driver deleted successfully")
    );
});

// UPDATE DRIVER (with mass-assignment prevention and status guard)
const updateDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findById(id);
    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }

    const { name, licenseNumber, licenseCategory, licenseExpiry, phone, safetyScore, status } = req.body;

    if (licenseNumber) {
        const cleanLicense = String(licenseNumber).trim().toUpperCase();
        if (cleanLicense !== driver.licenseNumber) {
            const licenseExists = await Driver.findOne({ licenseNumber: cleanLicense, _id: { $ne: id } });
            if (licenseExists) {
                throw new ApiError(409, "Another driver with this license number already exists");
            }
            driver.licenseNumber = cleanLicense;
        }
    }

    if (name !== undefined) driver.name = String(name).trim();
    if (licenseCategory !== undefined) driver.licenseCategory = String(licenseCategory).trim();
    if (phone !== undefined) driver.phone = String(phone).trim();

    if (licenseExpiry !== undefined) {
        const parsedExpiry = new Date(licenseExpiry);
        if (Number.isNaN(parsedExpiry.getTime())) {
            throw new ApiError(400, "Invalid license expiry date");
        }
        driver.licenseExpiry = parsedExpiry;
    }

    if (safetyScore !== undefined) {
        const score = Number(safetyScore);
        if (score < 0 || score > 100) {
            throw new ApiError(400, "Safety score must be between 0 and 100");
        }
        driver.safetyScore = score;
    }

    if (status !== undefined && status !== driver.status) {
        const validStatuses = ['Available', 'OnTrip', 'OffDuty', 'Suspended'];
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }

        if (driver.status === "OnTrip" && (status === "Available" || status === "OffDuty" || status === "Suspended")) {
            throw new ApiError(
                400,
                "Driver is currently on a trip. Complete or cancel the active trip before changing status."
            );
        }

        driver.status = status;
    }

    await driver.save();

    return res.status(200).json(
        new ApiResponse(200, driver, "Driver updated successfully")
    );
});

module.exports = {
    registerDriver,
    getAllDrivers,
    getDriverById,
    getAvailableDrivers,
    getOnTripDrivers,
    getOffDutyDrivers,
    getSuspendedDrivers,
    deleteDriver,
    updateDriver
};