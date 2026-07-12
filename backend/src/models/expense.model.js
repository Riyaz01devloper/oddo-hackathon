const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({

    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
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
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    description: {
        type: String
    }

}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);