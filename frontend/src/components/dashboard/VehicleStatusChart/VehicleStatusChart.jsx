import styles from "./VehicleStatusChart.module.css";

function VehicleStatusChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className={styles.chart}>
      {data.map((item) => {
        const percentage =
          total > 0 ? Math.round((Number(item.value || 0) / total) * 100) : 0;

        return (
          <div key={item.label} className={styles.row}>
            <div className={styles.labelArea}>
              <span className={styles.dot}></span>
              <span className={styles.label}>{item.label}</span>
            </div>

            <div className={styles.barArea}>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className={styles.valueArea}>
              <strong>{item.value}</strong>
              <span>{percentage}%</span>
            </div>
          </div>
        );
      })}

      {data.length === 0 && (
        <div className={styles.empty}>
          No vehicle status data available.
        </div>
      )}
    </div>
  );
}

export default VehicleStatusChart;