import { useEffect, useState } from "react";
import styles from "./TripForm.module.css";

const initialForm = {
  source: "",
  destination: "",
  vehicleId: "",
  driverId: "",
  cargoWeight: "",
  plannedDistance: "",
};

function TripForm({
  trip,
  vehicles,
  drivers,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (trip) {
      setFormData({
        source: trip.source,
        destination: trip.destination,
        vehicleId: trip.vehicleId,
        driverId: trip.driverId,
        cargoWeight: trip.cargoWeight,
        plannedDistance: trip.plannedDistance,
      });
    } else {
      setFormData(initialForm);
    }
  }, [trip]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validate() {
    const validationErrors = {};

    if (!formData.source.trim())
      validationErrors.source = "Source is required.";

    if (!formData.destination.trim())
      validationErrors.destination = "Destination is required.";

    if (!formData.vehicleId)
      validationErrors.vehicleId = "Select a vehicle.";

    if (!formData.driverId)
      validationErrors.driverId = "Select a driver.";

    if (!formData.cargoWeight || Number(formData.cargoWeight) <= 0)
      validationErrors.cargoWeight = "Cargo weight must be greater than 0.";

    if (
      !formData.plannedDistance ||
      Number(formData.plannedDistance) <= 0
    )
      validationErrors.plannedDistance =
        "Distance must be greater than 0.";

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    // TODO: Backend validation
    // Vehicle assignment
    // Driver assignment
    // Vehicle capacity
    // License validity

    onSave({
      ...formData,
      vehicleId: Number(formData.vehicleId),
      driverId: Number(formData.driverId),
      cargoWeight: Number(formData.cargoWeight),
      plannedDistance: Number(formData.plannedDistance),
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{trip ? "Edit Trip" : "Create Trip"}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.group}>
            <label>Source</label>

            <input
              name="source"
              value={formData.source}
              onChange={handleChange}
            />

            {errors.source && (
              <span className={styles.error}>{errors.source}</span>
            )}
          </div>

          <div className={styles.group}>
            <label>Destination</label>

            <input
              name="destination"
              value={formData.destination}
              onChange={handleChange}
            />

            {errors.destination && (
              <span className={styles.error}>
                {errors.destination}
              </span>
            )}
          </div>

          <div className={styles.group}>
            <label>Vehicle</label>

            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
            >
              <option value="">Select Vehicle</option>

              {vehicles.map((vehicle) => (
                <option
                  key={vehicle.id}
                  value={vehicle.id}
                >
                  {vehicle.vehicleName}
                </option>
              ))}
            </select>

            {errors.vehicleId && (
              <span className={styles.error}>
                {errors.vehicleId}
              </span>
            )}
          </div>

          <div className={styles.group}>
            <label>Driver</label>

            <select
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
            >
              <option value="">Select Driver</option>

              {drivers.map((driver) => (
                <option
                  key={driver.id}
                  value={driver.id}
                >
                  {driver.name}
                </option>
              ))}
            </select>

            {errors.driverId && (
              <span className={styles.error}>
                {errors.driverId}
              </span>
            )}
          </div>

          <div className={styles.group}>
            <label>Cargo Weight (kg)</label>

            <input
              type="number"
              name="cargoWeight"
              value={formData.cargoWeight}
              onChange={handleChange}
            />

            {errors.cargoWeight && (
              <span className={styles.error}>
                {errors.cargoWeight}
              </span>
            )}
          </div>

          <div className={styles.group}>
            <label>Planned Distance (km)</label>

            <input
              type="number"
              name="plannedDistance"
              value={formData.plannedDistance}
              onChange={handleChange}
            />

            {errors.plannedDistance && (
              <span className={styles.error}>
                {errors.plannedDistance}
              </span>
            )}
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
              {trip ? "Update Trip" : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TripForm;