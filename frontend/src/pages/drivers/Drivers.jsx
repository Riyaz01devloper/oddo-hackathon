import { useEffect, useMemo, useState } from "react";

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

  // GET ALL DRIVERS
  const fetchDrivers = async () => {
    try {
      setLoading(true);

      const response = await getDrivers();

      console.log("Drivers API response:", response);

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

  // LOAD DRIVERS WHEN PAGE OPENS
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

  // FILTER DRIVERS
  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const name = driver.name || "";
      const licenseNumber = driver.licenseNumber || "";

      const searchMatch =
        name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        licenseNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const statusMatch =
        statusFilter === "All" ||
        driver.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [drivers, searchTerm, statusFilter]);

  // ADD DRIVER
  function handleAdd() {
    setEditingDriver(null);
    setIsModalOpen(true);
  }

  // EDIT DRIVER
  function handleEdit(driver) {
    setEditingDriver(driver);
    setIsModalOpen(true);
  }

  // DELETE DRIVER
  async function handleDelete(id) {
    if (!window.confirm("Delete this driver?")) return;

    try {
      await deleteDriver(id);

      // Refresh from database
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

  // CREATE / UPDATE DRIVER
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

      // Get fresh data from MongoDB
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
        <div className={styles.header}>
          <div>
            <h1>Drivers</h1>
            <p>Manage registered drivers.</p>
          </div>

          <button
            className={styles.addButton}
            onClick={handleAdd}
          >
            Add Driver
          </button>
        </div>

        {/* SEARCH */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* TABLE */}
        {loading ? (
          <p>Loading drivers...</p>
        ) : (
          <DriverTable
            drivers={filteredDrivers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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