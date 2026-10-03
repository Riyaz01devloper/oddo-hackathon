import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

import styles from "./Sidebar.module.css";

const menuSections = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "FLEET",
    items: [
      {
        name: "Vehicles",
        path: "/fleet",
        icon: Truck,
      },
      {
        name: "Drivers",
        path: "/drivers",
        icon: Users,
      },
      {
        name: "Trips",
        path: "/trips",
        icon: Route,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        name: "Fuel & Expenses",
        path: "/expenses",
        icon: Wallet,
      },
      {
        name: "Maintenance",
        path: "/maintenance",
        icon: Wrench,
      },
      {
        name: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
    ],
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const userName = user?.name || "Fleet Manager";
  const userRole = user?.role || "Fleet Manager";

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <Truck size={21} strokeWidth={2.2} />
        </div>

        <div className={styles.logoText}>
          <h2>TransitOps</h2>
          <span>Fleet Intelligence</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.navigation}>
        {menuSections.map((section) => (
          <div className={styles.section} key={section.title}>
            <div className={styles.sectionTitle}>
              {section.title}
            </div>

            <div className={styles.sectionItems}>
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={item.name}
                    className={({ isActive }) =>
                      `${styles.link} ${
                        isActive ? styles.active : ""
                      }`
                    }
                  >
                    <span className={styles.icon}>
                      <Icon size={19} strokeWidth={2} />
                    </span>

                    <span className={styles.linkText}>
                      {item.name}
                    </span>

                    <ChevronRight
                      size={15}
                      className={styles.arrow}
                    />
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={styles.bottomSection}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          <span className={styles.icon}>
            <Settings size={19} strokeWidth={2} />
          </span>

          <span className={styles.linkText}>Settings</span>

          <ChevronRight
            size={15}
            className={styles.arrow}
          />
        </NavLink>

        {/* User */}
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className={styles.userInfo}>
            <strong>{userName}</strong>
            <span>{userRole}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;