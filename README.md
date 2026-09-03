# CRP India — Civic Reporting Platform

An enterprise-grade, full-stack civic grievance reporting and municipal resolution web platform built with Node.js, Express, MongoDB, Mongoose, React, and Vite. Designed specifically according to human-centric civic service principles, featuring authentic typography, light/dark themes, role separation between citizens and municipal authorities, and real-time status tracking.

---

## 1. Project Overview

**CRP India (Civic Reporting Platform)** bridges the gap between city residents and municipal engineering departments across India. Citizens can lodge geo-tagged complaints accompanied by photographic evidence regarding road hazards, overflowing dumpsters, unlit streetlights, contaminated water supply, clogged drains, and public space damage.

Municipal authorities can view incoming grievances on an executive dashboard, allocate complaints to specific field officers and departments, update resolution milestones, log official remarks, and close complaints with complete transparency.

---

## 2. Technology Stack

### Frontend
- **Framework / Bundler**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Design System**: Custom CSS with Light (`#F4F8FC` mild blue) and Dark (deep navy/charcoal) themes, Inter typography, accessible status badges, and responsive layouts
- **State & Theme**: React Context API (`AuthContext`, `ThemeContext`) persisted via `localStorage`

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **In-Memory Fallback**: `mongodb-memory-server` (automatic fallback in development if no local MongoDB daemon is running)
- **Authentication**: JSON Web Tokens (JWT) with bcrypt password hashing
- **File Handling**: Multer for multipart image uploads (`.jpg`, `.jpeg`, `.png`, `.webp`)
- **Logging & Security**: Morgan, CORS, defensive error handling middleware

---

## 3. Folder Structure

```
CRP-India/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & in-memory fallback
│   │   ├── controllers/
│   │   │   ├── authController.js      # Register, login, getMe
│   │   │   ├── complaintController.js # Create, lookup, list, update status, assign
│   │   │   └── authorityController.js # Executive metrics & department breakdowns
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verification & authority role guards
│   │   │   ├── errorHandler.js        # Centralized HTTP error handler
│   │   │   └── upload.js              # Multer configuration for evidence photos
│   │   ├── models/
│   │   │   ├── Complaint.js           # Schema with timeline history & status enum
│   │   │   ├── Counter.js             # Atomic sequence counter for reference IDs
│   │   │   └── User.js                # Citizen & Authority accounts with bcrypt
│   │   ├── routes/
│   │   │   ├── authRoutes.js          # /api/auth
│   │   │   ├── authorityRoutes.js     # /api/authority
│   │   │   └── complaintRoutes.js     # /api/complaints
│   │   ├── utils/
│   │   │   ├── referenceGenerator.js  # Generates CRP-2026-XXXXX IDs
│   │   │   └── seed.js                # Sample complaints & accounts seeder
│   │   └── server.js                  # Express app entrypoint & middleware mounting
│   ├── uploads/                       # Storage for citizen evidence photos
│   ├── .env.example                   # Backend environment template
│   ├── .env                           # Local environment config
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Footer.jsx             # Official civic footer
│   │   │   ├── Navbar.jsx             # Nav links, role switch, theme toggle
│   │   │   ├── ProtectedRoute.jsx     # Authority portal route guard
│   │   │   ├── StatusBadge.jsx        # Standardized color-coded status pills
│   │   │   ├── ThemeToggle.jsx        # Light/Dark mode switcher
│   │   │   └── Timeline.jsx           # Vertical audit trail timeline
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # JWT authentication state
│   │   │   └── ThemeContext.jsx       # Theme state & HTML class management
│   │   ├── pages/
│   │   │   ├── authority/
│   │   │   │   ├── AuthorityComplaintDetail.jsx # Status update & officer assignment
│   │   │   │   ├── AuthorityComplaints.jsx      # Filterable/searchable registry
│   │   │   │   ├── AuthorityDashboard.jsx       # Executive KPI metrics & charts
│   │   │   │   └── AuthorityLogin.jsx           # Municipal officer login
│   │   │   ├── About.jsx              # Civic charter, SLA times, privacy
│   │   │   ├── CategorySelect.jsx     # Direct category cards (no continue button)
│   │   │   ├── CitizenLogin.jsx       # Citizen sign in
│   │   │   ├── CitizenRegister.jsx    # Citizen sign up
│   │   │   ├── ComplaintDetails.jsx   # Public complaint detail view
│   │   │   ├── ComplaintForm.jsx      # Grievance registration & GPS detection
│   │   │   ├── Home.jsx               # Civic landing with horizontal highlights
│   │   │   ├── RoleSelection.jsx      # First visit gateway (Citizen / Authority)
│   │   │   └── TrackComplaint.jsx     # Single-input lookup (zero fake data)
│   │   ├── services/
│   │   │   └── api.js                 # Unified Fetch client & token interceptor
│   │   ├── App.jsx                    # Routing configuration
│   │   ├── index.css                  # Design system tokens & styles
│   │   └── main.jsx                   # React root entry
│   ├── index.html                     # Preloaded fonts & anti-FOUC theme script
│   ├── .env.example
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 4. How to Install Dependencies

From the project root:

### Backend Installation
```bash
cd backend
npm install
```

### Frontend Installation
```bash
cd ../frontend
npm install
```

---

## 5. How to Configure MongoDB

The backend automatically connects to MongoDB via Mongoose using the `MONGO_URI` specified in `backend/.env`.

1. **Local MongoDB**: If you have MongoDB Community Server installed locally on port `27017`:
   ```env
   MONGO_URI=mongodb://localhost:27017/crp_india
   ```
2. **MongoDB Atlas (Cloud)**:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/crp_india?retryWrites=true&w=majority
   ```
3. **Zero-Configuration Fallback (Default in Development)**:
   If no local MongoDB daemon or connection is detected, the backend will automatically spin up an embedded `mongodb-memory-server` and pre-seed test records. This ensures students and evaluators can run the system immediately without installing MongoDB!

---

## 6. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/crp_india
JWT_SECRET=crp_india_super_secret_jwt_key_2026_dev_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. How to Run the Application

### Start the Backend Server
```bash
cd backend
npm run dev
# Or: npm start
```
The API will run on `http://localhost:5000`.

### Start the Frontend Client
In a separate terminal:
```bash
cd frontend
npm run dev
```
The Vite development server will run on `http://localhost:5173`. Open this URL in your web browser.

---

## 8. Authentication & Roles

Authentication utilizes signed JSON Web Tokens (JWT) containing user identifiers and assigned roles. Passwords are salted and hashed using `bcryptjs` (10 rounds).

### Supported Roles:
1. **Citizen (`citizen`)**:
   - Register and login.
   - Lodge complaints with or without an account.
   - Track complaints across India via reference ID.
2. **Municipal Authority (`authority`)**:
   - Access the dedicated **Municipal Authority Portal** (`/authority/login`).
   - Access the Executive Dashboard (`/authority/dashboard`).
   - Filter, assign departments/officers, update statuses, and log official remarks.

---

## 9. REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new citizen account
- `POST /api/auth/login` — Sign in as citizen or municipal authority
- `GET /api/auth/me` — Verify active token and get authenticated user profile

### Complaints
- `POST /api/complaints` — Submit a grievance (supports multipart form-data for images)
- `GET /api/complaints/:referenceId` — Retrieve single complaint by reference ID
- `GET /api/complaints` — List complaints with pagination, status, category, and keyword filters
- `PATCH /api/complaints/:id/status` — (Authority only) Update complaint status & add remark
- `PATCH /api/complaints/:id/assign` — (Authority only) Assign department and field officer

### Municipal Authority
- `GET /api/authority/dashboard` — (Authority only) Aggregate statistics, ward breakdowns, recent complaints

---

## 10. Pre-seeded Test Accounts & Sample Complaints

Run the seed script at any time to re-populate standard test data:
```bash
cd backend
npm run seed
```

### Authority Accounts:
- **Executive Zonal Engineer (Roads)**:
  - **Email**: `authority@crp.gov.in`
  - **Password**: `Authority@123`
- **Chief Sanitation Inspector**:
  - **Email**: `sanitation.officer@crp.gov.in`
  - **Password**: `Authority@123`

### Citizen Account:
- **Email**: `citizen@example.com`
- **Password**: `Citizen@123`

### Sample Complaint Reference IDs:
- `CRP-2026-00101` — Roads & Potholes (*In Progress*)
- `CRP-2026-00102` — Garbage & Sanitation (*Assigned*)
- `CRP-2026-00103` — Streetlights (*Under Review*)
- `CRP-2026-00104` — Water Supply (*Resolved*)
- `CRP-2026-00105` — Drainage (*Submitted*)

---

## 11. Creating a New Municipal Authority Account

To provision a new authority account, you can use the MongoDB shell or run a simple Node script:
```javascript
const User = require('./src/models/User');

await User.create({
  name: 'Anjali Deshmukh',
  email: 'a.deshmukh@crp.gov.in',
  password: 'Authority@123',
  phone: '+91 98330 11223',
  role: 'authority',
  department: 'Water Supply & Jal Board',
  designation: 'Superintendent Engineer'
});
```

---

## 12. Key UI/UX Highlights

- **Role Selection First Screen**: On initial visit, users choose between Citizen and Municipal Authority.
- **Immediate Category Navigation**: Clicking any category immediately routes to the complaint form (`/report/:categorySlug`) with the category pre-selected.
- **Pure Search in Track Complaint**: The track complaint page starts in a clean state with zero dummy/hardcoded complaints. Real data displays only upon searching.
- **Design Authenticity**: No generic SaaS cards or gradients. Inter typography, crisp dividers, `#F4F8FC` mild blue-tinted light background, and deep charcoal navy dark background.
- **Horizontal Feature Badges**: Highlights remain horizontally aligned on desktop screens without awkward wrapping.