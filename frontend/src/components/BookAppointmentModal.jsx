import { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function BookAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");
  const [patientAge, setPatientAge] = useState(25);
  const [contactNumber, setContactNumber] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Common appointment time slots
  const defaultSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
      setError("");
      setSuccessMsg("");
    }
  }, [isOpen]);

  const loadDoctors = async () => {
    try {
      setFetchingDoctors(true);
      const res = await api.get("/doctors");
      setDoctors(res.data);
      if (res.data.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(res.data[0]._id);
      }
    } catch (err) {
      setError("Could not load available doctors.");
    } finally {
      setFetchingDoctors(false);
    }
  };

  if (!isOpen) return null;

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);

  // Available time slots from doctor or default slots
  const availableSlots =
    selectedDoctor?.availableTimeSlots?.length > 0
      ? selectedDoctor.availableTimeSlots
      : defaultSlots;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!selectedDoctorId) {
      setError("Please select a doctor.");
      return;
    }
    if (!appointmentDate || !appointmentTime) {
      setError("Please select both an appointment date and a time slot.");
      return;
    }
    if (!reason.trim()) {
      setError("Please provide a reason for the visit.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        doctorId: selectedDoctorId,
        appointmentDate,
        appointmentTime,
        reason: reason.trim(),
        patientName: user?.name,
        patientAge: Number(patientAge),
        contactNumber: contactNumber.trim()
      };

      const res = await api.post("/patient/appointments", payload);
      setSuccessMsg("Appointment booked successfully!");
      setTimeout(() => {
        onSuccess(res.data.appointment);
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment. Please try another time slot.");
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date string for min date limit
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">CAREPOINT SCHEDULING</span>
            <h2>Book New Appointment</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {successMsg && <div className="alert success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Doctor Selection */}
          <div className="form-group">
            <label>
              Search & Select Doctor <span className="req">*</span>
            </label>
            <input
              type="text"
              placeholder="Filter by name, specialty, or department..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="doctor-select-grid">
              {filteredDoctors.map((doc) => {
                const isSelected = doc._id === selectedDoctorId;
                return (
                  <div
                    key={doc._id}
                    className={`doctor-choice-card ${isSelected ? "selected" : ""} ${
                      !doc.isAvailable ? "unavailable" : ""
                    }`}
                    onClick={() => {
                      if (doc.isAvailable) setSelectedDoctorId(doc._id);
                    }}
                  >
                    <div className="choice-header">
                      <strong>{doc.name}</strong>
                      <span className="fee-tag">₹{doc.consultationFee}</span>
                    </div>
                    <span className="specialty-label">{doc.specialization}</span>
                    <small className="dept-label">{doc.department}</small>
                    <div className="availability-indicator">
                      {doc.isAvailable ? (
                        <span className="badge-available">● Available</span>
                      ) : (
                        <span className="badge-away">● Away / Unavailable</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredDoctors.length === 0 && (
                <p className="empty-notice">No doctors match your search query.</p>
              )}
            </div>
          </div>

          {/* Date & Time Slot Selection */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Appointment Date <span className="req">*</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                Select Time Slot <span className="req">*</span>
              </label>
              <div className="slot-grid">
                {availableSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    className={`slot-chip ${appointmentTime === slot ? "active" : ""}`}
                    onClick={() => setAppointmentTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Patient Age</label>
              <input
                type="number"
                min="0"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Mobile number"
              />
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="form-group">
            <label>
              Reason for Visit / Symptoms <span className="req">*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder="Briefly describe your symptoms or reason for consulting the doctor..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="modal-actions">
            <button type="button" className="outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="primary"
              disabled={loading || !selectedDoctorId || !appointmentDate || !appointmentTime}
            >
              {loading ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
