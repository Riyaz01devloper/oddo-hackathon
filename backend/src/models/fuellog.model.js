const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
        index: true
    },

    liters: {
        type: Number,
        required: true,
        min: 0
    },

    cost: {
        type: Number,
        required: true,
        min: 0
    },

    date: {
        type: Date,
        default: Date.now,
        index: true
    },

    tolls: {
        type: Number,
        default: 0,
        min: 0
    },

    maintenance: {
        type: Number,
        default: 0,
        min: 0
    }

}, { timestamps: true });

fuelLogSchema.index({ vehicle: 1, date: -1 });

const FuelLog = mongoose.models.FuelLog || mongoose.model("FuelLog", fuelLogSchema);
module.exports = FuelLog;