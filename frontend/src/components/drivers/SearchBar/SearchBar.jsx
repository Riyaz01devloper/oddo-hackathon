import styles from "./SearchBar.module.css";

function SearchBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Search by name or license number..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={styles.select}
      >
        <option value="All">All Status</option>
        <option value="Available">Available</option>
        <option value="On Trip">On Trip</option>
        <option value="Off Duty">Off Duty</option>
        <option value="Suspended">Suspended</option>
      </select>
    </div>
  );
}

export default SearchBar;