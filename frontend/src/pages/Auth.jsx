import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth({ register: initialRegister = false }) {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab mode: 'login' or 'register'
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [role, setRole] = useState("patient"); // 'patient' | 'doctor'
  const [form, setForm] = useState({ role: "patient" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const flashMessage = location.state?.message || "";

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setForm((prev) => ({ ...prev, role: selectedRole }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister ? { ...form, role } : form;
      const res = await api.post(endpoint, payload);
      const data = res.data;

      // Log in with the returned user profile and JWT token
      login({ ...data.user, token: data.token });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials or register a new account."
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo fast-fill shortcut
  const handleDemoFill = async (demoRole) => {
    setError("");
    setLoading(true);
    const credentials =
      demoRole === "doctor"
        ? { email: "doctor@carepoint.com", password: "123456789" }
        : { email: "patient@carepoint.com", password: "Patient123!" };

    try {
      const res = await api.post("/auth/login", credentials);
      login({ ...res.data.user, token: res.data.token });
    } catch (err) {
      setError(err.response?.data?.message || `Demo ${demoRole} login failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-mark">✚</div>
        <h1>CarePoint Hospital</h1>
        <p className="muted">
          {isRegister
            ? "Create your personal account with your own details."
            : "Sign in with your email and password."}
        </p>

        {/* Tab Switcher between Sign In and Register */}
        <div className="auth-tab-group">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(false);
              setError("");
              navigate("/login", { replace: true });
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(true);
              setError("");
              navigate("/register", { replace: true });
            }}
          >
            Create Account
          </button>
        </div>

        {flashMessage && <div className="alert success">{flashMessage}</div>}
        {error && <div className="alert error">{error}</div>}

        {/* Main Form for User's Own Details */}
        <form onSubmit={submit}>
          {isRegister && (
            <>
              {/* Account Type / Role Choice */}
              <label>I want to register as a:</label>
              <div className="role-selector-group">
                <button
                  type="button"
                  className={`role-choice-btn ${role === "patient" ? "active" : ""}`}
                  onClick={() => handleRoleChange("patient")}
                >
                  👤 Patient
                </button>
                <button
                  type="button"
                  className={`role-choice-btn ${role === "doctor" ? "active" : ""}`}
                  onClick={() => handleRoleChange("doctor")}
                >
                  🩺 Doctor
                </button>
              </div>

              <label>
                Your Full Name
                <input
                  required
                  placeholder={role === "doctor" ? "e.g. Dr. Munwar Basha" : "e.g. Munwar Basha"}
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label>
                Phone Number
                <input
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  pattern="[0-9+\-\s]{7,}"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>

              {role === "doctor" && (
                <>
                  <label>
                    Medical Specialization
                    <input
                      required
                      placeholder="e.g. General Medicine, Cardiology, Pediatrics"
                      value={form.specialization || ""}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    />
                  </label>
                  <label>
                    Hospital Department
                    <input
                      required
                      placeholder="e.g. Outpatient Department (OPD)"
                      value={form.department || ""}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    />
                  </label>
                </>
              )}
            </>
          )}

          <label>
            Email Address
            <input
              required
              type="email"
              placeholder="Enter your email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              placeholder="Enter your password (min 6 chars)"
              minLength={6}
              value={form.password || ""}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>

          {isRegister && (
            <label>
              Confirm Password
              <input
                required
                type="password"
                placeholder="Re-enter your password"
                minLength={6}
                value={form.confirmPassword || ""}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </label>
          )}

          <button className="primary full submit-auth-btn" disabled={loading}>
            {loading ? "Processing..." : isRegister ? `Register as ${role === "doctor" ? "Doctor" : "Patient"}` : "Sign In to My Account"}
          </button>
        </form>

        {/* Demo Accounts Section (Subtle / Collapsible) */}
        <div className="demo-toggle-area">
          <button
            type="button"
            className="demo-toggle-link"
            onClick={() => setShowDemo(!showDemo)}
          >
            {showDemo ? "▲ Hide test shortcuts" : "⚡ Need test shortcuts? Click here"}
          </button>

          {showDemo && (
            <div className="demo-accounts-box">
              <span className="demo-title">Pre-seeded Test Accounts:</span>
              <div className="demo-btn-row">
                <button
                  type="button"
                  className="btn-demo-patient"
                  onClick={() => handleDemoFill("patient")}
                  disabled={loading}
                >
                  👤 Test as Patient (Rohith)
                </button>
                <button
                  type="button"
                  className="btn-demo-doctor"
                  onClick={() => handleDemoFill("doctor")}
                  disabled={loading}
                >
                  🩺 Test as Doctor (Dr. Ravi)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
