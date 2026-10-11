import api from "./api";

export const getDriverHistory = (id) => api.get(`/drivers/${id}/history`);

export const getVehicleHistory = (id) => api.get(`/vehicles/${id}/history`);

export const getAuditLogs = (params) => api.get("/audit-logs", { params });

