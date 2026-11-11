import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication and role check to all patient portal routes
router.use(verifyToken, verifyRole(["patient", "admin"]));

/**
 * GET /api/patient/appointments
 * Fetch only the logged-in patient's appointment history
 */
router.get("/appointments", async (req, res) => {
  try {
    const userId = req.user.id;
    const userPhone = req.user.phone;
    const userName = req.user.name;

    // Search by patientId or legacy match by phone / name
    const filter = {
      $or: [
        { patientId: userId },
        ...(userPhone ? [{ contactNumber: userPhone }] : []),
        ...(userName ? [{ patientName: new RegExp(`^${userName}$`, "i") }] : [])
      ]
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialization department consultationFee isAvailable")
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.json(appointments);
  } catch (error) {
    console.error("Patient appointments fetch error:", error);
    res.status(500).json({ message: "Could not fetch your appointments." });
  }
});

/**
 * POST /api/patient/appointments
 * Book a new appointment with conflict validation
 */
router.post("/appointments", async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, patientName, patientAge, contactNumber } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        message: "Doctor, appointment date, appointment time, and reason are required."
      });
    }

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID provided." });
    }

    // Verify doctor existence & availability
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Selected doctor does not exist." });
    }

    if (doctor.isAvailable === false) {
      return res.status(400).json({
        message: `Dr. ${doctor.name} is currently away and not accepting appointments.`
      });
    }

    // Check conflict: doctor already booked for the specified slot
    const doctorConflict = await Appointment.exists({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $ne: "Cancelled" }
    });

    if (doctorConflict) {
      return res.status(409).json({
        message: `Dr. ${doctor.name} is already booked on ${appointmentDate} at ${appointmentTime}. Please select another time slot.`
      });
    }

    // Check conflict: patient themselves already have an appointment at this time
    const patientConflict = await Appointment.exists({
      patientId: req.user.id,
      appointmentDate,
      appointmentTime,
      status: { $ne: "Cancelled" }
    });

    if (patientConflict) {
      return res.status(409).json({
        message: `You already have an appointment scheduled on ${appointmentDate} at ${appointmentTime}.`
      });
    }

    const newAppointment = await Appointment.create({
      patientId: req.user.id,
      patientName: (patientName || req.user.name || "Patient").trim(),
      patientAge: Number(patientAge) || 28,
      contactNumber: (contactNumber || req.user.phone || "0000000000").trim(),
      doctorId,
      appointmentDate,
      appointmentTime,
      reason: reason.trim(),
      status: "Booked"
    });

    await newAppointment.populate("doctorId", "name specialization department consultationFee");

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: newAppointment
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ message: error.message || "Failed to book appointment." });
  }
});

/**
 * PATCH /api/patient/appointments/:id/cancel
 * Allow patient to cancel their own appointment
 */
router.patch("/appointments/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Verify ownership: logged in patient owns this appointment
    const isOwner =
      appointment.patientId?.toString() === req.user.id ||
      appointment.contactNumber === req.user.phone ||
      req.user.role === "admin";

    if (!isOwner) {
      return res.status(403).json({
        message: "You are not authorized to cancel this appointment."
      });
    }

    if (appointment.status === "Cancelled") {
      return res.status(400).json({ message: "This appointment is already cancelled." });
    }

    appointment.status = "Cancelled";
    await appointment.save();
    await appointment.populate("doctorId", "name specialization department consultationFee");

    res.json({
      message: "Appointment cancelled successfully.",
      appointment
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Could not cancel appointment." });
  }
});

export default router;
