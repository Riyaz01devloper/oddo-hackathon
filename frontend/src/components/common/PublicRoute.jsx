import { Navigate } from "react-router-dom";

/**
 * Route wrapper for public auth pages (Login, Register).
 * Redirects to /dashboard if already authenticated.
 */
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;

