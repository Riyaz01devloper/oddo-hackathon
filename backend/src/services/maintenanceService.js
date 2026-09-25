import api from "./api";

export const getMaintenance = () => {
  return api.get("/maintenance");
};

export const getMaintenanceById = (id) => {
  return api.get(`/maintenance/${id}`);
};

export const createMaintenance = (data) => {
  return api.post("/maintenance", data);
};

export const updateMaintenance = (id, data) => {
  return api.put(`/maintenance/${id}`, data);
};

export const closeMaintenance = (id) => {
  return api.patch(`/maintenance/${id}/close`);
};

export const deleteMaintenance = (id) => {
  return api.delete(`/maintenance/${id}`);
};