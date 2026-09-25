const express = require("express");

const router = express.Router();

const {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
  closeMaintenance,
  deleteMaintenance,
} = require("../controllers/maintenance.controller.js");

const verifyJWT = require("../middlewares/auth.middleware.js");
const authorizeRoles = require("../middlewares/role.middleware.js");

router.post(
  "/",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer"
  ),
  createMaintenance
);

router.get(
  "/",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  getMaintenance
);

router.get(
  "/:id",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer",
    "Financial Analyst"
  ),
  getMaintenanceById
);

router.put(
  "/:id",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer"
  ),
  updateMaintenance
);

router.patch(
  "/:id/close",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer"
  ),
  closeMaintenance
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles(
    "Fleet Manager",
    "Safety Officer"
  ),
  deleteMaintenance
);

module.exports = router;