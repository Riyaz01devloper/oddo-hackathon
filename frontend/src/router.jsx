import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import App from "./App";

// Main Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Fleet from "./pages/fleet/Fleet";
import Drivers from "./pages/drivers/Drivers";
import Trips from "./pages/trips/Trips";
import FuelExpenses from "./pages/expenses/FuelExpenses";import Maintenance from "./pages/maintenance/Maintenance";
import Analytics from "./pages/analytics/Analytics";
import Settings from "./pages/settings/Settings";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

const router = createBrowserRouter([
  // AUTH
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // ROOT REDIRECT
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // MAIN APPLICATION
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "fleet",
        element: <Fleet />,
      },
      {
        path: "drivers",
        element: <Drivers />,
      },
      {
        path: "trips",
        element: <Trips />,
      },
      {
        path: "expenses",
        element: <FuelExpenses />,
      },
      {
        path: "maintenance",
        element: <Maintenance />,
      },
      {
        path: "reports",
        element: <Analytics />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

export default router;