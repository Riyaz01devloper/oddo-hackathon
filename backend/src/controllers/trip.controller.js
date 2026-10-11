const Trip = require("../models/trip.model.js");
const Vehicle = require("../models/vehicle.model.js");
const Driver = require("../models/driver.model.js");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

// ============================================================
// GET ALL TRIPS (with optional pagination & filtering)
// ============================================================

const getAllTrips = asyncHandler(async (req, res) => {
    const { page, limit, status, vehicleId, driverId } = req.query;

    const query = {};
    if (status && status !== "All") query.status = status;
    if (vehicleId) query.vehicle = vehicleId;
    if (driverId) query.driver = driverId;

    if (page) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const [trips, total] = await Promise.all([
            Trip.find(query)
                .populate("vehicle", "registrationNumber name type maxLoadCapacity")
                .populate("driver", "name licenseNumber phone safetyScore")
                .select("-__v")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Trip.countDocuments(query)
        ]);

        return res.status(200).json({
            statusCode: 200,
            success: true,
            data: trips,
            trips,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }

    const trips = await Trip.find(query)
        .populate("vehicle", "registrationNumber name type maxLoadCapacity")
        .populate("driver", "name licenseNumber phone safetyScore")
        .select("-__v")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            trips,
            "Trips fetched successfully"
        )
    );
});

// ============================================================
// GET TRIP BY ID
// ============================================================

const getTripById = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId)
        .populate("vehicle", "registrationNumber name type maxLoadCapacity")
        .populate("driver", "name licenseNumber phone safetyScore")
        .select("-__v")
        .lean();

    if (!trip) {
        throw new ApiError(404, "Trip not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            trip,
            "Trip fetched successfully"
        )
    );
});

// ============================================================
// CREATE / DRAFT TRIP
// ============================================================

const draftTrip = asyncHandler(async (req, res) => {
    const {
        source,
        destination,
        vehicle,
        driver,
        cargoWeight,
        plannedDistance,
    } = req.body;

    // Basic validation
    if (
        !source ||
        !destination ||
        !vehicle ||
        !driver ||
        cargoWeight === undefined ||
        plannedDistance === undefined
    ) {
        throw new ApiError(
            400,
            "All fields (source, destination, vehicle, driver, cargoWeight, plannedDistance) are required"
        );
    }

    const numCargo = Number(cargoWeight);
    const numDist = Number(plannedDistance);

    if (!Number.isFinite(numCargo) || numCargo <= 0) {
        throw new ApiError(400, "Cargo weight must be a number greater than 0");
    }

    if (!Number.isFinite(numDist) || numDist <= 0) {
        throw new ApiError(400, "Planned distance must be a number greater than 0");
    }

    // Find and validate vehicle
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
        throw new ApiError(404, "Vehicle not found");
    }

    if (vehicleExists.status !== "Available") {
        throw new ApiError(
            400,
            `Vehicle is currently ${vehicleExists.status}. Only 'Available' vehicles can be assigned.`
        );
    }

    // Vehicle capacity check
    if (numCargo > vehicleExists.maxLoadCapacity) {
        throw new ApiError(
            400,
            `Cargo weight (${numCargo} kg) exceeds vehicle's maximum load capacity (${vehicleExists.maxLoadCapacity} kg)`
        );
    }

    // Find and validate driver
    const driverExists = await Driver.findById(driver);
    if (!driverExists) {
        throw new ApiError(404, "Driver not found");
    }

    if (driverExists.status !== "Available") {
        throw new ApiError(
            400,
            `Driver is currently ${driverExists.status}. Only 'Available' drivers can be assigned.`
        );
    }

    // Driver license validity check
    if (
        driverExists.licenseExpiry &&
        new Date(driverExists.licenseExpiry) < new Date()
    ) {
        throw new ApiError(
            400,
            `Driver's license expired on ${new Date(driverExists.licenseExpiry).toLocaleDateString()}`
        );
    }

    // Create trip
    const trip = await Trip.create({
        source: String(source).trim(),
        destination: String(destination).trim(),
        vehicle,
        driver,
        cargoWeight: numCargo,
        plannedDistance: numDist,
        status: "Draft",
    });

    // Reserve vehicle and driver
    vehicleExists.status = "OnTrip";
    await vehicleExists.save();

    driverExists.status = "OnTrip";
    await driverExists.save();

    // Return populated trip
    const createdTrip = await Trip.findById(trip._id)
        .populate("vehicle", "registrationNumber name type maxLoadCapacity")
        .populate("driver", "name licenseNumber phone safetyScore")
        .select("-__v")
        .lean();

    return res.status(201).json(
        new ApiResponse(
            201,
            createdTrip,
            "Trip created successfully"
        )
    );
});

// ============================================================
// UPDATE TRIP
// ============================================================

const updateTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const {
        source,
        destination,
        vehicle,
        driver,
        cargoWeight,
        plannedDistance,
    } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
        throw new ApiError(404, "Trip not found");
    }

    // Business rule: Only draft trips can be edited
    if (trip.status !== "Draft") {
        throw new ApiError(
            400,
            `Only draft trips can be updated. Current status is ${trip.status}.`
        );
    }

    if (
        !source ||
        !destination ||
        !vehicle ||
        !driver ||
        cargoWeight === undefined ||
        plannedDistance === undefined
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const numCargo = Number(cargoWeight);
    const numDist = Number(plannedDistance);

    if (!Number.isFinite(numCargo) || numCargo <= 0) {
        throw new ApiError(400, "Cargo weight must be a number greater than 0");
    }

    if (!Number.isFinite(numDist) || numDist <= 0) {
        throw new ApiError(400, "Planned distance must be a number greater than 0");
    }

    const oldVehicleId = String(trip.vehicle);
    const oldDriverId = String(trip.driver);

    const newVehicleId = String(vehicle);
    const newDriverId = String(driver);

    // Validate new vehicle
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
        throw new ApiError(404, "Vehicle not found");
    }

    if (numCargo > vehicleExists.maxLoadCapacity) {
        throw new ApiError(
            400,
            `Cargo weight (${numCargo} kg) exceeds vehicle's maximum load capacity (${vehicleExists.maxLoadCapacity} kg)`
        );
    }

    // Validate new driver
    const driverExists = await Driver.findById(driver);
    if (!driverExists) {
        throw new ApiError(404, "Driver not found");
    }

    if (
        driverExists.licenseExpiry &&
        new Date(driverExists.licenseExpiry) < new Date()
    ) {
        throw new ApiError(400, "Driver's license has expired");
    }

    // Reassign vehicle if changed
    if (oldVehicleId !== newVehicleId) {
        if (vehicleExists.status !== "Available") {
            throw new ApiError(400, "Selected vehicle is not available");
        }

        const oldVehicle = await Vehicle.findById(trip.vehicle);
        if (oldVehicle && oldVehicle.status === "OnTrip") {
            oldVehicle.status = "Available";
            await oldVehicle.save();
        }

        vehicleExists.status = "OnTrip";
        await vehicleExists.save();
    }

    // Reassign driver if changed
    if (oldDriverId !== newDriverId) {
        if (driverExists.status !== "Available") {
            throw new ApiError(400, "Selected driver is not available");
        }

        const oldDriver = await Driver.findById(trip.driver);
        if (oldDriver && oldDriver.status === "OnTrip") {
            oldDriver.status = "Available";
            await oldDriver.save();
        }

        driverExists.status = "OnTrip";
        await driverExists.save();
    }

    // Update trip details
    trip.source = String(source).trim();
    trip.destination = String(destination).trim();
    trip.vehicle = vehicle;
    trip.driver = driver;
    trip.cargoWeight = numCargo;
    trip.plannedDistance = numDist;

    await trip.save();

    const updatedTrip = await Trip.findById(tripId)
        .populate("vehicle", "registrationNumber name type maxLoadCapacity")
        .populate("driver", "name licenseNumber phone safetyScore")
        .select("-__v")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTrip,
            "Trip updated successfully"
        )
    );
});

// ============================================================
// DELETE TRIP
// ============================================================

const deleteTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

    if (!trip) {
        throw new ApiError(404, "Trip not found");
    }

    // CRITICAL BUSINESS LOGIC: Only release resources if trip is ACTIVE (Draft or Dispatched).
    // If the trip was already Completed or Cancelled, resources were released previously,
    // and resetting vehicle/driver status would corrupt another active trip!
    if (trip.status === "Draft" || trip.status === "Dispatched") {
        const vehicle = await Vehicle.findById(trip.vehicle);
        if (vehicle && vehicle.status === "OnTrip") {
            vehicle.status = "Available";
            await vehicle.save();
        }

        const driver = await Driver.findById(trip.driver);
        if (driver && driver.status === "OnTrip") {
            driver.status = "Available";
            await driver.save();
        }
    }

    await Trip.findByIdAndDelete(tripId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Trip deleted successfully"
        )
    );
});

// ============================================================
// DISPATCH TRIP
// ============================================================

const dispatchTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

    if (!trip) {
        throw new ApiError(404, "Trip not found");
    }

    if (trip.status !== "Draft") {
        throw new ApiError(
            400,
            `Cannot dispatch trip with status '${trip.status}'. Only Draft trips can be dispatched.`
        );
    }

    trip.status = "Dispatched";
    await trip.save();

    const populatedTrip = await Trip.findById(tripId)
        .populate("vehicle", "registrationNumber name type maxLoadCapacity")
        .populate("driver", "name licenseNumber phone safetyScore")
        .select("-__v")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            populatedTrip,
            "Trip dispatched successfully"
        )
    );
});

// ============================================================
// COMPLETE TRIP
// ============================================================

const finishTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

    if (!trip) {
        throw new ApiError(404, "Trip not found");
    }

    if (trip.status !== "Dispatched") {
        throw new ApiError(
            400,
            `Cannot complete trip with status '${trip.status}'. Only Dispatched trips can be completed.`
        );
    }

    // Release vehicle
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle && vehicle.status === "OnTrip") {
        vehicle.status = "Available";
        await vehicle.save();
    }

    // Release driver
    const driver = await Driver.findById(trip.driver);
    if (driver && driver.status === "OnTrip") {
        driver.status = "Available";
        await driver.save();
    }

    trip.status = "Completed";
    await trip.save();

    const populatedTrip = await Trip.findById(tripId)
        .populate("vehicle", "registrationNumber name type maxLoadCapacity")
        .populate("driver", "name licenseNumber phone safetyScore")
        .select("-__v")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            populatedTrip,
            "Trip completed successfully"
        )
    );
});

// ============================================================
// CANCEL TRIP
// ============================================================

const cancelTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

    if (!trip) {
        throw new ApiError(404, "Trip not found");
    }

    if (trip.status === "Completed") {
        throw new ApiError(400, "Completed trips cannot be cancelled");
    }

    if (trip.status === "Cancelled") {
        throw new ApiError(400, "Trip is already cancelled");
    }

    // Release vehicle and driver if active
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle && vehicle.status === "OnTrip") {
        vehicle.status = "Available";
        await vehicle.save();
    }

    const driver = await Driver.findById(trip.driver);
    if (driver && driver.status === "OnTrip") {
        driver.status = "Available";
        await driver.save();
    }

    trip.status = "Cancelled";
    await trip.save();

    const populatedTrip = await Trip.findById(tripId)
        .populate("vehicle", "registrationNumber name type maxLoadCapacity")
        .populate("driver", "name licenseNumber phone safetyScore")
        .select("-__v")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            populatedTrip,
            "Trip cancelled successfully"
        )
    );
});

module.exports = {
    getAllTrips,
    getTripById,
    draftTrip,
    updateTrip,
    deleteTrip,
    dispatchTrip,
    finishTrip,
    cancelTrip,
};