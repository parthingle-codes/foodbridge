# FOODBRIDGE API CONTRACT (v1.0.0)
**HACKNOVA 2026 — Community Food Rescue & Surplus Redistribution Network**

> **Base URL:** `http://localhost:5000/api`  
> **Headers:** `Content-Type: application/json`  
> **Authenticated Requests:** `Authorization: Bearer <token>`  
> **Data Format:** camelCase JSON  
> **IDs:** UUID v4  
> **Timestamps:** ISO 8601 UTC  

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Human readable confirmation",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## 1. Authentication & Users

### POST `/api/auth/register`
Register a donor, distributor organization, volunteer, or biofarm.

**Request Body:**
```json
{
  "name": "Annapurna Foundation",
  "email": "ngo@foodbridge.demo",
  "phone": "+91-9876543211",
  "password": "password123",
  "role": "donor | organization | ngo | volunteer | biofarm",
  "address": "456 Church Street, Bangalore, Karnataka",
  "organizationName": "Annapurna Foundation",
  "registrationNumber": "NGO-KA-2024-001",
  "operatingHours": "08:00 - 20:00",
  "capacity": 200,
  "vehicleType": "bike | car | van | walk",
  "availableHours": "08:00 - 20:00",
  "farmName": "Green Earth Biofarm",
  "processingCapacity": 1000,
  "processingMethods": ["composting", "biogas", "approved_reuse", "other"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "22222222-2222-2222-2222-222222222222",
      "name": "Annapurna Foundation",
      "fullName": "Annapurna Foundation",
      "email": "ngo@foodbridge.demo",
      "phone": "+91-9876543211",
      "role": "organization",
      "address": "456 Church Street, Bangalore, Karnataka"
    }
  }
}
```

### POST `/api/auth/login`
**Request Body:**
```json
{
  "email": "donor@foodbridge.demo",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "Rajesh Kumar",
      "fullName": "Rajesh Kumar",
      "email": "donor@foodbridge.demo",
      "role": "donor",
      "phone": "+91-9876543210",
      "address": "123 MG Road, Bangalore, Karnataka"
    }
  }
}
```

### GET `/api/auth/profile` *(also `/api/auth/me`)*
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Rajesh Kumar",
    "fullName": "Rajesh Kumar",
    "email": "donor@foodbridge.demo",
    "phone": "+91-9876543210",
    "role": "donor",
    "address": "123 MG Road, Bangalore, Karnataka",
    "profile": { ... }
  }
}
```

---

## 2. Donor Management

### GET `/api/donor/dashboard`
**Headers:** `Authorization: Bearer <token>` (Donor)
**Success Response (200):**
```json
{
  "success": true,
  "message": "Donor dashboard stats retrieved",
  "data": {
    "totalDonations": 12,
    "foodRescued": 340,
    "estimatedServings": 1360,
    "creditsEarned": 350
  }
}
```

### GET `/api/donor/listings`
**Headers:** `Authorization: Bearer <token>` (Donor)
**Query Parameters:** `status` (optional)
**Success Response (200):**
```json
{
  "success": true,
  "message": "Donor listings retrieved",
  "data": [
    {
      "id": "bbbb1111-1111-1111-1111-111111111111",
      "foodName": "Vegetable Biryani",
      "category": "cooked_meals",
      "quantity": 25,
      "unit": "kg",
      "estimatedServings": 100,
      "status": "AVAILABLE",
      "pickupStartTime": "2026-11-01T10:00:00.000Z",
      "pickupEndTime": "2026-11-01T14:00:00.000Z",
      "pickupAddress": "123 MG Road, Bangalore, Karnataka",
      "storageNotes": "Kept in warm insulated container",
      "allergenNotes": "Contains dairy, nuts",
      "foodCondition": "freshly_prepared",
      "createdAt": "2026-10-31T08:00:00.000Z",
      "matches": [ ... ]
    }
  ]
}
```

---

## 3. Food Listings

### POST `/api/food-listings`
Publish surplus food for rescue.

**Headers:** `Authorization: Bearer <token>` (Donor)
**Request Body:**
```json
{
  "foodName": "Fresh Paneer Tikka & Naan",
  "category": "cooked_meals",
  "quantity": 20,
  "unit": "kg",
  "estimatedServings": 80,
  "foodCondition": "freshly_prepared | good | near_expiry | other",
  "preparationTime": "2026-10-31T12:00:00.000Z",
  "pickupStartTime": "2026-10-31T14:00:00.000Z",
  "pickupEndTime": "2026-10-31T19:00:00.000Z",
  "storageInstructions": "Keep in warm insulated container",
  "allergens": ["dairy"],
  "additionalNotes": "Corporate event surplus, pristine condition",
  "pickupAddress": "Lavelle Road, Bangalore, Karnataka",
  "landmark": "Near UB City",
  "contactPhone": "+91-9876543210",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Food listing published successfully",
  "data": {
    "id": "...",
    "foodName": "Fresh Paneer Tikka & Naan",
    "category": "cooked_meals",
    "quantity": 20,
    "unit": "kg",
    "status": "AVAILABLE",
    "matches": [ ... ]
  }
}
```

### GET `/api/food-listings`
**Query Parameters:** `status`, `category`, `page`, `limit`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Food listings retrieved",
  "data": [
    {
      "id": "bbbb1111-1111-1111-1111-111111111111",
      "foodName": "Vegetable Biryani",
      "category": "cooked_meals",
      "quantity": 25,
      "unit": "kg",
      "estimatedServings": 100,
      "status": "AVAILABLE",
      "pickupStartTime": "...",
      "pickupEndTime": "...",
      "pickupAddress": "123 MG Road, Bangalore, Karnataka",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "donorName": "Rajesh Kumar",
      "storageInstructions": "..."
    }
  ]
}
```

### GET `/api/food-listings/:id`
**Success Response (200):** Returns full listing object with `donorName`, `donorPhone`, `images`, `safetyChecks`, and `matches`.

### PUT `/api/food-listings/:id`
Update listing parameters (Donor only).

### DELETE `/api/food-listings/:id`
Cancel listing (Donor only).

### POST `/api/food-listings/:id/image`
Upload evidence or presentation image.
`multipart/form-data` with field name `image`.

---

## 4. Intelligent Matching Engine

### GET `/api/matching/:listingId`
Executes multi-factor Uber-inspired weighted matching:
- **Distance (35%):** Proximity within configured service radius (PostGIS `ST_DWithin` & `ST_Distance`).
- **Capacity (25%):** Remaining organization volume vs donation quantity.
- **Time Availability (20%):** Operating hours overlap with pickup window.
- **Need / Category Compatibility (20%):** Food category compatibility.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Matches found successfully",
  "data": {
    "listingId": "bbbb1111-1111-1111-1111-111111111111",
    "totalMatches": 2,
    "matches": [
      {
        "organizationId": "aaaa1111-1111-1111-1111-111111111111",
        "organizationName": "Annapurna Foundation",
        "address": "456 Church Street, Bangalore, Karnataka",
        "distanceKm": 1.72,
        "remainingCapacityKg": 170,
        "matchScore": 0.9450,
        "reasons": [
          "Closest organization (1.72 km)",
          "High capacity available (170 kg remaining)",
          "Actively redistributes cooked_meals",
          "Operating hours align with pickup window"
        ],
        "matchReason": "Closest organization (1.72 km) • High capacity available (170 kg remaining)"
      }
    ]
  }
}
```

---

## 5. Organization Workflows

### GET `/api/organization/dashboard`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Organization dashboard stats",
  "data": {
    "available": 3,
    "reserved": 1,
    "activePickups": 1,
    "completed": 12
  }
}
```

### GET `/api/organization/available-food`
Returns ranked surplus food eligible for this organization.
**Success Response (200):**
```json
{
  "success": true,
  "message": "Available food listings retrieved",
  "data": [
    {
      "id": "bbbb1111-1111-1111-1111-111111111111",
      "foodName": "Vegetable Biryani",
      "category": "cooked_meals",
      "quantity": 25,
      "unit": "kg",
      "estimatedServings": 100,
      "distance": 1.72,
      "pickupEndTime": "2026-11-01T14:00:00.000Z",
      "storageInstructions": "Stored in insulated container",
      "donorName": "Rajesh Kumar",
      "matchScore": 0.945,
      "matchReason": "Closest organization (1.72 km) • High capacity available",
      "status": "AVAILABLE"
    }
  ]
}
```

### POST `/api/organization/listings/:id/reserve`
Acquires lock and reserves listing for 30 minutes.

### POST `/api/organization/listings/:id/accept`
Accepts reservation and dispatches volunteer pickup assignment.

### POST `/api/organization/listings/:id/decline`
Declines reservation and releases listing back to the network.

### GET `/api/organization/reservations`
Returns all active and past reservations for the organization.

---

## 6. Volunteer Management

### GET `/api/volunteer/dashboard`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Volunteer dashboard stats retrieved",
  "data": {
    "activeAssignments": 1,
    "completedDeliveries": 24,
    "successRate": 98
  }
}
```

### GET `/api/volunteer/assignments`
Returns volunteer's active and completed rescue missions.
**Success Response (200):**
```json
{
  "success": true,
  "message": "Volunteer assignments retrieved",
  "data": [
    {
      "id": "vvvv1111-1111-1111-1111-111111111111",
      "listingId": "bbbb1111-1111-1111-1111-111111111111",
      "foodName": "Vegetable Biryani",
      "quantity": 25,
      "unit": "kg",
      "pickupAddress": "123 MG Road, Bangalore, Karnataka",
      "destinationAddress": "456 Church Street, Bangalore, Karnataka",
      "pickupStartTime": "2026-11-01T10:00:00.000Z",
      "pickupEndTime": "2026-11-01T14:00:00.000Z",
      "status": "assigned | in_transit | completed",
      "donorName": "Rajesh Kumar",
      "donorPhone": "+91-9876543210",
      "organizationName": "Annapurna Foundation"
    }
  ]
}
```

### PUT `/api/volunteer/assignments/:id/status`
**Request Body:**
```json
{
  "status": "in_transit | completed"
}
```

---

## 7. Food Safety Checks (Double Verification)

### POST `/api/safety/donor-check/:listingId` (Check 1 of 2)
Performed by Donor before dispatch.
**Request Body:**
```json
{
  "preparationTimeConfirmed": true,
  "storageCondition": "refrigerated | room_temperature | frozen | heated",
  "packaging": "sealed_container | wrapped | open | boxed",
  "foodAppearance": "fresh | normal | slightly_aged | concerning",
  "allergensListed": "nuts, dairy",
  "visibleContamination": false,
  "contaminationDescription": "",
  "safetyConfirmed": true
}
```
**Success Response (201):**
```json
{
  "success": true,
  "message": "Donor safety check completed: PASS",
  "data": {
    "id": "...",
    "result": "pass",
    "status": "pass",
    "completedBy": "Rajesh Kumar",
    "completedAt": "2026-10-31T09:00:00.000Z"
  }
}
```

### POST `/api/safety/pickup-check/:assignmentId` (Check 2 of 2)
Performed by Volunteer on-site before taking custody.
**Request Body:**
```json
{
  "packagingIntegrity": "intact | minor_damage | compromised",
  "foodAppearanceSmell": "normal | slight_concern | concerning",
  "temperatureAppropriate": "yes | no | not_applicable",
  "transportContainer": "yes | insulated | standard | no",
  "visibleContamination": false,
  "contaminationDescription": "",
  "safetyConfirmed": true
}
```
**Success Response (201):**
```json
{
  "success": true,
  "message": "Pickup safety check completed: PASS",
  "data": {
    "id": "...",
    "result": "pass",
    "status": "pass",
    "completedBy": "Priya Sharma",
    "completedAt": "2026-10-31T09:15:00.000Z"
  }
}
```

### GET `/api/safety/:listingId`
Returns both independent safety verification records.

---

## 8. Cryptographic OTP Verification

### POST `/api/otp/pickup/:assignmentId/request`
Generates cryptographically random single-use OTP for food handover.
**Success Response (201):**
```json
{
  "success": true,
  "message": "Pickup OTP generated successfully",
  "data": {
    "otpId": "...",
    "expiresAt": "2026-10-31T09:30:00.000Z",
    "demoOtp": "123456",
    "otp": "123456"
  }
}
```

### POST `/api/otp/pickup/:assignmentId/verify`
**Request Body:**
```json
{
  "otp": "123456"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "Pickup verified",
  "data": {
    "verified": true,
    "message": "Pickup OTP verified successfully. Food handover authorized."
  }
}
```

### POST `/api/otp/delivery/:assignmentId/request`
Generates delivery handover OTP.

### POST `/api/otp/delivery/:assignmentId/verify`
Verifies OTP, marks listing `DELIVERED`, and automatically credits donor!

---

## 9. Waste Recovery & Biofarm Management

### GET `/api/waste-recovery/available`
Lists expired or rejected food diverted to circular biofarm recovery.
**Success Response (200):**
```json
{
  "success": true,
  "message": "Available waste recovery opportunities retrieved",
  "data": [
    {
      "id": "cccc1111-1111-1111-1111-111111111111",
      "materialName": "Expired Pastries and Organic Trimmings",
      "category": "bakery",
      "quantity": 15,
      "unit": "kg",
      "reason": "EXPIRED_NO_RESERVATION",
      "collectionDeadline": "2026-11-01T14:00:00.000Z",
      "distance": 8.4,
      "recoverySuitability": "Ideal for microbial composting or bio-fermentation.",
      "sourceName": "Kumar Catering Services",
      "pickupAddress": "123 MG Road, Bangalore, Karnataka"
    }
  ]
}
```

### POST `/api/waste-recovery/:id/accept`
Biofarm accepts recovery assignment.

### POST `/api/waste-recovery/:id/collect`
**Request Body:**
```json
{
  "collectedQuantity": 15,
  "notes": "Collected for aerobic composting batch #104"
}
```

### PUT `/api/waste-recovery/:id/processing`
**Request Body:**
```json
{
  "method": "composting | biogas | approved_reuse | other",
  "status": "collected | processing | completed",
  "recoveredQuantity": 15
}
```

### GET `/api/biofarm/dashboard`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Biofarm dashboard retrieved",
  "data": {
    "availableWaste": 1,
    "reservedCount": 0,
    "processedKg": 185,
    "completedTotal": 8
  }
}
```

---

## 10. Donor Credits & Rewards

### GET `/api/rewards`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Rewards details retrieved",
  "data": {
    "totalCredits": 550,
    "rank": 3,
    "totalDonations": 13,
    "totalServings": 560,
    "monthlyCredits": 412,
    "recentCredits": [
      {
        "id": "...",
        "credits": 200,
        "reason": "Successful surplus food rescue: 20 kg redistributed",
        "createdAt": "2026-10-31T09:30:00.000Z"
      }
    ]
  }
}
```

### GET `/api/rewards/leaderboard`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Rewards leaderboard retrieved",
  "data": [
    {
      "userId": "11111111-1111-1111-1111-111111111111",
      "name": "Kumar Catering Services (Rajesh)",
      "donations": 28,
      "servings": 1450,
      "credits": 2450
    }
  ]
}
```

### GET `/api/rewards/badges`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Achievement badges retrieved",
  "data": [
    {
      "key": "FIRST_RESCUE",
      "name": "First Rescue Pioneer",
      "description": "Successfully completed your first surplus food rescue donation.",
      "icon": "🌱",
      "earnedAt": "2026-10-31T08:00:00.000Z"
    }
  ]
}
```

---

## 11. Impact Analytics

### GET `/api/analytics/overview`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Impact analytics overview retrieved",
  "data": {
    "totalDonated": 1285,
    "totalRescued": 1045,
    "totalServings": 4180,
    "totalRecovered": 235,
    "successfulPickups": 49,
    "missed": 2,
    "activeVolunteers": 14,
    "activeDonors": 25,
    "partnerNGOs": 12,
    "deliverySuccessRate": 96.4,
    "avgResponseTime": "18 mins"
  }
}
```

### GET `/api/analytics/donation-trends`
**Success Response (200):**
```json
{
  "success": true,
  "message": "Donation trends retrieved",
  "data": [
    { "month": "Jun", "donated": 180, "rescued": 155, "recovered": 25 },
    { "month": "Jul", "donated": 220, "rescued": 195, "recovered": 25 },
    { "month": "Aug", "donated": 270, "rescued": 240, "recovered": 30 },
    { "month": "Sep", "donated": 310, "rescued": 285, "recovered": 25 },
    { "month": "Oct", "donated": 360, "rescued": 330, "recovered": 30 }
  ]
}
```

---

## 12. Live Map

### GET `/api/map/markers`
Returns all active food listings, verified NGOs, biofarms, and volunteers.
**Success Response (200):**
```json
{
  "success": true,
  "message": "Map markers retrieved",
  "data": [
    {
      "id": "bbbb1111-1111-1111-1111-111111111111",
      "type": "food_listing | organization | volunteer | biofarm",
      "lat": 12.9716,
      "lng": 77.5946,
      "title": "Vegetable Biryani",
      "subtitle": "25 kg • AVAILABLE",
      "details": { ... }
    }
  ]
}
```

---

## 13. Notifications

### GET `/api/notifications`
### GET `/api/notifications/unread-count`
### PUT `/api/notifications/:id/read`
### PUT `/api/notifications/read-all`

---

## 14. Admin

### GET `/api/admin/dashboard`
### GET `/api/admin/verification-requests`
### POST `/api/admin/organizations/:id/approve`
### POST `/api/admin/organizations/:id/reject`

---

## Demo Accounts & Credentials

| Role | Email | Password | Demo OTP |
|------|-------|----------|----------|
| **Donor** | `donor@foodbridge.demo` | `password123` | `123456` |
| **Distributor (NGO 1)** | `ngo1@foodbridge.demo` | `password123` | `123456` |
| **Distributor (NGO 2)** | `ngo2@foodbridge.demo` | `password123` | `123456` |
| **Volunteer 1** | `volunteer1@foodbridge.demo` | `password123` | `123456` |
| **Volunteer 2** | `volunteer2@foodbridge.demo` | `password123` | `123456` |
| **Biofarm** | `biofarm@foodbridge.demo` | `password123` | `123456` |
| **Admin** | `admin@foodbridge.demo` | `password123` | `123456` |
