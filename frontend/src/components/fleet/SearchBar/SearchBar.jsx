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
      <input
        type="text"
        placeholder="Search by registration number or vehicle name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.search}
      />

      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className={styles.select}
      >
        <option value="All">All Vehicle Types</option>
        <option value="Truck">Truck</option>
        <option value="Mini Truck">Mini Truck</option>
        <option value="Van">Van</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={styles.select}
      >
        <option value="All">All Status</option>
        <option value="Available">Available</option>
        <option value="On Trip">On Trip</option>
        <option value="In Shop">In Shop</option>
        <option value="Retired">Retired</option>
      </select>
    </div>
  );
}

export default SearchBar;