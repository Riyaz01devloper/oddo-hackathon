const mongoose = require('mongoose');
const Trip = require('../models/trip.model');
const FuelLog = require('../models/fuellog.model');
const Maintenance = require('../models/maintenance.model');
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

    const totalCost = getAggregateTotal(fuelCost, 'fuelCost') + getAggregateTotal(maintenanceCost, 'maintenanceCost');

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

    const totalRevenue = await Trip.aggregate([
        { $match: matchStage },
        { $group:{ _id:null, totalRevenue:{ $sum:"$fare" }}}
    ]);

    const fuelCost = await FuelLog.aggregate([
        { $match: matchStage },
        { $group:{ _id:null, totalFuelCost:{ $sum:"$cost" }}}
    ]);

    const maintenanceCost = await Maintenance.aggregate([
        { $match: matchStage },
        { $group:{ _id:null, totalMaintenanceCost:{ $sum:"$cost" }}}
    ]);

    const revenue = getAggregateTotal(totalRevenue, 'totalRevenue');
    const cost = getAggregateTotal(fuelCost, 'totalFuelCost') + getAggregateTotal(maintenanceCost, 'totalMaintenanceCost');
    const vehicleROI = cost === 0 ? 0 : ((revenue - cost) / cost) * 100;

    return res.status(200).json(
        new ApiResponse(200, { vehicleROI }, "Vehicle ROI calculated successfully")
    );
});

module.exports = {
    fuelEfficiency,
    fleetUtilization,
    operationalCost,
    vehicleROI
};