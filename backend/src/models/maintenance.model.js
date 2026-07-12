const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    issue: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['InShop', 'Closed'],
        default: 'InShop',
        required: true
    },
    openedAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date
    }
})


const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;