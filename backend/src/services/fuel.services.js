import api from "./api";

export const getFuelLogs = () => {
  return api.get("/fuel-logs");
};

export const getFuelLogsByVehicle = (vehicleId) => {
  return api.get(`/fuel-logs/${vehicleId}`);
};

export const createFuelLog = (data) => {
  return api.post("/fuel-logs", data);
};