import { useEffect, useMemo, useState } from "react";
import {
  Route,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";

import styles from "./Trips.module.css";

import TripForm from "../../components/trips/TripForm/TripForm";
import TripTable from "../../components/trips/TripTable/TripTable";
import SearchBar from "../../components/trips/SearchBar/SearchBar";

import {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../../services/tripService";

import { getVehicles } from "../../services/vehicleService";
import { getDrivers } from "../../services/driverService";

function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  // =========================
  // LOAD DATA
  // =========================

  const fetchTrips = async () => {
    try {
      const response = await getTrips();

      const data =
        response.data?.data ||
        response.data?.trips ||
        response.data ||
        [];

      setTrips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Error fetching trips:",
        error.response?.data || error.message
      );

      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

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
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [tripsResponse, vehiclesResponse, driversResponse] =
          await Promise.all([
            getTrips(),
            getVehicles(),
            getDrivers(),
          ]);

        if (cancelled) return;

        const tripData =
          tripsResponse.data?.data ||
          tripsResponse.data?.trips ||
          tripsResponse.data ||
          [];

        const vehicleData =
          vehiclesResponse.data?.vehicles ||
          vehiclesResponse.data?.data ||
          [];

        const driverData =
          driversResponse.data?.data ||
          driversResponse.data ||
          [];

        setTrips(Array.isArray(tripData) ? tripData : []);
        setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
        setDrivers(Array.isArray(driverData) ? driverData : []);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Error loading trips page:",
            error.response?.data || error.message
          );

          setTrips([]);
          setVehicles([]);
          setDrivers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // FILTER
  // =========================

  const filteredTrips = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return trips.filter((trip) => {
      const vehicleName =
        trip.vehicle?.name ||
        trip.vehicle?.registrationNumber ||
        "";

      const driverName =
        trip.driver?.name || "";

      const source = trip.source || "";
      const destination = trip.destination || "";

      const matchSearch =
        source.toLowerCase().includes(searchValue) ||
        destination.toLowerCase().includes(searchValue) ||
        vehicleName.toLowerCase().includes(searchValue) ||
        driverName.toLowerCase().includes(searchValue);

      const matchStatus =
        statusFilter === "All" ||
        trip.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [trips, search, statusFilter]);

  // =========================
  // STATS
  // =========================

  const tripStats = useMemo(() => {
    return {
      total: trips.length,

      draft: trips.filter(
        (trip) => trip.status === "Draft"
      ).length,

      dispatched: trips.filter(
        (trip) => trip.status === "Dispatched"
      ).length,

      completed: trips.filter(
        (trip) => trip.status === "Completed"
      ).length,

      cancelled: trips.filter(
        (trip) => trip.status === "Cancelled"
      ).length,
    };
  }, [trips]);

  // =========================
  // ADD
  // =========================

  function handleAdd() {
    setEditingTrip(null);
    setIsModalOpen(true);
  }

  // =========================
  // EDIT
  // =========================

  function handleEdit(trip) {
    setEditingTrip(trip);
    setIsModalOpen(true);
  }

  // =========================
  // DELETE
  // =========================

  async function handleDelete(id) {
    if (!window.confirm("Delete this trip?")) {
      return;
    }

    try {
      await deleteTrip(id);
      await fetchTrips();
    } catch (error) {
      console.error(
        "Delete trip error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete trip"
      );
    }
  }

  // =========================
  // CREATE / UPDATE
  // =========================

  async function handleSave(data) {
    try {
      if (editingTrip) {
        const id =
          editingTrip._id ||
          editingTrip.id;

        await updateTrip(id, data);
      } else {
        await createTrip(data);
      }

      await fetchTrips();

      setEditingTrip(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Save trip error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to save trip"
      );
    }
  }

  // =========================
  // AVAILABLE RESOURCES
  // =========================

  const availableVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "Available" ||
      vehicle._id === editingTrip?.vehicle?._id
  );

  const availableDrivers = drivers.filter(
    (driver) =>
      driver.status === "Available" ||
      driver._id === editingTrip?.driver?._id
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* HEADER */}

        <header className={styles.header}>
          <div>
            <div className={styles.breadcrumb}>
              Fleet Management
            </div>

            <h1>Trips</h1>

            <p>
              Create, dispatch and monitor transport trips.
            </p>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={handleAdd}
          >
            <Plus size={18} />
            Create Trip
          </button>
        </header>

        {/* STATS */}

        {!loading && (
          <section className={styles.statsGrid}>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.blue}`}
              >
                <Route size={19} />
              </div>

              <div>
                <span>Total Trips</span>
                <strong>{tripStats.total}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.gray}`}
              >
                <FileText size={19} />
              </div>

              <div>
                <span>Draft</span>
                <strong>{tripStats.draft}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.orange}`}
              >
                <Send size={19} />
              </div>

              <div>
                <span>Dispatched</span>
                <strong>{tripStats.dispatched}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.green}`}
              >
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>Completed</span>
                <strong>{tripStats.completed}</strong>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={`${styles.statIcon} ${styles.red}`}
              >
                <XCircle size={19} />
              </div>

              <div>
                <span>Cancelled</span>
                <strong>{tripStats.cancelled}</strong>
              </div>
            </div>

          </section>
        )}

        {/* SEARCH */}

        <section className={styles.filterSection}>
          <div className={styles.filterHeader}>
            <div>
              <h2>Trip Registry</h2>

              <span>
                {filteredTrips.length} trip
                {filteredTrips.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </span>
            </div>
          </div>

          <SearchBar
            search={search}
            setSearch={setSearch}
            status={statusFilter}
            setStatus={setStatusFilter}
          />
        </section>

        {/* TABLE */}

        {loading ? (
          <div className={styles.loadingCard}>
            <div className={styles.loadingIcon}>
              <Route size={22} />
            </div>

            <div className={styles.loadingContent}>
              <div className={styles.loadingLine} />
              <div className={styles.loadingLineSmall} />
            </div>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <TripTable
              trips={filteredTrips}
              vehicles={vehicles}
              drivers={drivers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* FORM */}

        {isModalOpen && (
          <TripForm
            trip={editingTrip}
            vehicles={availableVehicles}
            drivers={availableDrivers}
            onSave={handleSave}
            onCancel={() => {
              setEditingTrip(null);
              setIsModalOpen(false);
            }}
          />
        )}

      </div>
    </div>
  );
}

export default Trips;