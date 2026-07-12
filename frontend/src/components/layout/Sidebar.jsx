import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

import styles from "./Sidebar.module.css";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Fleet",
    path: "/fleet",
    icon: <Truck size={20} />,
  },
  {
    name: "Drivers",
    path: "/drivers",
    icon: <Users size={20} />,
  },
  {
    name: "Trips",
    path: "/trips",
    icon: <Route size={20} />,
  },
  {
    name: "Maintenance",
    path: "/maintenance",
    icon: <Wrench size={20} />,
  },
  {
    name: "Fuel & Expenses",
    path: "/expenses",
    icon: <Wallet size={20} />,
  },
  {
    name: "Analytics",
    path: "/reports",
    icon: <BarChart3 size={20} />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings size={20} />,
  },
];

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>TransitOps</h2>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;