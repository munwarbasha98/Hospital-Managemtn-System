import { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import BookAppointmentModal from "../components/BookAppointmentModal.jsx";

export default function Doctors() {
  const { isDoctor, isAdmin, isPatient } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = () => {
    api
      .get("/doctors", { params: { search } })
      .then((r) => setDoctors(r.data))
      .catch((err) =>
        setMessage(
          err.response?.data?.message || "Could not load doctors. Make sure backend is running."
        )
      );
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/doctors", {
        ...form,
        consultationFee: Number(form.consultationFee)
      });
      setForm({});
      setMessage("Doctor added successfully.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add doctor.");
    }
  };

  const remove = async (id) => {
    if (window.confirm("Are you sure you want to remove this doctor from directory?")) {
      await api.delete(`/doctors/${id}`);
      load();
    }
  };

  return (
    <div className="doctors-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARE TEAM DIRECTORY</p>
          <h1>Our Specialist Medical Staff</h1>
          <p className="muted">Find certified doctors, view consultation fees, and schedule visits.</p>
        </div>
        <div className="heading-actions">
          <input
            className="search"
            placeholder="Search by doctor or specialty..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setTimeout(load, 100);
            }}
          />
          {isPatient && (
            <button className="primary" onClick={() => setIsModalOpen(true)}>
              ✚ Book Appointment
            </button>
          )}
        </div>
      </div>

      <div className="content-grid">
        <section>
          <div className="doctor-grid">
            {doctors.map((d) => (
              <article className="doctor-card" key={d._id}>
                <div className="avatar">
                  {d.name
                    .replace(/^Dr\.\s*/i, "")
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <h3>{d.name}</h3>
                <span className="tag">{d.specialization}</span>
                <p>
                  {d.department} • <strong>₹{d.consultationFee}</strong> consultation
                </p>
                <div className="card-footer-info">
                  <small className={d.isAvailable ? "status-online" : "status-offline"}>
                    {d.isAvailable ? "● Available for Consultations" : "● Currently Away"}
                  </small>
                  {isAdmin && (
                    <button className="text-button" onClick={() => remove(d._id)}>
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {doctors.length === 0 && <p className="empty">No doctors found matching criteria.</p>}
        </section>

        {/* Add Doctor form for Admins */}
        {isAdmin && (
          <form className="panel compact" onSubmit={submit}>
            <h2>Add New Doctor</h2>
            {message && <div className="alert success">{message}</div>}
            <label>
              Full Name
              <input
                required
                placeholder="Dr. Jane Smith"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Specialization
              <input
                required
                placeholder="e.g. Cardiology"
                value={form.specialization || ""}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
            </label>
            <label>
              Department
              <input
                required
                placeholder="e.g. Cardiology Dept"
                value={form.department || ""}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </label>
            <label>
              Consultation Fee (₹)
              <input
                required
                type="number"
                min="0"
                placeholder="500"
                value={form.consultationFee || ""}
                onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
              />
            </label>
            <button className="primary full">Save to Directory</button>
          </form>
        )}
      </div>

      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
