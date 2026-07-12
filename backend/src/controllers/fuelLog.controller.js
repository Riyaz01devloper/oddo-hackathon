const FuelLog = require("../models/fuellog.model.js");
const Vehicle = require("../models/vehicle.model.js");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");


// Add Fuel Log
const addFuelLog = asyncHandler(async (req, res) => {

    const { vehicle, liters, cost, date } = req.body;

    if (!vehicle || !liters || !cost) {
        throw new ApiError(400, "Vehicle, liters and cost are required");
    }

    const existingVehicle = await Vehicle.findById(vehicle);

    if (!existingVehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    const fuelLog = await FuelLog.create({
        vehicle,
        liters,
        cost,
        date
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            fuelLog,
            "Fuel log added successfully"
        )
    );

});


// Get All Fuel Logs
const getAllFuelLogs = asyncHandler(async (req, res) => {

    const fuelLogs = await FuelLog.find()
        .populate("vehicle", "registrationNumber name model");

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

    const fuelLogs = await FuelLog.find({
        vehicle: vehicleId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            fuelLogs,
            "Vehicle fuel logs fetched successfully"
        )
    );

});


module.exports = {
    addFuelLog,
    getAllFuelLogs,
    getFuelLogsByVehicle
};