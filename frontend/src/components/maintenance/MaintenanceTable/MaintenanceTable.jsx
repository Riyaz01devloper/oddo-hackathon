import styles from "./MaintenanceTable.module.css";
import StatusBadge from "../../fleet/StatusBadge/StatusBadge";

function MaintenanceTable({ records, onEdit, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Service Type</th>
            <th>Cost</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id}>
                <td>{record.vehicleName}</td>

                <td>{record.serviceType}</td>

                <td>₹{record.cost.toLocaleString()}</td>

                <td>{record.date}</td>

                <td>
                  <StatusBadge status={record.status} />
                </td>

                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.edit}
                      onClick={() => onEdit(record)}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.delete}
                      onClick={() => onDelete(record.id)}
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
                colSpan="6"
                className={styles.empty}
              >
                No maintenance records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MaintenanceTable;