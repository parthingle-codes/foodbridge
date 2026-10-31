# FOODBRIDGE API Contract

> **Frontend ↔ Backend Integration Reference**
> Base URL: `http://localhost:5000/api`

## Response Format

### Success
```json
{ "success": true, "message": "...", "data": { ... } }
```

### Error
```json
{ "success": false, "message": "...", "errors": [...] }
```

- JSON fields: camelCase
- IDs: UUID v4
- Timestamps: ISO 8601

---

## Authentication

### POST /auth/register
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "donor | organization | ngo | volunteer | biofarm",
  "address": "string (optional)",
  "organizationName": "string (for org/ngo)",
  "registrationNumber": "string (for org/ngo)",
  "operatingHours": "string (for org/ngo)",
  "capacity": "number (for org/ngo)",
  "vehicleType": "bike | car | van | walk (for volunteer)",
  "availableHours": "string (for volunteer)",
  "farmName": "string (for biofarm)",
  "processingCapacity": "number (for biofarm)",
  "processingMethods": ["composting", "biogas", "approved_reuse", "other"]
}
```
**Response data:** `{ token, user: { id, name, email, role, ... } }`

### POST /auth/login
```json
{ "email": "string", "password": "string" }
```
**Response data:** `{ token, user: { id, name, email, role, ... } }`

### GET /auth/profile
**Headers:** `Authorization: Bearer <token>`
**Response data:** `{ id, name, email, role, phone, address, ... }`

---

## Donor

### GET /donor/dashboard
**Response data:** `{ totalDonations, foodRescued, estimatedServings, creditsEarned }`

### GET /donor/listings
**Response data:** `[{ id, foodName, category, quantity, unit, status, createdAt, matches }]`

---

## Food Listings

### POST /food-listings
```json
{
  "foodName": "string",
  "category": "cooked_meals | raw_ingredients | packaged_food | bakery | fruits_vegetables | dairy | beverages | other",
  "quantity": "number",
  "unit": "kg | lbs | servings | items | liters | boxes",
  "estimatedServings": "number",
  "foodCondition": "freshly_prepared | good | near_expiry | other",
  "preparationTime": "ISO 8601",
  "pickupStartTime": "ISO 8601",
  "pickupEndTime": "ISO 8601",
  "storageInstructions": "string",
  "allergens": ["nuts", "dairy", "gluten", "eggs", "soy", "fish", "shellfish", "none"],
  "additionalNotes": "string",
  "pickupAddress": "string",
  "landmark": "string",
  "contactPhone": "string",
  "latitude": "number",
  "longitude": "number"
}
```

### GET /food-listings
**Query params:** `status`, `category`, `page`, `limit`
**Response data:** `[{ id, foodName, category, quantity, unit, estimatedServings, status, pickupStartTime, pickupEndTime, pickupAddress, latitude, longitude, donorName, distance, matchScore, ... }]`

### GET /food-listings/:id
### PUT /food-listings/:id
### DELETE /food-listings/:id
### POST /food-listings/:id/image (multipart/form-data)

---

## Organization

### GET /organization/dashboard
**Response data:** `{ available, reserved, activePickups, completed }`

### GET /organization/available-food
**Response data:** `[{ id, foodName, category, quantity, unit, estimatedServings, distance, pickupEndTime, storageInstructions, donorName, matchScore, matchReason, ... }]`

### POST /organization/listings/:id/accept
### POST /organization/listings/:id/decline
### POST /organization/listings/:id/reserve
### GET /organization/reservations

---

## Volunteer

### GET /volunteer/dashboard
**Response data:** `{ activeAssignments, completedDeliveries, successRate }`

### GET /volunteer/assignments
**Response data:** `[{ id, foodName, quantity, pickupAddress, destinationAddress, pickupStartTime, pickupEndTime, status, donorName, organizationName, ... }]`

### PUT /volunteer/assignments/:id/status
```json
{ "status": "in_transit | completed" }
```

---

## Safety Checks

### POST /safety/donor-check/:listingId
```json
{
  "preparationTimeConfirmed": "boolean",
  "storageCondition": "refrigerated | room_temperature | frozen | heated",
  "packaging": "sealed_container | wrapped | open | boxed",
  "foodAppearance": "fresh | normal | slightly_aged | concerning",
  "allergensListed": "string",
  "visibleContamination": "boolean",
  "contaminationDescription": "string (if contamination=true)",
  "safetyConfirmed": "boolean"
}
```
**Response data:** `{ result: "pass | failed | flagged", completedBy, completedAt }`

### POST /safety/pickup-check/:assignmentId
```json
{
  "packagingIntegrity": "intact | minor_damage | compromised",
  "foodAppearanceSmell": "normal | slight_concern | concerning",
  "temperatureAppropriate": "yes | no | not_applicable",
  "transportContainer": "yes | insulated | standard | no",
  "visibleContamination": "boolean",
  "contaminationDescription": "string",
  "safetyConfirmed": "boolean"
}
```
**Response data:** `{ result: "pass | failed | flagged", completedBy, completedAt }`

---

## OTP

### POST /otp/pickup/:assignmentId/request
### POST /otp/pickup/:assignmentId/verify
```json
{ "otp": "string (6 digits)" }
```
**Response data:** `{ verified: boolean, message, demoOtp?: "string (dev mode only)" }`

### POST /otp/delivery/:assignmentId/request
### POST /otp/delivery/:assignmentId/verify
### POST /otp/:type/:assignmentId/resend

---

## Waste Recovery (Biofarm)

### GET /waste-recovery/available
**Response data:** `[{ id, materialName, category, quantity, unit, reason, collectionDeadline, distance, recoverySuitability, sourceName, ... }]`

### POST /waste-recovery/:id/accept
### POST /waste-recovery/:id/decline
### POST /waste-recovery/:id/reserve
### POST /waste-recovery/:id/collect
```json
{ "collectedQuantity": "number", "notes": "string" }
```
### PUT /waste-recovery/:id/processing
```json
{ "method": "composting | biogas | approved_reuse | other", "status": "collected | processing | completed", "recoveredQuantity": "number" }
```

### GET /biofarm/dashboard
### GET /biofarm/history

---

## Rewards

### GET /rewards
**Response data:** `{ totalCredits, rank, totalDonations, totalServings, monthlyCredits, recentCredits: [...] }`

### GET /rewards/leaderboard
**Response data:** `[{ userId, name, donations, servings, credits }]`

### GET /rewards/badges
**Response data:** `[{ key, name, earnedAt }]`

---

## Analytics

### GET /analytics/overview
**Response data:** `{ totalDonated, totalRescued, totalServings, totalRecovered, successfulPickups, missed, activeVolunteers, activeDonors, partnerNGOs, deliverySuccessRate, avgResponseTime }`

### GET /analytics/donation-trends
**Response data:** `[{ month, donated, rescued, recovered }]`

---

## Notifications

### GET /notifications
**Response data:** `[{ id, type, title, message, description, read, createdAt }]`

### GET /notifications/unread-count
**Response data:** `{ count: number }`

### PUT /notifications/:id/read
### PUT /notifications/read-all

---

## Map

### GET /map/markers
**Response data:** `[{ id, type, lat, lng, title, subtitle, details }]`

---

## Admin

### GET /admin/dashboard
**Response data:** `{ totalUsers, donors, verifiedNGOs, volunteers, biofarms, foodListings, successfulDistributions, wasteRecovery }`

### GET /admin/verification-requests
**Response data:** `[{ id, organizationName, email, registrationNumber, createdAt }]`

### POST /admin/organizations/:id/approve
### POST /admin/organizations/:id/reject
