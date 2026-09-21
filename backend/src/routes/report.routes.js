const express = require("express");

const router = express.Router();

const Vehicle = require("../models/vehicle.model.js");
const Driver = require("../models/driver.model.js");
const Trip = require("../models/trip.model.js");
const Maintenance = require("../models/maintenance.model.js");

const {
  fuelEfficiency,
  fleetUtilization,
  operationalCost,
  vehicleROI,
} = require("../controllers/analytics.controller.js");

const verifyJWT = require("../middlewares/auth.middleware.js");
const authorizeRoles = require("../middlewares/role.middleware.js");
const {
  validateObjectId,
} = require("../middlewares/validator.middleware.js");

// ANALYTICS

router.get(
  "/analytics/fuel-efficiency",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  fuelEfficiency
);

router.get(
  "/analytics/fuel-efficiency/:vehicleId",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  validateObjectId("vehicleId"),
  fuelEfficiency
);

router.get(
  "/analytics/fleet-utilization",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  fleetUtilization
);

router.get(
  "/analytics/operational-cost",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  operationalCost
);

router.get(
  "/analytics/vehicle-roi",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  vehicleROI
);

router.get(
  "/analytics/vehicle-roi/:vehicleId",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  validateObjectId("vehicleId"),
  vehicleROI
);

// DASHBOARD

router.get(
  "/",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  async (req, res) => {
    try {
      // -----------------------------
      // VEHICLES
      // -----------------------------

      const [
        activeVehicles,
        availableVehicles,
        maintenanceVehicles,
        retiredVehicles,
        totalVehicles,
      ] = await Promise.all([
        Vehicle.countDocuments({
          status: "OnTrip",
        }),

        Vehicle.countDocuments({
          status: "Available",
        }),

        Vehicle.countDocuments({
          status: "InShop",
        }),

        Vehicle.countDocuments({
          status: "Retired",
        }),

        Vehicle.countDocuments(),
      ]);

      // -----------------------------
      // TRIPS
      // -----------------------------

      const [
        activeTrips,
        pendingTrips,
      ] = await Promise.all([
        Trip.countDocuments({
          status: "Dispatched",
        }),

        Trip.countDocuments({
          status: "Draft",
        }),
      ]);

      // -----------------------------
      // DRIVERS
      // -----------------------------

      const driversOnDuty =
        await Driver.countDocuments({
          status: "OnTrip",
        });

      // -----------------------------
      // MAINTENANCE
      // -----------------------------

      const maintenancePending =
        await Maintenance.countDocuments({
          status: "InShop",
        });

      // -----------------------------
      // FLEET UTILIZATION
      // -----------------------------

      const operationalVehicles =
        availableVehicles +
        activeVehicles +
        maintenanceVehicles;

      const fleetUtilization =
        operationalVehicles > 0
          ? Number(
              (
                (activeVehicles /
                  operationalVehicles) *
                100
              ).toFixed(2)
            )
          : 0;

      // -----------------------------
      // RESPONSE
      // -----------------------------

      return res.status(200).json({
        success: true,
        message: "Dashboard stats fetched successfully",

        data: {
          totalVehicles,

          activeVehicles,

          availableVehicles,

          vehiclesInMaintenance:
            maintenanceVehicles,

          retiredVehicles,

          activeTrips,

          pendingTrips,

          driversOnDuty,

          maintenancePending,

          fleetUtilization,

          vehicleStatus: {
            active: activeVehicles,

            available: availableVehicles,

            maintenance:
              maintenanceVehicles,

            inactive: retiredVehicles,
          },
        },
      });
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch dashboard data",
        error: error.message,
      });
    }
  }
);

module.exports = router;