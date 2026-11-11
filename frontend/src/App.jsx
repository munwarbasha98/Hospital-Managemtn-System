import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Auth from "./pages/Auth.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import Doctors from "./pages/Doctors.jsx";

/**
 * Smart Route Index that redirects users to their appropriate dashboard based on role
 */
function DashboardRedirect() {
  const { user, isDoctor } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={isDoctor ? "/dashboard/doctor" : "/dashboard/patient"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth register />} />

        {/* Smart Dashboard Index */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Role-Protected Patient Dashboard */}
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={["patient", "admin"]}>
              <Layout>
                <PatientDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Doctor Dashboard */}
        <Route
          path="/dashboard/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor", "admin"]}>
              <Layout>
                <DoctorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Common Medical Directory Route */}
        <Route
          path="/doctors"
          element={
            <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
              <Layout>
                <Doctors />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Appointments redirect to dashboard */}
        <Route
          path="/appointments"
          element={<DashboardRedirect />}
        />

        {/* Catch-all route */}
        <Route path="*" element={<DashboardRedirect />} />
      </Routes>
    </AuthProvider>
  );
}
