import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("hospitalUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("hospitalUser", JSON.stringify(userData));
    // Redirect based on role
    if (userData.role === "doctor") {
      navigate("/dashboard/doctor", { replace: true });
    } else {
      navigate("/dashboard/patient", { replace: true });
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("hospitalUser");
    navigate("/login", { replace: true });
  };

  const value = {
    user,
    token: user?.token,
    role: user?.role || "guest",
    isAuthenticated: !!user?.token,
    isDoctor: user?.role === "doctor",
    isPatient: user?.role === "patient",
    isAdmin: user?.role === "admin",
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
