import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Dashboard from "./pages/dashboard/Dashboard";
import Fleet from "./pages/fleet/Fleet";
import Drivers from "./pages/drivers/Drivers";
import Trips from "./pages/trips/Trips";
import Maintenance from "./pages/maintenance/Maintenance";
import FuelExpenses from "./pages/expenses/FuelExpenses";
import Analytics from "./pages/analytics/Analytics";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
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
        path: "maintenance",
        element: <Maintenance />,
      },
      {
        path: "expenses",
        element: <FuelExpenses />,
      },
      {
        path: "reports",
        element: <Analytics />,
      },
    ],
  },
]);

export default router;
