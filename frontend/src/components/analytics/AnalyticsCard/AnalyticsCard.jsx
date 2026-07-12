import styles from "./AnalyticsCard.module.css";

function AnalyticsCard({ title, value }) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>

      <p>{value}</p>
    </div>
  );
}

export default AnalyticsCard;