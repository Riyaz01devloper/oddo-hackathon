import { useEffect, useState } from "react";
import styles from "./FuelForm.module.css";

const initialForm = {
  vehicleId: "",
  date: "",
  liters: "",
  cost: "",
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

function FuelForm({ record, vehicles = [], onSave, onCancel }) {
  const [formData, setFormData] = useState(() => {
    if (record) {
      return {
        vehicleId: getVehicleId(record.vehicle) || record.vehicleId || "",
        date: record.date
          ? new Date(record.date).toISOString().split("T")[0]
          : "",
        liters: record.liters ?? "",
        cost: record.cost ?? "",
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

    if (!formData.liters || Number(formData.liters) <= 0) {
      setFormError("Liters must be greater than 0.");
      return;
    }

    if (!formData.cost || Number(formData.cost) <= 0) {
      setFormError("Cost must be greater than 0.");
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        vehicle: formData.vehicleId,
        vehicleId: formData.vehicleId,
        date: formData.date || new Date().toISOString().split("T")[0],
        liters: Number(formData.liters),
        cost: Number(formData.cost),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{record ? "Edit Fuel Log" : "Add Fuel Log"}</h2>

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
            <label>Date</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Liters</label>

            <input
              type="number"
              name="liters"
              value={formData.liters}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className={styles.group}>
            <label>Cost</label>

            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
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

export default FuelForm;
