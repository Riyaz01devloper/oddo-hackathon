import styles from "./Analytics.module.css";
import AnalyticsCard from "../../components/analytics/AnalyticsCard/AnalyticsCard";
import VehicleCostTable from "../../components/analytics/VehicleCostTable/VehicleCostTable";

// TODO: GET /api/analytics
const analytics = {
  fuelEfficiency: 8.4,
  fleetUtilization: 81,
  operationalCost: 34070,
  vehicleROI: 14.2,
};

// TODO: GET /api/reports
const vehicleCosts = [
  {
    id: 1,
    vehicle: "Truck-01",
    fuelCost: 3400,
    maintenanceCost: 5000,
    totalCost: 8400,
  },
  {
    id: 2,
    vehicle: "Mini Truck-02",
    fuelCost: 2700,
    maintenanceCost: 2100,
    totalCost: 4800,
  },
  {
    id: 3,
    vehicle: "Van-01",
    fuelCost: 1800,
    maintenanceCost: 900,
    totalCost: 2700,
  },
];

const cards = [
  {
    title: "Fuel Efficiency",
    value: `${analytics.fuelEfficiency} km/L`,
  },
  {
    title: "Fleet Utilization",
    value: `${analytics.fleetUtilization}%`,
  },
  {
    title: "Operational Cost",
    value: `₹${analytics.operationalCost.toLocaleString()}`,
  },
  {
    title: "Vehicle ROI",
    value: `${analytics.vehicleROI}%`,
  },
];

function Analytics() {
  function handleExport() {
    // TODO: Export CSV
    // TODO: Export CSV from backend
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Analytics</h1>
            <p>View operational insights.</p>
          </div>

          <button
            className={styles.exportButton}
            onClick={handleExport}
          >
            Export CSV
          </button>
        </div>

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