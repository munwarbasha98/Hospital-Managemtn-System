import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const DOCTOR_PASSWORD_PLAIN = "123456789";

const standardSlots = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30"
];

const doctorsData = [
  {
    name: "Dr. Anil Mehta",
    email: "anil.mehta@carepoint.com",
    phone: "+91 98765 43210",
    specialization: "Pediatrics",
    department: "Child Care",
    consultationFee: 350,
    isAvailable: true,
    availableSlots: standardSlots
  },
  {
    name: "Dr. Arjun Singh",
    email: "arjun.singh@carepoint.com",
    phone: "+91 98765 43211",
    specialization: "Orthopedics",
    department: "Orthopedics",
    consultationFee: 550,
    isAvailable: true,
    availableSlots: standardSlots
  },
  {
    name: "Dr. Meera Iyer",
    email: "meera.iyer@carepoint.com",
    phone: "+91 98765 43212",
    specialization: "Gynecology",
    department: "Women's Health",
    consultationFee: 600,
    isAvailable: true,
    availableSlots: standardSlots
  },
  {
    name: "Dr. Neha Gupta",
    email: "neha.gupta@carepoint.com",
    phone: "+91 98765 43213",
    specialization: "Neurology",
    department: "Neurology",
    consultationFee: 650,
    isAvailable: true,
    availableSlots: standardSlots
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@carepoint.com",
    phone: "+91 98765 43214",
    specialization: "Dermatology",
    department: "Dermatology",
    consultationFee: 400,
    isAvailable: true,
    availableSlots: standardSlots
  },
  {
    name: "Dr. Ravi Kumar",
    email: "doctor@carepoint.com",
    phone: "+91 98765 43215",
    specialization: "Cardiology",
    department: "Cardiology",
    consultationFee: 550,
    isAvailable: true,
    availableSlots: standardSlots
  }
];

async function seedDoctors() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables. Check backend/.env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully.\n");

    const hashedPassword = await bcrypt.hash(DOCTOR_PASSWORD_PLAIN, 10);
    console.log(`🔐 Password for every doctor: "${DOCTOR_PASSWORD_PLAIN}" (hashed with bcryptjs)\n`);

    // Update any existing users without a role to 'patient'
    const updatedUsers = await User.updateMany({ role: { $exists: false } }, { $set: { role: "patient" } });
    if (updatedUsers.modifiedCount > 0) {
      console.log(`Updated ${updatedUsers.modifiedCount} user(s) to default role: patient`);
    }

    console.log("Populating & upserting the 6 CarePoint specialist doctors...");
    console.log("======================================================================================");

    for (const doc of doctorsData) {
      const normalizedEmail = doc.email.toLowerCase();

      // 1. Find or create matching User account for login authentication
      let user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        user = await User.create({
          name: doc.name,
          email: normalizedEmail,
          phone: doc.phone,
          password: hashedPassword,
          role: "doctor"
        });
        console.log(`[User Created]  ${user.name.padEnd(18)} | Email: ${user.email.padEnd(25)}`);
      } else {
        user.name = doc.name;
        user.phone = doc.phone;
        user.password = hashedPassword;
        user.role = "doctor";
        await user.save();
        console.log(`[User Updated]  ${user.name.padEnd(18)} | Email: ${user.email.padEnd(25)}`);
      }

      // 2. Find existing doctors by email or matching doctor name
      const cleanName = doc.name.replace(/^Dr\.\s*/i, "").trim();
      const existingDoctors = await Doctor.find({
        $or: [
          { email: normalizedEmail },
          { name: { $regex: new RegExp(cleanName, "i") } }
        ]
      }).sort({ createdAt: 1 });

      let canonicalDoctor = null;

      if (existingDoctors.length > 0) {
        // Keep the first (oldest) one as canonical to preserve appointment foreign keys
        canonicalDoctor = existingDoctors[0];

        // If there are duplicate doctor documents for this doctor, re-point appointments and delete dupes
        for (let i = 1; i < existingDoctors.length; i++) {
          const duplicate = existingDoctors[i];
          await Appointment.updateMany(
            { doctorId: duplicate._id },
            { $set: { doctorId: canonicalDoctor._id } }
          );
          await Doctor.findByIdAndDelete(duplicate._id);
        }

        canonicalDoctor.userId = user._id;
        canonicalDoctor.name = doc.name;
        canonicalDoctor.email = normalizedEmail;
        canonicalDoctor.phone = doc.phone;
        canonicalDoctor.specialization = doc.specialization;
        canonicalDoctor.department = doc.department;
        canonicalDoctor.consultationFee = doc.consultationFee;
        canonicalDoctor.isAvailable = doc.isAvailable;
        canonicalDoctor.availableSlots = doc.availableSlots;
        canonicalDoctor.availableTimeSlots = doc.availableSlots;
        canonicalDoctor.password = hashedPassword;
        await canonicalDoctor.save();

        console.log(`[Doctor Updated] ${canonicalDoctor.name.padEnd(18)} | ${canonicalDoctor.specialization.padEnd(14)} | ${canonicalDoctor.department.padEnd(16)} | ₹${canonicalDoctor.consultationFee}`);
      } else {
        canonicalDoctor = await Doctor.create({
          userId: user._id,
          name: doc.name,
          email: normalizedEmail,
          phone: doc.phone,
          specialization: doc.specialization,
          department: doc.department,
          consultationFee: doc.consultationFee,
          isAvailable: doc.isAvailable,
          availableSlots: doc.availableSlots,
          availableTimeSlots: doc.availableSlots,
          password: hashedPassword
        });

        console.log(`[Doctor Added]   ${canonicalDoctor.name.padEnd(18)} | ${canonicalDoctor.specialization.padEnd(14)} | ${canonicalDoctor.department.padEnd(16)} | ₹${canonicalDoctor.consultationFee}`);
      }

      // Link canonical doctor ID back to User
      user.doctorId = canonicalDoctor._id;
      await user.save();
    }

    console.log("======================================================================================");

    // 3. Ensure demo patient user exists
    const patEmail = "patient@carepoint.com";
    let patUser = await User.findOne({ email: patEmail });
    if (!patUser) {
      const patHash = await bcrypt.hash("Patient123!", 10);
      patUser = await User.create({
        name: "Rohith Sharma",
        email: patEmail,
        phone: "9847878678",
        password: patHash,
        role: "patient"
      });
      console.log(`[Patient Created] ${patUser.name.padEnd(18)} | Email: ${patUser.email.padEnd(25)} (Password: Patient123!)`);
    } else {
      patUser.role = "patient";
      await patUser.save();
      console.log(`[Patient Verified] ${patUser.name.padEnd(18)} | Email: ${patUser.email.padEnd(25)} (Password: Patient123!)`);
    }

    const count = await Doctor.countDocuments();
    console.log(`\n🎉 Seeding successful! Total doctors in database: ${count}`);

    const allDocs = await Doctor.find({}).sort({ name: 1 });
    console.log("\nCarePoint Doctors Directory:");
    console.table(
      allDocs.map((d) => ({
        Name: d.name,
        Specialization: d.specialization,
        Department: d.department,
        "Fee (₹)": `₹${d.consultationFee}`,
        Status: d.isAvailable ? "Available (Online)" : "Away / Unavailable",
        Email: d.email,
        Slots: d.availableSlots?.join(", ")
      }))
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Doctor Seeding failed:", error);
    process.exit(1);
  }
}

seedDoctors();
