import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patientName: { type: String, required: true, trim: true },
    patientAge: { type: Number, required: true, min: 0, max: 120 },
    contactNumber: { type: String, required: true, trim: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Booked", "Completed", "Cancelled", "No-Show"], default: "Booked" }
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ patientId: 1 });

export default mongoose.model("Appointment", appointmentSchema);
