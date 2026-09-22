import { useState } from "react";
import styles from "./MaintenanceForm.module.css";

const initialForm = {
  vehicleId: "",
  serviceType: "",
  cost: "",
  date: "",
};

function formatDateForInput(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
}

function MaintenanceForm({
  record,
  vehicles = [],
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState(() => {
    if (!record) {
      return initialForm;
    }

    return {
      vehicleId:
        record.vehicle?._id ||
        record.vehicle ||
        record.vehicleId ||
        "",

      serviceType:
        record.issue ||
        record.serviceType ||
        "",

      cost: record.cost ?? "",

      date: formatDateForInput(
        record.openedAt || record.date
      ),
    };
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const vehicle = String(
      formData.vehicleId || ""
    ).trim();

    const issue = String(
      formData.serviceType || ""
    ).trim();

    const cost = Number(formData.cost);

    if (!vehicle) {
      alert("Please select a vehicle");
      return;
    }

    if (!issue) {
      alert("Please enter the maintenance issue");
      return;
    }

    if (
      formData.cost === "" ||
      !Number.isFinite(cost) ||
      cost < 0
    ) {
      alert("Please enter a valid cost");
      return;
    }

    onSave({
      vehicle,
      issue,
      cost,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
    >
      <div className={styles.header}>
        <h2>
          {record
            ? "Edit Maintenance"
            : "Add Maintenance"}
        </h2>

        <p>
          Record vehicle service details
        </p>
      </div>

      {/* VEHICLE */}
      <div className={styles.fieldGroup}>
        <label htmlFor="vehicleId">
          Vehicle
        </label>

        <select
          id="vehicleId"
          name="vehicleId"
          value={formData.vehicleId}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Vehicle
          </option>

          {vehicles.map((vehicle) => (
            <option
              key={vehicle._id}
              value={vehicle._id}
            >
              {vehicle.name ||
                vehicle.vehicleName ||
                vehicle.registrationNumber ||
                "Unnamed Vehicle"}
            </option>
          ))}
        </select>
      </div>

      {/* MAINTENANCE ISSUE */}
      <div className={styles.fieldGroup}>
        <label htmlFor="serviceType">
          Maintenance Issue
        </label>

        <input
          id="serviceType"
          type="text"
          name="serviceType"
          value={formData.serviceType}
          onChange={handleChange}
          placeholder="e.g. Engine servicing"
          required
        />
      </div>

      <div className={styles.row}>
        {/* COST */}
        <div className={styles.fieldGroup}>
          <label htmlFor="cost">
            Cost
          </label>

          <input
            id="cost"
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="₹ 5000"
            required
          />
        </div>

        {/* DATE */}
        <div className={styles.fieldGroup}>
          <label htmlFor="date">
            Date
          </label>

          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className={styles.saveButton}
        >
          {record
            ? "Update Maintenance"
            : "Save Maintenance"}
        </button>
      </div>
    </form>
  );
}

export default MaintenanceForm;