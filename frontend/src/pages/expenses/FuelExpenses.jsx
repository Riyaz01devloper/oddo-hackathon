import { useEffect, useMemo, useState } from "react";
import styles from "./FuelExpenses.module.css";

import FuelTable from "../../components/expenses/FuelTable/FuelTable";
import ExpenseTable from "../../components/expenses/ExpenseTable/ExpenseTable";
import FuelForm from "../../components/expenses/FuelForm/FuelForm";
import ExpenseForm from "../../components/expenses/ExpenseForm/ExpenseForm";

import { getVehicles } from "../../services/fleetService";

import {
  getFuelLogs,
  createFuelLog,
} from "../../services/fuelService"

import {
  getExpenses,
  createExpense,
  deleteExpense,
} from "../../services/expenseService"

function FuelExpenses() {
  const [activeTab, setActiveTab] = useState("fuel");

  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [search, setSearch] = useState("");

  const [fuelModal, setFuelModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [
        vehiclesResponse,
        fuelResponse,
        expenseResponse,
      ] = await Promise.all([
        getVehicles(),
        getFuelLogs(),
        getExpenses(),
      ]);

      const vehicleData =
        vehiclesResponse.data?.data ||
        vehiclesResponse.data?.vehicles ||
        [];

      const fuelData =
        fuelResponse.data?.data || [];

      const expenseData =
        expenseResponse.data?.data || [];

      setVehicles(
        Array.isArray(vehicleData) ? vehicleData : []
      );

      setFuelLogs(
        Array.isArray(fuelData) ? fuelData : []
      );

      setExpenses(
        Array.isArray(expenseData) ? expenseData : []
      );
    } catch (err) {
      console.error("Failed to load fuel and expenses:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load fuel and expense data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const filteredFuel = useMemo(() => {
    const query = search.toLowerCase().trim();

    return fuelLogs.filter((item) => {
      const vehicleName =
        item.vehicle?.name ||
        item.vehicle?.registrationNumber ||
        "";

      return vehicleName
        .toLowerCase()
        .includes(query);
    });
  }, [fuelLogs, search]);

  const filteredExpenses = useMemo(() => {
    const query = search.toLowerCase().trim();

    return expenses.filter((item) => {
      const vehicleName =
        item.vehicle?.name ||
        item.vehicle?.registrationNumber ||
        "";

      return vehicleName
        .toLowerCase()
        .includes(query);
    });
  }, [expenses, search]);

  const saveFuel = async (data) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        vehicle: data.vehicle || data.vehicleId,
        liters: Number(data.liters),
        cost: Number(data.cost),
        date: data.date || undefined,
      };

      await createFuelLog(payload);

      setFuelModal(false);

      await loadData();
    } catch (err) {
      console.error("Failed to add fuel log:", err);

      setError(
        err.response?.data?.message ||
          "Failed to add fuel log."
      );
    } finally {
      setSaving(false);
    }
  };

  const saveExpense = async (data) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        vehicle: data.vehicle || data.vehicleId,
        type: data.type || data.expenseType,
        amount: Number(data.amount),
        description: data.description || "",
      };

      await createExpense(payload);

      setExpenseModal(false);

      await loadData();
    } catch (err) {
      console.error("Failed to add expense:", err);

      setError(
        err.response?.data?.message ||
          "Failed to add expense."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteExpenseApi(id);

      await loadData();
    } catch (err) {
      console.error("Failed to delete expense:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete expense."
      );
    }
  };

  const openAddModal = () => {
    if (activeTab === "fuel") {
      setFuelModal(true);
    } else {
      setExpenseModal(true);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Fuel & Expenses</h1>

        <p>
          Track fuel logs and operational expenses.
        </p>

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        <div className={styles.topBar}>
          <div className={styles.tabs}>
            <button
              className={
                activeTab === "fuel"
                  ? styles.activeTab
                  : ""
              }
              onClick={() => setActiveTab("fuel")}
            >
              Fuel Logs
            </button>

            <button
              className={
                activeTab === "expense"
                  ? styles.activeTab
                  : ""
              }
              onClick={() => setActiveTab("expense")}
            >
              Expenses
            </button>
          </div>

          <button
            className={styles.addButton}
            onClick={openAddModal}
            disabled={saving}
          >
            Add
          </button>
        </div>

        <input
          className={styles.search}
          placeholder="Search by vehicle..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {loading ? (
          <div style={{ padding: "30px 0" }}>
            Loading...
          </div>
        ) : activeTab === "fuel" ? (
          <FuelTable
            logs={filteredFuel}
          />
        ) : (
          <ExpenseTable
            expenses={filteredExpenses}
            onDelete={handleDeleteExpense}
          />
        )}

        {fuelModal && (
          <FuelForm
            record={null}
            vehicles={vehicles}
            onSave={saveFuel}
            onCancel={() => setFuelModal(false)}
          />
        )}

        {expenseModal && (
          <ExpenseForm
            record={null}
            vehicles={vehicles}
            onSave={saveExpense}
            onCancel={() =>
              setExpenseModal(false)
            }
          />
        )}
      </div>
    </div>
  );
}

export default FuelExpenses;