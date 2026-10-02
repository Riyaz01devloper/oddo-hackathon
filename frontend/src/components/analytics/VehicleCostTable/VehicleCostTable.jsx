import styles from "./VehicleCostTable.module.css";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function VehicleCostTable({ vehicleCosts = [] }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Fuel Cost</th>
            <th>Maintenance Cost</th>
            <th>Total Cost</th>
          </tr>
        </thead>

        <tbody>
          {vehicleCosts.length > 0 ? (
            vehicleCosts.map((vehicle) => (
              <tr key={vehicle.id || vehicle._id}>
                <td>{vehicle.vehicle}</td>
                <td>{formatCurrency(vehicle.fuelCost)}</td>
                <td>{formatCurrency(vehicle.maintenanceCost)}</td>
                <td>{formatCurrency(vehicle.totalCost)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className={styles.empty}>
                No vehicle cost data yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleCostTable;
