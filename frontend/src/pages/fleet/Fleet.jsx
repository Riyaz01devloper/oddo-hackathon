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

  // GET VEHICLES
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await getVehicles();

      // Handles different ApiResponse structures
      const data = response.data.data || response.data;

      const vehicleList = Array.isArray(data)
        ? data
        : data.vehicles || [];

      setVehicles(vehicleList);
    } catch (error) {
      console.error(
        "Error fetching vehicles:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

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

  function handleAddVehicle() {
    setEditingVehicle(null);
    setIsModalOpen(true);
  }

  function handleEdit(vehicle) {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  }

  // DELETE
  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVehicle(id);

      setVehicles((prev) =>
        prev.filter(
          (vehicle) =>
            (vehicle._id || vehicle.id) !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error.response?.data || error.message
      );

      alert("Failed to delete vehicle");
    }
  }

  // POST + PUT
  async function handleSave(vehicleData) {
    try {
      if (editingVehicle) {
        const id =
          editingVehicle._id || editingVehicle.id;

        await updateVehicle(id, vehicleData);
      } else {
        await createVehicle(vehicleData);
      }

      // Fetch fresh database data
      await fetchVehicles();

      setIsModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error(
        "Save error:",
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

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {loading ? (
          <p>Loading vehicles...</p>
        ) : (
          <VehicleTable
            vehicles={filteredVehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

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