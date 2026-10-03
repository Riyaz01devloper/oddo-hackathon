import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  CarFront,
  ShieldCheck,
  UserX,
  Plus,
} from "lucide-react";

import styles from "./Drivers.module.css";

import SearchBar from "../../components/drivers/SearchBar/SearchBar";
import DriverTable from "../../components/drivers/DriverTable/DriverTable";
import DriverForm from "../../components/drivers/DriverForm/DriverForm";

import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../../services/driverService";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // =========================
  // GET DRIVERS
  // =========================

  const fetchDrivers = async () => {
    try {
      const response = await getDrivers();

      const data =
        response.data?.data ||
        response.data ||
        [];

      setDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Error fetching drivers:",
        error.response?.data || error.message
      );

      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadDrivers = async () => {
      try {
        const response = await getDrivers();

        if (cancelled) return;

        const data =
          response.data?.data ||
          response.data ||
          [];

        setDrivers(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Error fetching drivers:",
            error.response?.data || error.message
          );

          setDrivers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDrivers();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // FILTER DRIVERS
  // =========================

  const filteredDrivers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return drivers.filter((driver) => {
      const name = driver.name || "";
      const licenseNumber = driver.licenseNumber || "";
      const phone = driver.phone || "";

      const searchMatch =
        name.toLowerCase().includes(search) ||
        licenseNumber.toLowerCase().includes(search) ||
        phone.toLowerCase().includes(search);

      const statusMatch =
        statusFilter === "All" ||
        driver.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [drivers, searchTerm, statusFilter]);

  // =========================
  // DRIVER STATS
  // =========================

  const driverStats = useMemo(() => {
    return {
      total: drivers.length,

      available: drivers.filter(
        (driver) => driver.status === "Available"
      ).length,

      onTrip: drivers.filter(
        (driver) => driver.status === "OnTrip"
      ).length,

      offDuty: drivers.filter(
        (driver) => driver.status === "OffDuty"
      ).length,

      suspended: drivers.filter(
        (driver) => driver.status === "Suspended"
      ).length,
    };
  }, [drivers]);

  // =========================
  // ADD DRIVER
  // =========================

  function handleAdd() {
    setEditingDriver(null);
    setIsModalOpen(true);
  }

  // =========================
  // EDIT DRIVER
  // =========================

  function handleEdit(driver) {
    setEditingDriver(driver);
    setIsModalOpen(true);
  }

  // =========================
  // DELETE DRIVER
  // =========================

  async function handleDelete(id) {
    if (!window.confirm("Delete this driver?")) {
      return;
    }

    try {
      await deleteDriver(id);
      await fetchDrivers();
    } catch (error) {
      console.error(
        "Delete driver error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete driver"
      );
    }
  }

  // =========================
  // CREATE / UPDATE
  // =========================

  async function handleSave(driverData) {
    try {
      if (editingDriver) {
        const id =
          editingDriver._id ||
          editingDriver.id;

        await updateDriver(id, driverData);
      } else {
        await createDriver(driverData);
      }

      await fetchDrivers();

      setEditingDriver(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Save driver error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to save driver"
      );
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* HEADER */}

        <header className={styles.header}>
          <div>
            <div className={styles.breadcrumb}>
              Fleet Management
            </div>

            <h1>Drivers</h1>

            <p>
              Manage driver profiles, availability and
              safety information.
            </p>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={handleAdd}
          >
            <Plus size={18} />
            Add Driver
          </button>
        </header>

        {/* SUMMARY */}

        {!loading && (
          <section className={styles.statsGrid}>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.blue}`}
              >
                <Users size={19} />
              </div>

              <div>
                <span>Total Drivers</span>
                <strong>{driverStats.total}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.green}`}
              >
                <UserCheck size={19} />
              </div>

              <div>
                <span>Available</span>
                <strong>{driverStats.available}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.orange}`}
              >
                <CarFront size={19} />
              </div>

              <div>
                <span>On Trip</span>
                <strong>{driverStats.onTrip}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.gray}`}
              >
                <ShieldCheck size={19} />
              </div>

              <div>
                <span>Off Duty</span>
                <strong>{driverStats.offDuty}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.red}`}
              >
                <UserX size={19} />
              </div>

              <div>
                <span>Suspended</span>
                <strong>{driverStats.suspended}</strong>
              </div>
            </div>

          </section>
        )}

        {/* SEARCH / FILTER */}

        <section className={styles.filterSection}>
          <div className={styles.filterHeader}>
            <div>
              <h2>Driver Registry</h2>

              <span>
                {filteredDrivers.length} driver
                {filteredDrivers.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </span>
            </div>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </section>

        {/* TABLE */}

        {loading ? (
          <div className={styles.loadingCard}>
            <div className={styles.loadingIcon}>
              <Users size={22} />
            </div>

            <div className={styles.loadingContent}>
              <div className={styles.loadingLine} />
              <div className={styles.loadingLineSmall} />
            </div>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <DriverTable
              drivers={filteredDrivers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* FORM */}

        {isModalOpen && (
          <DriverForm
            driver={editingDriver}
            onSave={handleSave}
            onCancel={() => {
              setEditingDriver(null);
              setIsModalOpen(false);
            }}
          />
        )}

      </div>
    </div>
  );
}

export default Drivers;