const FuelLog = require("../models/fuellog.model.js");
const Vehicle = require("../models/vehicle.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

// Add Fuel Log
const addFuelLog = asyncHandler(async (req, res) => {
    const { vehicle, liters, cost, date } = req.body;

    if (!vehicle || liters === undefined || cost === undefined) {
        throw new ApiError(400, "Vehicle, liters and cost are required");
    }

    const numLiters = Number(liters);
    const numCost = Number(cost);

    if (!Number.isFinite(numLiters) || numLiters <= 0) {
        throw new ApiError(400, "Fuel liters must be a number greater than 0");
    }

    if (!Number.isFinite(numCost) || numCost <= 0) {
        throw new ApiError(400, "Fuel cost must be a number greater than 0");
    }

    const existingVehicle = await Vehicle.findById(vehicle);
    if (!existingVehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    let parsedDate = Date.now();
    if (date) {
        const d = new Date(date);
        if (!Number.isNaN(d.getTime())) {
            parsedDate = d;
        }
    }

    const fuelLog = await FuelLog.create({
        vehicle,
        liters: numLiters,
        cost: numCost,
        date: parsedDate
    });

    const populated = await FuelLog.findById(fuelLog._id)
        .populate("vehicle", "registrationNumber name type")
        .select("-__v")
        .lean();

    return res.status(201).json(
        new ApiResponse(
            201,
            populated,
            "Fuel log added successfully"
        )
    );
});

// Get All Fuel Logs (with optional pagination)
const getAllFuelLogs = asyncHandler(async (req, res) => {
    const { page, limit, vehicleId } = req.query;

    const query = {};
    if (vehicleId) query.vehicle = vehicleId;

    if (page) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const [fuelLogs, total] = await Promise.all([
            FuelLog.find(query)
                .populate("vehicle", "registrationNumber name type")
                .select("-__v")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            FuelLog.countDocuments(query)
        ]);

        return res.status(200).json({
            statusCode: 200,
            success: true,
            data: fuelLogs,
            fuelLogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }

    const fuelLogs = await FuelLog.find(query)
        .populate("vehicle", "registrationNumber name type")
        .select("-__v")
        .sort({ date: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            fuelLogs,
            "Fuel logs fetched successfully"
        )
    );
});

// Get Fuel Logs of One Vehicle
const getFuelLogsByVehicle = asyncHandler(async (req, res) => {
    const { vehicleId } = req.params;

    const fuelLogs = await FuelLog.find({ vehicle: vehicleId })
        .populate("vehicle", "registrationNumber name type")
        .select("-__v")
        .sort({ date: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            fuelLogs,
            "Vehicle fuel logs fetched successfully"
        )
    );
});

// Delete Fuel Log
const deleteFuelLog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const fuelLog = await FuelLog.findById(id);
    if (!fuelLog) {
        throw new ApiError(404, "Fuel log not found");
    }

    await FuelLog.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Fuel log deleted successfully"
        )
    );
});

module.exports = {
    addFuelLog,
    getAllFuelLogs,
    getFuelLogsByVehicle,
    deleteFuelLog
};