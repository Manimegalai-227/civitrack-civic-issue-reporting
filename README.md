# CIVITRACK. &mdash; Civic Issue Reporting &amp; Resolution System

A full-stack Civic Issue Reporting web application built for citizen engagement and municipal accountability. Citizens can report infrastructure problems (potholes, streetlights, garbage overflow, water leaks, drainage issues), upload photographic evidence, receive an official case number receipt (`CV-2026-XXXX`), track resolution progress through public ledgers, and manage their personal complaint history.

---

## 🏛️ Reference & Design Theme

Inspired by the civic ledger and municipal paper trail aesthetic:
- **Palette**: Civic paper (`#E7E3D9`), ink navy (`#1A2233`), card ledger (`#F6F3EC`), amber pending alert (`#D98E04`), progress blue (`#2A5C8A`), resolved green (`#1E7A5F`).
- **Typography**: IBM Plex Mono &amp; IBM Plex Sans.
- **Design Elements**: Official ticket-stub receipts, rotated status stamp badges, category pill filters, and departmental routing.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router v7, Axios, Responsive CSS
- **Backend**: Node.js, Express.js, RESTful API
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer (disk storage in `/uploads`, served statically)
- **Authentication**: JWT (JSON Web Tokens) &amp; bcrypt password hashing

---

## 📂 Project Structure

```
civic-issue-reporter/
├── package.json               # Root scripts for running client & server
├── README.md                  # Comprehensive project documentation
├── server/                    # Node.js + Express Backend
│   ├── .env                   # Environment variables (PORT, MONGODB_URI, JWT_SECRET)
│   ├── .env.example           # Example environment template
│   ├── package.json           # Server dependencies & scripts
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   ├── db.js              # MongoDB Mongoose connection
│   │   └── seed.js            # Initial demo user & sample civic cases seeder
│   ├── models/
│   │   ├── User.js            # User Schema with password hashing
│   │   └── Issue.js           # Issue Schema with case numbers & dept routing
│   ├── routes/
│   │   ├── authRoutes.js      # Register, Login, Me endpoints
│   │   └── issueRoutes.js     # Issue CRUD, my-reports, filters, status updater
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT Bearer token authentication
│   │   └── uploadMiddleware.js# Multer image upload filter & limits
│   └── uploads/               # Stored user-submitted evidence images
│
└── client/                    # React.js Frontend (Vite)
    ├── index.html             # HTML template with Google Fonts & favicon
    ├── package.json           # Frontend dependencies & scripts
    ├── vite.config.js         # Vite configuration with API & uploads proxy
    ├── public/                # Static assets (tce_logo.png, photo.jpg)
    └── src/
        ├── main.jsx           # React DOM root render
        ├── App.jsx            # Router and layout configuration
        ├── index.css          # Full civic theme styling & responsive layout
        ├── context/
        │   └── AuthContext.jsx# Authentication state & persistent session
        ├── services/
        │   └── api.js         # Axios HTTP client with auth interceptor
        ├── components/
        │   ├── Navbar.jsx     # Responsive sticky header with navigation
        │   ├── Footer.jsx     # Civic footer banner
        │   ├── IssueCard.jsx  # Reusable card with status stamp badge
        │   └── Alert.jsx      # Success / error notification banners
        └── pages/
            ├── Home.jsx         # 1. Hero, dynamic metrics, how it works, recent cases
            ├── Login.jsx        # 2. Citizen sign in with quick 1-click demo fill
            ├── Register.jsx     # 3. Citizen registration with form validation
            ├── ReportIssue.jsx  # 4. Issue submission with photo preview & receipt
            ├── AllIssues.jsx    # 5. Public case directory with search & filters
            ├── IssueDetails.jsx # 6. Case sheet with photo, metadata, status changer
            └── MyReports.jsx    # 7. Citizen dossier with summary cards & actions
```

---

## 🚀 Pages Implemented

1. **Home (`/`)**:
   - Hero section with civic tagline and ticket-stub receipt
   - Live metric counters (Cases Filed, Resolved, In Progress, Pending)
   - "How a Case Moves" 3-step operational workflow
   - Recent community reports preview

2. **Login (`/login`)**:
   - Clean card layout with email and password validation
   - "Quick Demo Fill" button to test credentials in 1 click
   - Error alert banners for invalid inputs

3. **Register (`/register`)**:
   - Full Name, Email, Phone Number (10 digits), Password, Confirm Password
   - Real-time client-side validation
   - Automatic login and redirection upon registration

4. **Report Issue (`/report`)**:
   - Form fields: Title, Category, Location / Landmark, Initial Status, Description
   - Photo upload with drag/drop file picker, live preview thumbnail, and remove option
   - Generates official case tracking number (e.g. `CV-2026-XXXX`)
   - Auto-routes to relevant department (Roads, Electrical, Sanitation, Water Board, Drainage)

5. **All Issues (`/issues`)**:
   - Real-time search by case number, title, or location
   - Category filter pills (All, Road, Streetlight, Garbage, Water, Drainage)
   - Status dropdown filter (All, Pending, In Progress, Resolved)
   - Responsive card grid with rotated status stamp badges

6. **Issue Details (`/issues/:id`)**:
   - Official Case Sheet layout
   - Metadata grid: Category, Location, Department Routed, Date Reported, Reporter name & contact
   - Full description and high-resolution photo evidence display
   - Interactive Status Changer dropdown allowing direct status updates (Pending → In Progress → Resolved) that save directly to MongoDB

7. **My Reports (`/my-reports`)**:
   - Dossier of all complaints filed by the logged-in citizen
   - Summary count cards (Total, Pending, In Progress, Resolved)
   - Comprehensive data table with direct actions ("Inspect" and "Delete")
   - Responsive design with empty state call to action

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v18+ recommended, v22 tested)
- **MongoDB** (running locally on port 27017 or a MongoDB Atlas URI)

### 1. Environment Configuration
The backend uses environment variables stored in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/civic_issue_db
JWT_SECRET=civic_issue_reporting_secret_key_2026
```

### 2. Start the Backend Server
```bash
cd server
npm install
node server.js
```
The server will start at `http://localhost:5000` and automatically seed initial sample civic issues.

### 3. Start the Frontend Application
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
The React frontend will be available at `http://localhost:3000`.

---

## 🔑 Demo Citizen Credentials

For convenience during evaluation, a demo citizen account is pre-seeded:
- **Email**: `citizen@civi.track`
- **Password**: `password123`
*(Or use the 1-click **"Quick Demo Fill"** button directly on the Login page!)*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new citizen account | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated citizen profile | Private (JWT) |
| `GET` | `/api/issues` | Get all issues (supports `?category=`, `?status=`, `?search=`) | Public |
| `GET` | `/api/issues/:id` | Get single issue details by ID or CaseNumber | Public |
| `POST` | `/api/issues` | Submit a new issue with optional photo upload | Private (JWT) |
| `GET` | `/api/issues/my-reports` | Get reports filed by logged-in citizen | Private (JWT) |
| `PATCH` | `/api/issues/:id/status` | Update issue status (Pending/In Progress/Resolved) | Private (JWT) |
| `DELETE` | `/api/issues/:id` | Delete an issue report | Private (Owner/Admin) |
| `GET` | `/api/health` | Backend server health check | Public |
