import styles from "./StatCard.module.css";

function StatCard({
  title,
  value,
  Icon,
  description,
  type = "primary",
}) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={`${styles.icon} ${styles[type]}`}>
          <Icon size={19} strokeWidth={2} />
        </div>

        <span className={styles.more}>•••</span>
      </div>

      <div className={styles.content}>
        <h3>{title}</h3>

        <p className={styles.value}>{value}</p>

        {description && (
          <span className={styles.description}>
            {description}
          </span>
        )}
      </div>
    </article>
  );
}

export default StatCard;