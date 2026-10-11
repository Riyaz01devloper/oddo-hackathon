const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    licenseCategory: {
        type: String,
        required: true,
        trim: true
    },
    licenseExpiry: {
        type: Date,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
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
        required: true,
        index: true
    }
}, { timestamps: true });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;