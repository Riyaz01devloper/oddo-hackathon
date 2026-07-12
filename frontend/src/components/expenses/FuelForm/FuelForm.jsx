import { useEffect, useState } from "react";
import styles from "./FuelForm.module.css";

const initialForm = {
  vehicleId: "",
  vehicleName: "",
  date: "",
  liters: "",
  cost: "",
};

function FuelForm({ record, vehicles, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData(initialForm);
    }
  }, [record]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "vehicleId") {
      const vehicle = vehicles.find((v) => v.id === Number(value));

      setFormData((prev) => ({
        ...prev,
        vehicleId: Number(value),
        vehicleName: vehicle ? vehicle.vehicleName : "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      ...formData,
      liters: Number(formData.liters),
      cost: Number(formData.cost),
    });
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

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleName}
                </option>
              ))}
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
              required
            />
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

export default FuelForm;