const Maintenance = require("../models/maintenance.model.js");
const Vehicle = require("../models/vehicle.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

// CREATE MAINTENANCE
const createMaintenance = asyncHandler(async (req, res) => {
  const { vehicle, issue, cost } = req.body;

  if (!vehicle || !issue || cost === undefined || cost === null) {
    throw new ApiError(
      400,
      "Vehicle, issue and cost are required"
    );
  }

  if (!Number.isFinite(Number(cost)) || Number(cost) < 0) {
    throw new ApiError(400, "Invalid maintenance cost");
  }

  const foundVehicle = await Vehicle.findById(vehicle);

  if (!foundVehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (foundVehicle.status === "Retired") {
    throw new ApiError(
      400,
      "Retired vehicle cannot be sent for maintenance"
    );
  }

  if (foundVehicle.status === "InShop") {
    throw new ApiError(
      400,
      "Vehicle is already in maintenance"
    );
  }

  const maintenance = await Maintenance.create({
    vehicle,
    issue: String(issue).trim(),
    cost: Number(cost),
  });

  foundVehicle.status = "InShop";
  await foundVehicle.save();

  const populatedMaintenance =
    await Maintenance.findById(maintenance._id)
      .populate("vehicle");

  return res.status(201).json(
    new ApiResponse(
      201,
      populatedMaintenance,
      "Maintenance created successfully"
    )
  );
});


// GET ALL MAINTENANCE
const getMaintenance = asyncHandler(async (req, res) => {
  const maintenance = await Maintenance.find()
    .populate("vehicle")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      maintenance,
      "Maintenance records fetched successfully"
    )
  );
});


// GET ONE MAINTENANCE
const getMaintenanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const maintenance =
    await Maintenance.findById(id).populate("vehicle");

  if (!maintenance) {
    throw new ApiError(
      404,
      "Maintenance record not found"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      maintenance,
      "Maintenance record fetched successfully"
    )
  );
});


// CLOSE MAINTENANCE
const closeMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const maintenance =
    await Maintenance.findById(id);

  if (!maintenance) {
    throw new ApiError(
      404,
      "Maintenance record not found"
    );
  }

  if (maintenance.status === "Closed") {
    throw new ApiError(
      400,
      "Maintenance is already closed"
    );
  }

  maintenance.status = "Closed";
  maintenance.closedAt = new Date();

  await maintenance.save();

  const vehicle =
    await Vehicle.findById(maintenance.vehicle);

  if (vehicle && vehicle.status !== "Retired") {
    vehicle.status = "Available";
    await vehicle.save();
  }

  const populatedMaintenance =
    await Maintenance.findById(maintenance._id)
      .populate("vehicle");

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedMaintenance,
      "Maintenance closed successfully"
    )
  );
});

module.exports = {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  closeMaintenance,
};