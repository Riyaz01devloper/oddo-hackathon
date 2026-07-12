import api from "./api";

export const getVehicles = () => {
  return api.get("/vehicles");
};

export const createVehicle = (vehicleData) => {
  return api.post("/vehicles", vehicleData);
};

export const updateVehicle = (id, vehicleData) => {
  return api.put(`/vehicles/${id}`, vehicleData);
};

export const deleteVehicle = (id) => {
  return api.delete(`/vehicles/${id}`);
};