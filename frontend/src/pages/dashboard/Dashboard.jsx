import { useEffect, useState } from "react";

import styles from "./Dashboard.module.css";

import {
  Bus,
  CheckCircle2,
  Wrench,
  Route,
  Clock3,
  Users,
  Gauge,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import StatCard from "../../components/dashboard/StatCard/StatCard";
import VehicleStatusChart from "../../components/dashboard/VehicleStatusChart/VehicleStatusChart";
import api from "../../services/api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0,
    vehicleStatus: {
      active: 0,
      available: 0,
      maintenance: 0,
      inactive: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/dashboard");

      const data =
        response.data?.data ||
        response.data ||
        {};

      setDashboardData({
        activeVehicles: data.activeVehicles ?? 0,
        availableVehicles: data.availableVehicles ?? 0,
        vehiclesInMaintenance:
          data.vehiclesInMaintenance ?? 0,
        activeTrips: data.activeTrips ?? 0,
        pendingTrips: data.pendingTrips ?? 0,
        driversOnDuty: data.driversOnDuty ?? 0,
        fleetUtilization: data.fleetUtilization ?? 0,

        vehicleStatus: {
          active: data.vehicleStatus?.active ?? 0,
          available: data.vehicleStatus?.available ?? 0,
          maintenance:
            data.vehicleStatus?.maintenance ?? 0,
          inactive: data.vehicleStatus?.inactive ?? 0,
        },
      });
    } catch (error) {
      console.error(
        "Dashboard error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      if (cancelled) return;
      await loadDashboard();
    };

    const timer = setTimeout(initialLoad, 0);

    const interval = setInterval(() => {
      if (!cancelled) {
        loadDashboard();
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const stats = [
    {
      title: "Active Vehicles",
      value: dashboardData.activeVehicles,
      icon: Bus,
      description: "Currently on trip",
      type: "primary",
    },
    {
      title: "Available Vehicles",
      value: dashboardData.availableVehicles,
      icon: CheckCircle2,
      description: "Ready for dispatch",
      type: "success",
    },
    {
      title: "Maintenance",
      value: dashboardData.vehiclesInMaintenance,
      icon: Wrench,
      description: "Vehicles in shop",
      type: "warning",
    },
    {
      title: "Active Trips",
      value: dashboardData.activeTrips,
      icon: Route,
      description: "Currently dispatched",
      type: "primary",
    },
    {
      title: "Pending Trips",
      value: dashboardData.pendingTrips,
      icon: Clock3,
      description: "Awaiting dispatch",
      type: "warning",
    },
    {
      title: "Drivers On Duty",
      value: dashboardData.driversOnDuty,
      icon: Users,
      description: "Currently on duty",
      type: "success",
    },
    {
      title: "Fleet Utilization",
      value: `${Number(
        dashboardData.fleetUtilization
      ).toFixed(1)}%`,
      icon: Gauge,
      description: "Current utilization",
      type: "primary",
    },
  ];

  const vehicleStatusData = [
    {
      label: "Active",
      value: dashboardData.vehicleStatus.active,
    },
    {
      label: "Available",
      value: dashboardData.vehicleStatus.available,
    },
    {
      label: "Maintenance",
      value: dashboardData.vehicleStatus.maintenance,
    },
    {
      label: "Inactive",
      value: dashboardData.vehicleStatus.inactive,
    },
  ];

  const totalVehicles =
    dashboardData.vehicleStatus.active +
    dashboardData.vehicleStatus.available +
    dashboardData.vehicleStatus.maintenance +
    dashboardData.vehicleStatus.inactive;

  return (
    <main className={styles.dashboard}>
      {/* ================================
          HEADER
      ================================= */}

      <header className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            Overview
          </div>

          <h1>Dashboard</h1>

          <p>
            Monitor your fleet performance and
            operations in real time.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing ? styles.spinning : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {/* ================================
          ERROR
      ================================= */}

      {error && (
        <div className={styles.errorBanner}>
          <div>
            <strong>Unable to load dashboard</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
          >
            Try again
          </button>
        </div>
      )}

      {/* ================================
          STAT CARDS
      ================================= */}

      {loading ? (
        <section className={styles.cardGrid}>
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              className={styles.skeletonCard}
              key={index}
            >
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonValue} />
            </div>
          ))}
        </section>
      ) : (
        <section className={styles.cardGrid}>
          {stats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              Icon={item.icon}
              description={item.description}
              type={item.type}
            />
          ))}
        </section>
      )}

      {/* ================================
          MAIN OVERVIEW
      ================================= */}

      {!loading && (
        <section className={styles.overviewGrid}>
          {/* Fleet Status */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Fleet Status</h2>
                <p>
                  Current distribution of your vehicles
                </p>
              </div>

              <div className={styles.totalVehicles}>
                <span>{totalVehicles}</span>
                <small>Total vehicles</small>
              </div>
            </div>

            <div className={styles.chartWrapper}>
              <VehicleStatusChart
                data={vehicleStatusData}
              />
            </div>
          </div>

          {/* Operational Summary */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Operations Overview</h2>
                <p>
                  Current operational activity
                </p>
              </div>

              <Route
                size={20}
                className={styles.panelIcon}
              />
            </div>

            <div className={styles.operationList}>
              <div className={styles.operationItem}>
                <div
                  className={`${styles.operationIcon} ${styles.blue}`}
                >
                  <Route size={17} />
                </div>

                <div className={styles.operationInfo}>
                  <strong>Active Trips</strong>
                  <span>
                    Trips currently dispatched
                  </span>
                </div>

                <div className={styles.operationValue}>
                  {dashboardData.activeTrips}
                </div>
              </div>

              <div className={styles.operationItem}>
                <div
                  className={`${styles.operationIcon} ${styles.orange}`}
                >
                  <Clock3 size={17} />
                </div>

                <div className={styles.operationInfo}>
                  <strong>Pending Trips</strong>
                  <span>
                    Trips waiting for dispatch
                  </span>
                </div>

                <div className={styles.operationValue}>
                  {dashboardData.pendingTrips}
                </div>
              </div>

              <div className={styles.operationItem}>
                <div
                  className={`${styles.operationIcon} ${styles.green}`}
                >
                  <Users size={17} />
                </div>

                <div className={styles.operationInfo}>
                  <strong>Drivers On Duty</strong>
                  <span>
                    Drivers currently working
                  </span>
                </div>

                <div className={styles.operationValue}>
                  {dashboardData.driversOnDuty}
                </div>
              </div>

              <div className={styles.operationItem}>
                <div
                  className={`${styles.operationIcon} ${styles.red}`}
                >
                  <Wrench size={17} />
                </div>

                <div className={styles.operationInfo}>
                  <strong>Maintenance</strong>
                  <span>
                    Vehicles currently in shop
                  </span>
                </div>

                <div className={styles.operationValue}>
                  {dashboardData.vehiclesInMaintenance}
                </div>
              </div>
            </div>

            <div className={styles.panelFooter}>
              <span>View detailed operations</span>

              <ArrowUpRight size={16} />
            </div>
          </div>
        </section>
      )}

      {/* ================================
          AI INSIGHTS PLACEHOLDER
      ================================= */}

      {!loading && (
        <section className={styles.aiPanel}>
          <div className={styles.aiIcon}>✦</div>

          <div className={styles.aiContent}>
            <span className={styles.aiLabel}>
              TRANSITOPS AI
            </span>

            <h2>AI Fleet Insights</h2>

            <p>
              AI-powered operational insights will
              appear here once the fleet intelligence
              module is connected.
            </p>
          </div>

          <button
            type="button"
            className={styles.aiButton}
            disabled
          >
            Coming soon
          </button>
        </section>
      )}
    </main>
  );
}

export default Dashboard;