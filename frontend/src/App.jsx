import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/layout/Layout";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Vehicles from "./pages/vehicles/Vehicles";
import Drivers from "./pages/drivers/Drivers";
import Trips from "./pages/trips/Trips";
import Maintenance from "./pages/maintenance/Maintenance";
import Expenses from "./pages/expenses/Expenses";
import Reports from "./pages/reports/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/trips" element={<Trips />} />
          <Route
            path="/maintenance"
            element={<Maintenance />}
          />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;