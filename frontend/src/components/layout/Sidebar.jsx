import { useEffect, useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Truck,
  Users,
  Route,
  Wrench,
  Wallet,
  BarChart3,
  Bell,
  History,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Download,
  X,
} from "lucide-react";

import styles from "./Sidebar.module.css";
import { getNotifications } from "../../services/notificationService";
import { promptPwaInstall, isAppInstalled, subscribePwaPrompt } from "../../utils/pwaInstall";

function Sidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [canInstall, setCanInstall] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = user?.role || "Fleet Manager";
  const userName = user?.name || "Fleet User";

  useEffect(() => {
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const res = await getNotifications();
        if (!cancelled) {
          const count = res.data?.data?.unreadCount || res.data?.unreadCount || 0;
          setUnreadCount(count);
        }
      } catch {
        // Silently catch in sidebar
      }
    };

    fetchUnread();
    const unsub = subscribePwaPrompt((ready) => {
      setCanInstall(ready && !isAppInstalled());
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onClose?.();
    navigate("/login");
  };

  const handleInstallClick = async () => {
    const res = await promptPwaInstall();
    if (res.outcome === "ios") {
      alert("To install on iOS: Tap Share (⎋) in Safari and choose 'Add to Home Screen' (⊕).");
    }
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  // Dynamic menu construction based on authorized role
  const menuSections = [
    {
      title: "MAIN",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "AI Fleet Copilot",
          path: "/copilot",
          icon: Bot,
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
    {
      title: "MONITORING & ACCESS",
      items: [
        {
          name: "Notifications",
          path: "/notifications",
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null,
        },
        ...(userRole === "Fleet Manager" || userRole === "Safety Officer"
          ? [
              {
                name: "Activity History",
                path: "/history",
                icon: History,
              },
            ]
          : []),
        ...(userRole === "Fleet Manager"
          ? [
              {
                name: "User Directory",
                path: "/users",
                icon: ShieldCheck,
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Truck size={21} strokeWidth={2.2} />
          </div>

          <div className={styles.logoText}>
            <h2>TransitOps</h2>
            <span>Fleet Intelligence</span>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {menuSections.map((section) => (
            <div className={styles.section} key={section.title}>
              <div className={styles.sectionTitle}>{section.title}</div>

              <div className={styles.sectionItems}>
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      title={item.name}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ""}`
                      }
                    >
                      <span className={styles.icon}>
                        <Icon size={19} strokeWidth={2} />
                      </span>

                      <span className={styles.linkText}>{item.name}</span>

                      {item.badge && (
                        <span className={styles.badge}>{item.badge}</span>
                      )}

                      <ChevronRight size={15} className={styles.arrow} />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className={styles.bottomSection}>
          {/* Install App button if available */}
          {canInstall && (
            <button
              type="button"
              className={styles.installAppBtn}
              onClick={handleInstallClick}
            >
              <Download size={16} />
              <span>Install Mobile App</span>
            </button>
          )}

          <NavLink
            to="/settings"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.icon}>
              <Settings size={19} strokeWidth={2} />
            </span>

            <span className={styles.linkText}>Settings</span>

            <ChevronRight size={15} className={styles.arrow} />
          </NavLink>

          {/* User Card -> Links directly to Profile */}
          <Link
            to="/profile"
            onClick={handleLinkClick}
            className={styles.userCard}
            title="View and edit profile"
          >
            <div className={styles.avatar}>
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className={styles.userInfo}>
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </div>
          </Link>

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
    </>
  );
}

export default Sidebar;