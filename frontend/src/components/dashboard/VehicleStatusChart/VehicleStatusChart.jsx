import styles from "./VehicleStatusChart.module.css";

function VehicleStatusChart({ data }) {
  return (
    <div className={styles.chart}>
      {data.map((item) => (
        <div key={item.label} className={styles.row}>
          <div className={styles.label}>{item.label}</div>

          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{
                width: `${item.value}%`,
              }}
            ></div>
          </div>

          <span className={styles.value}>{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default VehicleStatusChart;