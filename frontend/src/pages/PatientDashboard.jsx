import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import BookAppointmentModal from "../components/BookAppointmentModal.jsx";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/patient/appointments");
      setAppointments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setCancellingId(id);
    setActionMsg("");
    try {
      const res = await api.patch(`/patient/appointments/${id}/cancel`);
      setActionMsg("Appointment cancelled successfully.");
      // Update locally
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: "Cancelled" } : app))
      );
    } catch (err) {
      setActionMsg(err.response?.data?.message || "Could not cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleBookSuccess = (newAppt) => {
    setAppointments((prev) => [newAppt, ...prev]);
    setActionMsg("Your appointment has been successfully booked!");
  };

  // Metrics computation
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingCount = appointments.filter(
    (a) => a.status === "Booked" && a.appointmentDate >= todayStr
  ).length;
  const totalBookings = appointments.length;
  const cancelledVisits = appointments.filter((a) => a.status === "Cancelled").length;
  const completedVisits = appointments.filter((a) => a.status === "Completed").length;

  // Filtered appointments
  const filteredAppointments = appointments.filter((app) => {
    // Tab filtering
    if (activeTab === "upcoming" && (app.status !== "Booked" || app.appointmentDate < todayStr)) {
      return false;
    }
    if (activeTab === "completed" && app.status !== "Completed") return false;
    if (activeTab === "cancelled" && app.status !== "Cancelled") return false;

    // Search query
    const docName = app.doctorId?.name || "";
    const specialty = app.doctorId?.specialization || "";
    const reason = app.reason || "";
    const query = searchFilter.toLowerCase();

    return (
      docName.toLowerCase().includes(query) ||
      specialty.toLowerCase().includes(query) ||
      reason.toLowerCase().includes(query)
    );
  });

  return (
    <div className="dashboard-page patient-dashboard">
      {/* Hero / Header Section */}
      <section className="hero">
        <div>
          <p className="eyebrow">PATIENT HEALTH PORTAL</p>
          <h1>
            Welcome back, {user?.name || "Patient"} <span>👋</span>
          </h1>
          <p className="muted">
            Track your consultations, schedule visits with top specialists, and manage your health journey.
          </p>
        </div>
        <button
          className="primary book-btn-hero"
          onClick={() => setIsModalOpen(true)}
        >
          <span>✚</span> Book New Appointment
        </button>
      </section>

      {/* Action status message */}
      {actionMsg && <div className="alert success">{actionMsg}</div>}
      {error && <div className="alert error">{error}</div>}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon upcoming-icon">⏰</span>
          <div>
            <strong>{upcomingCount}</strong>
            <span>Upcoming Appointments</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon total-icon">📅</span>
          <div>
            <strong>{totalBookings}</strong>
            <span>Total Bookings</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon cancelled-icon">❌</span>
          <div>
            <strong>{cancelledVisits}</strong>
            <span>Cancelled Visits</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon completed-icon">✓</span>
          <div>
            <strong>{completedVisits}</strong>
            <span>Completed Visits</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="quick-grid">
        <div className="quick-card interactive-card" onClick={() => setIsModalOpen(true)}>
          <span>🩺</span>
          <div>
            <h3>Schedule a Doctor</h3>
            <p>Select date, preferred time, and specialist for quick care.</p>
          </div>
          <b>+</b>
        </div>
        <Link to="/doctors" className="quick-card">
          <span>🔎</span>
          <div>
            <h3>Explore Specialists</h3>
            <p>Browse department doctors, credentials, and fee structures.</p>
          </div>
          <b>→</b>
        </Link>
      </div>

      {/* Appointments Management Table */}
      <div className="section-header-row">
        <div>
          <h2>Your Appointment History</h2>
          <p className="muted">Review upcoming visits, past treatments, and cancellation statuses.</p>
        </div>

        {/* Tab Filter */}
        <div className="pill-filters">
          <button
            className={`pill-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({totalBookings})
          </button>
          <button
            className={`pill-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            className={`pill-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed ({completedVisits})
          </button>
          <button
            className={`pill-btn ${activeTab === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled ({cancelledVisits})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search by doctor, specialty, or condition..."
          className="search-input-wide"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />
      </div>

      {/* Interactive Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Doctor & Specialty</th>
              <th>Date & Time</th>
              <th>Reason for Visit</th>
              <th>Fee</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appt) => {
              const isBooked = appt.status === "Booked";
              return (
                <tr key={appt._id}>
                  <td>
                    <strong>{appt.doctorId?.name || "Specialist Assigned"}</strong>
                    <small>{appt.doctorId?.specialization || "General OPD"}</small>
                  </td>
                  <td>
                    <strong>{appt.appointmentDate}</strong>
                    <small>⏰ {appt.appointmentTime}</small>
                  </td>
                  <td>
                    <span className="reason-text">{appt.reason}</span>
                  </td>
                  <td>
                    <strong>₹{appt.doctorId?.consultationFee || 500}</strong>
                  </td>
                  <td>
                    <span className={`status-badge status-${appt.status.toLowerCase()}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {isBooked ? (
                      <button
                        className="btn-danger-outline"
                        onClick={() => handleCancel(appt._id)}
                        disabled={cancellingId === appt._id}
                      >
                        {cancellingId === appt._id ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : (
                      <span className="text-muted-sm">No action required</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAppointments.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">📂</span>
            <h3>No appointments found</h3>
            <p className="muted">
              {activeTab !== "all"
                ? `You have no ${activeTab} appointments.`
                : "You haven't scheduled any doctor consultations yet."}
            </p>
            <button className="primary" onClick={() => setIsModalOpen(true)}>
              Book Your First Appointment
            </button>
          </div>
        )}

        {loading && <p className="loading-notice">Loading your appointments...</p>}
      </div>

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBookSuccess}
      />
    </div>
  );
}
