import styles from "./MaintenanceTable.module.css";
import StatusBadge from "../../fleet/StatusBadge/StatusBadge";

function MaintenanceTable({ records = [], onEdit, onDelete }) {
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
            records.map((record) => {
              const vehicleName =
                record?.vehicle?.vehicleName ||
                record?.vehicle?.name ||
                record?.vehicleName ||
                "Unknown Vehicle";

              const serviceType =
                record?.issue ||
                record?.serviceType ||
                "No issue specified";

              const cost = Number(record?.cost || 0);

              const date = record?.openedAt
                ? new Date(record.openedAt).toLocaleDateString()
                : record?.date || "-";

              const status =
                record?.status || "InShop";

              const recordId =
                record?._id || record?.id;

              return (
                <tr key={recordId}>
                  <td>{vehicleName}</td>

                  <td>{serviceType}</td>

                  <td>
                    ₹{cost.toLocaleString("en-IN")}
                  </td>

                  <td>{date}</td>

                  <td>
                    <StatusBadge status={status} />
                  </td>

                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.edit}
                        onClick={() =>
                          onEdit?.(record)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className={styles.delete}
                        onClick={() =>
                          onDelete?.(recordId)
                        }
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