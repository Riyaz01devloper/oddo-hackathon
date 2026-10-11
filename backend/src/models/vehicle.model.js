const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    maxLoadCapacity: {
        type: Number,
        required: true,
        min: 0
    },
    odometer: {
        type: Number,
        required: true,
        min: 0
    },
    acquisitionCost: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Available', 'OnTrip', 'InShop', 'Retired'],
        default: 'Available',
        required: true,
        index: true
    }
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;