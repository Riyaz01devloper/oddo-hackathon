import { useEffect, useState } from "react";
import styles from "./ExpenseForm.module.css";

const EXPENSE_TYPES = [
  "Toll",
  "Parking",
  "Repair",
  "Maintenance",
  "Insurance",
  "Other",
];

const initialForm = {
  vehicleId: "",
  type: "",
  amount: "",
  date: "",
  description: "",
};

function getVehicleId(vehicle) {
  return vehicle?._id || vehicle?.id || "";
}

function getVehicleLabel(vehicle) {
  return (
    vehicle?.name ||
    vehicle?.vehicleName ||
    vehicle?.registrationNumber ||
    "Unnamed Vehicle"
  );
}

function ExpenseForm({ record, vehicles = [], onSave, onCancel }) {
  const [formData, setFormData] = useState(() => {
    if (record) {
      return {
        vehicleId: getVehicleId(record.vehicle) || record.vehicleId || "",
        type: record.type || record.expenseType || "",
        amount: record.amount ?? "",
        date: record.date || record.createdAt
          ? new Date(record.date || record.createdAt)
              .toISOString()
              .split("T")[0]
          : "",
        description: record.description || "",
      };
    }
    return initialForm;
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.vehicleId) {
      setFormError("Please select a vehicle.");
      return;
    }

    if (!formData.type) {
      setFormError("Please select an expense type.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError("Amount must be greater than 0.");
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        vehicle: formData.vehicleId,
        vehicleId: formData.vehicleId,
        type: formData.type,
        expenseType: formData.type,
        amount: Number(formData.amount),
        date: formData.date || new Date().toISOString().split("T")[0],
        description: formData.description?.trim() || "",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{record ? "Edit Expense" : "Add Expense"}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.group}>
            <label>Vehicle</label>

            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
            >
              <option value="">Select Vehicle</option>

              {vehicles.map((vehicle) => {
                const id = String(getVehicleId(vehicle));

                return (
                  <option key={id} value={id}>
                    {getVehicleLabel(vehicle)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className={styles.group}>
            <label>Expense Type</label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>

              {EXPENSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.group}>
            <label>Amount</label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className={styles.group}>
            <label>Date</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          {formError && (
            <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px", fontWeight: "500" }}>
              {formError}
            </div>
          )}

          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>

            <button type="submit" className={styles.save} disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
