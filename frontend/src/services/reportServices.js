import api from "./api";

export const getReports = () =>
  api.get("/reports");

export const getDashboardStats = () =>
  api.get("/dashboard");