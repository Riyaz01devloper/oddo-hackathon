import { useState, useEffect } from "react";
import { Users as UsersIcon, Search, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Users.module.css";
import { getUsers } from "../../services/userService";

function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await getUsers({
          search: submittedSearch.trim() || undefined,
          role: roleFilter !== "All" ? roleFilter : undefined,
          page,
          limit: 15,
        });
        if (cancelled) return;
        const data = res.data?.data || res.data || {};
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch users directory:", err);
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [page, roleFilter, submittedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "Fleet Manager":
        return styles.roleManager;
      case "Safety Officer":
        return styles.roleSafety;
      case "Financial Analyst":
        return styles.roleAnalyst;
      default:
        return styles.roleDriver;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>Administration</div>
        <h1>User Directory</h1>
        <p>Manage system credentials, verify assigned operational roles, and review accounts.</p>
      </header>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <form className={styles.searchBox} onSubmit={handleSearchSubmit}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select
          className={styles.roleSelect}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Roles</option>
          <option value="Fleet Manager">Fleet Manager</option>
          <option value="Driver">Driver</option>
          <option value="Safety Officer">Safety Officer</option>
          <option value="Financial Analyst">Financial Analyst</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email Address</th>
              <th>System Role</th>
              <th>Registered Phone</th>
              <th>Member Since</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  Loading user records...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  No accounts found matching your search criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const dateStr = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Legacy Member";

                return (
                  <tr key={u._id || u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {u.name ? u.name.charAt(0).toUpperCase() : <UsersIcon size={16} />}
                        </div>
                        <div>
                          <strong>{u.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${getRoleBadgeClass(u.role)}`}>
                        <Shield size={11} style={{ marginRight: "4px" }} />
                        {u.role}
                      </span>
                    </td>
                    <td>{u.phone || "-"}</td>
                    <td>{dateStr}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Showing {users.length} of {total} account(s)
          </span>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} style={{ display: "inline" }} /> Previous
            </button>
            <span style={{ fontSize: "12px", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageButton}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} style={{ display: "inline" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
