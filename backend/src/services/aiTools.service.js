const Vehicle = require('../models/vehicle.model.js');
const Driver = require('../models/driver.model.js');
const Trip = require('../models/trip.model.js');
const Maintenance = require('../models/maintenance.model.js');
const FuelLog = require('../models/fuellog.model.js');
const Expense = require('../models/expense.model.js');

/**
 * Server-side read-only functions for AI Fleet Copilot.
 * Strictly sanitized: no passwords, tokens, or arbitrary database queries.
 * Results are limited to max 25 items per query.
 */

// 1. Overall Fleet Summary
async function getFleetSummary() {
    const [vehicles, drivers, trips, maintenance] = await Promise.all([
        Vehicle.find().select('name registrationNumber status type maxLoadCapacity').lean(),
        Driver.find().select('name licenseNumber status safetyScore').lean(),
        Trip.find().select('status plannedDistance cargoWeight createdAt').lean(),
        Maintenance.find({ status: 'InShop' }).select('cost issue vehicle').lean()
    ]);

    const vehicleStatusCounts = vehicles.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
    }, {});

    const driverStatusCounts = drivers.reduce((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
    }, {});

    const tripStatusCounts = trips.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    return {
        totalVehicles: vehicles.length,
        vehiclesByStatus: vehicleStatusCounts,
        totalDrivers: drivers.length,
        driversByStatus: driverStatusCounts,
        totalTripsRecorded: trips.length,
        tripsByStatus: tripStatusCounts,
        activeMaintenanceCount: maintenance.length,
        sources: [
            { type: 'VehicleRegistry', count: vehicles.length },
            { type: 'DriverRegistry', count: drivers.length },
            { type: 'TripRegistry', count: trips.length }
        ]
    };
}

// 2. Available Vehicles
async function getAvailableVehicles() {
    const available = await Vehicle.find({ status: 'Available' })
        .select('name registrationNumber type maxLoadCapacity odometer')
        .limit(25)
        .lean();

    return {
        availableCount: available.length,
        vehicles: available,
        sources: available.map(v => ({ id: v._id, label: `${v.name} (${v.registrationNumber})` }))
    };
}

// 3. Vehicles currently on trips
async function getVehiclesOnTrips() {
    const activeTrips = await Trip.find({ status: 'Dispatched' })
        .populate('vehicle', 'name registrationNumber type')
        .populate('driver', 'name phone')
        .limit(25)
        .lean();

    return {
        onTripCount: activeTrips.length,
        activeTrips: activeTrips.map(t => ({
            tripId: t._id,
            vehicle: t.vehicle?.name,
            registration: t.vehicle?.registrationNumber,
            driver: t.driver?.name,
            source: t.source,
            destination: t.destination,
            cargoWeightKg: t.cargoWeight,
            dispatchedAt: t.createdAt
        })),
        sources: activeTrips.map(t => ({
            id: t._id,
            label: `Trip to ${t.destination} [${t.vehicle?.registrationNumber || 'N/A'}]`
        }))
    };
}

// 4. Vehicles in maintenance
async function getVehiclesInMaintenance() {
    const records = await Maintenance.find({ status: 'InShop' })
        .populate('vehicle', 'name registrationNumber')
        .limit(25)
        .lean();

    return {
        count: records.length,
        records: records.map(r => ({
            id: r._id,
            vehicle: r.vehicle?.name,
            registration: r.vehicle?.registrationNumber,
            issue: r.issue,
            cost: r.cost,
            serviceDate: r.serviceDate
        })),
        sources: records.map(r => ({
            id: r._id,
            label: `${r.vehicle?.name || 'Vehicle'} in shop (${r.issue || 'Service'})`
        }))
    };
}

// 5. Drivers with lowest safety scores
async function getDriversLowSafetyScores() {
    const drivers = await Driver.find()
        .sort({ safetyScore: 1 })
        .limit(10)
        .select('name licenseNumber safetyScore status phone')
        .lean();

    return {
        drivers,
        sources: drivers.map(d => ({ id: d._id, label: `${d.name} (Safety: ${d.safetyScore}/100)` }))
    };
}

// 6. License expirations approaching
async function getExpiringLicenses(days = 60) {
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const drivers = await Driver.find({ licenseExpiry: { $lte: threshold } })
        .sort({ licenseExpiry: 1 })
        .limit(25)
        .select('name licenseNumber licenseExpiry status phone')
        .lean();

    const formatted = drivers.map(d => {
        const daysLeft = Math.ceil((new Date(d.licenseExpiry) - now) / (1000 * 60 * 60 * 24));
        return {
            id: d._id,
            name: d.name,
            licenseNumber: d.licenseNumber,
            licenseExpiry: d.licenseExpiry,
            daysLeft,
            status: daysLeft <= 0 ? 'EXPIRED' : 'EXPIRING_SOON'
        };
    });

    return {
        count: formatted.length,
        drivers: formatted,
        sources: formatted.map(d => ({ id: d.id, label: `${d.name} (${d.daysLeft} days remaining)` }))
    };
}

// 7. Incomplete trips (Draft or Dispatched)
async function getIncompleteTrips() {
    const trips = await Trip.find({ status: { $in: ['Draft', 'Dispatched'] } })
        .populate('vehicle', 'name registrationNumber')
        .populate('driver', 'name')
        .sort({ createdAt: -1 })
        .limit(25)
        .lean();

    return {
        count: trips.length,
        trips: trips.map(t => ({
            id: t._id,
            status: t.status,
            source: t.source,
            destination: t.destination,
            vehicle: t.vehicle?.name,
            driver: t.driver?.name,
            cargoWeightKg: t.cargoWeight,
            plannedDistanceKm: t.plannedDistance,
            createdAt: t.createdAt
        })),
        sources: trips.map(t => ({ id: t._id, label: `Trip #${String(t._id).slice(-6)} [${t.status}]` }))
    };
}

// 8. Highest maintenance cost vehicles
async function getHighestMaintenanceCostVehicles() {
    const maintenanceCosts = await Maintenance.aggregate([
        {
            $group: {
                _id: "$vehicle",
                totalCost: { $sum: "$cost" },
                maintenanceCount: { $sum: 1 },
                issues: { $push: "$issue" }
            }
        },
        { $sort: { totalCost: -1 } },
        { $limit: 10 }
    ]);

    await Vehicle.populate(maintenanceCosts, { path: "_id", select: "name registrationNumber type status" });

    const formatted = maintenanceCosts
        .filter(m => m._id)
        .map(m => ({
            vehicleId: m._id._id,
            name: m._id.name,
            registration: m._id.registrationNumber,
            status: m._id.status,
            totalMaintenanceCost: m.totalCost,
            maintenanceCount: m.maintenanceCount,
            recentIssues: (m.issues || []).slice(0, 3)
        }));

    return {
        topVehicles: formatted,
        sources: formatted.map(v => ({ id: v.vehicleId, label: `${v.name} (Total: ₹${v.totalMaintenanceCost.toLocaleString('en-IN')})` }))
    };
}

// 9. Monthly Fuel & Operating Expenses comparison
async function getMonthlyFuelAndExpenses() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [currentFuel, prevFuel, currentExpenses, prevExpenses] = await Promise.all([
        FuelLog.aggregate([
            { $match: { date: { $gte: currentMonthStart } } },
            { $group: { _id: null, totalLiters: { $sum: "$liters" }, totalCost: { $sum: "$totalCost" }, count: { $sum: 1 } } }
        ]),
        FuelLog.aggregate([
            { $match: { date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
            { $group: { _id: null, totalLiters: { $sum: "$liters" }, totalCost: { $sum: "$totalCost" }, count: { $sum: 1 } } }
        ]),
        Expense.aggregate([
            { $match: { date: { $gte: currentMonthStart } } },
            { $group: { _id: null, totalCost: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]),
        Expense.aggregate([
            { $match: { date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
            { $group: { _id: null, totalCost: { $sum: "$amount" }, count: { $sum: 1 } } }
        ])
    ]);

    const curFuelCost = currentFuel[0]?.totalCost || 0;
    const prevFuelCost = prevFuel[0]?.totalCost || 0;
    const curExpCost = currentExpenses[0]?.totalCost || 0;
    const prevExpCost = prevExpenses[0]?.totalCost || 0;

    return {
        currentMonth: {
            month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
            fuelCost: curFuelCost,
            fuelLiters: currentFuel[0]?.totalLiters || 0,
            otherExpenses: curExpCost,
            totalOperatingCost: curFuelCost + curExpCost
        },
        previousMonth: {
            month: new Date(prevMonthStart).toLocaleString('default', { month: 'long', year: 'numeric' }),
            fuelCost: prevFuelCost,
            fuelLiters: prevFuel[0]?.totalLiters || 0,
            otherExpenses: prevExpCost,
            totalOperatingCost: prevFuelCost + prevExpCost
        },
        fuelDeltaPercentage: prevFuelCost > 0
            ? Math.round(((curFuelCost - prevFuelCost) / prevFuelCost) * 100)
            : 0,
        sources: [
            { label: 'FuelLog Aggregations' },
            { label: 'Expense Aggregations' }
        ]
    };
}

// 10. Drivers with most completed trips
async function getTopDriversByTrips() {
    const topDrivers = await Trip.aggregate([
        { $match: { status: 'Completed' } },
        {
            $group: {
                _id: "$driver",
                completedTrips: { $sum: 1 },
                totalDistance: { $sum: "$plannedDistance" },
                totalCargoKg: { $sum: "$cargoWeight" }
            }
        },
        { $sort: { completedTrips: -1 } },
        { $limit: 10 }
    ]);

    await Driver.populate(topDrivers, { path: "_id", select: "name licenseNumber safetyScore status phone" });

    const formatted = topDrivers
        .filter(d => d._id)
        .map(d => ({
            driverId: d._id._id,
            name: d._id.name,
            license: d._id.licenseNumber,
            safetyScore: d._id.safetyScore,
            status: d._id.status,
            completedTrips: d.completedTrips,
            totalDistanceKm: d.totalDistance,
            totalCargoKg: d.totalCargoKg
        }));

    return {
        topDrivers: formatted,
        sources: formatted.map(d => ({ id: d.driverId, label: `${d.name} (${d.completedTrips} trips)` }))
    };
}

module.exports = {
    getFleetSummary,
    getAvailableVehicles,
    getVehiclesOnTrips,
    getVehiclesInMaintenance,
    getDriversLowSafetyScores,
    getExpiringLicenses,
    getIncompleteTrips,
    getHighestMaintenanceCostVehicles,
    getMonthlyFuelAndExpenses,
    getTopDriversByTrips
};

