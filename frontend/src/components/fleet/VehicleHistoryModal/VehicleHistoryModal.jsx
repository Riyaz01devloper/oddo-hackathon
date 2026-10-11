import { useState, useEffect } from "react";
import { X, Truck, Wrench, Fuel } from "lucide-react";
import styles from "./VehicleHistoryModal.module.css";
import { getVehicleHistory } from "../../../services/historyService";
import StatusBadge from "../StatusBadge/StatusBadge";

function VehicleHistoryModal({ vehicleId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trips");

  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      try {
        const res = await getVehicleHistory(vehicleId);
        if (!cancelled) {
          setData(res.data?.data || res.data);
        }
      } catch (err) {
        console.error("Failed to load vehicle history:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (vehicleId) loadHistory();
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  if (!vehicleId) return null;

  const vehicle = data?.vehicle;
  const stats = data?.stats;
  const trips = data?.trips || [];
  const maintenance = data?.maintenance || [];
  const fuelLogs = data?.fuelLogs || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            Vehicle Lifecycle Log: {vehicle?.name || "Loading..."} (
            {vehicle?.registrationNumber || ""})
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Loading vehicle operational records...
            </div>
          ) : !vehicle ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Vehicle record not found.
            </div>
          ) : (
            <div>
              {/* Cost Summary Cards */}
              <div className={styles.costBreakdown}>
                <div className={styles.costCard}>
                  <span>Total Operating Cost</span>
                  <strong style={{ color: "#2563eb" }}>
                    ₹{Number(stats?.totalOperatingCost || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className={styles.costCard}>
                  <span>Total Fuel Expenses</span>
                  <strong>
                    ₹{Number(stats?.totalFuelCost || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className={styles.costCard}>
                  <span>Total Maintenance Cost</span>
                  <strong>
                    ₹{Number(stats?.totalMaintenanceCost || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className={styles.costCard}>
                  <span>Recorded Trips</span>
                  <strong>{stats?.totalTrips || 0}</strong>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "trips" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("trips")}
                >
                  <Truck size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Trips ({trips.length})
                </button>

                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "maintenance" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("maintenance")}
                >
                  <Wrench size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Maintenance ({maintenance.length})
                </button>

                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "fuel" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("fuel")}
                >
                  <Fuel size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Fuel Records ({fuelLogs.length})
                </button>
              </div>

              {/* Trips Tab */}
              {activeTab === "trips" && (
                <div>
                  {trips.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#64748b" }}>No trips on record.</p>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Trip ID</th>
                          <th>Route</th>
                          <th>Driver</th>
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
                            <td>{t.driver?.name || "Unassigned"}</td>
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

              {/* Maintenance Tab */}
              {activeTab === "maintenance" && (
                <div>
                  {maintenance.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#64748b" }}>No maintenance records on file.</p>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Service Date</th>
                          <th>Issue Description</th>
                          <th>Service Cost</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenance.map((m) => (
                          <tr key={m._id}>
                            <td>
                              {m.serviceDate
                                ? new Date(m.serviceDate).toLocaleDateString("en-IN")
                                : "-"}
                            </td>
                            <td>{m.issue}</td>
                            <td>₹{Number(m.cost || 0).toLocaleString("en-IN")}</td>
                            <td>
                              <StatusBadge status={m.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Fuel Tab */}
              {activeTab === "fuel" && (
                <div>
                  {fuelLogs.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#64748b" }}>No fuel consumption logs on file.</p>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Fuel Quantity</th>
                          <th>Total Cost</th>
                          <th>Odometer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fuelLogs.map((f) => (
                          <tr key={f._id}>
                            <td>
                              {f.date ? new Date(f.date).toLocaleDateString("en-IN") : "-"}
                            </td>
                            <td>{f.liters} Liters</td>
                            <td>₹{Number(f.totalCost || 0).toLocaleString("en-IN")}</td>
                            <td>{f.odometer ? `${f.odometer} km` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleHistoryModal;
