import { useEffect, useState } from "react";
import styles from "./ExpenseForm.module.css";

const initialForm = {
  vehicleId: "",
  vehicleName: "",
  expenseType: "",
  amount: "",
  date: "",
};

function ExpenseForm({
  record,
  vehicles,
  onSave,
  onCancel,
}) {
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
      const vehicle = vehicles.find(
        (item) => item.id === Number(value)
      );

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
      amount: Number(formData.amount),
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>
          {record ? "Edit Expense" : "Add Expense"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.group}>
            <label>Vehicle</label>

            <select
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
                  key={vehicle.id}
                  value={vehicle.id}
                >
                  {vehicle.vehicleName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.group}>
            <label>Expense Type</label>

            <input
              type="text"
              name="expenseType"
              value={formData.expenseType}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Amount</label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
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

export default ExpenseForm;