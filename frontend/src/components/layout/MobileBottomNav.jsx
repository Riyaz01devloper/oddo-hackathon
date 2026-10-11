import { NavLink } from "react-router-dom";
import { LayoutDashboard, Truck, Route, Bot, Menu } from "lucide-react";
import styles from "./MobileBottomNav.module.css";

function MobileBottomNav({ onToggleMenu, isMenuOpen }) {
  return (
    <nav className={styles.bottomNav} aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ""}`
        }
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/fleet"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ""}`
        }
      >
        <Truck size={20} />
        <span>Fleet</span>
      </NavLink>

      <NavLink
        to="/trips"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ""}`
        }
      >
        <Route size={20} />
        <span>Trips</span>
      </NavLink>

      <NavLink
        to="/copilot"
        className={({ isActive }) =>
          `${styles.navItem} ${styles.copilotItem} ${isActive ? styles.active : ""}`
        }
      >
        <div className={styles.copilotIconWrapper}>
          <Bot size={20} />
        </div>
        <span>Copilot</span>
      </NavLink>

      <button
        type="button"
        className={`${styles.navItem} ${styles.menuButton} ${isMenuOpen ? styles.active : ""}`}
        onClick={onToggleMenu}
        aria-label="More navigation items"
      >
        <Menu size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}

export default MobileBottomNav;
