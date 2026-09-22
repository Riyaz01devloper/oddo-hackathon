import { useState } from "react";
import styles from "./DriverForm.module.css";

const initialForm = {
  name: "",
  licenseNumber: "",
  licenseCategory: "LMV",
  licenseExpiry: "",
  phone: "",
  safetyScore: 100,
  status: "Available",
};

function formatDateForInput(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
}

function DriverForm({ driver, onSave, onCancel }) {
  const [formData, setFormData] = useState(() => {
    if (!driver) {
      return initialForm;
    }

    return {
      name: driver.name || "",
      licenseNumber: driver.licenseNumber || "",
      licenseCategory: driver.licenseCategory || "LMV",
      licenseExpiry: formatDateForInput(driver.licenseExpiry),
      phone: driver.phone || "",
      safetyScore: driver.safetyScore ?? 100,
      status: driver.status || "Available",
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

    onSave({
      ...formData,
      safetyScore: Number(formData.safetyScore),
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{driver ? "Edit Driver" : "Add Driver"}</h2>

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div className={styles.group}>
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* LICENSE NUMBER */}
          <div className={styles.group}>
            <label>License Number</label>

            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* LICENSE CATEGORY */}
          <div className={styles.group}>
            <label>License Category</label>

            <select
              name="licenseCategory"
              value={formData.licenseCategory}
              onChange={handleChange}
            >
              <option value="LMV">LMV</option>
              <option value="HMV">HMV</option>
              <option value="Transport">Transport</option>
            </select>
          </div>

          {/* LICENSE EXPIRY */}
          <div className={styles.group}>
            <label>License Expiry</label>

            <input
              type="date"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleChange}
              required
            />
          </div>

          {/* PHONE */}
          <div className={styles.group}>
            <label>Contact Number</label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* SAFETY SCORE */}
          <div className={styles.group}>
            <label>Safety Score</label>

            <input
              type="number"
              name="safetyScore"
              value={formData.safetyScore}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>

          {/* STATUS */}
          <div className={styles.group}>
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="OnTrip">On Trip</option>
              <option value="OffDuty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.save}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DriverForm;