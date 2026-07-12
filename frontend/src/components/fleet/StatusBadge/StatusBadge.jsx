import styles from "./StatusBadge.module.css";

function StatusBadge({ status }) {
  const badgeClass = {
    Available: styles.green,
    "On Trip": styles.blue,
    "In Shop": styles.orange,
    Retired: styles.gray,
  };

  return (
    <span className={`${styles.badge} ${badgeClass[status]}`}>
      {status}
    </span>
  );
}

export default StatusBadge;