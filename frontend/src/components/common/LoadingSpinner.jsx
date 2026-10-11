import { Loader2 } from "lucide-react";
import styles from "./LoadingSpinner.module.css";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className={styles.spinnerContainer} role="status" aria-live="polite">
      <Loader2 className={styles.spinnerIcon} size={36} />
      {message && <span className={styles.spinnerText}>{message}</span>}
    </div>
  );
}

export default LoadingSpinner;

