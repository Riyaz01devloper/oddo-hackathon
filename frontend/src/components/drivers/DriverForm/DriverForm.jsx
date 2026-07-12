import { useEffect, useState } from "react";
import styles from "./DriverForm.module.css";

const initialForm = {
  name: "",
  licenseNumber: "",
  licenseCategory: "LMV",
  licenseExpiry: "",
  contactNumber: "",
  safetyScore: "",
  status: "Available",
};

function DriverForm({ driver, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (driver) {
      setFormData(driver);
    } else {
      setFormData(initialForm);
    }
  }, [driver]);

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

          <div className={styles.group}>
            <label>License Category</label>

            <select
              name="licenseCategory"
              value={formData.licenseCategory}
              onChange={handleChange}
            >
              <option>LMV</option>
              <option>HMV</option>
              <option>Transport</option>
            </select>
          </div>

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

          <div className={styles.group}>
            <label>Contact Number</label>

            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className={styles.group}>
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Available</option>
              <option>On Trip</option>
              <option>Off Duty</option>
              <option>Suspended</option>
            </select>
          </div>

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