# 🌿 FOODBRIDGE Frontend

> **Connecting Surplus Food to People Who Need It**
> Community Food Rescue & Surplus Redistribution Network

Built for **HACKNOVA 2026** 🏆

---

## 🚀 Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| React Router 7 | Client-side routing |
| Axios | HTTP client |
| Leaflet + React Leaflet | Interactive maps |
| OpenStreetMap | Map tiles |
| Recharts | Data visualization |
| Lucide React | Icon library |
| React Hot Toast | Notifications |

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/                # ProtectedRoute
│   │   └── notifications/         # NotificationBell
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication context & JWT
│   ├── layouts/
│   │   └── DashboardLayout.jsx    # Dashboard shell with sidebar
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DonorDashboard.jsx
│   │   ├── CreateListing.jsx
│   │   ├── DonorListings.jsx
│   │   ├── OrganizationDashboard.jsx
│   │   ├── VolunteerDashboard.jsx
│   │   ├── SafetyCheckPage.jsx
│   │   ├── OtpPage.jsx
│   │   ├── BiofarmDashboard.jsx
│   │   ├── RewardsPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   ├── MapPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   └── AdminDashboard.jsx
│   ├── services/
│   │   ├── api.js                 # Axios instance with interceptors
│   │   └── index.js               # All API service modules
│   ├── App.jsx                    # Root with routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles & Tailwind
├── .env.example
├── api-contract.md                # Backend API contract
├── vite.config.js
└── package.json
```

---

## 🔑 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API base URL |
| `VITE_MAP_TILE_URL` | OpenStreetMap URL | Map tile server |
| `VITE_DEV_MODE` | `true` | Enable dev features |

---

## 🗺 Routes

| Path | Role | Page |
|---|---|---|
| `/` | Public | Landing Page |
| `/login` | Public | Login |
| `/register` | Public | Multi-step Registration |
| `/donor/dashboard` | Donor | Dashboard |
| `/donor/create-listing` | Donor | Create Food Listing |
| `/donor/listings` | Donor | My Listings |
| `/donor/rewards` | Donor | Rewards & Leaderboard |
| `/organization/dashboard` | Org/NGO | Dashboard |
| `/organization/available-food` | Org/NGO | Browse Food |
| `/organization/reservations` | Org/NGO | Reservations |
| `/volunteer/dashboard` | Volunteer | Dashboard |
| `/volunteer/safety-check` | Volunteer | Safety Verification |
| `/volunteer/otp` | Volunteer | OTP Verification |
| `/biofarm/dashboard` | Biofarm | Waste Recovery |
| `/biofarm/recovery` | Biofarm | Available Recovery |
| `/biofarm/history` | Biofarm | History |
| `/analytics` | All | Impact Analytics |
| `/map` | All | Interactive Map |
| `/notifications` | All | Notification Center |
| `/admin/dashboard` | Admin | Admin Panel |

---

## ✅ Feature Status

### P0 — Core (Implemented)
- [x] Landing page with hero, how-it-works, user groups, CTA
- [x] Multi-step registration (5 roles: Donor, Restaurant, NGO, Volunteer, Biofarm)
- [x] Login with JWT
- [x] Role-based routing and dashboards
- [x] Donor: create food listing with full form validation
- [x] Organization: view available food with match scores, accept/decline/reserve
- [x] Volunteer: assignment timeline (ASSIGNED → SAFETY → OTP → TRANSIT → DELIVERY → DONE)
- [x] Two-stage safety checks (donor-side + pickup-side)
- [x] Pickup & delivery OTP verification
- [x] Biofarm waste recovery dashboard (distinct amber theme)

### P1 — Enhanced (Implemented)
- [x] Interactive map (Leaflet + OpenStreetMap)
- [x] Donor rewards, badges & leaderboard
- [x] Impact analytics with Recharts
- [x] Notification center & bell dropdown

### P2 — Polish (Implemented)
- [x] Admin dashboard with org verification
- [x] Responsive design (desktop sidebar, mobile hamburger)
- [x] Toast notifications, loading/empty/error states
- [x] Professional design system

---

## 🎨 Design System

- **Primary:** green-600 (`#16a34a`)
- **Accent:** orange-500 (`#f97316`)
- **Background:** stone-50 (`#fafaf9`)
- **Text:** gray-800 (`#1f2937`)
- **Biofarm:** amber-600 (`#d97706`)
- **Font:** Inter
- **Cards:** rounded-xl, shadow-sm, border border-gray-100
- **Buttons:** rounded-lg, font-semibold, transitions

---

## 🧪 Demo Walkthrough

1. Register as **Donor** → Create food listing
2. Register as **Organization** → See listing with match score → Accept/Reserve
3. Register as **Volunteer** → See assigned pickup → Complete safety check → Enter OTP
4. View **Donor Rewards** → See credits updated
5. View **Biofarm Dashboard** → Accept expired food for recovery
6. View **Analytics** → See impact metrics and charts

---

## 🔗 Backend Integration

See [`api-contract.md`](./api-contract.md) for the complete API specification.

**Backend base URL:** `http://localhost:5000/api`

---

## 📝 License

Built for HACKNOVA 2026 Hackathon
