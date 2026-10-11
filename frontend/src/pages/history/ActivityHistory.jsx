import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import styles from "./ActivityHistory.module.css";
import { getAuditLogs } from "../../services/historyService";

function ActivityHistory() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      setLoading(true);
      try {
        const res = await getAuditLogs({
          action: actionFilter !== "All" ? actionFilter : undefined,
          entityType: entityFilter !== "All" ? entityFilter : undefined,
          page,
          limit: 20,
        });
        if (cancelled) return;
        const data = res.data?.data || res.data || {};
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load audit logs:", err);
          setLogs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLogs();
    return () => {
      cancelled = true;
    };
  }, [page, actionFilter, entityFilter]);

  const getActionBadgeClass = (action) => {
    if (action.includes("LOGIN") || action.includes("REGISTER")) return styles.actionLogin;
    if (action.includes("UPDATE") || action.includes("CHANGE")) return styles.actionUpdate;
    if (action.includes("AI_QUERY")) return styles.actionAi;
    if (action.includes("DELETE") || action.includes("CANCEL")) return styles.actionDanger;
    return styles.actionUpdate;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>Compliance & Audit</div>
        <h1>System Activity History</h1>
        <p>Immutable audit trail tracking operational dispatches, user access, and fleet record modifications.</p>
      </header>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={16} color="#64748b" />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Filter Events:</span>
        </div>

        <select
          className={styles.filterSelect}
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="REGISTER">REGISTER</option>
          <option value="UPDATE_PROFILE">UPDATE_PROFILE</option>
          <option value="CHANGE_PASSWORD">CHANGE_PASSWORD</option>
          <option value="AI_QUERY">AI_QUERY</option>
          <option value="DISPATCH_TRIP">DISPATCH_TRIP</option>
          <option value="COMPLETE_TRIP">COMPLETE_TRIP</option>
        </select>

        <select
          className={styles.filterSelect}
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Entities</option>
          <option value="User">User</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Driver">Driver</option>
          <option value="Trip">Trip</option>
          <option value="Maintenance">Maintenance</option>
          <option value="AICopilot">AICopilot</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Operational Summary</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  Loading audit trail...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  No activity events recorded matching these parameters.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const dateStr = log.createdAt
                  ? new Date(log.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "-";

                return (
                  <tr key={log._id || log.id}>
                    <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#64748b" }}>
                      {dateStr}
                    </td>
                    <td>
                      <div className={styles.actorInfo}>
                        <strong>{log.actor?.name || "System"}</strong>
                        <span>{log.actor?.role || "User"}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.actionBadge} ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <strong>{log.entityType}</strong>
                    </td>
                    <td style={{ maxWidth: "380px" }}>
                      <span style={{ fontSize: "12px", color: "#475569" }}>
                        {log.details || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Showing {logs.length} of {total} event(s)
          </span>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} style={{ display: "inline" }} /> Previous
            </button>
            <span style={{ fontSize: "12px", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageButton}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} style={{ display: "inline" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityHistory;
