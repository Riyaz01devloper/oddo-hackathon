const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
        index: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
        index: true
    },
    cargoWeight: {
        type: Number,
        required: true,
        min: 0
    },
    plannedDistance: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft',
        index: true
    }
}, { timestamps: true });

tripSchema.index({ status: 1, createdAt: -1 });
tripSchema.index({ vehicle: 1, status: 1 });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;