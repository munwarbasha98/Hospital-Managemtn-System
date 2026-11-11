import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor to inject the JWT Bearer token into every outgoing request
api.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(sessionStorage.getItem("hospitalUser") || "null");
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      // sessionStorage read failed
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration (HTTP 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      sessionStorage.removeItem("hospitalUser");
      window.location.href = "/login?expired=true";
    }
    return Promise.reject(error);
  }
);

export const request = async (promise) => (await promise).data;
