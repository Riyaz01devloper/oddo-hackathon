import { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Navigation,
  Truck,
  User,
  Package,
  Route,
} from "lucide-react";
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
  vehicles = [],
  drivers = [],
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (trip) {
      setFormData({
        source: trip.source || "",
        destination: trip.destination || "",
        vehicleId:
          trip.vehicle?._id ||
          trip.vehicle ||
          trip.vehicleId ||
          "",
        driverId:
          trip.driver?._id ||
          trip.driver ||
          trip.driverId ||
          "",
        cargoWeight: trip.cargoWeight ?? "",
        plannedDistance: trip.plannedDistance ?? "",
      });
    } else {
      setFormData(initialForm);
    }

    setErrors({});
  }, [trip]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function validate() {
    const validationErrors = {};

    if (!formData.source.trim()) {
      validationErrors.source = "Source is required.";
    }

    if (!formData.destination.trim()) {
      validationErrors.destination = "Destination is required.";
    }

    if (!formData.vehicleId) {
      validationErrors.vehicleId = "Select a vehicle.";
    }

    if (!formData.driverId) {
      validationErrors.driverId = "Select a driver.";
    }

    if (
      !formData.cargoWeight ||
      Number(formData.cargoWeight) <= 0
    ) {
      validationErrors.cargoWeight =
        "Cargo weight must be greater than 0.";
    }

    if (
      !formData.plannedDistance ||
      Number(formData.plannedDistance) <= 0
    ) {
      validationErrors.plannedDistance =
        "Distance must be greater than 0.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      source: formData.source.trim(),
      destination: formData.destination.trim(),
      vehicle: formData.vehicleId,
      driver: formData.driverId,
      cargoWeight: Number(formData.cargoWeight),
      plannedDistance: Number(formData.plannedDistance),
    });
  }

  function getVehicleId(vehicle) {
    return vehicle._id || vehicle.id;
  }

  function getDriverId(driver) {
    return driver._id || driver.id;
  }

  return (
    <div className={styles.overlay} onMouseDown={onCancel}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <div className={styles.headerIcon}>
              <Route size={20} />
            </div>

            <div>
              <h2>{trip ? "Edit Trip" : "Create Trip"}</h2>
              <p>
                {trip
                  ? "Update trip information and assignments."
                  : "Create a new fleet trip and assign resources."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.sectionTitle}>
            <MapPin size={17} />
            <span>Route Information</span>
          </div>

          <div className={styles.routeGrid}>
            <div className={styles.group}>
              <label htmlFor="source">Source</label>

              <div className={styles.inputWrapper}>
                <MapPin size={17} />
                <input
                  id="source"
                  name="source"
                  type="text"
                  placeholder="e.g. Delhi"
                  value={formData.source}
                  onChange={handleChange}
                />
              </div>

              {errors.source && (
                <span className={styles.error}>
                  {errors.source}
                </span>
              )}
            </div>

            <div className={styles.group}>
              <label htmlFor="destination">Destination</label>

              <div className={styles.inputWrapper}>
                <Navigation size={17} />
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="e.g. Jaipur"
                  value={formData.destination}
                  onChange={handleChange}
                />
              </div>

              {errors.destination && (
                <span className={styles.error}>
                  {errors.destination}
                </span>
              )}
            </div>
          </div>

          <div className={styles.sectionTitle}>
            <Truck size={17} />
            <span>Resource Assignment</span>
          </div>

          <div className={styles.grid}>
            <div className={styles.group}>
              <label htmlFor="vehicleId">Vehicle</label>

              <div className={styles.selectWrapper}>
                <Truck size={17} />

                <select
                  id="vehicleId"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                >
                  <option value="">Select Vehicle</option>

                  {vehicles.map((vehicle) => {
                    const id = getVehicleId(vehicle);

                    return (
                      <option key={id} value={id}>
                        {vehicle.name ||
                          vehicle.vehicleName ||
                          "Unnamed Vehicle"}
                        {vehicle.registrationNumber
                          ? ` • ${vehicle.registrationNumber}`
                          : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {errors.vehicleId && (
                <span className={styles.error}>
                  {errors.vehicleId}
                </span>
              )}
            </div>

            <div className={styles.group}>
              <label htmlFor="driverId">Driver</label>

              <div className={styles.selectWrapper}>
                <User size={17} />

                <select
                  id="driverId"
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                >
                  <option value="">Select Driver</option>

                  {drivers.map((driver) => {
                    const id = getDriverId(driver);

                    return (
                      <option key={id} value={id}>
                        {driver.name || "Unnamed Driver"}
                        {driver.licenseNumber
                          ? ` • ${driver.licenseNumber}`
                          : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {errors.driverId && (
                <span className={styles.error}>
                  {errors.driverId}
                </span>
              )}
            </div>
          </div>

          <div className={styles.sectionTitle}>
            <Package size={17} />
            <span>Trip Details</span>
          </div>

          <div className={styles.grid}>
            <div className={styles.group}>
              <label htmlFor="cargoWeight">
                Cargo Weight
                <span className={styles.unit}>kg</span>
              </label>

              <div className={styles.inputWrapper}>
                <Package size={17} />

                <input
                  id="cargoWeight"
                  type="number"
                  name="cargoWeight"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1200"
                  value={formData.cargoWeight}
                  onChange={handleChange}
                />
              </div>

              {errors.cargoWeight && (
                <span className={styles.error}>
                  {errors.cargoWeight}
                </span>
              )}
            </div>

            <div className={styles.group}>
              <label htmlFor="plannedDistance">
                Planned Distance
                <span className={styles.unit}>km</span>
              </label>

              <div className={styles.inputWrapper}>
                <Route size={17} />

                <input
                  id="plannedDistance"
                  type="number"
                  name="plannedDistance"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 280"
                  value={formData.plannedDistance}
                  onChange={handleChange}
                />
              </div>

              {errors.plannedDistance && (
                <span className={styles.error}>
                  {errors.plannedDistance}
                </span>
              )}
            </div>
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