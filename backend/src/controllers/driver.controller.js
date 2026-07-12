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

const registerDriver = asyncHandler(async (req, res) => {
    const { name, licenseNumber, licenseCategory, licenseExpiry, phone, safetyScore } = req.body;

    if(!name || !licenseNumber || !licenseCategory || !licenseExpiry || !phone) {
        throw new ApiError(400, "All fields are required");
    }

    const driverExists = await Driver.findOne({ licenseNumber });
    if(driverExists) {
        throw new ApiError(400, "Driver with this license number already exists");
    }

    const driver = await Driver.create({
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry,
        phone,
        safetyScore
    });
    return res.status(201).json(
        new ApiResponse(201, driver, "Driver registered successfully")
    );
});

const getAllDrivers = asyncHandler(async (req, res) => {
    const drivers = await Driver.find().select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, drivers, "Drivers fetched successfully")
    );
});

const getDriverById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findById(id).select('-__v').lean();
    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }
    return res.status(200).json(
        new ApiResponse(200, driver, "Driver fetched successfully")
    );
});

const getAvailableDrivers = asyncHandler(async (req, res) => {
    const availableDrivers = await Driver.find({ status: 'Available' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, availableDrivers, "Available drivers fetched successfully")
    );
});

const getOnTripDrivers = asyncHandler(async (req, res) => {
    const onTripDrivers = await Driver.find({ status: 'OnTrip' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, onTripDrivers, "On trip drivers fetched successfully")
    );
});

const getOffDutyDrivers = asyncHandler(async (req, res) => {
    const offDutyDrivers = await Driver.find({ status: 'OffDuty' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, offDutyDrivers, "Off duty drivers fetched successfully")
    );
});

const getSuspendedDrivers = asyncHandler(async (req, res) => {
    const suspendedDrivers = await Driver.find({ status: 'Suspended' }).select('-__v').lean();
    return res.status(200).json(
        new ApiResponse(200, suspendedDrivers, "Suspended drivers fetched successfully")
    );
});

const deleteDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "Driver deleted successfully")
    );
});

const updateDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const driver = await Driver.findById(id);
    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }

    Object.assign(driver, updates);
    await driver.save();

    return res.status(200).json(
        new ApiResponse(200, driver, "Driver updated successfully")
    );
});

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