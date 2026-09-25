import styles from "./FuelTable.module.css";

function FuelTable({ logs = [] }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Registration</th>
            <th>Date</th>
            <th>Liters</th>
            <th>Cost</th>
          </tr>
        </thead>

        <tbody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log._id}>
                <td>
                  {log.vehicle?.name ||
                    "Unknown Vehicle"}
                </td>

                <td>
                  {log.vehicle?.registrationNumber ||
                    "-"}
                </td>

                <td>
                  {log.date
                    ? new Date(
                        log.date
                      ).toLocaleDateString("en-IN")
                    : "-"}
                </td>

                <td>
                  {Number(log.liters || 0).toFixed(2)} L
                </td>

                <td>
                  ₹
                  {Number(
                    log.cost || 0
                  ).toLocaleString("en-IN")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className={styles.empty}
              >
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