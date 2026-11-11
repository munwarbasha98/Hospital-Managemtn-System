use("hospitalDB");

// Insert
db.doctors.insertOne({
  name: "Dr. Priya Sharma",
  specialization: "Dermatology",
  department: "Dermatology",
  consultationFee: 400,
  isAvailable: true
});

// Find all doctors and filter by specialization
db.doctors.find();
db.doctors.find({ specialization: "Cardiology" });

// Update one doctor
db.doctors.updateOne(
  { name: "Dr. Priya Sharma" },
  { $set: { consultationFee: 450 } }
);

// Delete one doctor (use only for a demonstration record)
db.doctors.deleteOne({ name: "Dr. Priya Sharma" });

// Count and group appointments
db.appointments.countDocuments();
db.appointments.aggregate([
  { $group: { _id: "$status", totalAppointments: { $sum: 1 } } }
]);
