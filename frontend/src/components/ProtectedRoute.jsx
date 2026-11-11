import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Role-Based Protected Route Component
 * @param {string[]} allowedRoles Array of roles authorized to view this route, e.g. ['patient', 'doctor', 'admin']
 * @param {React.ReactNode} children Child components to render when authorized
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated visitors to login, preserving intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are specified, check if the user has permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If unauthorized, safely redirect to the appropriate dashboard for their role
    if (role === "doctor") {
      return <Navigate to="/dashboard/doctor" replace />;
    } else {
      return <Navigate to="/dashboard/patient" replace />;
    }
  }

  return children;
}
