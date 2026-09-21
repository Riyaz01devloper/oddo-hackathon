import api from "./api";

export const getFuelLogs = () => api.get("/fuel-logs");

export const createFuelLog = (data) =>
  api.post("/fuel-logs", data);

export const updateFuelLog = (id, data) =>
  api.put(`/fuel-logs/${id}`, data);

export const deleteFuelLog = (id) =>
  api.delete(`/fuel-logs/${id}`);