import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  Wrench,
  Route,
  ShieldAlert,
  CheckCheck,
  CheckCircle,
} from "lucide-react";
import styles from "./Notifications.module.css";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAlerts = async () => {
      try {
        const res = await getNotifications();
        if (cancelled) return;
        const data = res.data?.data || res.data || {};
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load notifications:", err);
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAlerts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await markAllNotificationsRead(unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "LICENSE":
        return <AlertTriangle size={18} />;
      case "MAINTENANCE":
        return <Wrench size={18} />;
      case "TRIP":
        return <Route size={18} />;
      case "SAFETY":
        return <ShieldAlert size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getIconBoxClass = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return styles.iconCritical;
      case "HIGH":
        return styles.iconHigh;
      case "MEDIUM":
        return styles.iconMedium;
      default:
        return styles.iconInfo;
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return styles.badgeCritical;
      case "HIGH":
        return styles.badgeHigh;
      case "MEDIUM":
        return styles.badgeMedium;
      default:
        return styles.badgeInfo;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>Operations Center</div>
        <div className={styles.headerTitleRow}>
          <div>
            <h1>Fleet Notifications & Alerts</h1>
            <p>Real-time operational alerts aggregated directly from live vehicle and driver statuses.</p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={handleMarkAllRead}
            >
              <CheckCheck size={16} />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </header>

      <div className={styles.card}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
            Scanning fleet state for operational alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
            <CheckCircle size={32} color="#16a34a" style={{ marginBottom: "10px" }} />
            <div style={{ fontWeight: 600, color: "var(--text-primary, #0f172a)" }}>
              All Clear! No Active Fleet Alerts
            </div>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>
              Licenses are up to date, and no vehicles require critical maintenance intervention.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`${styles.item} ${!item.read ? styles.itemUnread : ""}`}
              >
                <div
                  className={`${styles.iconBox} ${getIconBoxClass(item.severity)}`}
                >
                  {getCategoryIcon(item.category)}
                </div>

                <div className={styles.content}>
                  <div className={styles.metaRow}>
                    <span className={styles.title}>{item.title}</span>
                    <span
                      className={`${styles.severityBadge} ${getSeverityBadgeClass(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <div className={styles.message}>{item.message}</div>

                  <div className={styles.footerRow}>
                    <span className={styles.timestamp}>
                      {new Date(item.timestamp).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>

                    {item.actionLink && (
                      <Link to={item.actionLink} className={styles.actionLink}>
                        View Details &rarr;
                      </Link>
                    )}

                    {!item.read && (
                      <button
                        type="button"
                        className={styles.readBtn}
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
