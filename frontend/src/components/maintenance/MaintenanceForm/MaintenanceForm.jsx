import { useEffect, useState } from "react";
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
  vehicles = [],
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialForm);

  // Update form whenever record changes
  useEffect(() => {
    if (record) {
      setFormData({
        vehicleId:
          record.vehicle?._id ||
          record.vehicleId ||
          "",

        vehicleName:
          record.vehicle?.vehicleName ||
          record.vehicle?.name ||
          record.vehicleName ||
          "",

        serviceType:
          record.issue ||
          record.serviceType ||
          "",

        cost:
          record.cost !== undefined &&
          record.cost !== null
            ? record.cost
            : "",

        date: record.openedAt
          ? new Date(record.openedAt)
              .toISOString()
              .split("T")[0]
          : record.date || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [record]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "vehicleId") {
      const selectedVehicle = vehicles.find(
        (item) =>
          String(item?._id) === String(value)
      );

      setFormData((prev) => ({
        ...prev,
        vehicleId: value,
        vehicleName:
          selectedVehicle?.vehicleName ||
          selectedVehicle?.name ||
          "",
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

    const vehicleId = String(
      formData.vehicleId || ""
    ).trim();

    const issue = String(
      formData.serviceType || ""
    ).trim();

    const cost = Number(formData.cost);

    if (!vehicleId) {
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

    // Send exactly what the backend expects
    onSave({
      vehicle: vehicleId,
      issue: issue,
      cost: cost,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
    >
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
            key={vehicle?._id}
            value={vehicle?._id}
          >
            {vehicle?.vehicleName ||
              vehicle?.name ||
              "Unnamed Vehicle"}
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
        step="0.01"
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
        {record
          ? "Update Maintenance"
          : "Save Maintenance"}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
    </form>
  );
}

export default MaintenanceForm;