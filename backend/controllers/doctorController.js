import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

/**
 * @desc   Fetch all doctors with optional case-insensitive search across name, specialization, or department
 * @route  GET /api/doctors
 * @access Public
 */
export const getDoctors = async (req, res) => {
  try {
    const { search, specialization, department, isAvailable } = req.query;
    const filter = {};

    // Case-insensitive search matching name, specialization, or department
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { specialization: searchRegex },
        { department: searchRegex }
      ];
    }

    if (specialization) {
      filter.specialization = new RegExp(`^${specialization.trim()}$`, "i");
    }

    if (department) {
      filter.department = new RegExp(`^${department.trim()}$`, "i");
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true" || isAvailable === true;
    }

    const doctors = await Doctor.find(filter).sort({ name: 1 });
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Failed to fetch doctors list.", error: error.message });
  }
};

/**
 * @desc   Get single doctor by ID
 * @route  GET /api/doctors/:id
 * @access Public
 */
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid doctor ID." });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ message: "Failed to fetch doctor.", error: error.message });
  }
};

/**
 * @desc   Register a new doctor
 * @route  POST /api/doctors/register OR POST /api/doctors
 * @access Public / Admin
 */
export const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone = "",
      specialization,
      department,
      consultationFee,
      password,
      availableSlots
    } = req.body;

    // Validation
    if (!name || !email || !specialization || !department || consultationFee === undefined) {
      return res.status(400).json({
        message: "Full Name, Email, Specialization, Department, and Consultation Fee are required."
      });
    }

    if (isNaN(Number(consultationFee)) || Number(consultationFee) < 0) {
      return res.status(400).json({ message: "Consultation Fee must be a valid positive number." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingDoctor = await Doctor.findOne({ email: normalizedEmail });
    if (existingDoctor) {
      return res.status(409).json({ message: "A doctor with this email is already registered." });
    }

    // Default password to '123456789' if not provided
    const docPassword = password && password.trim().length >= 6 ? password.trim() : "123456789";

    // Format name to have 'Dr.' prefix if missing
    const formattedName = name.trim().startsWith("Dr.") ? name.trim() : `Dr. ${name.trim()}`;

    // Standard slots fallback
    const slots =
      Array.isArray(availableSlots) && availableSlots.length > 0
        ? availableSlots
        : ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30"];

    // Check or create corresponding User account for authentication
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const hashedUserPassword = await bcrypt.hash(docPassword, 10);
      user = await User.create({
        name: formattedName,
        email: normalizedEmail,
        phone: phone.trim(),
        password: hashedUserPassword,
        role: "doctor"
      });
    } else {
      user.role = "doctor";
      await user.save();
    }

    // Create the Doctor document (password is hashed by Doctor pre-save hook)
    const doctor = await Doctor.create({
      userId: user._id,
      name: formattedName,
      email: normalizedEmail,
      phone: phone.trim(),
      specialization: specialization.trim(),
      department: department.trim(),
      consultationFee: Number(consultationFee),
      isAvailable: true,
      availableSlots: slots,
      availableTimeSlots: slots,
      password: docPassword
    });

    // Link doctorId back to user
    user.doctorId = doctor._id;
    await user.save();

    res.status(201).json({
      message: "Doctor registered successfully.",
      doctor
    });
  } catch (error) {
    console.error("Error registering doctor:", error);
    res.status(400).json({ message: error.message || "Could not register doctor." });
  }
};

/**
 * @desc   Toggle doctor availability status between Available and Away/Unavailable
 * @route  PATCH /api/doctors/:id/availability
 * @access Public / Authenticated Doctor / Admin
 */
export const toggleDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid doctor ID." });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    // If an explicit boolean is provided in body, set it; otherwise toggle current status
    if (typeof req.body.isAvailable === "boolean") {
      doctor.isAvailable = req.body.isAvailable;
    } else {
      doctor.isAvailable = !doctor.isAvailable;
    }

    await doctor.save();

    res.status(200).json({
      message: `Doctor status updated to ${doctor.isAvailable ? "Available" : "Away / Unavailable"}.`,
      isAvailable: doctor.isAvailable,
      doctor
    });
  } catch (error) {
    console.error("Error toggling doctor availability:", error);
    res.status(500).json({ message: "Failed to update availability.", error: error.message });
  }
};

/**
 * @desc   Update doctor details
 * @route  PUT /api/doctors/:id
 * @access Admin / Doctor
 */
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid doctor ID." });
    }

    const updates = { ...req.body };
    if (updates.availableSlots && !updates.availableTimeSlots) {
      updates.availableTimeSlots = updates.availableSlots;
    }
    if (updates.availableTimeSlots && !updates.availableSlots) {
      updates.availableSlots = updates.availableTimeSlots;
    }

    const doctor = await Doctor.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    res.status(200).json({
      message: "Doctor profile updated successfully.",
      doctor
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(400).json({ message: error.message || "Failed to update doctor." });
  }
};

/**
 * @desc   Delete doctor
 * @route  DELETE /api/doctors/:id
 * @access Admin
 */
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid doctor ID." });
    }

    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    res.status(200).json({ message: "Doctor deleted from directory." });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Failed to delete doctor.", error: error.message });
  }
};
