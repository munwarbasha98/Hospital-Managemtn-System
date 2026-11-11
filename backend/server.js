import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorPortalRoutes from "./routes/doctorPortalRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorPortalRoutes);
app.use((error, _req, res, _next) => res.status(500).json({ message: error.message || "Server error." }));

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API running at http://localhost:${port}`)))
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
