import {
  Route,
  MapPin,
  Truck,
  User,
  Pencil,
  Trash2,
} from "lucide-react";

import styles from "./TripTable.module.css";
import StatusBadge from "../../fleet/StatusBadge/StatusBadge";

function TripTable({
  trips = [],
  vehicles = [],
  drivers = [],
  onEdit,
  onDelete,
}) {
  // Supports both populated MongoDB references
  // and IDs if the backend returns unpopulated references.
  function getVehicle(trip) {
    if (trip.vehicle && typeof trip.vehicle === "object") {
      return trip.vehicle;
    }

    const vehicleId =
      trip.vehicle?._id ||
      trip.vehicle;

    return vehicles.find(
      (vehicle) =>
        vehicle._id === vehicleId ||
        vehicle.id === vehicleId
    );
  }

  function getDriver(trip) {
    if (trip.driver && typeof trip.driver === "object") {
      return trip.driver;
    }

    const driverId =
      trip.driver?._id ||
      trip.driver;

    return drivers.find(
      (driver) =>
        driver._id === driverId ||
        driver.id === driverId
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Trip</th>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo</th>
              <th>Distance</th>
              <th>Status</th>
              <th className={styles.actionsHeader}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {trips.length > 0 ? (
              trips.map((trip) => {
                const tripId =
                  trip._id || trip.id;

                const vehicle = getVehicle(trip);
                const driver = getDriver(trip);

                return (
                  <tr key={tripId}>
                    {/* TRIP */}

                    <td>
                      <div className={styles.tripCell}>
                        <div className={styles.tripIcon}>
                          <Route size={17} />
                        </div>

                        <div className={styles.tripInfo}>
                          <strong>
                            #{String(tripId).slice(-6)}
                          </strong>

                          <span>
                            Trip ID
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ROUTE */}

                    <td>
                      <div className={styles.route}>
                        <div className={styles.location}>
                          <span
                            className={styles.sourceDot}
                          />

                          <span>
                            {trip.source || "-"}
                          </span>
                        </div>

                        <div className={styles.routeLine} />

                        <div className={styles.location}>
                          <span
                            className={styles.destinationDot}
                          />

                          <span>
                            {trip.destination || "-"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* VEHICLE */}

                    <td>
                      <div className={styles.resource}>
                        <div className={styles.resourceIcon}>
                          <Truck size={15} />
                        </div>

                        <div>
                          <strong>
                            {vehicle?.name || "-"}
                          </strong>

                          <span>
                            {vehicle?.registrationNumber ||
                              "No registration"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* DRIVER */}

                    <td>
                      <div className={styles.resource}>
                        <div
                          className={`${styles.resourceIcon} ${styles.driverIcon}`}
                        >
                          <User size={15} />
                        </div>

                        <div>
                          <strong>
                            {driver?.name || "-"}
                          </strong>

                          <span>
                            {driver?.licenseNumber ||
                              "No license"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CARGO */}

                    <td>
                      <span className={styles.number}>
                        {Number(
                          trip.cargoWeight ?? 0
                        ).toLocaleString("en-IN")}
                        <small> kg</small>
                      </span>
                    </td>

                    {/* DISTANCE */}

                    <td>
                      <div className={styles.distance}>
                        <MapPin size={14} />

                        <span>
                          {Number(
                            trip.plannedDistance ?? 0
                          ).toLocaleString("en-IN")}
                          <small> km</small>
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <StatusBadge
                        status={trip.status}
                      />
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.edit}
                          onClick={() =>
                            onEdit(trip)
                          }
                          title="Edit trip"
                        >
                          <Pencil size={15} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className={styles.delete}
                          onClick={() =>
                            onDelete(tripId)
                          }
                          title="Delete trip"
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className={styles.empty}
                >
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Route size={22} />
                    </div>

                    <strong>
                      No trips found
                    </strong>

                    <span>
                      Try changing your search or
                      status filter.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TripTable;