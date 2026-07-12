const Vehicle = require("../models/vehicle.model.js");

/*
const vehicleSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    maxLoadCapacity: {
        type: Number,
        required: true
    },
    odometer: {
        type: Number,
        required: true
    },
    acquisitionCost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'OnTrip', 'InShop', 'Retired'],
        default: 'Available',
        required: true
    }
})
*/

const registerVehicle = async (req, res) => {
    const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost } = req.body;

    if(!registrationNumber || !name || !type || !maxLoadCapacity || !odometer || !acquisitionCost) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const vehicleExists = await Vehicle.findOne({ registrationNumber });
    if(vehicleExists) {
        return res.status(400).json({ message: "Vehicle with this registration number already exists" });
    }

    const vehicle = await Vehicle.create({
        registrationNumber,
        name,
        type,
        maxLoadCapacity,
        odometer,
        acquisitionCost
    });
    return res.status(201).json({ message: "Vehicle registered successfully", vehicle });
}

const getAllVehicles = async (req, res) => {
    const vehicles = await Vehicle.find().select('-__v').lean();
    return res.status(200).json({ vehicles });
}

const getVehicleById = async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).select('-__v').lean();
    if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
    }
    return res.status(200).json({ vehicle });
}

const getAvailableVehicles = async (req, res) => {
    const vehicles = await Vehicle.find({ status: 'Available' }).select('-__v').lean();
    return res.status(200).json({ vehicles });
}

const getOnTripVehicles = async (req, res) => {
    const vehicles = await Vehicle.find({ status: 'OnTrip' }).select('-__v').lean();
    return res.status(200).json({ vehicles });
}

const getInShopVehicles = async (req, res) => {
    const vehicles = await Vehicle.find({ status: 'InShop' }).select('-__v').lean();
    return res.status(200).json({ vehicles });
}

const getRetiredVehicles = async (req, res) => {
    const vehicles = await Vehicle.find({ status: 'Retired' }).select('-__v').lean();
    return res.status(200).json({ vehicles });
}


const deleteVehicle = async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
    }
    await Vehicle.findByIdAndDelete(id);
    return res.status(200).json({ message: "Vehicle deleted successfully" });
}

module.exports = {
    registerVehicle,
    getAllVehicles,
    getVehicleById,
    getAvailableVehicles,
    getOnTripVehicles,
    getInShopVehicles,
    getRetiredVehicles,
    deleteVehicle
}