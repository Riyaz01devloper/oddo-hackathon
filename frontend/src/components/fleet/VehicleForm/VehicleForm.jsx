import { useEffect, useState } from "react";
import styles from "./VehicleForm.module.css";

const initialForm = {
  registrationNumber: "",
  vehicleName: "",
  vehicleType: "Truck",
  capacity: "",
  odometer: "",
  status: "Available",
};

function VehicleForm({ vehicle, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    } else {
      setFormData(initialForm);
    }
  }, [vehicle]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      ...formData,
      capacity: Number(formData.capacity),
      odometer: Number(formData.odometer),
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{vehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.group}>
            <label>Registration Number</label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Vehicle Name</label>
            <input
              type="text"
              name="vehicleName"
              value={formData.vehicleName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Vehicle Type</label>

            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
            >
              <option>Truck</option>
              <option>Mini Truck</option>
              <option>Van</option>
            </select>
          </div>

          <div className={styles.group}>
            <label>Capacity</label>

            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Odometer</label>

            <input
              type="number"
              name="odometer"
              value={formData.odometer}
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
              <option>Available</option>
              <option>On Trip</option>
              <option>In Shop</option>
              <option>Retired</option>
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

export default VehicleForm;