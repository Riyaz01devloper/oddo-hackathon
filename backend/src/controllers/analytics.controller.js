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

// FUEL EFFICIENCY (km / Liter)
const fuelEfficiency = asyncHandler(async (req, res) => {
    const vehicleId = req.params.vehicleId || req.query.vehicleId;
    if (vehicleId && !mongoose.Types.ObjectId.isValid(vehicleId)) {
        throw new ApiError(400, 'Invalid vehicle id format');
    }

    const matchStage = vehicleId ? { vehicle: new mongoose.Types.ObjectId(vehicleId) } : {};

    const [totalDistanceResult, totalFuelResult] = await Promise.all([
        Trip.aggregate([
            {
                $match: {
                    ...matchStage,
                    status: "Completed"
                }
            },
            {
                $group: {
                    _id: null,
                    totalDistance: { $sum: "$plannedDistance" }
                }
            }
        ]),
        FuelLog.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalFuel: { $sum: "$liters" }
                }
            }
        ])
    ]);

    const distance = getAggregateTotal(totalDistanceResult, 'totalDistance');
    const fuel = getAggregateTotal(totalFuelResult, 'totalFuel');
    const efficiency = fuel === 0 ? 0 : Number((distance / fuel).toFixed(2));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                fuelEfficiency: efficiency,
                totalDistance: distance,
                totalFuelLiters: fuel,
                unit: "km/L"
            },
            "Fuel efficiency calculated successfully"
        )
    );
});

// FLEET UTILIZATION (%)
const fleetUtilization = asyncHandler(async (req, res) => {
    const statusCounts = await Vehicle.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    let totalVehicles = 0;
    let activeVehicles = 0;

    for (const item of statusCounts) {
        totalVehicles += item.count;
        if (item._id === "OnTrip") {
            activeVehicles = item.count;
        }
    }

    const utilization = totalVehicles === 0
        ? 0
        : Number(((activeVehicles / totalVehicles) * 100).toFixed(2));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                fleetUtilization: utilization,
                activeVehicles,
                totalVehicles
            },
            "Fleet utilization calculated successfully"
        )
    );
});

// OPERATIONAL COST (Fuel + Maintenance + Extra Expenses)
const operationalCost = asyncHandler(async (req, res) => {
    const [fuelCost, maintenanceCost, extraExpenseCost] = await Promise.all([
        FuelLog.aggregate([{ $group: { _id: null, fuelCost: { $sum: "$cost" } } }]),
        Maintenance.aggregate([{ $group: { _id: null, maintenanceCost: { $sum: "$cost" } } }]),
        Expense.aggregate([{ $group: { _id: null, extraExpenseCost: { $sum: "$amount" } } }])
    ]);

    const fuelTotal = getAggregateTotal(fuelCost, 'fuelCost');
    const maintenanceTotal = getAggregateTotal(maintenanceCost, 'maintenanceCost');
    const extraTotal = getAggregateTotal(extraExpenseCost, 'extraExpenseCost');
    const totalCost = fuelTotal + maintenanceTotal + extraTotal;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalCost,
                breakdown: {
                    fuelCost: fuelTotal,
                    maintenanceCost: maintenanceTotal,
                    extraExpenses: extraTotal
                },
                currency: "INR"
            },
            "Operational cost calculated successfully"
        )
    );
});

// VEHICLE ROI / CAPITAL RETENTION RATIO (%)
const vehicleROI = asyncHandler(async (req, res) => {
    const vehicleId = req.params.vehicleId || req.query.vehicleId;
    if (vehicleId && !mongoose.Types.ObjectId.isValid(vehicleId)) {
        throw new ApiError(400, 'Invalid vehicle id format');
    }

    const matchStage = vehicleId ? { vehicle: new mongoose.Types.ObjectId(vehicleId) } : {};
    const vehicleMatch = vehicleId ? { _id: new mongoose.Types.ObjectId(vehicleId) } : {};

    const [acquisition, fuelCost, maintenanceCost, extraExpenseCost] = await Promise.all([
        Vehicle.aggregate([
            { $match: vehicleMatch },
            { $group: { _id: null, totalAcquisition: { $sum: "$acquisitionCost" } } }
        ]),
        FuelLog.aggregate([
            { $match: matchStage },
            { $group: { _id: null, totalFuelCost: { $sum: "$cost" } } }
        ]),
        Maintenance.aggregate([
            { $match: matchStage },
            { $group: { _id: null, totalMaintenanceCost: { $sum: "$cost" } } }
        ]),
        Expense.aggregate([
            { $match: matchStage },
            { $group: { _id: null, extraExpenseCost: { $sum: "$amount" } } }
        ])
    ]);

    const investment = getAggregateTotal(acquisition, 'totalAcquisition');
    const cost =
        getAggregateTotal(fuelCost, 'totalFuelCost') +
        getAggregateTotal(maintenanceCost, 'totalMaintenanceCost') +
        getAggregateTotal(extraExpenseCost, 'extraExpenseCost');

    // Net capital retention ratio: (Investment - Operational Costs) / Investment * 100
    const roi = investment === 0 ? 0 : Number((((investment - cost) / investment) * 100).toFixed(2));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                vehicleROI: roi,
                totalAcquisitionCost: investment,
                totalOperationalCost: cost,
                metricNote: "Capital retention ratio based on acquisition cost minus operational overhead (fuel + maintenance + expenses)."
            },
            "Vehicle ROI calculated successfully"
        )
    );
});

// VEHICLE COSTS TABLE
const vehicleCosts = asyncHandler(async (req, res) => {
    const [vehicles, fuelCosts, maintenanceCosts, extraExpenses] = await Promise.all([
        Vehicle.find().select("name registrationNumber type").lean(),
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
            _id: vehicle._id,
            vehicle: vehicle.name || vehicle.registrationNumber,
            registrationNumber: vehicle.registrationNumber,
            type: vehicle.type,
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