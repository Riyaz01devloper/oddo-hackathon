import { useMemo, useState } from "react";
import styles from "./Maintenance.module.css";

import MaintenanceTable from "../../components/maintenance/MaintenanceTable/MaintenanceTable";
import MaintenanceForm from "../../components/maintenance/MaintenanceForm/MaintenanceForm";

// TODO: GET /api/maintenance
const initialMaintenance = [
  {
    id: 1,
    vehicleId: 1,
    vehicleName: "Tata Ace",
    serviceType: "Oil Change",
    cost: 3500,
    date: "2026-07-10",
    status: "Completed",
  },
  {
    id: 2,
    vehicleId: 2,
    vehicleName: "Ashok Leyland",
    serviceType: "Engine Repair",
    cost: 18000,
    date: "2026-07-12",
    status: "In Shop",
  },
  {
    id: 3,
    vehicleId: 3,
    vehicleName: "Mahindra Pickup",
    serviceType: "Brake Service",
    cost: 6200,
    date: "2026-07-14",
    status: "Completed",
  },
];

const vehicles = [
  {
    id: 1,
    vehicleName: "Tata Ace",
  },
  {
    id: 2,
    vehicleName: "Ashok Leyland",
  },
  {
    id: 3,
    vehicleName: "Mahindra Pickup",
  },
];

function Maintenance() {
  const [records, setRecords] = useState(initialMaintenance);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.vehicleName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        record.serviceType
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  function handleSave(data) {
    if (editingRecord) {
      // TODO: PUT /api/maintenance/:id

      setRecords((prev) =>
        prev.map((record) =>
          record.id === editingRecord.id
            ? {
                ...data,
                id: editingRecord.id,
              }
            : record
        )
      );
    } else {
      // TODO: POST /api/maintenance

      setRecords((prev) => [
        ...prev,
        {
          ...data,
          id: Date.now(),
        },
      ]);
    }

    setEditingRecord(null);
    setIsModalOpen(false);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this maintenance record?")) return;

    // TODO: DELETE /api/maintenance/:id

    setRecords((prev) => prev.filter((record) => record.id !== id));
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Maintenance</h1>
            <p>Manage vehicle maintenance records.</p>
          </div>

          <button
            className={styles.button}
            onClick={() => {
              setEditingRecord(null);
              setIsModalOpen(true);
            }}
          >
            Add Maintenance
          </button>
        </div>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search by vehicle or service type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="In Shop">In Shop</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <MaintenanceTable
          records={filteredRecords}
          onEdit={(record) => {
            setEditingRecord(record);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />

        {isModalOpen && (
          <MaintenanceForm
            record={editingRecord}
            vehicles={vehicles}
            onSave={handleSave}
            onCancel={() => {
              setEditingRecord(null);
              setIsModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Maintenance;