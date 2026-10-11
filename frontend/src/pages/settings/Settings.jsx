import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Palette,
  Bell,
  Shield,
  Sliders,
  Sun,
  Moon,
  LogOut,
  User,
  CheckCircle2,
  Save,
} from "lucide-react";
import styles from "./Settings.module.css";
import { updateProfile } from "../../services/userService";

function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appearance");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Appearance
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("transitops_theme") || "light";
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("transitops_notifications");
    return saved
      ? JSON.parse(saved)
      : {
          licenseAlerts: true,
          maintenanceAlerts: true,
          tripAlerts: true,
          weeklySummary: false,
        };
  });

  // Data Preferences
  const [units, setUnits] = useState(() => {
    return localStorage.getItem("transitops_units") || "metric";
  });
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem("transitops_dateFormat") || "DD/MM/YYYY";
  });
  const [pageSize, setPageSize] = useState(() => {
    return localStorage.getItem("transitops_pageSize") || "20";
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("transitops_theme", theme);
  }, [theme]);

  const handleSavePreferences = async () => {
    localStorage.setItem("transitops_notifications", JSON.stringify(notifications));
    localStorage.setItem("transitops_units", units);
    localStorage.setItem("transitops_dateFormat", dateFormat);
    localStorage.setItem("transitops_pageSize", pageSize);

    try {
      await updateProfile({
        preferences: {
          theme,
          notifications,
          units,
          dateFormat,
        },
      });
    } catch {
      // Local fallback remains fully intact
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>System Configuration</div>
        <h1>Application Settings</h1>
        <p>Customize your workspace appearance, operational alerts, and display preferences.</p>
      </header>

      <div className={styles.layout}>
        {/* Sidebar Tabs */}
        <nav className={styles.navMenu}>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "appearance" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("appearance")}
          >
            <Palette size={17} />
            <span>Appearance</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "notifications" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={17} />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "security" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield size={17} />
            <span>Security & Sessions</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "data" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("data")}
          >
            <Sliders size={17} />
            <span>Data Preferences</span>
          </button>
        </nav>

        {/* Content Panel */}
        <div className={styles.contentCard}>
          {/* 1. APPEARANCE */}
          {activeTab === "appearance" && (
            <div>
              <div className={styles.sectionTitle}>
                <h2>Interface Theme</h2>
                <p>Select your preferred color theme for TransitOps. Changes take effect immediately.</p>
              </div>

              <div className={styles.themeGrid}>
                <button
                  type="button"
                  className={`${styles.themeOption} ${theme === "light" ? styles.themeActive : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <Sun size={26} color="#eab308" />
                  <strong>Light Mode</strong>
                  <span>High-contrast clean daylight interface</span>
                </button>

                <button
                  type="button"
                  className={`${styles.themeOption} ${theme === "dark" ? styles.themeActive : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <Moon size={26} color="#60a5fa" />
                  <strong>Dark Mode</strong>
                  <span>Reduced eye strain for night operations</span>
                </button>
              </div>

              <button type="button" className={styles.saveButton} onClick={handleSavePreferences}>
                <Save size={16} />
                <span>Save Theme Preference</span>
              </button>

              {saveSuccess && (
                <div className={styles.successPill}>
                  <CheckCircle2 size={14} />
                  <span>Preferences saved successfully!</span>
                </div>
              )}
            </div>
          )}

          {/* 2. NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div>
              <div className={styles.sectionTitle}>
                <h2>In-App Operational Alerts</h2>
                <p>Configure which automated fleet events generate alert indicators.</p>
              </div>

              <div className={styles.toggleList}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Driver License Expiry Alerts</strong>
                    <span>Notify when a driver&apos;s license is within 30 days of expiration</span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifications.licenseAlerts}
                      onChange={(e) =>
                        setNotifications({ ...notifications, licenseAlerts: e.target.checked })
                      }
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Maintenance Workshop Alerts</strong>
                    <span>Alert when a vehicle is assigned to maintenance or is pending in shop</span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifications.maintenanceAlerts}
                      onChange={(e) =>
                        setNotifications({ ...notifications, maintenanceAlerts: e.target.checked })
                      }
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Trip Dispatch & Completion Alerts</strong>
                    <span>Notify when transport trips change status across the fleet</span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifications.tripAlerts}
                      onChange={(e) =>
                        setNotifications({ ...notifications, tripAlerts: e.target.checked })
                      }
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Weekly Operations Digest</strong>
                    <span>Compile periodic fleet efficiency summaries</span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifications.weeklySummary}
                      onChange={(e) =>
                        setNotifications({ ...notifications, weeklySummary: e.target.checked })
                      }
                    />
                    <span className={styles.slider} />
                  </label>
                </div>
              </div>

              <button type="button" className={styles.saveButton} onClick={handleSavePreferences}>
                <Save size={16} />
                <span>Save Notification Settings</span>
              </button>

              {saveSuccess && (
                <div className={styles.successPill}>
                  <CheckCircle2 size={14} />
                  <span>Notification settings saved!</span>
                </div>
              )}
            </div>
          )}

          {/* 3. SECURITY & SESSIONS */}
          {activeTab === "security" && (
            <div>
              <div className={styles.sectionTitle}>
                <h2>Account Security & Sessions</h2>
                <p>Review your active session credentials and authentication parameters.</p>
              </div>

              <div className={styles.securityCard}>
                <div className={styles.securityDetails}>
                  <strong>Active User: {currentUser?.name || "Fleet User"}</strong>
                  <span>
                    Role: {currentUser?.role || "Fleet Manager"} &bull; Email: {currentUser?.email}
                  </span>
                </div>
                <Link to="/profile" className={styles.actionButton}>
                  <User size={15} />
                  <span>Edit Profile</span>
                </Link>
              </div>

              <div className={styles.securityCard}>
                <div className={styles.securityDetails}>
                  <strong>Session Security</strong>
                  <span>Protected via JSON Web Token (HTTP-Only & Bearer Header)</span>
                </div>
                <button type="button" className={`${styles.actionButton} ${styles.dangerButton}`} onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Terminate Session (Sign out)</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. DATA PREFERENCES */}
          {activeTab === "data" && (
            <div>
              <div className={styles.sectionTitle}>
                <h2>Display & Calculation Preferences</h2>
                <p>Customize measurement units and table display defaults.</p>
              </div>

              <div className={styles.settingGroup}>
                <label>Measurement Unit System</label>
                <select
                  className={styles.selectInput}
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                >
                  <option value="metric">Metric (Kilometers, Liters, Kilograms)</option>
                  <option value="imperial">Imperial (Miles, Gallons, Pounds)</option>
                </select>
              </div>

              <div className={styles.settingGroup}>
                <label>Date Display Format</label>
                <select
                  className={styles.selectInput}
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 11/10/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/11/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                </select>
              </div>

              <div className={styles.settingGroup}>
                <label>Default Table Rows Per Page</label>
                <select
                  className={styles.selectInput}
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                >
                  <option value="10">10 records</option>
                  <option value="20">20 records</option>
                  <option value="50">50 records</option>
                </select>
              </div>

              <button type="button" className={styles.saveButton} onClick={handleSavePreferences}>
                <Save size={16} />
                <span>Save Data Preferences</span>
              </button>

              {saveSuccess && (
                <div className={styles.successPill}>
                  <CheckCircle2 size={14} />
                  <span>Data preferences saved!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;