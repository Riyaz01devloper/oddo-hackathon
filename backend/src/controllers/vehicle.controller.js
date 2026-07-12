const Vehicle = require("../models/vehicle.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

const registerVehicle = asyncHandler(async (req, res) => {
    const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost } = req.body;

    if(!registrationNumber || !name || !type || !maxLoadCapacity || !odometer || !acquisitionCost) {
        throw new ApiError(400, "All fields are required");
    }

    const vehicleExists = await Vehicle.findOne({ registrationNumber });
    if(vehicleExists) {
        throw new ApiError(400, "Vehicle with this registration number already exists");
    }

    const vehicle = await Vehicle.create({
        registrationNumber,
        name,
        type,
        maxLoadCapacity,
        odometer,
        acquisitionCost
    });
    
    return res.status(201).json(
        new ApiResponse(201, vehicle, "Vehicle registered successfully")
    );
});

const getAllVehicles = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find().select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, vehicles, "Vehicles fetched successfully")
    );
});

const getVehicleById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).select('-__v').lean();
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }
    return res.status(200).json(
        new ApiResponse(200, vehicle, "Vehicle fetched successfully")
    );
});

const getAvailableVehicles = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find({ status: 'Available' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, vehicles, "Available vehicles fetched successfully")
    );
});

const getOnTripVehicles = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find({ status: 'OnTrip' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, vehicles, "On-trip vehicles fetched successfully")
    );
});

const getInShopVehicles = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find({ status: 'InShop' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, vehicles, "In-shop vehicles fetched successfully")
    );
});

const getRetiredVehicles = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find({ status: 'Retired' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, vehicles, "Retired vehicles fetched successfully")
    );
});

const deleteVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }
    await Vehicle.findByIdAndDelete(id);
    return res.status(200).json(
        new ApiResponse(200, {}, "Vehicle deleted successfully")
    );
});

const updateVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    Object.assign(vehicle, updates);
    await vehicle.save();

    return res.status(200).json(
        new ApiResponse(200, vehicle, "Vehicle updated successfully")
    );
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
    updateVehicle
}