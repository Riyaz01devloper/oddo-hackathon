const Driver = require("../models/driver.model.js");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

/*
const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    licenseCategory: {
        type: String,
        required: true
    },
    licenseExpiry: {
        type: Date,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    safetyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    status: {
        type: String,
        enum: ['Available', 'OnTrip', 'OffDuty', 'Suspended'],
        default: 'Available',
        required: true
    }
})
*/

const registerDriver = async (req, res) => {
    const { name, licenseNumber, licenseCategory, licenseExpiry, phone, safetyScore } = req.body;

    if(!name || !licenseNumber || !licenseCategory || !licenseExpiry || !phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const driverExists = await Driver.findOne({ licenseNumber });
    if(driverExists) {
        return res.status(400).json({ message: "Driver with this license number already exists" });
    }

    const driver = await Driver.create({
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry,
        phone,
        safetyScore
    });
    return res.status(201).json({ message: "Driver registered successfully", driver });
}

const getAllDrivers = async (req, res) => {
    const drivers = await Driver.find().select('-__v').lean();
    return res.status(200).json({ message: "Drivers fetched successfully", drivers });
}

const getDriverById = async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findById(id).select('-__v').lean();
    if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
    }
    return res.status(200).json({ message: "Driver fetched successfully", driver });
}

const getAvailableDrivers = async (req, res) => {
    const availableDrivers = await Driver.find({ status: 'Available' }).select('-__v').lean();
    return res.status(200).json({ message: "Available drivers fetched successfully", availableDrivers });
}

const getOnTripDrivers = async (req, res) => {
    const onTripDrivers = await Driver.find({ status: 'OnTrip' }).select('-__v').lean();
    return res.status(200).json({ message: "On trip drivers fetched successfully", onTripDrivers });
}

const getOffDutyDrivers = async (req, res) => {
    const offDutyDrivers = await Driver.find({ status: 'OffDuty' }).select('-__v').lean();
    return res.status(200).json({ message: "Off duty drivers fetched successfully", offDutyDrivers });
}

const getSuspendedDrivers = async (req, res) => {
    const suspendedDrivers = await Driver.find({ status: 'Suspended' }).select('-__v').lean();
    return res.status(200).json({ message: "Suspended drivers fetched successfully", suspendedDrivers });
}

const deleteDriver = async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
    }
    return res.status(200).json({ message: "Driver deleted successfully" });
}

const updateDriver = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const driver = await Driver.findById(id);
    if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
    }

    Object.assign(driver, updates);
    await driver.save();

    return res.status(200).json({ message: "Driver updated successfully", driver });
}

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
}