# CarePoint Hospital Appointment Management System

CarePoint is a beginner-friendly college project for **SDG 3 — Good Health and Well-being**. It demonstrates a React/Vite frontend, an Express/Node.js REST API, and MongoDB operations through both Mongoose and `mongosh`.

## Technology

- React, Vite, JavaScript, Axios, React Router DOM
- Node.js, Express.js, bcryptjs
- MongoDB and Mongoose

MongoDB is the only database used.

## Project structure

```text
hospital management/
├── frontend/                 # React/Vite application
├── backend/                  # Express API and Mongoose models
├── mongosh/
│   ├── setup.js              # Collections and fictional doctors
│   └── operations.js         # CRUD, count, and aggregation examples
└── README.md
```

## Requirements

- Node.js 18+
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- `mongosh` installed and available on PATH

## Run locally

1. Start MongoDB locally, or create a MongoDB Atlas cluster.
2. Open a terminal in `backend` and install dependencies:

   ```bash
   npm install
   copy .env.example .env
   ```

   On macOS/Linux, use `cp .env.example .env` instead of `copy`.
3. If using Atlas, update `MONGODB_URI` in `backend/.env`. The default local value is:

   ```text
   mongodb://127.0.0.1:27017/hospitalDB
   ```

4. Create collections and fictional doctors:

   ```bash
   mongosh "mongodb://127.0.0.1:27017" mongosh/setup.js
   ```

5. Start the API:

   ```bash
   cd backend
   npm run dev
   ```

6. In another terminal, install and start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## API routes

| Area | Routes |
|---|---|
| Authentication | `POST /api/auth/register`, `POST /api/auth/login` |
| Doctors | `GET/POST /api/doctors`, `PUT/DELETE /api/doctors/:id` |
| Appointments | `GET/POST /api/appointments`, `PUT /api/appointments/:id`, `PATCH /api/appointments/:id/cancel` |
| Dashboard | `GET /api/dashboard/stats` |

Appointment creation checks that the doctor exists and prevents an active booking for the same doctor, date, and time. Cancelled slots can be booked again.

## Authentication note

Passwords are hashed with `bcryptjs`, and duplicate emails are rejected. This academic demonstration deliberately does **not** use JWT. The frontend stores the returned user summary in `sessionStorage` to control the UI. This is not secure backend authentication and should not be used for a production hospital system.

## Mongosh demonstration

Run the complete example file:

```bash
mongosh "mongodb://127.0.0.1:27017" mongosh/operations.js
```

Or open an interactive shell:

```bash
mongosh
use hospitalDB
db.doctors.find()
db.doctors.find({ specialization: "Cardiology" })
db.appointments.countDocuments()
```

To insert an appointment manually, first copy a real doctor ID from `db.doctors.find()`, then replace the placeholder:

```javascript
db.appointments.insertOne({
  patientName: "Rahul Sharma",
  patientAge: 25,
  contactNumber: "9876543210",
  doctorId: ObjectId("PASTE_A_REAL_DOCTOR_ID"),
  appointmentDate: "2026-11-10",
  appointmentTime: "10:30",
  reason: "Regular checkup",
  status: "Booked"
});
```

The aggregation example groups appointments by status:

```javascript
db.appointments.aggregate([
  { $group: { _id: "$status", totalAppointments: { $sum: 1 } } }
]);
```

Use `db.users.find()`, `db.doctors.find()`, and `db.appointments.find()` to verify records created through the web interface. The Node.js API and mongosh use the same `hospitalDB` database.

## Demo flow

1. Register a fictional user.
2. Sign in and view dashboard statistics.
3. Browse or add a doctor.
4. Book an appointment.
5. Filter or cancel it from Appointments.
6. Verify the saved document with `mongosh`.
