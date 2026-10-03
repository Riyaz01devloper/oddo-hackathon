import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  CheckCircle2,
  Wrench,
  Archive,
  Plus,
} from "lucide-react";

import styles from "./Fleet.module.css";
import SearchBar from "../../components/fleet/SearchBar/SearchBar";
import VehicleTable from "../../components/fleet/VehicleTable/VehicleTable";
import VehicleForm from "../../components/fleet/VehicleForm/VehicleForm";

import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../services/vehicleService";

function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // =========================
  // GET VEHICLES
  // =========================

  const fetchVehicles = async () => {
    try {
      const response = await getVehicles();

      const data =
        response.data?.vehicles ||
        response.data?.data ||
        [];

      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Error fetching vehicles:",
        error.response?.data || error.message
      );

      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadVehicles = async () => {
      try {
        const response = await getVehicles();

        if (cancelled) return;

        const data =
          response.data?.vehicles ||
          response.data?.data ||
          [];

        setVehicles(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Error fetching vehicles:",
            error.response?.data || error.message
          );

          setVehicles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // FILTER VEHICLES
  // =========================

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const registration = vehicle.registrationNumber || "";
      const name = vehicle.name || "";
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        registration.toLowerCase().includes(search) ||
        name.toLowerCase().includes(search);

      const matchesType =
        typeFilter === "All" ||
        vehicle.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" ||
        vehicle.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    vehicles,
    searchTerm,
    typeFilter,
    statusFilter,
  ]);

  // =========================
  // VEHICLE COUNTS
  // =========================

  const vehicleStats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter(
        (vehicle) => vehicle.status === "Available"
      ).length,
      onTrip: vehicles.filter(
        (vehicle) => vehicle.status === "OnTrip"
      ).length,
      maintenance: vehicles.filter(
        (vehicle) => vehicle.status === "InShop"
      ).length,
      retired: vehicles.filter(
        (vehicle) => vehicle.status === "Retired"
      ).length,
    };
  }, [vehicles]);

  // =========================
  // ADD VEHICLE
  // =========================

  function handleAddVehicle() {
    setEditingVehicle(null);
    setIsModalOpen(true);
  }

  // =========================
  // EDIT VEHICLE
  // =========================

  function handleEdit(vehicle) {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  }

  // =========================
  // DELETE VEHICLE
  // =========================

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVehicle(id);
      await fetchVehicles();
    } catch (error) {
      console.error(
        "Delete vehicle error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete vehicle"
      );
    }
  }

  // =========================
  // CREATE / UPDATE
  // =========================

  async function handleSave(vehicleData) {
    try {
      if (editingVehicle) {
        const id =
          editingVehicle._id ||
          editingVehicle.id;

        await updateVehicle(id, vehicleData);
      } else {
        await createVehicle(vehicleData);
      }

      await fetchVehicles();

      setIsModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error(
        "Save vehicle error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to save vehicle"
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

            <h1>Vehicle Registry</h1>

            <p>
              Manage vehicles, availability and fleet status
              from one place.
            </p>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddVehicle}
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        </header>

        {/* SUMMARY CARDS */}

        {!loading && (
          <section className={styles.statsGrid}>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.blue}`}
              >
                <Truck size={19} />
              </div>

              <div>
                <span>Total Vehicles</span>
                <strong>{vehicleStats.total}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.green}`}
              >
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>Available</span>
                <strong>{vehicleStats.available}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.orange}`}
              >
                <Truck size={19} />
              </div>

              <div>
                <span>On Trip</span>
                <strong>{vehicleStats.onTrip}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.red}`}
              >
                <Wrench size={19} />
              </div>

              <div>
                <span>Maintenance</span>
                <strong>{vehicleStats.maintenance}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.gray}`}
              >
                <Archive size={19} />
              </div>

              <div>
                <span>Retired</span>
                <strong>{vehicleStats.retired}</strong>
              </div>
            </div>

          </section>
        )}

        {/* SEARCH / FILTERS */}

        <section className={styles.filterSection}>
          <div className={styles.filterHeader}>
            <div>
              <h2>All Vehicles</h2>
              <span>
                {filteredVehicles.length} vehicle
                {filteredVehicles.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </section>

        {/* TABLE */}

        {loading ? (
          <div className={styles.loadingCard}>
            <div className={styles.loadingIcon}>
              <Truck size={22} />
            </div>

            <div className={styles.loadingContent}>
              <div className={styles.loadingLine} />
              <div className={styles.loadingLineSmall} />
            </div>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <VehicleTable
              vehicles={filteredVehicles}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* ADD / EDIT MODAL */}

        {isModalOpen && (
          <VehicleForm
            vehicle={editingVehicle}
            onSave={handleSave}
            onCancel={() => {
              setEditingVehicle(null);
              setIsModalOpen(false);
            }}
          />
        )}

      </div>
    </div>
  );
}

export default Fleet;