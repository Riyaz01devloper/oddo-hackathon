import { useMemo, useState } from "react";
import styles from "./Trips.module.css";

import TripForm from "../../components/trips/TripForm/TripForm";
import TripTable from "../../components/trips/TripTable/TripTable";
import SearchBar from "../../components/trips/SearchBar/SearchBar";

// TODO: GET /api/vehicles
const vehicles = [
  {
    id: 1,
    registrationNumber: "DL01AB1234",
    vehicleName: "Tata Ace",
    status: "Available",
  },
  {
    id: 2,
    registrationNumber: "DL02CD5678",
    vehicleName: "Ashok Leyland",
    status: "On Trip",
  },
  {
    id: 3,
    registrationNumber: "DL03EF4321",
    vehicleName: "Mahindra Pickup",
    status: "Available",
  },
];

// TODO: GET /api/drivers
const drivers = [
  {
    id: 1,
    name: "Rahul Sharma",
    status: "Available",
  },
  {
    id: 2,
    name: "Amit Kumar",
    status: "On Trip",
  },
  {
    id: 3,
    name: "Rohit Verma",
    status: "Available",
  },
];

// TODO: GET /api/trips
const initialTrips = [
  {
    id: 101,
    source: "Delhi",
    destination: "Noida",
    vehicleId: 1,
    driverId: 1,
    cargoWeight: 800,
    plannedDistance: 25,
    status: "Draft",
  },
  {
    id: 102,
    source: "Ghaziabad",
    destination: "Gurgaon",
    vehicleId: 3,
    driverId: 3,
    cargoWeight: 1200,
    plannedDistance: 48,
    status: "Dispatched",
  },
];

function Trips() {
  const [trips, setTrips] = useState(initialTrips);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
      const driver = drivers.find((d) => d.id === trip.driverId);

      const matchSearch =
        trip.source.toLowerCase().includes(search.toLowerCase()) ||
        trip.destination.toLowerCase().includes(search.toLowerCase()) ||
        vehicle?.vehicleName.toLowerCase().includes(search.toLowerCase()) ||
        driver?.name.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "All" || trip.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [trips, search, statusFilter]);

  function handleCreate(data) {
    if (editingTrip) {
      // TODO: PUT /api/trips/:id

      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === editingTrip.id
            ? {
                ...data,
                id: editingTrip.id,
              }
            : trip
        )
      );
    } else {
      // TODO: POST /api/trips

      setTrips((prev) => [
        ...prev,
        {
          ...data,
          id: Date.now(),
          status: "Draft",
        },
      ]);
    }

    setEditingTrip(null);
    setIsModalOpen(false);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this trip?")) return;

    // TODO: DELETE /api/trips/:id

    setTrips((prev) => prev.filter((trip) => trip.id !== id));
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Trips</h1>
            <p>Create and manage transport trips.</p>
          </div>

          <button
            className={styles.button}
            onClick={() => {
              setEditingTrip(null);
              setIsModalOpen(true);
            }}
          >
            Create Trip
          </button>
        </div>

        <SearchBar
          search={search}
          setSearch={setSearch}
          status={statusFilter}
          setStatus={setStatusFilter}
        />

        <TripTable
          trips={filteredTrips}
          vehicles={vehicles}
          drivers={drivers}
          onEdit={(trip) => {
            setEditingTrip(trip);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />

        {isModalOpen && (
          <TripForm
            trip={editingTrip}
            vehicles={vehicles.filter((v) => v.status === "Available")}
            drivers={drivers.filter((d) => d.status === "Available")}
            onSave={handleCreate}
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