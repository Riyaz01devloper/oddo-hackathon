/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import App from "./App";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy-loaded Main Pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Fleet = lazy(() => import("./pages/fleet/Fleet"));
const Drivers = lazy(() => import("./pages/drivers/Drivers"));
const Trips = lazy(() => import("./pages/trips/Trips"));
const FuelExpenses = lazy(() => import("./pages/expenses/FuelExpenses"));
const Maintenance = lazy(() => import("./pages/maintenance/Maintenance"));
const Analytics = lazy(() => import("./pages/analytics/Analytics"));
const Settings = lazy(() => import("./pages/settings/Settings"));

// Lazy-loaded Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

const router = createBrowserRouter([
  // AUTH
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingSpinner message="Loading sign-in..." />}>
          <Login />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingSpinner message="Loading registration..." />}>
          <Register />
        </Suspense>
      </PublicRoute>
    ),
  },

  // ROOT REDIRECT
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // MAIN APPLICATION (PROTECTED)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
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
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

export default router;