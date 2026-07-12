import styles from "./TripTable.module.css";
import StatusBadge from "../../fleet/StatusBadge/StatusBadge";

function TripTable({
  trips,
  vehicles,
  drivers,
  onEdit,
  onDelete,
}) {
  function getVehicleName(id) {
    const vehicle = vehicles.find((v) => v.id === id);
    return vehicle ? vehicle.vehicleName : "-";
  }

  function getDriverName(id) {
    const driver = drivers.find((d) => d.id === id);
    return driver ? driver.name : "-";
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Cargo Weight</th>
            <th>Planned Distance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {trips.length > 0 ? (
            trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.id}</td>

                <td>{trip.source}</td>

                <td>{trip.destination}</td>

                <td>{getVehicleName(trip.vehicleId)}</td>

                <td>{getDriverName(trip.driverId)}</td>

                <td>{trip.cargoWeight} kg</td>

                <td>{trip.plannedDistance} km</td>

                <td>
                  <StatusBadge status={trip.status} />
                </td>

                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.edit}
                      onClick={() => onEdit(trip)}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.delete}
                      onClick={() => onDelete(trip.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                className={styles.empty}
              >
                No trips found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TripTable;