import styles from "./DriverTable.module.css";
import StatusBadge from "../../fleet/StatusBadge/StatusBadge";

function DriverTable({ drivers, onEdit, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>License Number</th>
            <th>License Category</th>
            <th>License Expiry</th>
            <th>Contact Number</th>
            <th>Safety Score</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {drivers.length > 0 ? (
            drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.licenseCategory}</td>
                <td>{driver.licenseExpiry}</td>
                <td>{driver.contactNumber}</td>
                <td>{driver.safetyScore}</td>

                <td>
                  <StatusBadge status={driver.status} />
                </td>

                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => onEdit(driver)}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.deleteButton}
                      onClick={() => onDelete(driver.id)}
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
                colSpan="8"
                className={styles.empty}
              >
                No drivers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DriverTable;