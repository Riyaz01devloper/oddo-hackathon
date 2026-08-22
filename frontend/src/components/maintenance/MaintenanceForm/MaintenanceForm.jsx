import { useState } from "react";
import styles from "./MaintenanceForm.module.css";

const initialForm = {
  vehicleId: "",
  vehicleName: "",
  serviceType: "",
  cost: "",
  date: "",
};

function MaintenanceForm({
  record,
  vehicles,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState(() =>
    record
      ? {
          vehicleId: record.vehicle?._id || record.vehicleId || "",
          vehicleName:
            record.vehicle?.vehicleName ||
            record.vehicleName ||
            "",
          serviceType: record.issue || record.serviceType || "",
          cost: record.cost ?? "",
          date: record.openedAt
            ? new Date(record.openedAt)
                .toISOString()
                .split("T")[0]
            : record.date || "",
        }
      : initialForm
  );

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "vehicleId") {
      const vehicle = vehicles.find(
        (item) => String(item._id) === String(value)
      );

      setFormData((prev) => ({
        ...prev,
        vehicleId: value,
        vehicleName: vehicle?.vehicleName || vehicle?.name || "",
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

    if (!formData.vehicleId) {
      alert("Please select a vehicle");
      return;
    }

    if (!formData.serviceType.trim()) {
      alert("Please enter the maintenance issue");
      return;
    }

    if (
      formData.cost === "" ||
      Number(formData.cost) < 0
    ) {
      alert("Please enter a valid cost");
      return;
    }

    onSave({
      vehicle: formData.vehicleId,
      issue: formData.serviceType.trim(),
      cost: Number(formData.cost),
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Keep your existing JSX fields here */}

      <select
        name="vehicleId"
        value={formData.vehicleId}
        onChange={handleChange}
        required
      >
        <option value="">Select Vehicle</option>

        {vehicles.map((vehicle) => (
          <option
            key={vehicle._id}
            value={vehicle._id}
          >
            {vehicle.vehicleName || vehicle.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="serviceType"
        value={formData.serviceType}
        onChange={handleChange}
        placeholder="Maintenance issue"
        required
      />

      <input
        type="number"
        name="cost"
        value={formData.cost}
        onChange={handleChange}
        min="0"
        placeholder="Cost"
        required
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
      />

      <button type="submit">
        Save Maintenance
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default MaintenanceForm;