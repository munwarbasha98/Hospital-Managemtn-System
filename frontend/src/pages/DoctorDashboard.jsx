import { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, apptsRes] = await Promise.all([
        api.get("/doctor/profile").catch(() => ({ data: null })),
        api.get("/doctor/appointments")
      ]);
      setProfile(profileRes.data);
      setAppointments(apptsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load doctor dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Doctor Availability
  const toggleAvailability = async () => {
    if (!profile) return;
    setAvailabilityUpdating(true);
    setMsg("");
    setError("");
    const newStatus = !profile.isAvailable;
    try {
      const res = await api.patch("/doctor/availability", { isAvailable: newStatus });
      setProfile(res.data.doctor);
      setMsg(
        newStatus
          ? "Status updated: You are now marked as AVAILABLE for consultations."
          : "Status updated: You are now marked as AWAY / UNAVAILABLE."
      );
    } catch (err) {
      setError("Failed to update availability status.");
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  // Update Appointment Status (Completed, Cancelled, No-Show)
  const updateAppointmentStatus = async (id, newStatus) => {
    setStatusUpdatingId(id);
    setMsg("");
    setError("");
    try {
      const res = await api.patch(`/doctor/appointments/${id}/status`, { status: newStatus });
      setMsg(`Appointment marked as ${newStatus}.`);
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not update appointment status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Compute Metrics
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const todayCount = todayAppointments.length;
  const pendingCount = appointments.filter((a) => a.status === "Booked").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;
  const noShowOrCancelledCount = appointments.filter(
    (a) => a.status === "Cancelled" || a.status === "No-Show"
  ).length;

  // Filter Appointments for the list
  const filteredAppointments = appointments.filter((app) => {
    if (activeTab === "today" && app.appointmentDate !== todayStr) return false;
    if (activeTab === "pending" && app.status !== "Booked") return false;
    if (activeTab === "completed" && app.status !== "Completed") return false;

    const patientName = app.patientName || app.patientId?.name || "";
    const phone = app.contactNumber || app.patientId?.phone || "";
    const reason = app.reason || "";
    const q = searchQuery.toLowerCase();

    return (
      patientName.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q) ||
      reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-page doctor-dashboard">
      {/* Top Banner / Welcome */}
      <section className="hero">
        <div>
          <p className="eyebrow">DOCTOR & CLINICAL PORTAL</p>
          <h1>
            Welcome, {profile?.name || user?.name || "Doctor"} <span>🩺</span>
          </h1>
          <p className="muted">
            {profile?.specialization || "Physician"} • {profile?.department || "Consultation"} • Room 204
          </p>
        </div>

        {/* Real-Time Availability Switch */}
        <div className="availability-toggle-card">
          <div className="toggle-info">
            <span className="toggle-title">Practice Status</span>
            <span className={`status-pill ${profile?.isAvailable ? "pill-active" : "pill-away"}`}>
              {profile?.isAvailable ? "● Active & Accepting" : "● Away / Off Duty"}
            </span>
          </div>
          <button
            className={`toggle-switch-btn ${profile?.isAvailable ? "active" : "inactive"}`}
            onClick={toggleAvailability}
            disabled={availabilityUpdating}
          >
            {availabilityUpdating ? "Updating..." : profile?.isAvailable ? "Set Away" : "Set Active"}
          </button>
        </div>
      </section>

      {/* Notifications */}
      {msg && <div className="alert success">{msg}</div>}
      {error && <div className="alert error">{error}</div>}

      {/* Summary Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon upcoming-icon">📅</span>
          <div>
            <strong>{todayCount}</strong>
            <span>Today's Appointments</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon total-icon">⏳</span>
          <div>
            <strong>{pendingCount}</strong>
            <span>Pending Consultations</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon completed-icon">✓</span>
          <div>
            <strong>{completedCount}</strong>
            <span>Completed Count</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon cancelled-icon">🚫</span>
          <div>
            <strong>{noShowOrCancelledCount}</strong>
            <span>Cancelled / No-Shows</span>
          </div>
        </div>
      </div>

      {/* Queue Header & Filters */}
      <div className="section-header-row">
        <div>
          <h2>Patient Consultation Queue</h2>
          <p className="muted">Manage patient arrivals, examine symptoms, and update appointment records.</p>
        </div>

        {/* Tab Switcher */}
        <div className="pill-filters">
          <button
            className={`pill-btn ${activeTab === "today" ? "active" : ""}`}
            onClick={() => setActiveTab("today")}
          >
            Today's Queue ({todayCount})
          </button>
          <button
            className={`pill-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Scheduled ({appointments.length})
          </button>
          <button
            className={`pill-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`pill-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="table-controls">
        <input
          type="text"
          placeholder="Filter queue by patient name, phone number, or symptoms..."
          className="search-input-wide"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Interactive Queue Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time & Date</th>
              <th>Patient Information</th>
              <th>Symptoms / Reason</th>
              <th>Status</th>
              <th style={{ textAlign: "right", minWidth: "220px" }}>Update Consultation</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appt) => {
              const isUpdating = statusUpdatingId === appt._id;
              return (
                <tr key={appt._id}>
                  <td>
                    <strong className="queue-time">⏰ {appt.appointmentTime}</strong>
                    <small>{appt.appointmentDate}</small>
                  </td>
                  <td>
                    <strong>{appt.patientName}</strong>
                    <small>
                      Age: {appt.patientAge || "—"} • 📞 {appt.contactNumber}
                    </small>
                  </td>
                  <td>
                    <span className="reason-text">{appt.reason}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${appt.status.toLowerCase()}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="action-button-group">
                      {appt.status === "Booked" && (
                        <>
                          <button
                            className="btn-action-success"
                            onClick={() => updateAppointmentStatus(appt._id, "Completed")}
                            disabled={isUpdating}
                            title="Mark Completed"
                          >
                            ✓ Complete
                          </button>
                          <button
                            className="btn-action-warning"
                            onClick={() => updateAppointmentStatus(appt._id, "No-Show")}
                            disabled={isUpdating}
                            title="Mark No-Show"
                          >
                            No-Show
                          </button>
                          <button
                            className="btn-action-danger"
                            onClick={() => updateAppointmentStatus(appt._id, "Cancelled")}
                            disabled={isUpdating}
                            title="Cancel Appointment"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {appt.status !== "Booked" && (
                        <div className="status-selector-wrap">
                          <select
                            value={appt.status}
                            disabled={isUpdating}
                            onChange={(e) => updateAppointmentStatus(appt._id, e.target.value)}
                            className="status-dropdown"
                          >
                            <option value="Booked">Revert to Booked</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No-Show">No-Show</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAppointments.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">🩺</span>
            <h3>No appointments in this queue</h3>
            <p className="muted">
              {activeTab === "today"
                ? "You have no appointments scheduled for today. Take a well-deserved breather!"
                : "No matching appointment records found."}
            </p>
          </div>
        )}

        {loading && <p className="loading-notice">Loading appointment queue...</p>}
      </div>
    </div>
  );
}
