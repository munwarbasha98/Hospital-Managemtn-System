import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication and role check to all doctor portal routes
router.use(verifyToken, verifyRole(["doctor", "admin"]));

/**
 * Helper to get or link Doctor profile for the authenticated user
 */
async function getDoctorForUser(user) {
  let doctor = await Doctor.findOne({ userId: user.id });
  if (!doctor) {
    // Try finding by email or name
    doctor = await Doctor.findOne({
      $or: [
        { email: user.email },
        { name: { $regex: new RegExp(user.name.replace(/^Dr\.\s*/i, ""), "i") } }
      ]
    });
    if (doctor) {
      doctor.userId = user.id;
      if (!doctor.email) doctor.email = user.email;
      await doctor.save();
    }
  }

  // If no doctor document exists yet, auto-create one for this doctor user
  if (!doctor) {
    doctor = await Doctor.create({
      userId: user.id,
      name: user.name.startsWith("Dr.") ? user.name : `Dr. ${user.name}`,
      email: user.email,
      specialization: "General Practice",
      department: "Consultation & OPD",
      consultationFee: 500,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      availableTimeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      isAvailable: true
    });
  }

  return doctor;
}

/**
 * GET /api/doctor/profile
 * Get current doctor's details and availability
 */
router.get("/profile", async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch doctor profile." });
  }
});

/**
 * GET /api/doctor/appointments
 * Fetch appointments specifically assigned to the logged-in doctor
 */
router.get("/appointments", async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    const filter = { doctorId: doctor._id };

    if (req.query.date) filter.appointmentDate = req.query.date;
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization consultationFee")
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("Doctor appointments fetch error:", error);
    res.status(500).json({ message: "Could not load doctor appointments." });
  }
});

/**
 * PATCH /api/doctor/appointments/:id/status
 * Allow the doctor to update appointment status (Completed, Cancelled, No-Show, Booked)
 */
router.patch("/appointments/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const validStatuses = ["Booked", "Completed", "Cancelled", "No-Show"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const doctor = await getDoctorForUser(req.user);

    // Verify appointment belongs to this doctor (unless admin)
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (req.user.role !== "admin" && appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this appointment." });
    }

    appointment.status = status;
    await appointment.save();
    await appointment.populate("doctorId", "name specialization");
    await appointment.populate("patientId", "name email phone");

    res.json({
      message: `Appointment status updated to ${status}.`,
      appointment
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ message: "Could not update appointment status." });
  }
});

/**
 * PATCH /api/doctor/availability
 * Allow doctor to toggle availability and working hours/days
 */
router.patch("/availability", async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    const { isAvailable, availableDays, availableTimeSlots, consultationFee } = req.body;

    if (isAvailable !== undefined) doctor.isAvailable = Boolean(isAvailable);
    if (availableDays && Array.isArray(availableDays)) doctor.availableDays = availableDays;
    if (availableTimeSlots && Array.isArray(availableTimeSlots)) doctor.availableTimeSlots = availableTimeSlots;
    if (consultationFee !== undefined && Number(consultationFee) >= 0) {
      doctor.consultationFee = Number(consultationFee);
    }

    await doctor.save();
    res.json({
      message: "Availability settings updated successfully.",
      doctor
    });
  } catch (error) {
    console.error("Doctor availability update error:", error);
    res.status(500).json({ message: "Could not update availability." });
  }
});

export default router;
