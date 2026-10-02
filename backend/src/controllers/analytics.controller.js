const mongoose = require('mongoose');
const Trip = require('../models/trip.model');
const FuelLog = require('../models/fuellog.model');
const Maintenance = require('../models/maintenance.model');
const Expense = require('../models/expense.model');
const Vehicle = require('../models/vehicle.model');
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

const getAggregateTotal = (result, field) => result?.[0]?.[field] ?? 0;

const fuelEfficiency = asyncHandler(async (req, res) => {
    const vehicleId = req.params.vehicleId || req.query.vehicleId;
    if (vehicleId && !mongoose.Types.ObjectId.isValid(vehicleId)) {
        throw new ApiError(400, 'Invalid vehicle id');
    }

    const matchStage = vehicleId ? { vehicle: new mongoose.Types.ObjectId(vehicleId) } : {};

    const totalDistance = await Trip.aggregate([
        {
            $match:{
                ...matchStage,
                status:"Completed"
            }
        },
        {
            $group:{
                _id:null,
                totalDistance:{
                    $sum:"$plannedDistance"
                }
            }
        }
    ])

    const totalFuel = await FuelLog.aggregate([
        {
            $match: matchStage
        },
        {
            $group:{
                _id:null,
                totalFuel:{
                    $sum:"$liters"
                }
            }
        }
    ]);

    const distance = getAggregateTotal(totalDistance, 'totalDistance');
    const fuel = getAggregateTotal(totalFuel, 'totalFuel');
    const fuelEfficiency = fuel === 0 ? 0 : distance / fuel;

    return res.status(200).json(
        new ApiResponse(200, { fuelEfficiency }, "Fuel efficiency calculated successfully")
    );
});

const fleetUtilization = asyncHandler(async (req, res) => {
    const totalVehicles = await Vehicle.countDocuments();

    const activeVehicles = await Vehicle.countDocuments({status:"OnTrip"});

    const fleetUtilization = totalVehicles === 0 ? 0 : (activeVehicles/totalVehicles)*100;

    return res.status(200).json(
        new ApiResponse(200, { fleetUtilization }, "Fleet utilization calculated successfully")
    );
});

const operationalCost = asyncHandler(async (req, res) => {
    const fuelCost = await FuelLog.aggregate([
        { $group:{ _id:null, fuelCost:{ $sum:"$cost" }}}
    ]);

    const maintenanceCost = await Maintenance.aggregate([
        { $group:{ _id:null, maintenanceCost:{ $sum:"$cost" }}}
    ]);

    const extraExpenseCost = await Expense.aggregate([
        { $group:{ _id:null, extraExpenseCost:{ $sum:"$amount" }}}
    ]);

    const totalCost =
        getAggregateTotal(fuelCost, 'fuelCost') +
        getAggregateTotal(maintenanceCost, 'maintenanceCost') +
        getAggregateTotal(extraExpenseCost, 'extraExpenseCost');

    return res.status(200).json(
        new ApiResponse(200, { totalCost }, "Operational cost calculated successfully")
    );
});

const vehicleROI = asyncHandler(async (req, res) => {
    const vehicleId = req.params.vehicleId || req.query.vehicleId;
    if (vehicleId && !mongoose.Types.ObjectId.isValid(vehicleId)) {
        throw new ApiError(400, 'Invalid vehicle id');
    }

    const matchStage = vehicleId ? { vehicle: new mongoose.Types.ObjectId(vehicleId) } : {};

    const vehicleMatch = vehicleId
        ? { _id: new mongoose.Types.ObjectId(vehicleId) }
        : {};

    const acquisition = await Vehicle.aggregate([
        { $match: vehicleMatch },
        { $group:{ _id:null, totalAcquisition:{ $sum:"$acquisitionCost" }}}
    ]);

    const fuelCost = await FuelLog.aggregate([
        { $match: matchStage },
        { $group:{ _id:null, totalFuelCost:{ $sum:"$cost" }}}
    ]);

    const maintenanceCost = await Maintenance.aggregate([
        { $match: matchStage },
        { $group:{ _id:null, totalMaintenanceCost:{ $sum:"$cost" }}}
    ]);

    const extraExpenseCost = await Expense.aggregate([
        { $match: matchStage },
        { $group:{ _id:null, extraExpenseCost:{ $sum:"$amount" }}}
    ]);

    const investment = getAggregateTotal(acquisition, 'totalAcquisition');
    const cost =
        getAggregateTotal(fuelCost, 'totalFuelCost') +
        getAggregateTotal(maintenanceCost, 'totalMaintenanceCost') +
        getAggregateTotal(extraExpenseCost, 'extraExpenseCost');
    const vehicleROI = investment === 0 ? 0 : ((investment - cost) / investment) * 100;

    return res.status(200).json(
        new ApiResponse(200, { vehicleROI }, "Vehicle ROI calculated successfully")
    );
});

const vehicleCosts = asyncHandler(async (req, res) => {
    const [vehicles, fuelCosts, maintenanceCosts, extraExpenses] = await Promise.all([
        Vehicle.find().select("name registrationNumber").lean(),
        FuelLog.aggregate([
            { $group: { _id: "$vehicle", fuelCost: { $sum: "$cost" } } }
        ]),
        Maintenance.aggregate([
            { $group: { _id: "$vehicle", maintenanceCost: { $sum: "$cost" } } }
        ]),
        Expense.aggregate([
            { $group: { _id: "$vehicle", extraCost: { $sum: "$amount" } } }
        ]),
    ]);

    const fuelMap = new Map(
        fuelCosts.map((item) => [String(item._id), item.fuelCost || 0])
    );
    const maintenanceMap = new Map(
        maintenanceCosts.map((item) => [String(item._id), item.maintenanceCost || 0])
    );
    const extraMap = new Map(
        extraExpenses.map((item) => [String(item._id), item.extraCost || 0])
    );

    const costs = vehicles.map((vehicle) => {
        const fuelCost = fuelMap.get(String(vehicle._id)) || 0;
        const maintenanceCost = maintenanceMap.get(String(vehicle._id)) || 0;
        const extraCost = extraMap.get(String(vehicle._id)) || 0;

        return {
            id: vehicle._id,
            vehicle: vehicle.name || vehicle.registrationNumber,
            fuelCost,
            maintenanceCost,
            extraCost,
            totalCost: fuelCost + maintenanceCost + extraCost,
        };
    });

    return res.status(200).json(
        new ApiResponse(200, costs, "Vehicle costs fetched successfully")
    );
});

module.exports = {
    fuelEfficiency,
    fleetUtilization,
    operationalCost,
    vehicleROI,
    vehicleCosts,
};