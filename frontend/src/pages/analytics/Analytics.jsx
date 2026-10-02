import { useEffect, useState } from "react";

import styles from "./Analytics.module.css";

import AnalyticsCard from "../../components/analytics/AnalyticsCard/AnalyticsCard";
import VehicleCostTable from "../../components/analytics/VehicleCostTable/VehicleCostTable";

import {
  getFuelEfficiency,
  getFleetUtilization,
  getOperationalCost,
  getVehicleROI,
  getVehicleCosts,
} from "../../services/analyticsService";

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? {};
}

function Analytics() {
  const [analytics, setAnalytics] = useState({
    fuelEfficiency: 0,
    fleetUtilization: 0,
    operationalCost: 0,
    vehicleROI: 0,
  });

  const [vehicleCosts, setVehicleCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      try {
        setError("");

        const [
          fuelEfficiencyResponse,
          fleetUtilizationResponse,
          operationalCostResponse,
          vehicleROIResponse,
          vehicleCostsResponse,
        ] = await Promise.all([
          getFuelEfficiency(),
          getFleetUtilization(),
          getOperationalCost(),
          getVehicleROI(),
          getVehicleCosts(),
        ]);

        if (cancelled) return;

        const fuelData = unwrap(fuelEfficiencyResponse);
        const utilizationData = unwrap(fleetUtilizationResponse);
        const costData = unwrap(operationalCostResponse);
        const roiData = unwrap(vehicleROIResponse);
        const costsData = unwrap(vehicleCostsResponse);

        setAnalytics({
          fuelEfficiency: fuelData.fuelEfficiency ?? 0,
          fleetUtilization: utilizationData.fleetUtilization ?? 0,
          operationalCost: costData.totalCost ?? 0,
          vehicleROI: roiData.vehicleROI ?? 0,
        });

        setVehicleCosts(Array.isArray(costsData) ? costsData : []);
      } catch (err) {
        if (!cancelled) {
          console.error("Analytics loading error:", err);

          setError(
            err.response?.data?.message ||
              "Failed to load analytics."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    const interval = setInterval(loadAnalytics, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const cards = [
    {
      title: "Fuel Efficiency",
      value: loading
        ? "..."
        : `${Number(analytics.fuelEfficiency).toFixed(2)} km/L`,
    },
    {
      title: "Fleet Utilization",
      value: loading
        ? "..."
        : `${Number(analytics.fleetUtilization).toFixed(1)}%`,
    },
    {
      title: "Operational Cost",
      value: loading
        ? "..."
        : `₹${Number(analytics.operationalCost).toLocaleString("en-IN")}`,
    },
    {
      title: "Vehicle ROI",
      value: loading
        ? "..."
        : `${Number(analytics.vehicleROI).toFixed(1)}%`,
    },
  ];

  function handleExport() {
    const rows = [
      ["Vehicle", "Fuel Cost", "Maintenance Cost", "Total Cost"],
      ...vehicleCosts.map((item) => [
        item.vehicle,
        item.fuelCost,
        item.maintenanceCost,
        item.totalCost,
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "analytics-vehicle-costs.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Analytics</h1>
            <p>
              Live fleet performance based on trips, fuel, maintenance, and expenses.
            </p>
          </div>

          <button
            className={styles.exportButton}
            type="button"
            onClick={handleExport}
            disabled={vehicleCosts.length === 0}
          >
            Export CSV
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <section className={styles.cardGrid}>
          {cards.map((card) => (
            <AnalyticsCard
              key={card.title}
              title={card.title}
              value={card.value}
            />
          ))}
        </section>

        <VehicleCostTable vehicleCosts={vehicleCosts} />
      </div>
    </div>
  );
}

export default Analytics;
