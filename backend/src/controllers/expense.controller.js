const Expense = require("../models/expense.model.js");
const Vehicle = require("../models/vehicle.model.js");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");


// Add Expense
const addExpense = asyncHandler(async (req, res) => {

    const { vehicle, type, amount, description } = req.body;

    if (!vehicle || !type || !amount) {
        throw new ApiError(400, "Vehicle, type and amount are required");
    }

    const existingVehicle = await Vehicle.findById(vehicle);

    if (!existingVehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    const expense = await Expense.create({
        vehicle,
        type,
        amount,
        description
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            expense,
            "Expense added successfully"
        )
    );

});


// Get All Expenses
const getAllExpenses = asyncHandler(async (req, res) => {

    const expenses = await Expense.find()
        .populate("vehicle", "registrationNumber name model");

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

    const expenses = await Expense.find({
        vehicle: vehicleId
    });

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