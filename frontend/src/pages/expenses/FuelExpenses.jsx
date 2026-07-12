import { useMemo, useState } from "react";
import styles from "./FuelExpenses.module.css";

import FuelTable from "../../components/expenses/FuelTable/FuelTable";
import ExpenseTable from "../../components/expenses/ExpenseTable/ExpenseTable";
import FuelForm from "../../components/expenses/FuelForm/FuelForm";
import ExpenseForm from "../../components/expenses/ExpenseForm/ExpenseForm";

const vehicles = [
  { id: 1, vehicleName: "Tata Ace" },
  { id: 2, vehicleName: "Ashok Leyland" },
  { id: 3, vehicleName: "Mahindra Pickup" },
];

// TODO: GET /api/fuel
const initialFuelLogs = [
  {
    id: 1,
    vehicleId: 1,
    vehicleName: "Tata Ace",
    date: "2026-07-10",
    liters: 45,
    cost: 4700,
  },
  {
    id: 2,
    vehicleId: 2,
    vehicleName: "Ashok Leyland",
    date: "2026-07-12",
    liters: 70,
    cost: 7700,
  },
];

// TODO: GET /api/expenses
const initialExpenses = [
  {
    id: 1,
    vehicleId: 1,
    vehicleName: "Tata Ace",
    expenseType: "Toll",
    amount: 800,
    date: "2026-07-11",
  },
  {
    id: 2,
    vehicleId: 2,
    vehicleName: "Ashok Leyland",
    expenseType: "Parking",
    amount: 300,
    date: "2026-07-12",
  },
];

function FuelExpenses() {
  const [activeTab, setActiveTab] = useState("fuel");

  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs);
  const [expenses, setExpenses] = useState(initialExpenses);

  const [search, setSearch] = useState("");

  const [fuelModal, setFuelModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);

  const [editingFuel, setEditingFuel] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const filteredFuel = useMemo(() => {
    return fuelLogs.filter((item) =>
      item.vehicleName.toLowerCase().includes(search.toLowerCase())
    );
  }, [fuelLogs, search]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) =>
      item.vehicleName.toLowerCase().includes(search.toLowerCase())
    );
  }, [expenses, search]);

  function saveFuel(data) {
    if (editingFuel) {
      // TODO: PUT /api/fuel/:id

      setFuelLogs((prev) =>
        prev.map((item) =>
          item.id === editingFuel.id
            ? { ...data, id: editingFuel.id }
            : item
        )
      );
    } else {
      // TODO: POST /api/fuel

      setFuelLogs((prev) => [
        ...prev,
        {
          ...data,
          id: Date.now(),
        },
      ]);
    }

    setEditingFuel(null);
    setFuelModal(false);
  }

  function deleteFuel(id) {
    if (!window.confirm("Delete fuel log?")) return;

    // TODO: DELETE /api/fuel/:id

    setFuelLogs((prev) => prev.filter((item) => item.id !== id));
  }

  function saveExpense(data) {
    if (editingExpense) {
      // TODO: PUT /api/expenses/:id

      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingExpense.id
            ? { ...data, id: editingExpense.id }
            : item
        )
      );
    } else {
      // TODO: POST /api/expenses

      setExpenses((prev) => [
        ...prev,
        {
          ...data,
          id: Date.now(),
        },
      ]);
    }

    setEditingExpense(null);
    setExpenseModal(false);
  }

  function deleteExpense(id) {
    if (!window.confirm("Delete expense?")) return;

    // TODO: DELETE /api/expenses/:id

    setExpenses((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Fuel & Expenses</h1>

        <p>Track fuel logs and operational expenses.</p>

        <div className={styles.topBar}>
          <div className={styles.tabs}>
            <button
              className={
                activeTab === "fuel" ? styles.activeTab : ""
              }
              onClick={() => setActiveTab("fuel")}
            >
              Fuel Logs
            </button>

            <button
              className={
                activeTab === "expense" ? styles.activeTab : ""
              }
              onClick={() => setActiveTab("expense")}
            >
              Expenses
            </button>
          </div>

          <button
            className={styles.addButton}
            onClick={() => {
              if (activeTab === "fuel") {
                setEditingFuel(null);
                setFuelModal(true);
              } else {
                setEditingExpense(null);
                setExpenseModal(true);
              }
            }}
          >
            Add
          </button>
        </div>

        <input
          className={styles.search}
          placeholder="Search by vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {activeTab === "fuel" ? (
          <FuelTable
            logs={filteredFuel}
            onEdit={(item) => {
              setEditingFuel(item);
              setFuelModal(true);
            }}
            onDelete={deleteFuel}
          />
        ) : (
          <ExpenseTable
            expenses={filteredExpenses}
            onEdit={(item) => {
              setEditingExpense(item);
              setExpenseModal(true);
            }}
            onDelete={deleteExpense}
          />
        )}

        {fuelModal && (
          <FuelForm
            record={editingFuel}
            vehicles={vehicles}
            onSave={saveFuel}
            onCancel={() => {
              setEditingFuel(null);
              setFuelModal(false);
            }}
          />
        )}

        {expenseModal && (
          <ExpenseForm
            record={editingExpense}
            vehicles={vehicles}
            onSave={saveExpense}
            onCancel={() => {
              setEditingExpense(null);
              setExpenseModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default FuelExpenses;