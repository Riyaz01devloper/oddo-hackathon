const Trip = require("../models/trip.model.js");
const Vehicle = require("../models/vehicle.model.js");
const Driver = require("../models/driver.model.js");

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

const draftTrip = async (req, res) => {
    const { source, destination, vehicle, driver, cargoWeight, plannedDistance } = req.body;

    if(!source || !destination || !vehicle || !driver || !cargoWeight || !plannedDistance) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const vehicleExists = await Vehicle.findById(vehicle);
    if(!vehicleExists) {
        return res.status(400).json({ message: "Vehicle not found" });
    }

    const driverExists = await Driver.findById(driver);
    if(!driverExists) {
        return res.status(400).json({ message: "Driver not found" });
    }

    if(vehicleExists.status !== 'Available') {
        return res.status(400).json({ message: "Vehicle is not available" });
    }
    else if(driverExists.status !== 'Available') {
        return res.status(400).json({ message: "Driver is not available" });
    }
    else if(cargoWeight > vehicleExists.maxLoadCapacity) {
        return res.status(400).json({ message: "Cargo weight exceeds vehicle's maximum load capacity" });
    }
    else if(driverExists.licenseExpiry < new Date()) {
        return res.status(400).json({ message: "Driver's license has expired" });
    }
    else{
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

        res.status(201).json(trip);
    }
}

const dispatchTrip = async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if(!trip) {
        return res.status(404).json({ message: "Trip not found" });
    }

    trip.status = 'Dispatched';
    await trip.save();

    res.status(200).json({ message: "Trip dispatched successfully", trip });
}

const finishTrip = async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if(!trip) {
        return res.status(404).json({ message: "Trip not found" });
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    vehicle.status = 'Available';
    await vehicle.save();
    driver.status = 'Available';
    await driver.save();

    trip.status = 'Completed';
    await trip.save();

    return res.status(200).json({ message: "Trip completed successfully", trip });
}

const cancelTrip = async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if(!trip) {
        return res.status(404).json({ message: "Trip not found" });
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    vehicle.status = 'Available';
    await vehicle.save();
    driver.status = 'Available';
    await driver.save();

    trip.status = 'Cancelled';
    await trip.save();

    return res.status(200).json({ message: "Trip cancelled successfully", trip });
}

module.exports = {
    draftTrip,
    dispatchTrip,
    finishTrip,
    cancelTrip
}