const Maintenance = require("../models/maintenance.model.js");
const Vehicle = require("../models/vehicle.model.js");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");


// Create Maintenance
const createMaintenance = asyncHandler(async (req, res) => {

    const { vehicle, issue, cost } = req.body;

    if (!vehicle || !issue || !cost) {
        throw new ApiError(400, "All fields are required");
    }

    const foundVehicle = await Vehicle.findById(vehicle);

    if (!foundVehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    if (foundVehicle.status === "Retired") {
        throw new ApiError(400, "Retired vehicle cannot be sent for maintenance");
    }

    if (foundVehicle.status === "In Shop") {
        throw new ApiError(400, "Vehicle is already in maintenance");
    }

    const maintenance = await Maintenance.create({
        vehicle,
        issue,
        cost
    });

    foundVehicle.status = "In Shop";
    await foundVehicle.save();

    return res.status(201).json(
        new ApiResponse(201, maintenance, "Maintenance created successfully")
    );

});



// Close Maintenance
const closeMaintenance = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const maintenance = await Maintenance.findById(id);

    if (!maintenance) {
        throw new ApiError(404, "Maintenance record not found");
    }

    maintenance.status = "Closed";
    maintenance.closedAt = new Date();

    await maintenance.save();

    const vehicle = await Vehicle.findById(maintenance.vehicle);

    if (vehicle && vehicle.status !== "Retired") {
        vehicle.status = "Available";
        await vehicle.save();
    }

    return res.status(200).json(
        new ApiResponse(200, maintenance, "Maintenance closed successfully")
    );

});


module.exports = {
    createMaintenance,
    closeMaintenance
};