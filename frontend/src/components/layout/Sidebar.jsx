import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
} from "lucide-react";


const links = [
  { name: "Vehicles", path: "/vehicles", icon: Truck },
  { name: "Drivers", path: "/drivers", icon: Users },
  { name: "Trips", path: "/trips", icon: Route },
  { name: "Expenses", path: "/expenses", icon: Fuel },
  { name: "Reports", path: "/reports", icon: BarChart3 },
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">TransitOps</h1>
        <p className="text-sm text-slate-400">Fleet Management</p>
      </div>

      <nav className="p-4 space-y-2">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive
                  ? "bg-blue-600"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <Icon size={20} />
            {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;