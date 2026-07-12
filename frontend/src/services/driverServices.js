import api from "./api";

export const getDrivers = () => {
  return api.get("/drivers");
};

export const createDriver = (driverData) => {
  return api.post("/drivers", driverData);
};

export const updateDriver = (id, driverData) => {
  return api.put(`/drivers/${id}`, driverData);
};

export const deleteDriver = (id) => {
  return api.delete(`/drivers/${id}`);
};