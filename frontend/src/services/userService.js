import api from "./api";

export const getProfile = () => api.get("/users/me");

export const updateProfile = (data) => api.patch("/users/me", data);

export const changePassword = (data) => api.patch("/users/me/password", data);

export const getUsers = (params) => api.get("/users", { params });

