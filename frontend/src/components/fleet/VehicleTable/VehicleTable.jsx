import styles from "./VehicleTable.module.css";
import StatusBadge from "../StatusBadge/StatusBadge";

function VehicleTable({ vehicles = [], onEdit, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Registration Number</th>
            <th>Vehicle Name</th>
            <th>Vehicle Type</th>
            <th>Capacity</th>
            <th>Odometer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => {
              const vehicleId = vehicle._id || vehicle.id;

              return (
                <tr key={vehicleId}>
                  <td>{vehicle.registrationNumber || "-"}</td>
                  <td>{vehicle.name || "-"}</td>
                  <td>{vehicle.type || "-"}</td>
                  <td>{vehicle.maxLoadCapacity ?? 0} kg</td>
                  <td>{(vehicle.odometer ?? 0).toLocaleString()} km</td>

                  <td>
                    <StatusBadge status={vehicle.status} />
                  </td>

                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => onEdit(vehicle)}
                      >
                        Edit
                      </button>

                      <button
                        className={styles.deleteBtn}
                        onClick={() => onDelete(vehicleId)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className={styles.empty}>
                No vehicles found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleTable;