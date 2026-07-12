// components/dashboard/StatCard/StatCard.jsx

import styles from "./StatCard.module.css";

function StatCard({ title, value, Icon }) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.icon}>
          <Icon size={24} />
        </span>
      </div>

      <h3>{title}</h3>

      <p>{value}</p>
    </article>
  );
}

export default StatCard;