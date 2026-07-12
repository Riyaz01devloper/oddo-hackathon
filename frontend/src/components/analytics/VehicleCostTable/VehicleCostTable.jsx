import styles from "./VehicleCostTable.module.css";

function VehicleCostTable({ vehicleCosts }) {
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
          {vehicleCosts.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.vehicle}</td>

              <td>₹{vehicle.fuelCost.toLocaleString()}</td>

              <td>₹{vehicle.maintenanceCost.toLocaleString()}</td>

              <td>₹{vehicle.totalCost.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleCostTable;