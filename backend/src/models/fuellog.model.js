const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({

    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },

    liters: {
        type: Number,
        required: true
    },

    cost: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

const FuelLog = mongoose.model("FuelLog", fuelLogSchema);
module.exports = FuelLog;