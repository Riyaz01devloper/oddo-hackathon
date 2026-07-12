import api from "./api";

export const getExpenses = () => api.get("/expenses");

export const createExpense = (data) =>
  api.post("/expenses", data);