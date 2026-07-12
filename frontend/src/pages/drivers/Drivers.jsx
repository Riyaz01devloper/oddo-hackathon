import { useMemo, useState } from "react";
import styles from "./Drivers.module.css";

import SearchBar from "../../components/drivers/SearchBar/SearchBar";
import DriverTable from "../../components/drivers/DriverTable/DriverTable";
import DriverForm from "../../components/drivers/DriverForm/DriverForm";

const initialDrivers = [
  {
    id: 1,
    name: "Rahul Sharma",
    licenseNumber: "DL123456789",
    licenseCategory: "LMV",
    licenseExpiry: "2028-04-15",
    contactNumber: "9876543210",
    safetyScore: 95,
    status: "Available",
  },
  {
    id: 2,
    name: "Amit Kumar",
    licenseNumber: "DL987654321",
    licenseCategory: "HMV",
    licenseExpiry: "2027-11-20",
    contactNumber: "9812345678",
    safetyScore: 89,
    status: "On Trip",
  },
  {
    id: 3,
    name: "Rohit Verma",
    licenseNumber: "DL112233445",
    licenseCategory: "HMV",
    licenseExpiry: "2026-09-08",
    contactNumber: "9898989898",
    safetyScore: 76,
    status: "Off Duty",
  },
];

// TODO: GET /api/drivers

function Drivers() {
  const [drivers, setDrivers] = useState(initialDrivers);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const searchMatch =
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.licenseNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const statusMatch =
        statusFilter === "All" || driver.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [drivers, searchTerm, statusFilter]);

  function handleAdd() {
    setEditingDriver(null);
    setIsModalOpen(true);
  }

  function handleEdit(driver) {
    setEditingDriver(driver);
    setIsModalOpen(true);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this driver?")) return;

    // TODO: DELETE /api/drivers/:id

    setDrivers((prev) => prev.filter((driver) => driver.id !== id));
  }

  function handleSave(driverData) {
    if (editingDriver) {
      // TODO: PUT /api/drivers/:id

      setDrivers((prev) =>
        prev.map((driver) =>
          driver.id === editingDriver.id
            ? {
                ...driverData,
                id: editingDriver.id,
              }
            : driver
        )
      );
    } else {
      // TODO: POST /api/drivers

      setDrivers((prev) => [
        ...prev,
        {
          ...driverData,
          id: Date.now(),
        },
      ]);
    }

    setEditingDriver(null);
    setIsModalOpen(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
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

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <DriverTable
          drivers={filteredDrivers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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