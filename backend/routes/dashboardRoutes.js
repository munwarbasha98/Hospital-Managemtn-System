import express from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();
router.get("/stats", async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const [totalDoctors, totalAppointments, upcomingAppointments, completedAppointments] = await Promise.all([
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments({ appointmentDate: { $gte: today }, status: "Booked" }),
    Appointment.countDocuments({ status: "Completed" })
  ]);
  res.json({ totalDoctors, totalAppointments, upcomingAppointments, completedAppointments });
});
export default router;
