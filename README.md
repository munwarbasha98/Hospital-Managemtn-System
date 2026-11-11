# CarePoint - Hospital Appointment Management System

**Course Project:** CSE494  
**Student Name:** A Munwar Basha  
**Registration Number:** 12314548  
**Class / Section:** B.Tech CSE (K4P23WS)  
**Project Guide:** Dr. Manpreet Singh Sehgal  
**Department:** Discipline of CSE/IT, Lovely Professional University  
**Academic Alignment:** UN Sustainable Development Goal 3 (Good Health and Well-being)  

---

## About the Project

CarePoint is a full-stack hospital appointment management web application built using the MERN stack (MongoDB, Express.js, React, Node.js). 

In traditional outpatient departments (OPDs), patients often face long waiting times, lack of clarity regarding doctor availability, and scheduling overlaps. CarePoint addresses this by providing an online booking portal where patients can view specialist doctors, check their consultation fees and available time slots, and schedule visits without double-booking conflicts. Doctors also have a dedicated portal to view their daily appointments, update patient statuses, and manage their availability.

---

## Key Features

### 1. Patient Portal
- User registration and login with encrypted passwords.
- Real-time directory search across doctors by name, medical specialization, or hospital department.
- Doctor cards showing consultation fees (in ₹), availability indicators (Available vs Away), and available time slots.
- Conflict-free booking system: prevents booking an appointment if the doctor is already booked for that specific date and time slot.
- My Appointments page to view booked visits and cancel bookings if necessary.

### 2. Doctor Portal
- Dedicated login for registered medical staff.
- Daily appointment dashboard displaying patient details, age, contact number, and reason for consultation.
- Status management: doctors can mark appointments as **Completed**, **Cancelled**, or **No-Show**.
- Availability controls: doctors can switch their status between **Available** and **Away / Unavailable**.

### 3. Database & Evaluation
- MongoDB collections for `users`, `doctors`, and `appointments`.
- Pre-seeded with 6 specialist doctors and sample patient accounts.
- Includes standalone MongoDB Shell (`mongosh`) scripts to run CRUD operations and aggregation queries for lab demonstrations.

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router DOM, Axios, Plain CSS3 (Responsive)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas / Local MongoDB, Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing
- **Testing & Tools:** mongosh, Nodemon

---

## Project Structure

```text
hospital management/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection logic
│   ├── controllers/
│   │   └── doctorController.js   # Logic for search, registration, and status toggle
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification and role authorization
│   ├── models/
│   │   ├── Appointment.js        # Appointment schema with compound index
│   │   ├── Doctor.js             # Doctor schema with password hashing
│   │   └── User.js               # User accounts (patient and doctor roles)
│   ├── routes/
│   │   ├── appointmentRoutes.js  # General appointment endpoints
│   │   ├── authRoutes.js         # Register, login, and profile
│   │   ├── dashboardRoutes.js    # Quick stats endpoint
│   │   ├── doctorPortalRoutes.js # Doctor-specific appointment management
│   │   ├── doctorRoutes.js       # Doctor search and directory routes
│   │   └── patientRoutes.js      # Patient appointment routes
│   ├── scripts/
│   │   └── seedDoctors.js        # Script to seed the 6 specialist doctors
│   ├── .env.example              # Example environment variables
│   ├── package.json              # Backend dependencies
│   ├── server.js                 # Express server entry point
│   └── testEndpoints.js          # API test script
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Layout, ProtectedRoute, Modal
│   │   ├── context/              # AuthContext for user session
│   │   ├── pages/                # Auth, Doctors, PatientDashboard, DoctorDashboard
│   │   ├── services/             # Axios instance
│   │   ├── App.jsx               # Main routing file
│   │   ├── main.jsx              # Entry point
│   │   └── styles.css            # Stylesheet
│   ├── index.html
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js
├── mongosh/
│   ├── setup.js                  # Initial collection creation script
│   └── operations.js             # Sample queries and aggregation pipeline
├── CarePoint_Hospital_Project_Report.docx
└── README.md
```

---

## How to Set Up and Run Locally

### Prerequisites
- Node.js (v18 or higher installed)
- MongoDB installed locally OR a MongoDB Atlas connection string

---

### Step 1: Backend Setup

1. Open terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` file from the example:
   - On Windows:
     ```bash
     copy .env.example .env
     ```
   - On macOS/Linux:
     ```bash
     cp .env.example .env
     ```

4. Open `.env` and verify your MongoDB URI:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/hospitalDB
   JWT_SECRET=carepoint_hospital_jwt_secret_key_2026
   ```
   *(If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string).*

5. Populate the database with the sample doctors and users:
   ```bash
   npm run seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will start running on `http://localhost:5000`.

---

### Step 2: Frontend Setup

1. Open a new terminal window and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## Test Login Credentials

You can test both Doctor and Patient accounts using these pre-seeded credentials:

### Doctors List (Password for all doctors: `123456789`)

| Doctor Name | Email (Username) | Password | Specialization | Department | Consultation Fee |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Ravi Kumar** | `doctor@carepoint.com` | `123456789` | Cardiology | Cardiology | ₹550 |
| **Dr. Anil Mehta** | `anil.mehta@carepoint.com` | `123456789` | Pediatrics | Child Care | ₹350 |
| **Dr. Arjun Singh** | `arjun.singh@carepoint.com` | `123456789` | Orthopedics | Orthopedics | ₹550 |
| **Dr. Meera Iyer** | `meera.iyer@carepoint.com` | `123456789` | Gynecology | Women's Health | ₹600 |
| **Dr. Neha Gupta** | `neha.gupta@carepoint.com` | `123456789` | Neurology | Neurology | ₹650 |
| **Dr. Priya Sharma** | `priya.sharma@carepoint.com` | `123456789` | Dermatology | Dermatology | ₹400 |

### Patient Account

| Role | Email (Username) | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@carepoint.com` | `Patient123!` | Test patient with sample appointment history |

*(Note: On the login page, you can also click the quick test shortcut to autofill and test immediately).*

---

## API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new patient or doctor account
- `POST /api/auth/login` - Login with email and password (returns JWT token)
- `GET /api/auth/me` - Fetch profile of logged-in user

### Doctors (`/api/doctors`)
- `GET /api/doctors` - Get all doctors (supports query search: `?search=cardio`)
- `GET /api/doctors/:id` - Get specific doctor details
- `POST /api/doctors/register` - Add a new doctor
- `PATCH /api/doctors/:id/availability` - Toggle doctor availability status

### Patient Routes (`/api/patient`)
- `GET /api/patient/appointments` - Get list of appointments for logged-in patient
- `POST /api/patient/appointments` - Book appointment with selected doctor
- `PATCH /api/patient/appointments/:id/cancel` - Cancel a booked appointment

### Doctor Portal Routes (`/api/doctor`)
- `GET /api/doctor/profile` - View profile of logged-in doctor
- `GET /api/doctor/appointments` - View all appointments booked with this doctor
- `PATCH /api/doctor/appointments/:id/status` - Update status (`Completed`, `Cancelled`, `No-Show`)
- `PATCH /api/doctor/availability` - Update fee, working days, and time slots

---

## MongoDB Shell (mongosh) Demonstration

To demonstrate direct database queries during the lab evaluation:

1. Connect to mongosh:
   ```bash
   mongosh
   use hospitalDB
   ```

2. View all doctors:
   ```javascript
   db.doctors.find().pretty()
   ```

3. Find doctors by specialization:
   ```javascript
   db.doctors.find({ specialization: "Cardiology" })
   ```

4. Count total booked appointments:
   ```javascript
   db.appointments.countDocuments()
   ```

5. Group appointments by status (Aggregation):
   ```javascript
   db.appointments.aggregate([
     { $group: { _id: "$status", total: { $sum: 1 } } }
   ])
   ```

You can also run the complete script in one command:
```bash
mongosh "mongodb://127.0.0.1:27017" mongosh/operations.js
```

---

## Verification & Testing

To run the automated backend test script that checks login, authorization, and route protection:

```bash
cd backend
npm run test:api
```

---

## Declaration

This project is developed for academic evaluation in course CSE494 at Lovely Professional University. All medical details, doctor names, and appointments used are for demonstration and testing purposes only.
