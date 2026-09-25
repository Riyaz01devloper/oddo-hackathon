import { useEffect, useState } from "react";
import api from "../../services/api";
function Reports() {
  const [reports, setReports] = useState({
    fleetUtilization: 0,
    fuelEfficiency: 0,
    operationalCost: 0,
    vehicleROI: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setError("");

      const [
        fuelResponse,
        utilizationResponse,
        costResponse,
        roiResponse,
      ] = await Promise.all([
        api.get("/reports/analytics/fuel-efficiency"),
        api.get("/reports/analytics/fleet-utilization"),
        api.get("/reports/analytics/operational-cost"),
        api.get("/reports/analytics/vehicle-roi"),
      ]);

      setReports({
        fuelEfficiency:
          fuelResponse.data?.data?.fuelEfficiency ?? 0,

        fleetUtilization:
          utilizationResponse.data?.data?.fleetUtilization ?? 0,

        operationalCost:
          costResponse.data?.data?.totalCost ?? 0,

        vehicleROI:
          roiResponse.data?.data?.vehicleROI ?? 0,
      });
    } catch (err) {
      console.error("Failed to fetch reports:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const timer = setTimeout(() => {
    fetchReports();
  }, 0);

  const interval = setInterval(() => {
    fetchReports();
  }, 10000);

  return () => {
    clearTimeout(timer);
    clearInterval(interval);
  };
}, []);
    // Refresh analytics every 10 seconds
 
  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const stats = [
    {
      title: "Fleet Utilization",
      value: loading
        ? "Loading..."
        : `${Number(reports.fleetUtilization).toFixed(1)}%`,
    },
    {
      title: "Fuel Efficiency",
      value: loading
        ? "Loading..."
        : `${Number(reports.fuelEfficiency).toFixed(2)} km/L`,
    },
    {
      title: "Operational Cost",
      value: loading
        ? "Loading..."
        : formatCurrency(reports.operationalCost),
    },
    {
      title: "Average ROI",
      value: loading
        ? "Loading..."
        : `${Number(reports.vehicleROI).toFixed(2)}%`,
    },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Reports & Analytics</h1>

          <p style={styles.subtitle}>
            Monitor fleet performance and operational costs.
          </p>
        </div>

        <button
          onClick={fetchReports}
          style={styles.refreshButton}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <div style={styles.grid}>
        {stats.map((stat) => (
          <div
            key={stat.title}
            style={styles.card}
          >
            <p style={styles.cardTitle}>
              {stat.title}
            </p>

            <h2 style={styles.cardValue}>
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <div style={styles.report}>
        <h2 style={styles.reportTitle}>
          Fleet Performance Summary
        </h2>

        <p style={styles.reportText}>
          Current fleet utilization is{" "}
          <strong>
            {Number(reports.fleetUtilization).toFixed(1)}%
          </strong>
          . The fleet is achieving{" "}
          <strong>
            {Number(reports.fuelEfficiency).toFixed(2)} km/L
          </strong>{" "}
          fuel efficiency with total operational costs of{" "}
          <strong>
            {formatCurrency(reports.operationalCost)}
          </strong>
          .
        </p>

        <p style={styles.updated}>
          Analytics automatically refresh every 10 seconds.
        </p>
      </div>
    </main>
  );
}

const styles = {
  page: {
    padding: "30px",
    minHeight: "100vh",
    background: "#f8fafc",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  heading: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  refreshButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "600",
  },

  cardValue: {
    marginTop: "12px",
    marginBottom: 0,
    fontSize: "28px",
    color: "#111827",
  },

  report: {
    marginTop: "30px",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },

  reportTitle: {
    marginTop: 0,
    color: "#111827",
  },

  reportText: {
    color: "#4b5563",
    lineHeight: "1.7",
  },

  updated: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#9ca3af",
  },
};

export default Reports;