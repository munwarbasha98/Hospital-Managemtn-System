import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: [true, "Doctor name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Doctor email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: { type: String, trim: true, default: "" },
    specialization: { type: String, required: [true, "Specialization is required"], trim: true },
    department: { type: String, required: [true, "Department is required"], trim: true },
    consultationFee: { type: Number, required: [true, "Consultation fee is required"], min: 0 },
    isAvailable: { type: Boolean, default: true },
    availableSlots: {
      type: [String],
      default: [
        "09:00", "09:30", "10:00", "10:30",
        "11:00", "11:30", "14:00", "14:30"
      ]
    },
    // Preserved for backwards compatibility with existing frontend modals
    availableTimeSlots: {
      type: [String],
      default: [
        "09:00", "09:30", "10:00", "10:30",
        "11:00", "11:30", "14:00", "14:30"
      ]
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    password: { type: String, select: false }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        if (!ret.availableSlots && ret.availableTimeSlots) {
          ret.availableSlots = ret.availableTimeSlots;
        }
        if (!ret.availableTimeSlots && ret.availableSlots) {
          ret.availableTimeSlots = ret.availableSlots;
        }
        return ret;
      }
    }
  }
);

// Hash password with bcryptjs before saving if modified
doctorSchema.pre("save", async function (next) {
  if (this.availableSlots && this.availableSlots.length > 0 && (!this.availableTimeSlots || this.availableTimeSlots.length === 0)) {
    this.availableTimeSlots = this.availableSlots;
  } else if (this.availableTimeSlots && this.availableTimeSlots.length > 0 && (!this.availableSlots || this.availableSlots.length === 0)) {
    this.availableSlots = this.availableTimeSlots;
  }

  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper method
doctorSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Doctor", doctorSchema);
