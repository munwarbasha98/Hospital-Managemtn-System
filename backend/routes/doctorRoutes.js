import express from "express";
import {
  getDoctors,
  getDoctorById,
  registerDoctor,
  toggleDoctorAvailability,
  updateDoctor,
  deleteDoctor
} from "../controllers/doctorController.js";

const router = express.Router();

// GET /api/doctors - Fetch all doctors with search (?search=...)
router.get("/", getDoctors);

// POST /api/doctors/register - Register a new doctor
router.post("/register", registerDoctor);

// POST /api/doctors - Create/register a new doctor (compatible with existing form submissions)
router.post("/", registerDoctor);

// GET /api/doctors/:id - Fetch single doctor by ID
router.get("/:id", getDoctorById);

// PATCH /api/doctors/:id/availability - Toggle doctor availability
router.patch("/:id/availability", toggleDoctorAvailability);

// PUT /api/doctors/:id - Update doctor details
router.put("/:id", updateDoctor);

// DELETE /api/doctors/:id - Remove doctor
router.delete("/:id", deleteDoctor);

export default router;
