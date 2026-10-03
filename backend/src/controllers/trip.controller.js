const Trip = require("../models/trip.model.js");
const Vehicle = require("../models/vehicle.model.js");
const Driver = require("../models/driver.model.js");

const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

// ============================================================
// GET ALL TRIPS
// ============================================================

const getAllTrips = asyncHandler(async (req, res) => {
    const trips = await Trip.find()
        .populate("vehicle", "registrationNumber name")
        .populate("driver", "name licenseNumber")
        .select("-__v")
        .sort({ _id: -1 })
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
            "All fields are required"
        );
    }

    if (Number(cargoWeight) <= 0) {
        throw new ApiError(
            400,
            "Cargo weight must be greater than 0"
        );
    }

    if (Number(plannedDistance) <= 0) {
        throw new ApiError(
            400,
            "Planned distance must be greater than 0"
        );
    }

    // Find vehicle
    const vehicleExists = await Vehicle.findById(vehicle);

    if (!vehicleExists) {
        throw new ApiError(
            404,
            "Vehicle not found"
        );
    }

    // Find driver
    const driverExists = await Driver.findById(driver);

    if (!driverExists) {
        throw new ApiError(
            404,
            "Driver not found"
        );
    }

    // Vehicle availability
    if (vehicleExists.status !== "Available") {
        throw new ApiError(
            400,
            "Vehicle is not available"
        );
    }

    // Driver availability
    if (driverExists.status !== "Available") {
        throw new ApiError(
            400,
            "Driver is not available"
        );
    }

    // Vehicle capacity
    if (
        Number(cargoWeight) >
        vehicleExists.maxLoadCapacity
    ) {
        throw new ApiError(
            400,
            "Cargo weight exceeds vehicle's maximum load capacity"
        );
    }

    // Driver license validity
    if (
        driverExists.licenseExpiry &&
        new Date(driverExists.licenseExpiry) < new Date()
    ) {
        throw new ApiError(
            400,
            "Driver's license has expired"
        );
    }

    // Create trip
    const trip = await Trip.create({
        source: source.trim(),
        destination: destination.trim(),
        vehicle,
        driver,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
        status: "Draft",
    });

    // Reserve vehicle
    vehicleExists.status = "OnTrip";
    await vehicleExists.save();

    // Reserve driver
    driverExists.status = "OnTrip";
    await driverExists.save();

    // Return populated trip
    const createdTrip = await Trip.findById(trip._id)
        .populate("vehicle", "registrationNumber name")
        .populate("driver", "name licenseNumber")
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

    // Find existing trip
    const trip = await Trip.findById(tripId);

    if (!trip) {
        throw new ApiError(
            404,
            "Trip not found"
        );
    }

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
            "All fields are required"
        );
    }

    if (Number(cargoWeight) <= 0) {
        throw new ApiError(
            400,
            "Cargo weight must be greater than 0"
        );
    }

    if (Number(plannedDistance) <= 0) {
        throw new ApiError(
            400,
            "Planned distance must be greater than 0"
        );
    }

    // Find new vehicle
    const vehicleExists = await Vehicle.findById(vehicle);

    if (!vehicleExists) {
        throw new ApiError(
            404,
            "Vehicle not found"
        );
    }

    // Find new driver
    const driverExists = await Driver.findById(driver);

    if (!driverExists) {
        throw new ApiError(
            404,
            "Driver not found"
        );
    }

    // Check capacity
    if (
        Number(cargoWeight) >
        vehicleExists.maxLoadCapacity
    ) {
        throw new ApiError(
            400,
            "Cargo weight exceeds vehicle's maximum load capacity"
        );
    }

    // Check license
    if (
        driverExists.licenseExpiry &&
        new Date(driverExists.licenseExpiry) < new Date()
    ) {
        throw new ApiError(
            400,
            "Driver's license has expired"
        );
    }

    const oldVehicleId = String(trip.vehicle);
    const oldDriverId = String(trip.driver);

    const newVehicleId = String(vehicle);
    const newDriverId = String(driver);

    // --------------------------------------------------------
    // Vehicle changed
    // --------------------------------------------------------

    if (oldVehicleId !== newVehicleId) {
        if (vehicleExists.status !== "Available") {
            throw new ApiError(
                400,
                "Selected vehicle is not available"
            );
        }

        const oldVehicle = await Vehicle.findById(
            trip.vehicle
        );

        if (oldVehicle) {
            oldVehicle.status = "Available";
            await oldVehicle.save();
        }

        vehicleExists.status = "OnTrip";
        await vehicleExists.save();
    }

    // --------------------------------------------------------
    // Driver changed
    // --------------------------------------------------------

    if (oldDriverId !== newDriverId) {
        if (driverExists.status !== "Available") {
            throw new ApiError(
                400,
                "Selected driver is not available"
            );
        }

        const oldDriver = await Driver.findById(
            trip.driver
        );

        if (oldDriver) {
            oldDriver.status = "Available";
            await oldDriver.save();
        }

        driverExists.status = "OnTrip";
        await driverExists.save();
    }

    // Update trip
    trip.source = source.trim();
    trip.destination = destination.trim();
    trip.vehicle = vehicle;
    trip.driver = driver;
    trip.cargoWeight = Number(cargoWeight);
    trip.plannedDistance = Number(plannedDistance);

    await trip.save();

    // Return populated trip
    const updatedTrip = await Trip.findById(tripId)
        .populate("vehicle", "registrationNumber name")
        .populate("driver", "name licenseNumber")
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
        throw new ApiError(
            404,
            "Trip not found"
        );
    }

    // Release vehicle
    const vehicle = await Vehicle.findById(
        trip.vehicle
    );

    if (
        vehicle &&
        vehicle.status === "OnTrip"
    ) {
        vehicle.status = "Available";
        await vehicle.save();
    }

    // Release driver
    const driver = await Driver.findById(
        trip.driver
    );

    if (
        driver &&
        driver.status === "OnTrip"
    ) {
        driver.status = "Available";
        await driver.save();
    }

    // Delete trip
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
        throw new ApiError(
            404,
            "Trip not found"
        );
    }

    if (trip.status !== "Draft") {
        throw new ApiError(
            400,
            "Only draft trips can be dispatched"
        );
    }

    trip.status = "Dispatched";

    await trip.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            trip,
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
        throw new ApiError(
            404,
            "Trip not found"
        );
    }

    if (trip.status !== "Dispatched") {
        throw new ApiError(
            400,
            "Only dispatched trips can be completed"
        );
    }

    // Find assigned vehicle
    const vehicle = await Vehicle.findById(
        trip.vehicle
    );

    // Find assigned driver
    const driver = await Driver.findById(
        trip.driver
    );

    // Release vehicle
    if (vehicle) {
        vehicle.status = "Available";
        await vehicle.save();
    }

    // Release driver
    if (driver) {
        driver.status = "Available";
        await driver.save();
    }

    // Complete trip
    trip.status = "Completed";

    await trip.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            trip,
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
        throw new ApiError(
            404,
            "Trip not found"
        );
    }

    if (
        trip.status === "Completed" ||
        trip.status === "Cancelled"
    ) {
        throw new ApiError(
            400,
            `Trip is already ${trip.status.toLowerCase()}`
        );
    }

    // Find assigned vehicle
    const vehicle = await Vehicle.findById(
        trip.vehicle
    );

    // Find assigned driver
    const driver = await Driver.findById(
        trip.driver
    );

    // Release vehicle
    if (vehicle) {
        vehicle.status = "Available";
        await vehicle.save();
    }

    // Release driver
    if (driver) {
        driver.status = "Available";
        await driver.save();
    }

    // Cancel trip
    trip.status = "Cancelled";

    await trip.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            trip,
            "Trip cancelled successfully"
        )
    );
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    getAllTrips,
    draftTrip,
    updateTrip,
    deleteTrip,
    dispatchTrip,
    finishTrip,
    cancelTrip,
};