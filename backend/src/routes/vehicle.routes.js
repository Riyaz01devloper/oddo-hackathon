const express = require("express");
const router = express.Router();

const {
  registerVehicle,
  getAllVehicles,
  getVehicleById,
  getAvailableVehicles,
  getOnTripVehicles,
  getInShopVehicles,
  getRetiredVehicles,
  deleteVehicle,
  updateVehicle,
} = require("../controllers/vehicle.controller.js");

const verifyJWT = require("../middlewares/auth.middleware.js");
const authorizeRoles = require("../middlewares/role.middleware.js");

router.post(
  "/",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer"),
  registerVehicle
);

router.get(
  "/",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer", "Financial Analyst"),
  getAllVehicles
);

router.get(
  "/available",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer", "Financial Analyst"),
  getAvailableVehicles
);

router.get(
  "/on-trip",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer", "Financial Analyst"),
  getOnTripVehicles
);

router.get(
  "/in-shop",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer", "Financial Analyst"),
  getInShopVehicles
);

router.get(
  "/retired",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer", "Financial Analyst"),
  getRetiredVehicles
);

router.get(
  "/:id",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer", "Financial Analyst"),
  getVehicleById
);

router.put(
  "/:id",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer"),
  updateVehicle
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles("Fleet Manager", "Safety Officer"),
  deleteVehicle
);

module.exports = router;