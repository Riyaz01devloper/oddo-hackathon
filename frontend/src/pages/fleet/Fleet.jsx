// pages/fleet/Fleet.jsx

import { useMemo, useState } from "react";
import styles from "./Fleet.module.css";

import SearchBar from "../../components/fleet/SearchBar/SearchBar";
import VehicleTable from "../../components/fleet/VehicleTable/VehicleTable";
import VehicleForm from "../../components/fleet/VehicleForm/VehicleForm";

const initialVehicles = [
  {
    id: 1,
    registrationNumber: "DL01AB1234",
    vehicleName: "Tata Ace",
    vehicleType: "Mini Truck",
    capacity: 900,
    odometer: 24560,
    status: "Available",
  },
  {
    id: 2,
    registrationNumber: "DL02CD5678",
    vehicleName: "Ashok Leyland",
    vehicleType: "Truck",
    capacity: 12000,
    odometer: 98750,
    status: "On Trip",
  },
  {
    id: 3,
    registrationNumber: "DL03EF4321",
    vehicleName: "Eeco Cargo",
    vehicleType: "Van",
    capacity: 700,
    odometer: 35120,
    status: "In Shop",
  },
  {
    id: 4,
    registrationNumber: "DL04GH6789",
    vehicleName: "Mahindra Bolero Pickup",
    vehicleType: "Mini Truck",
    capacity: 1500,
    odometer: 47210,
    status: "Available",
  },
];

// TODO: Fetch vehicles from backend

function Fleet() {
  const [vehicles, setVehicles] = useState(initialVehicles);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.registrationNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        vehicle.vehicleName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "All" || vehicle.vehicleType === typeFilter;

      const matchesStatus =
        statusFilter === "All" || vehicle.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchTerm, typeFilter, statusFilter]);

  function handleAddVehicle() {
    setEditingVehicle(null);
    setIsModalOpen(true);
  }

  function handleEdit(vehicle) {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  }

  function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmDelete) return;

    // TODO: DELETE vehicle

    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
  }

  function handleSave(vehicleData) {
    if (editingVehicle) {
      // TODO: PUT vehicle

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === editingVehicle.id
            ? {
                ...vehicleData,
                id: editingVehicle.id,
              }
            : vehicle
        )
      );
    } else {
      // TODO: POST new vehicle

      setVehicles((prev) => [
        ...prev,
        {
          ...vehicleData,
          id: Date.now(),
        },
      ]);
    }

    setIsModalOpen(false);
    setEditingVehicle(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Vehicle Registry</h1>
            <p>Manage all registered vehicles in the fleet.</p>
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

        <VehicleTable
          vehicles={filteredVehicles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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