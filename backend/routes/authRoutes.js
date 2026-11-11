import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import { JWT_SECRET, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Register a new user
 * Supports 'patient', 'doctor', or 'admin' roles (default: 'patient')
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role = "patient", specialization, department } = req.body;
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must contain at least 6 characters." });
    }

    const validRoles = ["patient", "doctor", "admin"];
    const userRole = validRoles.includes(role) ? role : "patient";

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: userRole
    });

    // If registered as doctor, automatically link or create their Doctor profile
    if (userRole === "doctor") {
      let doctorProfile = await Doctor.findOne({
        $or: [{ email: normalizedEmail }, { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } }]
      });

      if (!doctorProfile) {
        doctorProfile = await Doctor.create({
          userId: user._id,
          name: name.startsWith("Dr.") ? name.trim() : `Dr. ${name.trim()}`,
          email: normalizedEmail,
          specialization: specialization || "General Medicine",
          department: department || "Outpatient Department",
          consultationFee: 500,
          isAvailable: true
        });
      } else {
        doctorProfile.userId = user._id;
        doctorProfile.email = normalizedEmail;
        await doctorProfile.save();
      }

      user.doctorId = doctorProfile._id;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorId: user.doctorId
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Unable to register right now." });
  }
});

/**
 * Login user
 * Returns JWT token and user info including 'role'
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Fallback default role to 'patient' if previously undefined
    const role = user.role || "patient";
    if (!user.role) {
      user.role = "patient";
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorId: user.doctorId
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to login right now." });
  }
});

/**
 * Get current authenticated user profile
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile." });
  }
});

export default router;
