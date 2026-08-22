const express = require("express");

const {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  closeMaintenance,
} = require("../controllers/maintenance.controller.js");

const router = express.Router();

router
  .route("/")
  .get(getMaintenance)
  .post(createMaintenance);

router.get("/:id", getMaintenanceById);

router.patch("/:id/close", closeMaintenance);

module.exports = router;