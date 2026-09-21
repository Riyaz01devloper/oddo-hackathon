import api from "./api";

export const getFuelEfficiency = () =>
  api.get("/reports/analytics/fuel-efficiency");

export const getFleetUtilization = () =>
  api.get("/reports/analytics/fleet-utilization");

export const getOperationalCost = () =>
  api.get("/reports/analytics/operational-cost");

export const getVehicleROI = () =>
  api.get("/reports/analytics/vehicle-roi");

export const getVehicleFuelEfficiency = (vehicleId) =>
  api.get(`/reports/analytics/fuel-efficiency/${vehicleId}`);

export const getVehicleROIById = (vehicleId) =>
  api.get(`/reports/analytics/vehicle-roi/${vehicleId}`);