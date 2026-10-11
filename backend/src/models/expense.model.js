const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
        index: true
    },

    type: {
        type: String,
        enum: [
            "Toll",
            "Parking",
            "Repair",
            "Maintenance",
            "Insurance",
            "Other"
        ],
        required: true,
        index: true
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

expenseSchema.index({ vehicle: 1, createdAt: -1 });

module.exports = mongoose.model("Expense", expenseSchema);