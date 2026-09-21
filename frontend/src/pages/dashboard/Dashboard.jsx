import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import styles from "./Dashboard.module.css";

import {
  Bus,
  CheckCircle2,
  Wrench,
  Route,
  Clock3,
  Users,
  Gauge,
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

  // GET DASHBOARD DATA
  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const response = await api.get("/dashboard");

        console.log("Dashboard API response:", response);

        if (cancelled) return;

        const data =
          response.data?.data ||
          response.data ||
          {};

        setDashboardData({
          activeVehicles:
            data.activeVehicles ?? 0,

          availableVehicles:
            data.availableVehicles ?? 0,

          vehiclesInMaintenance:
            data.vehiclesInMaintenance ?? 0,

          activeTrips:
            data.activeTrips ?? 0,

          pendingTrips:
            data.pendingTrips ?? 0,

          driversOnDuty:
            data.driversOnDuty ?? 0,

          fleetUtilization:
            data.fleetUtilization ?? 0,

          vehicleStatus: {
            active:
              data.vehicleStatus?.active ?? 0,

            available:
              data.vehicleStatus?.available ?? 0,

            maintenance:
              data.vehicleStatus?.maintenance ?? 0,

            inactive:
              data.vehicleStatus?.inactive ?? 0,
          },
        });
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Dashboard error:",
            error.response?.data ||
              error.message
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadDashboard();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // DASHBOARD CARDS
  const stats = [
    {
      title: "Active Vehicles",
      value: dashboardData.activeVehicles,
      icon: Bus,
    },

    {
      title: "Available Vehicles",
      value: dashboardData.availableVehicles,
      icon: CheckCircle2,
    },

    {
      title: "Vehicles in Maintenance",
      value:
        dashboardData.vehiclesInMaintenance,
      icon: Wrench,
    },

    {
      title: "Active Trips",
      value: dashboardData.activeTrips,
      icon: Route,
    },

    {
      title: "Pending Trips",
      value: dashboardData.pendingTrips,
      icon: Clock3,
    },

    {
      title: "Drivers On Duty",
      value: dashboardData.driversOnDuty,
      icon: Users,
    },

    {
      title: "Fleet Utilization",
      value: `${dashboardData.fleetUtilization}%`,
      icon: Gauge,
    },
  ];

  // VEHICLE STATUS CHART
  const vehicleStatusData = [
    {
      label: "Active",
      value:
        dashboardData.vehicleStatus.active,
    },

    {
      label: "Available",
      value:
        dashboardData.vehicleStatus.available,
    },

    {
      label: "Maintenance",
      value:
        dashboardData.vehicleStatus.maintenance,
    },

    {
      label: "Inactive",
      value:
        dashboardData.vehicleStatus.inactive,
    },
  ];

  // AUTH
  const isLoggedIn =
    !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.reload();
  };

  return (
    <main className={styles.dashboard}>

      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome to TransitOps Fleet
            Management
          </p>
        </div>

        <div className={styles.authButtons}>
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className={styles.loginBtn}
              >
                Login
              </Link>

              <Link
                to="/register"
                className={styles.registerBtn}
              >
                Register
              </Link>
            </>
          ) : (
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <section
            className={styles.cardGrid}
          >
            {stats.map((item) => (
              <StatCard
                key={item.title}
                title={item.title}
                value={item.value}
                Icon={item.icon}
              />
            ))}
          </section>

          {/* VEHICLE STATUS */}
          <section
            className={styles.section}
          >
            <h2>Vehicle Status</h2>

            <VehicleStatusChart
              data={vehicleStatusData}
            />
          </section>
        </>
      )}
    </main>
  );
}

export default Dashboard;