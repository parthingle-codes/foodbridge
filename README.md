# FOODBRIDGE — Community Food Rescue & Surplus Redistribution Network
**Backend MVP for HACKNOVA 2026**

FoodBridge connects food donors (restaurants, caterers, grocery distributors), verified NGOs, community volunteers, and biofarm organic recovery facilities. It features an Uber-inspired intelligent matching engine, a 2-stage independent food safety check, cryptographic single-use OTP verification, automated donor reward credits, and a circular biofarm waste recovery workflow.

---

## ⚡ Quick Start (Under 60 Seconds)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Defaults in .env.example are preconfigured for local dev
cp .env.example .env
```

### 3. Run Automated E2E Verification Tests
```bash
npm test
```
*Executes all 38 test suites testing registration, intelligent matching, double safety checks, OTP verification, biofarm recovery, analytics, and admin workflows.*

### 4. Start the Server
```bash
npm start
```
The API server starts on:
- **Base URL:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

---

## 🗄️ Database Architecture & Dual-Mode Engine

The backend is built natively for **PostgreSQL 14+ with PostGIS 3+**:
- Spatial points: `GEOGRAPHY(Point, 4326)`
- Proximity search: `ST_DWithin` & `ST_Distance`
- Row-level transactions: `SELECT ... FOR UPDATE`

### Dual-Mode Capability
1. **Live PostgreSQL Mode:** Connects to PostgreSQL using `DATABASE_URL` or standard config in `.env`.
   To run migrations & seeds on your local Postgres instance:
   ```bash
   npm run migrate
   npm run seed
   ```
2. **Zero-Config High-Performance In-Memory PostGIS Mode:**
   If PostgreSQL is not running locally, the backend automatically boots with an embedded, zero-dependency in-memory PostGIS state engine. All models, matching algorithm, OTP generation, safety checks, and demo accounts function with 100% fidelity right out of the box!

---

## 🔑 Demo Accounts & Pre-Seeded Credentials

All seeded accounts use password: **`password123`**  
Demo OTP for verification: **`123456`**

| Role | Email | Password | Location |
|------|-------|----------|----------|
| **Donor** | `donor@foodbridge.demo` | `password123` | MG Road, Bangalore |
| **NGO 1 (Distributor)** | `ngo1@foodbridge.demo` | `password123` | Church Street, Bangalore (1.7 km) |
| **NGO 2 (Distributor)** | `ngo2@foodbridge.demo` | `password123` | Jayanagar, Bangalore (5.8 km) |
| **Volunteer 1** | `volunteer1@foodbridge.demo` | `password123` | Bike, Indiranagar |
| **Volunteer 2** | `volunteer2@foodbridge.demo` | `password123` | Car, Koramangala |
| **Biofarm** | `biofarm@foodbridge.demo` | `password123` | Whitefield Organic Facility |
| **Admin** | `admin@foodbridge.demo` | `password123` | Bangalore HQ |

---

## 🏗️ Core Modules & Workflows

### 1. Intelligent Matching Engine (Module 3)
Applies hard eligibility filters (verification, food category, remaining capacity, operating hour overlap, service radius) and multi-factor weighted ranking:
$$\text{Score} = (\text{Distance} \times 0.35) + (\text{Capacity} \times 0.25) + (\text{Time} \times 0.20) + (\text{Need} \times 0.20)$$

### 2. Double Food Safety Verification (Module 6)
Two independent audit records stored with actor UUID, timestamp, checklist answers, and results (`PASSED`, `FAILED`, `FLAGGED`):
- **Donor Check:** Preparation timestamp, temperature, packaging condition, allergen declarations, contamination check.
- **Pickup Check:** On-site inspection by volunteer (packaging integrity, odor/appearance, transport container suitability).
*A failed check terminates human consumption distribution and prevents handover.*

### 3. Cryptographic OTP Verification (Module 7)
- **Pickup OTP:** Cryptographically generated random 6-digit token, hashed with bcrypt, expires in 15 mins, verified before food custody handover.
- **Delivery OTP:** Verified by receiving NGO representative. Automatically marks delivery completed and awards donor reward credits in a single transaction.

### 4. Circular Biofarm Waste Recovery (Module 8)
Food surplus that expires without a reservation or is declined automatically routes into a separate, non-human waste recovery workflow. Biofarms accept, log collections, and record processing methods (`composting`, `biogas`, `approved_reuse`).

### 5. Donor Credit Ledger & Gamification (Module 9)
Auditable ledger awarding credits based on kilograms rescued ($10\text{ credits/kg}$). Donor rankings, monthly leaderboards, and milestone badges (`First Rescue Pioneer`, `Community Hero`).

### 6. Impact Analytics (Module 10)
Calculates real-time metrics without double-counting: total donated, total rescued, servings delivered, food recovered by biofarms, volunteer contributions, and monthly donation trends.

---

## 📑 API Contract

See [api-contract.md](./api-contract.md) for full endpoint specifications, payload schemas, and response formats.
