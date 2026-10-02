import { useEffect, useState } from "react";

import styles from "./Analytics.module.css";

import AnalyticsCard from "../../components/analytics/AnalyticsCard/AnalyticsCard";
import VehicleCostTable from "../../components/analytics/VehicleCostTable/VehicleCostTable";

import {
  getFuelEfficiency,
  getFleetUtilization,
  getOperationalCost,
  getVehicleROI,
} from "../../services/analyticsService";

function Analytics() {
  const [analytics, setAnalytics] = useState({
    fuelEfficiency: 0,
    fleetUtilization: 0,
    operationalCost: 0,
    vehicleROI: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const vehicleCosts = [];

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
        ] = await Promise.all([
          getFuelEfficiency(),
          getFleetUtilization(),
          getOperationalCost(),
          getVehicleROI(),
        ]);

        if (cancelled) return;

        setAnalytics({
          fuelEfficiency:
            fuelEfficiencyResponse.data?.data?.fuelEfficiency ?? 0,

          fleetUtilization:
            fleetUtilizationResponse.data?.data?.fleetUtilization ?? 0,

          operationalCost:
            operationalCostResponse.data?.data?.totalCost ?? 0,

          vehicleROI:
            vehicleROIResponse.data?.data?.vehicleROI ?? 0,
        });
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

    const timer = setTimeout(loadAnalytics, 0);

    const interval = setInterval(loadAnalytics, 10000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
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
        : `₹${Number(
            analytics.operationalCost
          ).toLocaleString("en-IN")}`,
    },
    {
      title: "Vehicle ROI",
      value: loading
        ? "..."
        : `${Number(analytics.vehicleROI).toFixed(1)}%`,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Analytics</h1>
            <p>
              Monitor fleet performance and operational insights.
            </p>
          </div>

          <button
            className={styles.exportButton}
            type="button"
            onClick={() => {
              alert("CSV export will be added next.");
            }}
          >
            Export CSV
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

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