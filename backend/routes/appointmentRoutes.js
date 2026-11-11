import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.search) filter.patientName = { $regex: req.query.search, $options: "i" };
  if (req.query.date) filter.appointmentDate = req.query.date;
  if (req.query.status) filter.status = req.query.status;
  res.json(await Appointment.find(filter).populate("doctorId", "name specialization").sort({ appointmentDate: 1, appointmentTime: 1 }));
});

router.post("/", async (req, res) => {
  try {
    const { patientName, patientAge, contactNumber, doctorId, appointmentDate, appointmentTime, reason } = req.body;
    if (!patientName || patientAge === undefined || !contactNumber || !doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ message: "All appointment fields are required." });
    }
    if (!mongoose.isValidObjectId(doctorId) || !(await Doctor.exists({ _id: doctorId }))) {
      return res.status(400).json({ message: "Please select a valid doctor." });
    }
    const conflict = await Appointment.exists({ doctorId, appointmentDate, appointmentTime, status: { $ne: "Cancelled" } });
    if (conflict) return res.status(409).json({ message: "This doctor is already booked for that date and time." });
    res.status(201).json(await (await Appointment.create(req.body)).populate("doctorId", "name specialization"));
  } catch {
    res.status(400).json({ message: "Could not book appointment. Check the submitted values." });
  }
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid appointment id." });
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("doctorId", "name specialization");
  if (!appointment) return res.status(404).json({ message: "Appointment not found." });
  res.json(appointment);
});

router.patch("/:id/cancel", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid appointment id." });
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: "Cancelled" }, { new: true }).populate("doctorId", "name specialization");
  if (!appointment) return res.status(404).json({ message: "Appointment not found." });
  res.json(appointment);
});

export default router;
