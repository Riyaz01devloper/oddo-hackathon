import styles from "./FuelTable.module.css";

function FuelTable({ logs, onEdit, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Date</th>
            <th>Liters</th>
            <th>Cost</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log.id}>
                <td>{log.vehicleName}</td>

                <td>{log.date}</td>

                <td>{log.liters} L</td>

                <td>₹{log.cost.toLocaleString()}</td>

                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.edit}
                      onClick={() => onEdit(log)}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.delete}
                      onClick={() => onDelete(log.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className={styles.empty}>
                No fuel logs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default FuelTable;