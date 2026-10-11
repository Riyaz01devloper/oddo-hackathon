import { Navigate, Outlet } from "react-router-dom";

/**
 * Route wrapper that ensures the user is authenticated.
 * Redirects to /login if no authentication token is present in localStorage.
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;

