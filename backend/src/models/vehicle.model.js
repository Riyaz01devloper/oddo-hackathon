const mongoose = require('mongoose');

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
    model: {
        type: String,
        required: true
    },
    // type: {
    //     type: String,
    //     required: true
    // },
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
        enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
        default: 'Available',
        required: true
    }
})

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;