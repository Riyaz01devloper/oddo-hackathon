import styles from "./SearchBar.module.css";

function SearchBar({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Search by source, destination, vehicle or driver..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.search}
      />

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
  );
}

export default SearchBar;