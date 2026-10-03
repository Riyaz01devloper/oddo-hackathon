import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

import styles from "./SearchBar.module.css";

function SearchBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <Search
          size={17}
          className={styles.searchIcon}
        />

        <input
          type="text"
          placeholder="Search by name, license or phone..."
          value={searchTerm}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          className={styles.searchInput}
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

      <div className={styles.filterWrapper}>
        <SlidersHorizontal
          size={15}
          className={styles.filterIcon}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusChange(e.target.value)
          }
          className={styles.select}
        >
          <option value="All">All Status</option>

          <option value="Available">
            Available
          </option>

          {/* Backend value = OnTrip */}
          <option value="OnTrip">
            On Trip
          </option>

          {/* Backend value = OffDuty */}
          <option value="OffDuty">
            Off Duty
          </option>

          <option value="Suspended">
            Suspended
          </option>
        </select>
      </div>
    </div>
  );
}

export default SearchBar;