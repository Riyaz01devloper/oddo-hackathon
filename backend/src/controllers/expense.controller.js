const Expense = require("../models/expense.model.js");
const Vehicle = require("../models/vehicle.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

const VALID_EXPENSE_TYPES = [
    "Toll",
    "Parking",
    "Repair",
    "Maintenance",
    "Insurance",
    "Other"
];

// Add Expense
const addExpense = asyncHandler(async (req, res) => {
    const { vehicle, type, amount, description } = req.body;

    if (!vehicle || !type || amount === undefined || amount === null) {
        throw new ApiError(400, "Vehicle, type, and amount are required");
    }

    if (!VALID_EXPENSE_TYPES.includes(type)) {
        throw new ApiError(400, `Invalid expense type. Must be one of: ${VALID_EXPENSE_TYPES.join(", ")}`);
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
        throw new ApiError(400, "Expense amount must be a number greater than 0");
    }

    const existingVehicle = await Vehicle.findById(vehicle);
    if (!existingVehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    const expense = await Expense.create({
        vehicle,
        type,
        amount: numAmount,
        description: description ? String(description).trim() : ""
    });

    const populatedExpense = await Expense.findById(expense._id)
        .populate("vehicle", "registrationNumber name type")
        .select("-__v")
        .lean();

    return res.status(201).json(
        new ApiResponse(
            201,
            populatedExpense,
            "Expense added successfully"
        )
    );
});

// Get All Expenses (with optional pagination)
const getAllExpenses = asyncHandler(async (req, res) => {
    const { page, limit, vehicleId, type } = req.query;

    const query = {};
    if (vehicleId) query.vehicle = vehicleId;
    if (type) query.type = type;

    if (page) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const [expenses, total] = await Promise.all([
            Expense.find(query)
                .populate("vehicle", "registrationNumber name type")
                .select("-__v")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Expense.countDocuments(query)
        ]);

        return res.status(200).json({
            statusCode: 200,
            success: true,
            data: expenses,
            expenses,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }

    const expenses = await Expense.find(query)
        .populate("vehicle", "registrationNumber name type")
        .select("-__v")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            expenses,
            "Expenses fetched successfully"
        )
    );
});

// Get Expenses By Vehicle
const getExpensesByVehicle = asyncHandler(async (req, res) => {
    const { vehicleId } = req.params;

    const expenses = await Expense.find({ vehicle: vehicleId })
        .populate("vehicle", "registrationNumber name type")
        .select("-__v")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            expenses,
            "Vehicle expenses fetched successfully"
        )
    );
});

// Delete Expense
const deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
        throw new ApiError(404, "Expense not found");
    }

    await Expense.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Expense deleted successfully"
        )
    );
});

module.exports = {
    addExpense,
    getAllExpenses,
    getExpensesByVehicle,
    deleteExpense
};