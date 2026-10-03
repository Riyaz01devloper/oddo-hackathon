import api from "./api";

export const getTrips = () =>
    api.get("/trips");

export const getTripById = (id) =>
    api.get(`/trips/${id}`);

export const createTrip = (data) =>
    api.post("/trips", data);

export const updateTrip = (id, data) =>
    api.put(`/trips/${id}`, data);

export const deleteTrip = (id) =>
    api.delete(`/trips/${id}`);

export const dispatchTrip = (id) =>
    api.patch(`/trips/${id}/dispatch`);

export const completeTrip = (id) =>
    api.patch(`/trips/${id}/complete`);

export const cancelTrip = (id) =>
    api.patch(`/trips/${id}/cancel`);