const Vehicle = require("../models/vehicle.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

// CREATE VEHICLE
const registerVehicle = asyncHandler(async (req, res) => {
  const {
    registrationNumber,
    name,
    type,
    maxLoadCapacity,
    odometer,
    acquisitionCost,
    status = "Available",
  } = req.body;

  if (
    !registrationNumber ||
    !name ||
    !type ||
    maxLoadCapacity === undefined ||
    odometer === undefined ||
    acquisitionCost === undefined
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const cleanReg = String(registrationNumber).trim().toUpperCase();

  if (
    Number(maxLoadCapacity) < 0 ||
    Number(odometer) < 0 ||
    Number(acquisitionCost) < 0
  ) {
    throw new ApiError(400, "Capacity, odometer, and acquisition cost cannot be negative");
  }

  const vehicleExists = await Vehicle.findOne({
    registrationNumber: cleanReg,
  });

  if (vehicleExists) {
    throw new ApiError(409, "Vehicle with this registration number already exists");
  }

  const vehicle = await Vehicle.create({
    registrationNumber: cleanReg,
    name: String(name).trim(),
    type: String(type).trim(),
    maxLoadCapacity: Number(maxLoadCapacity),
    odometer: Number(odometer),
    acquisitionCost: Number(acquisitionCost),
    status,
  });

  return res.status(201).json({
    statusCode: 201,
    success: true,
    message: "Vehicle registered successfully",
    data: vehicle,
    vehicle,
  });
});

// GET ALL VEHICLES (with optional pagination)
const getAllVehicles = asyncHandler(async (req, res) => {
  const { page, limit, status, type } = req.query;

  const query = {};
  if (status && status !== "All") query.status = status;
  if (type && type !== "All") query.type = type;

  if (page) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Vehicle.countDocuments(query),
    ]);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: vehicles,
      vehicles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  const vehicles = await Vehicle.find(query).select("-__v").sort({ createdAt: -1 }).lean();
  return res.status(200).json({
    statusCode: 200,
    success: true,
    data: vehicles,
    vehicles,
  });
});

// GET BY ID
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).select("-__v").lean();

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  return res.status(200).json({
    statusCode: 200,
    success: true,
    data: vehicle,
    vehicle,
  });
});

// AVAILABLE
const getAvailableVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ status: "Available" }).select("-__v").lean();
  return res.status(200).json({
    statusCode: 200,
    success: true,
    data: vehicles,
    vehicles,
  });
});

// ON TRIP
const getOnTripVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ status: "OnTrip" }).select("-__v").lean();
  return res.status(200).json({
    statusCode: 200,
    success: true,
    data: vehicles,
    vehicles,
  });
});

// INSHOP
const getInShopVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ status: "InShop" }).select("-__v").lean();
  return res.status(200).json({
    statusCode: 200,
    success: true,
    data: vehicles,
    vehicles,
  });
});

// RETIRED
const getRetiredVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ status: "Retired" }).select("-__v").lean();
  return res.status(200).json({
    statusCode: 200,
    success: true,
    data: vehicles,
    vehicles,
  });
});

// UPDATE VEHICLE (with mass-assignment prevention and status transition guard)
const updateVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const {
    registrationNumber,
    name,
    type,
    maxLoadCapacity,
    odometer,
    acquisitionCost,
    status,
  } = req.body;

  // Validate registration uniqueness if changed
  if (registrationNumber) {
    const cleanReg = String(registrationNumber).trim().toUpperCase();
    if (cleanReg !== vehicle.registrationNumber) {
      const regExists = await Vehicle.findOne({
        registrationNumber: cleanReg,
        _id: { $ne: id },
      });
      if (regExists) {
        throw new ApiError(409, "Another vehicle with this registration number already exists");
      }
      vehicle.registrationNumber = cleanReg;
    }
  }

  if (name !== undefined) vehicle.name = String(name).trim();
  if (type !== undefined) vehicle.type = String(type).trim();

  if (maxLoadCapacity !== undefined) {
    if (Number(maxLoadCapacity) < 0) {
      throw new ApiError(400, "Maximum load capacity cannot be negative");
    }
    vehicle.maxLoadCapacity = Number(maxLoadCapacity);
  }

  if (odometer !== undefined) {
    if (Number(odometer) < 0) {
      throw new ApiError(400, "Odometer cannot be negative");
    }
    vehicle.odometer = Number(odometer);
  }

  if (acquisitionCost !== undefined) {
    if (Number(acquisitionCost) < 0) {
      throw new ApiError(400, "Acquisition cost cannot be negative");
    }
    vehicle.acquisitionCost = Number(acquisitionCost);
  }

  // Prevent conflicting status transitions
  if (status !== undefined && status !== vehicle.status) {
    const validStatuses = ["Available", "OnTrip", "InShop", "Retired"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    if (vehicle.status === "OnTrip" && (status === "Available" || status === "InShop")) {
      throw new ApiError(
        400,
        "Vehicle is currently on a trip. Complete or cancel the active trip to change status."
      );
    }

    if (vehicle.status === "InShop" && status === "OnTrip") {
      throw new ApiError(
        400,
        "Vehicle is currently undergoing maintenance. Close maintenance before dispatching on a trip."
      );
    }

    vehicle.status = status;
  }

  await vehicle.save();

  return res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Vehicle updated successfully",
    data: vehicle,
    vehicle,
  });
});

// DELETE VEHICLE
const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (vehicle.status === "OnTrip") {
    throw new ApiError(400, "Cannot delete a vehicle that is currently on a trip");
  }

  if (vehicle.status === "InShop") {
    throw new ApiError(400, "Cannot delete a vehicle that is currently undergoing maintenance");
  }

  await Vehicle.findByIdAndDelete(id);

  return res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Vehicle deleted successfully",
  });
});

module.exports = {
  registerVehicle,
  getAllVehicles,
  getVehicleById,
  getAvailableVehicles,
  getOnTripVehicles,
  getInShopVehicles,
  getRetiredVehicles,
  deleteVehicle,
  updateVehicle,
};