import { Search, SlidersHorizontal } from "lucide-react";
import styles from "./SearchBar.module.css";

function SearchBar({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />

        <input
          type="text"
          placeholder="Search by source, destination, vehicle or driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
      </div>

      <div className={styles.filterWrapper}>
        <SlidersHorizontal size={17} className={styles.filterIcon} />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.select}
        >
          <option value="All">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
}

export default SearchBar;