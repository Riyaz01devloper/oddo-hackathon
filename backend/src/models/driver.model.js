const mongoose = require('mongoose');

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
        enum: ['Available', 'On Trip', 'Off Duty', 'Retired'],
        default: 'Available',
        required: true
    }
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;