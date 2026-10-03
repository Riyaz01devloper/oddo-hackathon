import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

import styles from "./SearchBar.module.css";

function SearchBar({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className={styles.filters}>
      <div className={styles.searchWrapper}>
        <Search
          size={17}
          className={styles.searchIcon}
        />

        <input
          type="text"
          placeholder="Search by registration or vehicle name..."
          value={searchTerm}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          className={styles.search}
        />

        {searchTerm && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.filterGroup}>
        <div className={styles.filterIcon}>
          <SlidersHorizontal size={15} />
        </div>

        <select
          value={typeFilter}
          onChange={(e) =>
            onTypeChange(e.target.value)
          }
          className={styles.select}
        >
          <option value="All">
            All Vehicle Types
          </option>

          <option value="Truck">
            Truck
          </option>

          <option value="Mini Truck">
            Mini Truck
          </option>

          <option value="Van">
            Van
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusChange(e.target.value)
          }
          className={styles.select}
        >
          <option value="All">
            All Status
          </option>

          <option value="Available">
            Available
          </option>

          {/* IMPORTANT: must match backend enum */}
          <option value="OnTrip">
            On Trip
          </option>

          <option value="InShop">
            In Maintenance
          </option>

          <option value="Retired">
            Retired
          </option>
        </select>
      </div>
    </div>
  );
}

export default SearchBar;