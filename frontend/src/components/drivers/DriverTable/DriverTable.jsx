import {
  User,
  ShieldCheck,
  Pencil,
  Trash2,
} from "lucide-react";

import styles from "./DriverTable.module.css";
import StatusBadge from "../../fleet/StatusBadge/StatusBadge";

function DriverTable({
  drivers = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Driver</th>
              <th>License</th>
              <th>Category</th>
              <th>Expiry</th>
              <th>Contact</th>
              <th>Safety Score</th>
              <th>Status</th>
              <th className={styles.actionsHeader}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {drivers.length > 0 ? (
              drivers.map((driver) => {
                const driverId =
                  driver._id || driver.id;

                const safetyScore =
                  Number(driver.safetyScore ?? 0);

                return (
                  <tr key={driverId}>
                    {/* DRIVER */}

                    <td>
                      <div className={styles.driverCell}>
                        <div className={styles.avatar}>
                          {(driver.name || "D")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className={styles.driverInfo}>
                          <strong>
                            {driver.name || "-"}
                          </strong>

                          <span>
                            {driver.phone || "No phone"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* LICENSE */}

                    <td>
                      <span className={styles.license}>
                        {driver.licenseNumber || "-"}
                      </span>
                    </td>

                    {/* CATEGORY */}

                    <td>
                      <span className={styles.category}>
                        {driver.licenseCategory || "-"}
                      </span>
                    </td>

                    {/* EXPIRY */}

                    <td>
                      <span className={styles.expiry}>
                        {driver.licenseExpiry
                          ? new Date(
                              driver.licenseExpiry
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </td>

                    {/* CONTACT */}

                    <td>
                      <span className={styles.phone}>
                        {driver.phone || "-"}
                      </span>
                    </td>

                    {/* SAFETY SCORE */}

                    <td>
                      <div className={styles.safety}>
                        <div className={styles.safetyTop}>
                          <ShieldCheck size={14} />

                          <strong>
                            {safetyScore}
                          </strong>
                        </div>

                        <div
                          className={
                            styles.safetyTrack
                          }
                        >
                          <div
                            className={
                              styles.safetyFill
                            }
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  safetyScore,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <StatusBadge
                        status={driver.status}
                      />
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() =>
                            onEdit(driver)
                          }
                          title="Edit driver"
                        >
                          <Pencil size={15} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() =>
                            onDelete(driverId)
                          }
                          title="Delete driver"
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
                  colSpan="8"
                  className={styles.empty}
                >
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <User size={22} />
                    </div>

                    <strong>
                      No drivers found
                    </strong>

                    <span>
                      Try changing your search or
                      status filter.
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

export default DriverTable;