# CarePoint Hospital Appointment Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-4.5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-FFB13B)](https://jwt.io/)
[![SDG 3](https://img.shields.io/badge/UN%20SDG-3%20Good%20Health-4C9F38)](https://sdgs.un.org/goals/goal3)

**CarePoint Hospital** is a full-stack MERN application built to streamline hospital appointment bookings, specialist doctor directories, and role-based doctor/patient portals. Aligned with the United Nations Sustainable Development Goal (**SDG 3: Good Health and Well-being**), CarePoint eliminates scheduling bottlenecks, prevents double-booking conflicts, and enables transparency in healthcare consultations.

---

## Table of Contents

- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Seeding](#database-seeding)
- [Pre-seeded Demo Accounts](#pre-seeded-demo-accounts)
- [API Reference](#api-reference)
  - [Authentication](#authentication-endpoints)
  - [Doctor Directory](#doctor-directory-endpoints)
  - [Appointments](#appointment-endpoints)
  - [Doctor Portal](#doctor-portal-endpoints)
  - [Patient Portal](#patient-portal-endpoints)
- [MongoDB Shell (Mongosh) Showcase](#mongodb-shell-mongosh-showcase)
- [Security & Validation](#security--validation)
- [Testing & Quality Verification](#testing--quality-verification)

---

## Key Features

- **🩺 Interactive Doctor Directory**: Live case-insensitive search across doctor names, specializations, and hospital departments. Displays real-time availability status (*Available* vs *Away*), consultation fees in ₹, and selectable time-slot chips.
- **🔒 Role-Based Access Control (RBAC)**: Secure authentication powered by JSON Web Tokens (JWT) and `bcryptjs` password hashing, segregating access into `patient`, `doctor`, and `admin` portals.
- **📅 Conflict-Free Booking Engine**: Validates existing bookings to eliminate slot collisions for the same doctor, date, and time.
- **👨‍⚕️ Doctor Management Portal**: Authenticated doctors can review assigned patient appointments, update appointment status (*Completed*, *Cancelled*, *No-Show*), toggle real-time availability, and update consultation fees.
- **👤 Patient Dashboard**: Patients can schedule consultations, review upcoming bookings, and cancel appointments with immediate slot release.
- **📊 Hospital Analytics**: Live dashboard summarizing registered doctors, appointments count, and status distributions.
- **🌱 Academic SDG 3 Alignment**: Supports raw MongoDB CLI queries and aggregations via `mongosh` for laboratory and academic demonstrations.

---

## Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite UI                   │
│      (Axios, React Router DOM, Custom Context API)     │
└──────────────────────────┬─────────────────────────────┘
                           │  HTTP / REST (JSON + JWT)
┌──────────────────────────▼─────────────────────────────┐
│                 Node.js + Express API                  │
│       (JWT Auth Middleware, Controllers, Mongoose)     │
└──────────────────────────┬─────────────────────────────┘
                           │  Database Driver
┌──────────────────────────▼─────────────────────────────┐
│                 MongoDB (Atlas / Local)                │
│    (Collections: users, doctors, appointments)         │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, React Router v6, Axios, Modern CSS3 Responsive Grid.
- **Backend**: Node.js (ES Modules), Express.js, Mongoose 8, JSONWebToken, Bcrypt.js, Dotenv, CORS.
- **Database**: MongoDB Atlas or Local Community Server (`hospitalDB`).

---

## Project Directory Structure

```text
hospital management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   └── doctorController.js   # Logic for search, register, toggle status
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT token verification & role enforcement
│   ├── models/
│   │   ├── Appointment.js        # Appointment schema with compound index
│   │   ├── Doctor.js             # Doctor schema with bcrypt pre-save hook
│   │   └── User.js               # User accounts (roles: patient, doctor, admin)
│   ├── routes/
│   │   ├── appointmentRoutes.js  # Public/Admin appointment CRUD
│   │   ├── authRoutes.js         # Register, Login, Current User profile
│   │   ├── dashboardRoutes.js    # Metric aggregations
│   │   ├── doctorPortalRoutes.js # Doctor-specific appointment & schedule management
│   │   ├── doctorRoutes.js       # Doctor directory and search API
│   │   └── patientRoutes.js      # Patient-specific appointment booking
│   ├── scripts/
│   │   └── seedDoctors.js        # Automated seed script for 6 specialist doctors
│   ├── .env.example              # Template environment variables
│   ├── package.json              # Backend dependencies and scripts
│   ├── server.js                 # Express application entrypoint
│   └── testEndpoints.js          # Automated backend smoke test suite
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Layout, ProtectedRoute, Booking Modal
│   │   ├── context/              # AuthContext (JWT session state)
│   │   ├── pages/                # Auth, Doctors, PatientDashboard, DoctorDashboard
│   │   ├── services/             # Axios API client with bearer token interceptor
│   │   ├── App.jsx               # Role-based route declarations
│   │   ├── main.jsx              # Application bootstrap
│   │   └── styles.css            # Application-wide styling
│   ├── index.html                # HTML entry template
│   ├── package.json              # Frontend dependencies and build scripts
│   └── vite.config.js            # Vite configuration
├── mongosh/
│   ├── setup.js                  # Standalone MongoDB collection initialization
│   └── operations.js             # Raw mongosh queries, counts, and aggregations
├── CarePoint_Hospital_Project_Report.docx # Academic project report
├── .gitignore                    # Git exclusions (.env, node_modules, dist)
└── README.md                     # Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB**: A running local instance (`mongodb://127.0.0.1:27017/hospitalDB`) or a free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas).
- *(Optional)* **mongosh** CLI installed on your PATH for database shell demonstrations.

---

### Environment Variables

Navigate to the `backend/` directory, duplicate `.env.example`, and rename it to `.env`:

```bash
cd backend
copy .env.example .env    # On Windows
# cp .env.example .env    # On macOS / Linux
```

Ensure your `backend/.env` file contains:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hospitalDB
JWT_SECRET=carepoint_hospital_jwt_secret_key_2026
```

> **Security Note**: Never commit your `.env` file with live database credentials to public version control. It is protected by `.gitignore`.

---

### Backend Setup

1. Open your terminal in the `backend/` folder:
   ```bash
   cd backend
   npm install
   ```
2. Start the backend development server with hot-reload:
   ```bash
   npm run dev
   ```
   The API will start running at: `http://localhost:5000`

---

### Frontend Setup

1. Open a second terminal window in the `frontend/` folder:
   ```bash
   cd frontend
   npm install
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and visit: `http://localhost:5173`

---

### Database Seeding

To automatically populate the **6 specialist doctors** and the **test patient** account, run the seed script:

```bash
cd backend
npm run seed
```

This ensures the doctors are indexed in MongoDB with pre-hashed passwords, full departments, consultation fees, and available time slots.

---

## Pre-seeded Demo Accounts

Use these pre-configured credentials to immediately log in and explore different portal perspectives:

### 🩺 Specialist Doctors (Password for all: `123456789`)

| Doctor Name | Email / Login | Password | Specialization | Department | Fee |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Ravi Kumar** | `doctor@carepoint.com` | `123456789` | Cardiology | Cardiology | ₹550 |
| **Dr. Anil Mehta** | `anil.mehta@carepoint.com` | `123456789` | Pediatrics | Child Care | ₹350 |
| **Dr. Arjun Singh** | `arjun.singh@carepoint.com` | `123456789` | Orthopedics | Orthopedics | ₹550 |
| **Dr. Meera Iyer** | `meera.iyer@carepoint.com` | `123456789` | Gynecology | Women's Health | ₹600 |
| **Dr. Neha Gupta** | `neha.gupta@carepoint.com` | `123456789` | Neurology | Neurology | ₹650 |
| **Dr. Priya Sharma** | `priya.sharma@carepoint.com` | `123456789` | Dermatology | Dermatology | ₹400 |

### 👤 Patient Account

| Role | Email / Login | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@carepoint.com` | `Patient123!` | Test patient with pre-scheduled appointment records |

*(You can also click the quick **"⚡ Need test shortcuts? Click here"** dropdown on the `/login` screen to one-click autofill and sign in).*

---

## API Reference

### Authentication Endpoints
Base URL: `/api/auth`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register a new patient or doctor account |
| `POST` | `/login` | Public | Authenticate with email/password; returns JWT token & user profile |
| `GET` | `/me` | Authenticated | Retrieve current session user information |

---

### Doctor Directory Endpoints
Base URL: `/api/doctors`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/?search=...` | Public | Fetch all doctors. Supports case-insensitive search by name, specialty, or dept |
| `GET` | `/:id` | Public | Fetch individual doctor profile by MongoDB ObjectId |
| `POST` | `/register` | Public / Admin | Register a new doctor profile with working hours, slots, and fee |
| `PATCH` | `/:id/availability` | Doctor / Admin | Toggle doctor availability (`isAvailable: true/false`) |
| `PUT` | `/:id` | Admin | Update doctor details |
| `DELETE` | `/:id` | Admin | Remove doctor from hospital directory |

---

### Appointment Endpoints
Base URL: `/api/appointments`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/?date=...&status=...` | Authenticated | List all hospital appointments with doctor populate |
| `POST` | `/` | Authenticated | Schedule a new appointment with slot conflict verification |
| `PUT` | `/:id` | Authenticated | Update appointment information |
| `PATCH` | `/:id/cancel` | Authenticated | Cancel appointment and free up the time slot |

---

### Doctor Portal Endpoints
Base URL: `/api/doctor` *(Requires `doctor` or `admin` role)*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Doctor | Fetch logged-in doctor's assigned profile and settings |
| `GET` | `/appointments` | Doctor | Fetch appointments booked specifically with this doctor |
| `PATCH` | `/appointments/:id/status` | Doctor | Mark appointment as `Completed`, `Cancelled`, or `No-Show` |
| `PATCH` | `/availability` | Doctor | Update consultation fee, available days, and time slots |

---

### Patient Portal Endpoints
Base URL: `/api/patient` *(Requires `patient` or `admin` role)*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/appointments` | Patient | Retrieve appointments booked by the logged-in patient |
| `POST` | `/appointments` | Patient | Book a new consultation with a selected doctor |
| `PATCH` | `/appointments/:id/cancel` | Patient | Cancel patient's own upcoming appointment |

---

## MongoDB Shell (Mongosh) Showcase

For database laboratory demonstrations and academic reviews, raw MongoDB operations can be executed directly using `mongosh`:

1. **Connect to your database:**
   ```bash
   mongosh "mongodb://127.0.0.1:27017"
   use hospitalDB
   ```

2. **Query Doctor Records by Specialization:**
   ```javascript
   db.doctors.find({ specialization: "Cardiology" }).pretty();
   ```

3. **Check Total Appointments Count:**
   ```javascript
   db.appointments.countDocuments();
   ```

4. **Aggregate Appointments by Status (SDG Metric):**
   ```javascript
   db.appointments.aggregate([
     { $group: { _id: "$status", total: { $sum: 1 } } },
     { $sort: { total: -1 } }
   ]);
   ```

5. **Run the Full Mongosh Demonstration Script:**
   ```bash
   mongosh "mongodb://127.0.0.1:27017" mongosh/operations.js
   ```

---

## Security & Validation

- **Password Cryptography**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 rounds of hashing.
- **Data Protection**: Mongoose models sanitize data (`select: false` on password fields) to prevent password leakage in API responses.
- **Double-Booking Prevention**: Database-level queries ensure no two active appointments share the same `doctorId`, `appointmentDate`, and `appointmentTime`.
- **JWT Authorization**: All private portal endpoints verify incoming Bearer tokens using HTTP 401 (Unauthorized) and HTTP 403 (Forbidden) status handlers.

---

## Testing & Quality Verification

The repository includes an automated smoke test suite to verify all critical authentication and role-based permissions:

```bash
cd backend
npm run test:api
```

### Test Coverage Highlights:
- ✅ Patient login & JWT generation
- ✅ Doctor login & JWT generation
- ✅ Patient appointment retrieval
- ✅ Doctor portal appointment isolation
- ✅ Doctor availability toggle
- ✅ Security check: Patient blocked with HTTP 403 from doctor-only endpoints
- ✅ Security check: Doctor blocked with HTTP 403 from patient-only endpoints

---

## Authors & Acknowledgments

- **Developed by**: A. Munwar Basha
- **Academic Focus**: SDG 3 (Good Health and Well-being) Hospital Automation
- **GitHub Repository**: [https://github.com/munwarbasha98/Hospital-Managemtn-System.git](https://github.com/munwarbasha98/Hospital-Managemtn-System.git)
