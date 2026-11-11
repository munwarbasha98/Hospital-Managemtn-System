use("hospitalDB");

db.createCollection("users");
db.createCollection("doctors");
db.createCollection("appointments");

db.doctors.insertMany([
  {
    name: "Dr. Ravi Kumar",
    specialization: "Cardiology",
    department: "Cardiology",
    consultationFee: 500,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["10:00", "10:30", "11:00"],
    isAvailable: true
  },
  {
    name: "Dr. Priya Sharma",
    specialization: "Dermatology",
    department: "Dermatology",
    consultationFee: 400,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTimeSlots: ["09:00", "09:30", "10:00"],
    isAvailable: true
  },
  {
    name: "Dr. Anil Mehta",
    specialization: "Pediatrics",
    department: "Child Care",
    consultationFee: 350,
    availableDays: ["Monday", "Tuesday", "Thursday"],
    availableTimeSlots: ["11:00", "11:30", "12:00"],
    isAvailable: true
  }
]);

print("hospitalDB collections and sample doctors are ready.");
