import {
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./Maintenance.module.css";

import MaintenanceTable from "../../components/maintenance/MaintenanceTable/MaintenanceTable";

import MaintenanceForm from "../../components/maintenance/MaintenanceForm/MaintenanceForm";

import {
  getMaintenance,
  createMaintenance,
  updateMaintenance,
} from "../../services/maintenanceService";

import { getVehicles } from "../../services/vehicleService";

function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
}

function normalizeMaintenance(record) {
  return {
    ...record,

    vehicleId:
      record.vehicle?._id ||
      record.vehicle ||
      record.vehicleId ||
      "",

    vehicleName:
      record.vehicle?.name ||
      record.vehicle?.registrationNumber ||
      record.vehicleName ||
      "Unknown Vehicle",

    serviceType:
      record.issue ||
      record.serviceType ||
      "",

    date: formatDate(
      record.openedAt || record.date
    ),

    // Backend: InShop / Closed
    // UI: InShop / Completed
    status:
      record.status === "InShop"
        ? "InShop"
        : record.status === "Closed"
        ? "Completed"
        : record.status || "",
  };
}

function Maintenance() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] =
    useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [editingRecord, setEditingRecord] =
    useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  // =========================
  // LOAD MAINTENANCE RECORDS
  // =========================
  useEffect(() => {
    let cancelled = false;

    const loadMaintenance = async () => {
      try {
        const response = await getMaintenance();

        if (cancelled) return;

        const data =
          response.data?.data ||
          response.data?.maintenance ||
          response.data ||
          [];

        const normalized =
          Array.isArray(data)
            ? data.map(normalizeMaintenance)
            : [];

        setRecords(normalized);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Error fetching maintenance:",
            error.response?.data ||
              error.message
          );

          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMaintenance();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // LOAD REAL VEHICLES
  // =========================
  useEffect(() => {
    let cancelled = false;

    const loadVehicles = async () => {
      try {
        const response = await getVehicles();

        if (cancelled) return;

        console.log(
          "Maintenance vehicles response:",
          response.data
        );

        const data =
          response.data?.vehicles ||
          response.data?.data ||
          response.data ||
          [];

        setVehicles(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Error fetching vehicles:",
            error.response?.data ||
              error.message
          );

          setVehicles([]);
        }
      } finally {
        if (!cancelled) {
          setVehiclesLoading(false);
        }
      }
    };

    loadVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // SEARCH + FILTER
  // =========================
  const filteredRecords = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return records.filter((record) => {
      const vehicleName =
        record.vehicleName || "";

      const serviceType =
        record.serviceType || "";

      const matchesSearch =
        vehicleName
          .toLowerCase()
          .includes(searchValue) ||
        serviceType
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    records,
    search,
    statusFilter,
  ]);

  // =========================
  // ADD MAINTENANCE
  // =========================
  function handleAdd() {
    setEditingRecord(null);
    setIsModalOpen(true);
  }

  // =========================
  // EDIT MAINTENANCE
  // =========================
  function handleEdit(record) {
    setEditingRecord(record);
    setIsModalOpen(true);
  }

  // =========================
  // SAVE / UPDATE
  // =========================
  async function handleSave(data) {
    try {
      console.log(
        "Maintenance payload:",
        data
      );

      if (editingRecord) {
        const id =
          editingRecord._id ||
          editingRecord.id;

        await updateMaintenance(
          id,
          data
        );
      } else {
        await createMaintenance(data);
      }

      // Reload actual MongoDB data
      const response =
        await getMaintenance();

      const latestData =
        response.data?.data ||
        response.data?.maintenance ||
        response.data ||
        [];

      const normalized =
        Array.isArray(latestData)
          ? latestData.map(
              normalizeMaintenance
            )
          : [];

      setRecords(normalized);

      setEditingRecord(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Save maintenance error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to save maintenance record"
      );
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h1>Maintenance</h1>

            <p>
              Manage vehicle maintenance records.
            </p>
          </div>

          <button
            className={styles.button}
            onClick={handleAdd}
          >
            Add Maintenance
          </button>
        </div>

        {/* FILTERS */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search by vehicle or service type..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="InShop">
              InShop
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>
        </div>

        {/* TABLE */}
        {loading ? (
          <p>Loading maintenance records...</p>
        ) : (
          <MaintenanceTable
            records={filteredRecords}
            onEdit={handleEdit}
            onDelete={() => {}}
          />
        )}

        {/* FORM */}
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

        {vehiclesLoading && isModalOpen && (
          <p>Loading vehicles...</p>
        )}
      </div>
    </div>
  );
}

export default Maintenance;