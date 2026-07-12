import api from "./api";

export const getMaintenanceRecords = () =>
  api.get("/maintenance");

export const createMaintenance = (data) =>
  api.post("/maintenance", data);

export const closeMaintenance = (id) =>
  api.patch(`/maintenance/${id}/close`);