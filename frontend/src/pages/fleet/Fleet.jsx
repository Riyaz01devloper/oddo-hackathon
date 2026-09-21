import { useEffect, useMemo, useState } from "react";
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

  // GET ALL VEHICLES
  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await getVehicles();

      console.log("Vehicles API response:", response);

      const data =
        response.data?.data ||
        response.data ||
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

  // LOAD VEHICLES WHEN PAGE OPENS
 useEffect(() => {
  let cancelled = false;

  const loadVehicles = async () => {
    try {
      const response = await getVehicles();

      if (cancelled) return;

      const data =
        response.data?.data ||
        response.data ||
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

  // FILTER VEHICLES
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const registration =
        vehicle.registrationNumber || "";

      const name =
        vehicle.vehicleName || "";

      const matchesSearch =
        registration
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "All" ||
        vehicle.vehicleType === typeFilter;

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

  // OPEN ADD VEHICLE MODAL
  function handleAddVehicle() {
    setEditingVehicle(null);
    setIsModalOpen(true);
  }

  // OPEN EDIT VEHICLE MODAL
  function handleEdit(vehicle) {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  }

  // DELETE VEHICLE
  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVehicle(id);

      // Fetch fresh data from database
      await fetchVehicles();
    } catch (error) {
      console.error(
        "Delete error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to delete vehicle"
      );
    }
  }

  // CREATE / UPDATE VEHICLE
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

      // Get latest data from MongoDB
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
        <div className={styles.header}>
          <div>
            <h1>Vehicle Registry</h1>

            <p>
              Manage all registered vehicles in the fleet.
            </p>
          </div>

          <button
            className={styles.addButton}
            onClick={handleAddVehicle}
          >
            Add Vehicle
          </button>
        </div>

        {/* SEARCH + FILTERS */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* VEHICLE TABLE */}
        {loading ? (
          <p>Loading vehicles...</p>
        ) : (
          <VehicleTable
            vehicles={filteredVehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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