import api from "./api";

export const getTrips = () => {
  return api.get("/trips");
};

export const createTrip = (tripData) => {
  return api.post("/trips", tripData);
};

export const dispatchTrip = (id) => {
  return api.patch(`/trips/${id}/dispatch`);
};

export const completeTrip = (id, data) => {
  return api.patch(`/trips/${id}/complete`, data);
};

export const cancelTrip = (id) => {
  return api.patch(`/trips/${id}/cancel`);
};