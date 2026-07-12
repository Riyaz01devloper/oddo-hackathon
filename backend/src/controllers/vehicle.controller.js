const Vehicle = require("../models/vehicle.model.js");

// CREATE VEHICLE
const registerVehicle = async (req, res) => {
  try {
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
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const vehicleExists = await Vehicle.findOne({
      registrationNumber,
    });

    if (vehicleExists) {
      return res.status(400).json({
        message: "Vehicle with this registration number already exists",
      });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      name,
      type,
      maxLoadCapacity: Number(maxLoadCapacity),
      odometer: Number(odometer),
      acquisitionCost: Number(acquisitionCost),
      status,
    });

    return res.status(201).json({
      message: "Vehicle registered successfully",
      vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().select("-__v").lean();
    return res.status(200).json({ vehicles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET BY ID
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.status(200).json({ vehicle });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// AVAILABLE
const getAvailableVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ status: "Available" });
  return res.status(200).json({ vehicles });
};

// ON TRIP
const getOnTripVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ status: "OnTrip" });
  return res.status(200).json({ vehicles });
};

// IN SHOP
const getInShopVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ status: "InShop" });
  return res.status(200).json({ vehicles });
};

// RETIRED
const getRetiredVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ status: "Retired" });
  return res.status(200).json({ vehicles });
};

// UPDATE
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.status(200).json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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