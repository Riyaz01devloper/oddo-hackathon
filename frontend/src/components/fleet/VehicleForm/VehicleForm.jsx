import { useEffect, useState } from "react";
import styles from "./VehicleForm.module.css";

const initialForm = {
  registrationNumber: "",
  name: "",
  type: "Truck",
  maxLoadCapacity: "",
  odometer: "",
  acquisitionCost: "",
  status: "Available",
};

function VehicleForm({ vehicle, onSave, onCancel }) {
  const [formData, setFormData] = useState(() => {
    if (vehicle) {
      return {
        registrationNumber: vehicle.registrationNumber || "",
        name: vehicle.name || "",
        type: vehicle.type || "Truck",
        maxLoadCapacity: vehicle.maxLoadCapacity ?? "",
        odometer: vehicle.odometer ?? "",
        acquisitionCost: vehicle.acquisitionCost ?? "",
        status: vehicle.status || "Available",
      };
    }
    return initialForm;
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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
    if (submitting) return;

    if (Number(formData.maxLoadCapacity) < 0 || Number(formData.odometer) < 0 || Number(formData.acquisitionCost) < 0) {
      setFormError("Load capacity, odometer, and acquisition cost cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        registrationNumber: formData.registrationNumber.trim(),
        name: formData.name.trim(),
        maxLoadCapacity: Number(formData.maxLoadCapacity),
        odometer: Number(formData.odometer),
        acquisitionCost: Number(formData.acquisitionCost),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{vehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.group}>
            <label>Registration Number</label>
            <input
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Vehicle Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Vehicle Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option>Truck</option>
              <option>Mini Truck</option>
              <option>Van</option>
            </select>
          </div>

          <div className={styles.group}>
            <label>Max Load Capacity (kg)</label>
            <input
              type="number"
              name="maxLoadCapacity"
              value={formData.maxLoadCapacity}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Odometer (km)</label>
            <input
              type="number"
              name="odometer"
              value={formData.odometer}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Acquisition Cost</label>
            <input
              type="number"
              name="acquisitionCost"
              value={formData.acquisitionCost}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="OnTrip">On Trip</option>
              <option value="InShop">InShop</option>
              <option value="Retired">Retired</option>
            </select>
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

export default VehicleForm;