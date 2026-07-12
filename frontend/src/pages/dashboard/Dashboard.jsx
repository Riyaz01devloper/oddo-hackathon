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

function Dashboard() {
  const stats = [
    {
      title: "Active Vehicles",
      value: 128,
      icon: Bus,
    },
    {
      title: "Available Vehicles",
      value: 84,
      icon: CheckCircle2,
    },
    {
      title: "Vehicles in Maintenance",
      value: 14,
      icon: Wrench,
    },
    {
      title: "Active Trips",
      value: 56,
      icon: Route,
    },
    {
      title: "Pending Trips",
      value: 19,
      icon: Clock3,
    },
    {
      title: "Drivers On Duty",
      value: 92,
      icon: Users,
    },
    {
      title: "Fleet Utilization",
      value: "87%",
      icon: Gauge,
    },
  ];

  const vehicleStatusData = [
    {
      label: "Active",
      value: 82,
    },
    {
      label: "Available",
      value: 64,
    },
    {
      label: "Maintenance",
      value: 18,
    },
    {
      label: "Inactive",
      value: 10,
    },
  ];

  return (
    <main className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
      </div>

      <section className={styles.cardGrid}>
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            Icon={item.icon}
          />
        ))}
      </section>

      <section className={styles.section}>
        <h2>Vehicle Status</h2>

        <VehicleStatusChart data={vehicleStatusData} />
      </section>
    </main>
  );
}

export default Dashboard;