import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import styles from "./DriverHistoryModal.module.css";
import { getDriverHistory } from "../../../services/historyService";
import StatusBadge from "../../fleet/StatusBadge/StatusBadge";

function DriverHistoryModal({ driverId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      try {
        const res = await getDriverHistory(driverId);
        if (!cancelled) {
          setData(res.data?.data || res.data);
        }
      } catch (err) {
        console.error("Failed to load driver history:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (driverId) loadHistory();
    return () => {
      cancelled = true;
    };
  }, [driverId]);

  if (!driverId) return null;

  const driver = data?.driver;
  const stats = data?.stats;
  const trips = data?.trips || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            Driver Operational Record: {driver?.name || "Loading..."}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Loading operational logs...
            </div>
          ) : !driver ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Driver record not found.
            </div>
          ) : (
            <div>
              {/* Stat Cards */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span>Total Trips Assigned</span>
                  <strong>{stats?.totalTrips || 0}</strong>
                </div>

                <div className={styles.statCard}>
                  <span>Completed Trips</span>
                  <strong style={{ color: "#16a34a" }}>{stats?.completedTripsCount || 0}</strong>
                </div>

                <div className={styles.statCard}>
                  <span>Safety Evaluation</span>
                  <strong style={{ color: driver.safetyScore < 75 ? "#dc2626" : "#2563eb" }}>
                    {driver.safetyScore}/100
                  </strong>
                </div>

                <div className={styles.statCard}>
                  <span>License Validity</span>
                  <strong style={{ color: stats?.isLicenseExpired ? "#dc2626" : "#475569" }}>
                    {stats?.isLicenseExpired
                      ? "Expired"
                      : `${stats?.daysUntilLicenseExpiry} days`}
                  </strong>
                </div>
              </div>

              {/* License Warning Banner if Expiring */}
              {stats?.daysUntilLicenseExpiry <= 30 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: stats?.isLicenseExpired ? "#fef2f2" : "#fffbeb",
                    color: stats?.isLicenseExpired ? "#b91c1c" : "#b45309",
                    border: "1px solid",
                    borderColor: stats?.isLicenseExpired ? "#fecaca" : "#fde68a",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    marginBottom: "20px",
                  }}
                >
                  <AlertTriangle size={15} />
                  <span>
                    License #{driver.licenseNumber}{" "}
                    {stats?.isLicenseExpired
                      ? "has expired! Driver cannot be dispatched."
                      : `expires in ${stats?.daysUntilLicenseExpiry} days.`}
                  </span>
                </div>
              )}

              {/* Active Trip Banner */}
              {stats?.activeTrip && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "20px",
                    fontSize: "13px",
                  }}
                >
                  <strong style={{ color: "#1d4ed8", display: "block", marginBottom: "4px" }}>
                    Currently On Duty &bull; Dispatched Trip #{String(stats.activeTrip._id).slice(-6)}
                  </strong>
                  <span style={{ color: "#475569" }}>
                    Route: {stats.activeTrip.source || "-"} &rarr; {stats.activeTrip.destination || "-"}{" "}
                    &bull; Cargo: {stats.activeTrip.cargoWeight || 0} kg
                  </span>
                </div>
              )}

              {/* Trip History Table */}
              <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 12px", color: "var(--text-primary, #0f172a)" }}>
                Recent Trip Assignments ({trips.length})
              </h3>

              {trips.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  No trip records found for this driver.
                </p>
              ) : (
                <table className={styles.tripsTable}>
                  <thead>
                    <tr>
                      <th>Trip ID</th>
                      <th>Route</th>
                      <th>Vehicle</th>
                      <th>Cargo</th>
                      <th>Distance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((t) => (
                      <tr key={t._id}>
                        <td>
                          <strong>#{String(t._id).slice(-6)}</strong>
                        </td>
                        <td>
                          {t.source || "-"} &rarr; {t.destination || "-"}
                        </td>
                        <td>
                          {t.vehicle?.name || "-"} ({t.vehicle?.registrationNumber || "No Reg"})
                        </td>
                        <td>{Number(t.cargoWeight || 0).toLocaleString("en-IN")} kg</td>
                        <td>{Number(t.plannedDistance || 0).toLocaleString("en-IN")} km</td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DriverHistoryModal;
