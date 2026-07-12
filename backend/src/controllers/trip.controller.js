const Trip = require("../models/trip.model.js");
const Vehicle = require("../models/vehicle.model.js");
const Driver = require("../models/driver.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

/*
const tripSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    cargoWeight: {
        type: Number,
        required: true
    },
    plannedDistance: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft'
    }
})
*/

const getAllTrips = asyncHandler(async (req, res) => {
    const trips = await Trip.find()
        .populate('vehicle', 'registrationNumber name')
        .populate('driver', 'name licenseNumber')
        .select('-__v')
        .lean();

    return res.status(200).json(
        new ApiResponse(200, trips, 'Trips fetched successfully')
    );
});

const draftTrip = asyncHandler(async (req, res) => {
    const { source, destination, vehicle, driver, cargoWeight, plannedDistance } = req.body;

    if (!source || !destination || !vehicle || !driver || !cargoWeight || !plannedDistance) {
        throw new ApiError(400, 'All fields are required');
    }

    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
        throw new ApiError(400, 'Vehicle not found');
    }

    const driverExists = await Driver.findById(driver);
    if (!driverExists) {
        throw new ApiError(400, 'Driver not found');
    }

    if (vehicleExists.status !== 'Available') {
        throw new ApiError(400, 'Vehicle is not available');
    }

    if (driverExists.status !== 'Available') {
        throw new ApiError(400, 'Driver is not available');
    }

    if (cargoWeight > vehicleExists.maxLoadCapacity) {
        throw new ApiError(400, 'Cargo weight exceeds vehicle\'s maximum load capacity');
    }

    if (driverExists.licenseExpiry < new Date()) {
        throw new ApiError(400, 'Driver\'s license has expired');
    }

    const trip = await Trip.create({
        source,
        destination,
        vehicle,
        driver,
        cargoWeight,
        plannedDistance
    });

    vehicleExists.status = 'OnTrip';
    await vehicleExists.save();

    driverExists.status = 'OnTrip';
    await driverExists.save();

    return res.status(201).json(
        new ApiResponse(201, trip, 'Trip created successfully')
    );
});

const dispatchTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new ApiError(404, 'Trip not found');
    }

    trip.status = 'Dispatched';
    await trip.save();

    return res.status(200).json(
        new ApiResponse(200, trip, 'Trip dispatched successfully')
    );
});

const finishTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new ApiError(404, 'Trip not found');
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    if (vehicle) {
        vehicle.status = 'Available';
        await vehicle.save();
    }

    if (driver) {
        driver.status = 'Available';
        await driver.save();
    }

    trip.status = 'Completed';
    await trip.save();

    return res.status(200).json(
        new ApiResponse(200, trip, 'Trip completed successfully')
    );
});

const cancelTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new ApiError(404, 'Trip not found');
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    if (vehicle) {
        vehicle.status = 'Available';
        await vehicle.save();
    }

    if (driver) {
        driver.status = 'Available';
        await driver.save();
    }

    trip.status = 'Cancelled';
    await trip.save();

    return res.status(200).json(
        new ApiResponse(200, trip, 'Trip cancelled successfully')
    );
});

module.exports = {
    getAllTrips,
    draftTrip,
    dispatchTrip,
    finishTrip,
    cancelTrip
};