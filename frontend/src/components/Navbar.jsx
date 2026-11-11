import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, role, isDoctor, isPatient, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link
          className="brand"
          to={isDoctor ? "/dashboard/doctor" : "/dashboard/patient"}
        >
          <span className="brand-icon">✚</span>
          <span className="brand-name">CarePoint</span>
        </Link>

        {/* Dynamic Navigation Links based on Role */}
        <nav className="nav-links">
          {isPatient && (
            <>
              <Link
                to="/dashboard/patient"
                className={`nav-link ${isActive("/dashboard/patient") ? "active" : ""}`}
              >
                📅 My Appointments
              </Link>
              <Link
                to="/doctors"
                className={`nav-link ${isActive("/doctors") ? "active" : ""}`}
              >
                🩺 Find Doctors
              </Link>
            </>
          )}

          {isDoctor && (
            <>
              <Link
                to="/dashboard/doctor"
                className={`nav-link ${isActive("/dashboard/doctor") ? "active" : ""}`}
              >
                🩺 Doctor Portal
              </Link>
              <Link
                to="/doctors"
                className={`nav-link ${isActive("/doctors") ? "active" : ""}`}
              >
                👥 Medical Team
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/dashboard/patient"
                className={`nav-link ${isActive("/dashboard/patient") ? "active" : ""}`}
              >
                Patient View
              </Link>
              <Link
                to="/dashboard/doctor"
                className={`nav-link ${isActive("/dashboard/doctor") ? "active" : ""}`}
              >
                Doctor View
              </Link>
              <Link
                to="/doctors"
                className={`nav-link ${isActive("/doctors") ? "active" : ""}`}
              >
                Manage Doctors
              </Link>
            </>
          )}
        </nav>

        {/* User Profile Info & Logout */}
        <div className="nav-user-controls">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {(user?.name || "U")
                .replace(/^Dr\.\s*/i, "")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="user-meta">
              <span className="user-name">{user?.name || "User"}</span>
              <span className={`role-pill role-${role}`}>{role}</span>
            </div>
          </div>
          <button className="outline logout-btn" onClick={logout} title="Log out">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
