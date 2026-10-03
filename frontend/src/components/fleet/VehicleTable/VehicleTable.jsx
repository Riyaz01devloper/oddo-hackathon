import {
  Truck,
  Gauge,
  Pencil,
  Trash2,
} from "lucide-react";

import styles from "./VehicleTable.module.css";
import StatusBadge from "../StatusBadge/StatusBadge";

function VehicleTable({ vehicles = [], onEdit, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Registration</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Status</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => {
                const vehicleId =
                  vehicle._id || vehicle.id;

                return (
                  <tr key={vehicleId}>
                    {/* VEHICLE */}
                    <td>
                      <div className={styles.vehicleCell}>
                        <div className={styles.vehicleIcon}>
                          <Truck size={17} />
                        </div>

                        <div className={styles.vehicleInfo}>
                          <strong>
                            {vehicle.name || "-"}
                          </strong>

                          <span>
                            {vehicle.type || "Vehicle"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* REGISTRATION */}
                    <td>
                      <span className={styles.registration}>
                        {vehicle.registrationNumber || "-"}
                      </span>
                    </td>

                    {/* TYPE */}
                    <td>
                      <span className={styles.type}>
                        {vehicle.type || "-"}
                      </span>
                    </td>

                    {/* CAPACITY */}
                    <td>
                      <span className={styles.number}>
                        {Number(
                          vehicle.maxLoadCapacity ?? 0
                        ).toLocaleString("en-IN")}
                        <small> kg</small>
                      </span>
                    </td>

                    {/* ODOMETER */}
                    <td>
                      <div className={styles.odometer}>
                        <Gauge size={15} />

                        <span>
                          {Number(
                            vehicle.odometer ?? 0
                          ).toLocaleString("en-IN")}
                          <small> km</small>
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td>
                      <StatusBadge
                        status={vehicle.status}
                      />
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() =>
                            onEdit(vehicle)
                          }
                          title="Edit vehicle"
                        >
                          <Pencil size={15} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() =>
                            onDelete(vehicleId)
                          }
                          title="Delete vehicle"
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className={styles.empty}
                >
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Truck size={22} />
                    </div>

                    <strong>
                      No vehicles found
                    </strong>

                    <span>
                      Try changing your search or
                      filter criteria.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VehicleTable;