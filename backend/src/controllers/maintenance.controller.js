const Maintenance = require("../models/maintenance.model.js");
const Vehicle = require("../models/vehicle.model.js");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

// =========================
// CREATE MAINTENANCE
// =========================
const createMaintenance = asyncHandler(async (req, res) => {
  const { vehicle, issue, cost } = req.body;

  if (
    !vehicle ||
    !issue ||
    cost === undefined ||
    cost === null
  ) {
    throw new ApiError(
      400,
      "Vehicle, issue and cost are required"
    );
  }

  const numCost = Number(cost);
  if (!Number.isFinite(numCost) || numCost < 0) {
    throw new ApiError(
      400,
      "Maintenance cost must be a non-negative number"
    );
  }

  const foundVehicle = await Vehicle.findById(vehicle);

  if (!foundVehicle) {
    throw new ApiError(
      404,
      "Vehicle not found"
    );
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

  // Prevent sending vehicles currently on a trip into maintenance
  if (foundVehicle.status === "OnTrip") {
    throw new ApiError(
      400,
      "Vehicle is currently on a trip. Complete or cancel the active trip before sending to maintenance."
    );
  }

  const maintenance = await Maintenance.create({
    vehicle,
    issue: String(issue).trim(),
    cost: numCost,
    status: "InShop",
    openedAt: new Date(),
  });

  foundVehicle.status = "InShop";
  await foundVehicle.save();

  const populatedMaintenance = await Maintenance.findById(
    maintenance._id
  ).populate("vehicle", "registrationNumber name type odometer status").lean();

  return res.status(201).json(
    new ApiResponse(
      201,
      populatedMaintenance,
      "Maintenance created successfully"
    )
  );
});

// =========================
// GET ALL MAINTENANCE (with optional pagination)
// =========================
const getMaintenance = asyncHandler(async (req, res) => {
  const { page, limit, status, vehicleId } = req.query;

  const query = {};
  if (status && status !== "All") query.status = status;
  if (vehicleId) query.vehicle = vehicleId;

  if (page) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [maintenance, total] = await Promise.all([
      Maintenance.find(query)
        .populate("vehicle", "registrationNumber name type odometer status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Maintenance.countDocuments(query),
    ]);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: maintenance,
      maintenance,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  const maintenance = await Maintenance.find(query)
    .populate("vehicle", "registrationNumber name type odometer status")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      maintenance,
      "Maintenance records fetched successfully"
    )
  );
});

// =========================
// GET ONE MAINTENANCE
// =========================
const getMaintenanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const maintenance = await Maintenance.findById(id)
    .populate("vehicle", "registrationNumber name type odometer status")
    .lean();

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

// =========================
// UPDATE MAINTENANCE
// =========================
const updateMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vehicle, issue, cost, status } = req.body;

  const maintenance = await Maintenance.findById(id);

  if (!maintenance) {
    throw new ApiError(
      404,
      "Maintenance record not found"
    );
  }

  if (cost !== undefined) {
    const numCost = Number(cost);
    if (!Number.isFinite(numCost) || numCost < 0) {
      throw new ApiError(
        400,
        "Invalid maintenance cost"
      );
    }
    maintenance.cost = numCost;
  }

  if (vehicle && String(vehicle) !== String(maintenance.vehicle)) {
    const foundVehicle = await Vehicle.findById(vehicle);

    if (!foundVehicle) {
      throw new ApiError(
        404,
        "Vehicle not found"
      );
    }

    if (foundVehicle.status === "Retired" || foundVehicle.status === "OnTrip") {
      throw new ApiError(
        400,
        `Cannot reassign to vehicle with status ${foundVehicle.status}`
      );
    }

    // Restore old vehicle to Available if active
    if (maintenance.status === "InShop") {
      const oldVehicle = await Vehicle.findById(maintenance.vehicle);
      if (oldVehicle && oldVehicle.status === "InShop") {
        oldVehicle.status = "Available";
        await oldVehicle.save();
      }

      foundVehicle.status = "InShop";
      await foundVehicle.save();
    }

    maintenance.vehicle = vehicle;
  }

  if (issue !== undefined) {
    maintenance.issue = String(issue).trim();
  }

  if (status !== undefined) {
    if (!["InShop", "Closed"].includes(status)) {
      throw new ApiError(
        400,
        "Invalid maintenance status. Must be 'InShop' or 'Closed'"
      );
    }

    maintenance.status = status;

    if (status === "Closed") {
      maintenance.closedAt = maintenance.closedAt || new Date();
    } else if (status === "InShop") {
      maintenance.closedAt = null;
    }
  }

  await maintenance.save();

  // Synchronize assigned vehicle status
  const updatedVehicle = await Vehicle.findById(maintenance.vehicle);
  if (updatedVehicle && updatedVehicle.status !== "Retired") {
    if (maintenance.status === "InShop") {
      updatedVehicle.status = "InShop";
    } else if (maintenance.status === "Closed" && updatedVehicle.status === "InShop") {
      updatedVehicle.status = "Available";
    }
    await updatedVehicle.save();
  }

  const populatedMaintenance = await Maintenance.findById(
    maintenance._id
  ).populate("vehicle", "registrationNumber name type odometer status").lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedMaintenance,
      "Maintenance updated successfully"
    )
  );
});

// =========================
// CLOSE MAINTENANCE
// =========================
const closeMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const maintenance = await Maintenance.findById(id);

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

  const vehicle = await Vehicle.findById(maintenance.vehicle);

  if (vehicle && vehicle.status === "InShop") {
    vehicle.status = "Available";
    await vehicle.save();
  }

  const populatedMaintenance = await Maintenance.findById(
    maintenance._id
  ).populate("vehicle", "registrationNumber name type odometer status").lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedMaintenance,
      "Maintenance closed successfully"
    )
  );
});

// =========================
// DELETE MAINTENANCE
// =========================
const deleteMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const maintenance = await Maintenance.findById(id);

  if (!maintenance) {
    throw new ApiError(
      404,
      "Maintenance record not found"
    );
  }

  // If active maintenance is deleted, make vehicle available again
  if (maintenance.status === "InShop") {
    const vehicle = await Vehicle.findById(maintenance.vehicle);

    if (vehicle && vehicle.status === "InShop") {
      vehicle.status = "Available";
      await vehicle.save();
    }
  }

  await Maintenance.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Maintenance record deleted successfully"
    )
  );
});

module.exports = {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
  closeMaintenance,
  deleteMaintenance,
};