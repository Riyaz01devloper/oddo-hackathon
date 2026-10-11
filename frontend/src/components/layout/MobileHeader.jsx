import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Bell, Download, Bus } from "lucide-react";
import { getNotifications } from "../../services/notificationService";
import { promptPwaInstall, isAppInstalled, subscribePwaPrompt } from "../../utils/pwaInstall";
import styles from "./MobileHeader.module.css";

function MobileHeader({ onToggleMenu, isMenuOpen }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const res = await getNotifications();
        if (!cancelled) {
          const count = res.data?.data?.unreadCount || res.data?.unreadCount || 0;
          setUnreadCount(count);
        }
      } catch {
        // Silently catch
      }
    };

    fetchUnread();
    const unsub = subscribePwaPrompt((ready) => {
      setCanInstall(ready && !isAppInstalled());
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const handleInstall = async () => {
    const res = await promptPwaInstall();
    if (res.outcome === "ios") {
      alert("To install on iOS: Tap Share (⎋) in Safari and select 'Add to Home Screen' (⊕).");
    }
  };

  return (
    <header className={styles.mobileHeader}>
      <div className={styles.leftGroup}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className={styles.brandLink}>
          <div className={styles.brandIcon}>
            <Bus size={18} />
          </div>
          <span className={styles.brandTitle}>TransitOps</span>
        </Link>
      </div>

      <div className={styles.rightGroup}>
        {canInstall && (
          <button
            type="button"
            className={styles.installButton}
            onClick={handleInstall}
            title="Download App to Home Screen"
          >
            <Download size={14} />
            <span>App</span>
          </button>
        )}

        <Link to="/notifications" className={styles.bellButton} aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </Link>
      </div>
    </header>
  );
}

export default MobileHeader;
