import api from "./api";

export const getExpenses = () => {
  return api.get("/expenses");
};

export const getExpensesByVehicle = (vehicleId) => {
  return api.get(`/expenses/${vehicleId}`);
};

export const createExpense = (data) => {
  return api.post("/expenses", data);
};

export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`);
};