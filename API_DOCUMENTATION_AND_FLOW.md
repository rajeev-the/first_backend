# First Choose Platform — API Reference & Workflow Architecture

Complete documentation of all REST APIs, authentication models, customer and partner journeys, PostGIS geospatial discovery, and deterministic visit booking state machine.

---

## 📑 Table of Contents
1. [System Architecture & Tech Stack](#1-system-architecture--tech-stack)
2. [Authentication & Session Lifecycle](#2-authentication--session-lifecycle)
3. [End-to-End Customer Flow](#3-end-to-end-customer-flow)
4. [End-to-End Professional / Partner Flow](#4-end-to-end-professional--partner-flow)
5. [Booking State Machine Architecture](#5-booking-state-machine-architecture)
6. [Complete API Catalog](#6-complete-api-catalog)
   - [Auth & Identity Endpoints](#auth--identity-endpoints)
   - [Users Endpoints](#users-endpoints)
   - [Categories & Catalog Endpoints](#categories--catalog-endpoints)
   - [Professionals Discovery & Public Profile Endpoints](#professionals-discovery--public-profile-endpoints)
   - [Professional Partner Management Endpoints](#professional-partner-management-endpoints)
   - [Visit Booking Endpoints](#visit-booking-endpoints)
   - [System & Health Endpoints](#system--health-endpoints)

---

## 1. System Architecture & Tech Stack

```
[ Mobile Apps / Flutter / Web Client ]
                 │
                 ▼  (HTTPS / REST / JSON)
        [ NestJS API Gateway ]
        ├── Helmet & CORS Middleware
        ├── JWT Auth Guard & Roles Guard
        ├── Class Validator & DTO Pipes
        └── Transform & Logging Interceptors
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
[ PostgreSQL (Neon) ]  [ Upstash Redis ]
  - Relational Data      - OTP Storage (5-min TTL)
  - PostGIS & Geodesic   - Session Token Whitelist
  - Full Audit Trail     - Rate Limiting
```

- **Framework**: NestJS 10.x (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache / Fast Store**: Upstash Redis (Session & OTP management)
- **Geospatial Engine**: PostGIS / Spherical Law of Cosines (WGS 84 ellipsoid)
- **API Versioning**: URI-based (`/api/v1/`)
- **Documentation**: Swagger OpenAPI at `/api/docs`

---

## 2. Authentication & Session Lifecycle

All protected endpoints require a **Bearer JWT Access Token** in the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

```
[Client]                            [Backend API]                    [Redis Cache]
   │                                      │                                │
   ├── POST /auth/request-otp ───────────>│── Generate 6-digit OTP ───────>│ (Store OTP, 5 min TTL)
   │   (phone: +919876543210)             │                                │
   │                                      │                                │
   ├── POST /auth/verify-otp ────────────>│── Validate OTP ───────────────>│
   │   (phone + otp)                      │── Create/Update User (DB)      │
   │                                      │── Generate Access & Refresh    │
   │                                      │── Store Active Session ───────>│ (Store sessionId)
   │<── Returns Tokens & User Info ───────│                                │
   │                                      │                                │
   ├── Protected API Request ────────────>│── Verify JWT Signature         │
   │   (Bearer Access Token)              │── Check Active Session ───────>│
   │<── 200 OK (Authorized Response) ─────│                                │
```

---

## 3. End-to-End Customer Flow

```
1. Browse Service Categories
   GET /api/v1/categories
            │
            ▼
2. Select Problem Type (Optional)
   GET /api/v1/categories/:id/problems
            │
            ▼
3. Discover Nearby Verified Professionals (PostGIS)
   GET /api/v1/professionals/nearby?lat=28.6139&lng=77.2090&category=ac-repair
            │
            ▼
4. Inspect Professional Profile, Experience, Portfolio & Reviews
   GET /api/v1/professionals/:id?lat=28.6139&lng=77.2090
            │
            ▼
5. Calculate Visiting Charge & Taxes Breakdown
   POST /api/v1/bookings/calculate (professionalId, categoryId, coupon)
            │
            ▼
6. Confirm Visit Booking
   POST /api/v1/bookings (address, scheduledDate, timeSlot, paymentMethod)
   Status: REQUESTED (PENDING)
            │
            ▼
7. Track Live Booking Status & Audit History
   GET /api/v1/bookings/customer/active
   GET /api/v1/bookings/:id
```

---

## 4. End-to-End Professional / Partner Flow

```
1. Partner Phone Login & OTP Verification
   POST /api/v1/auth/request-otp -> POST /api/v1/auth/verify-otp
            │
            ▼
2. Setup Business Profile & Visiting Charge
   POST /api/v1/professionals/profile
   (businessName, bio, experienceYears, visitingCharge, serviceRadiusKm, lat, lng)
            │
            ▼
3. Select & Link Service Categories
   POST /api/v1/professionals/services
   (categoryIds: ["..."])
            │
            ▼
4. Upload KYC Government Documents (Aadhaar / PAN / Trade License)
   POST /api/v1/professionals/kyc
   (documentType, documentNumber, documentUrl)
            │
            ▼
5. Go Online & Manage Live Location
   PATCH /api/v1/professionals/me/profile
   (isOnline: true, latitude: 28.6139, longitude: 77.2090)
```

---

## 5. Booking State Machine Architecture

```
                    REQUESTED (PENDING)
                            │
                            ▼
                         ACCEPTED
                            │
                            ▼
                        ON_THE_WAY
                            │
                            ▼
                         ARRIVED
                            │
                            ▼
                        INSPECTION
                            │
                            ▼
                      QUOTE_CREATED
                            │
                            ▼
                WAITING_CUSTOMER_APPROVAL
                     (DIAGNOSIS_PENDING)
                            │
                  ┌─────────┴─────────┐
                  │                   │
                  ▼                   ▼
         APPROVED (QUOTE_APPROVED) REJECTED (QUOTE_REJECTED)
                  │                   │
                  ▼                   ▼
             IN_PROGRESS            CLOSED
                  │
                  ▼
              COMPLETED

* CANCELLED: Allowed from [PENDING, ACCEPTED, ON_THE_WAY] by Customer or Admin.
```

- **Backend Enforcement**: State changes must pass validation in `booking-state-machine.ts`.
- **Role Permissions**: Customer can only approve/reject quotes and request cancellation; Professionals can accept, depart, inspect, quote, and complete.
- **Audit Logging**: Each transition logs `bookingId`, `status`, `changedById`, and timestamped notes in `BookingStatusHistory`.

---

## 6. Complete API Catalog

### Base URL
```
http://localhost:3000/api/v1
```

---

### Auth & Identity Endpoints

#### 1. Request OTP
- **Method**: `POST /auth/request-otp`
- **Access**: Public
- **Description**: Generates and sends a 6-digit OTP (stored in Redis for 5 minutes). In development/test mode, OTP is fixed to `123456`.
- **Request Body**:
  ```json
  {
    "phone": "+919876543210"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "message": "OTP sent successfully to +919876543210",
      "expiresInSeconds": 300
    }
  }
  ```

#### 2. Verify OTP & Authenticate
- **Method**: `POST /auth/verify-otp`
- **Access**: Public
- **Description**: Validates OTP, creates user if first-time, and issues JWT access token + refresh token.
- **Request Body**:
  ```json
  {
    "phone": "+919876543210",
    "otp": "123456",
    "name": "Rahul Kumar",
    "role": "CUSTOMER"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 900,
      "user": {
        "id": "9369d71c-8e72-475c-9c76-2f477038e4a9",
        "phone": "+919876543210",
        "name": "Rahul Kumar",
        "role": "CUSTOMER",
        "status": "ACTIVE"
      }
    }
  }
  ```

#### 3. Refresh Access Token
- **Method**: `POST /auth/refresh-token`
- **Access**: Public (requires valid refreshToken)
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```

#### 4. Logout Session
- **Method**: `POST /auth/logout`
- **Access**: Bearer JWT
- **Description**: Invalidates the active Redis session token.

---

### Users Endpoints

#### 1. Get Current User Profile
- **Method**: `GET /users/me`
- **Access**: Bearer JWT
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "9369d71c-8e72-475c-9c76-2f477038e4a9",
      "phone": "+919876543210",
      "name": "Rahul Kumar",
      "email": "rahul@example.com",
      "avatarUrl": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a",
      "role": "CUSTOMER",
      "status": "ACTIVE"
    }
  }
  ```

#### 2. Update Profile
- **Method**: `PATCH /users/me`
- **Access**: Bearer JWT
- **Request Body**:
  ```json
  {
    "name": "Rahul Kumar",
    "email": "rahul.kumar@example.com",
    "avatarUrl": "https://..."
  }
  ```

---

### Categories & Catalog Endpoints

#### 1. List All Service Categories
- **Method**: `GET /categories`
- **Access**: Public
- **Query Params**:
  - `includeProblems` (boolean, optional): Include nested problem types (`true`/`false`).
  - `filter` (string, optional): Filter by UI category section (`popular`, `emergency`, `appliance`, etc.).
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": "74331644-aff2-4565-89eb-1ec0618ca8b9",
        "name": "AC Repair & Service",
        "slug": "ac-repair",
        "icon": "https://img.icons8.com/color/96/air-conditioner.png",
        "description": "Comprehensive AC installation, repair, and gas refilling",
        "isActive": true
      }
    ]
  }
  ```

#### 2. Get Category Details by Slug or ID
- **Method**: `GET /categories/:id`
- **Access**: Public
- **Example**: `GET /categories/ac-repair`

#### 3. List Problem Types Under Category
- **Method**: `GET /categories/:id/problems`
- **Access**: Public
- **Example**: `GET /categories/ac-repair/problems`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": "18cfd145-8fe0-410a-8a60-a2924198ee67",
        "title": "AC Not Cooling / Weak Airflow",
        "description": "Inspection of cooling coil, refrigerant gas levels, and compressor",
        "estimatedPriceMin": 299,
        "estimatedPriceMax": 899,
        "isActive": true
      }
    ]
  }
  ```

---

### Professionals Discovery & Public Profile Endpoints

#### 1. Discover Nearby Professionals (PostGIS / Geospatial)
- **Method**: `GET /professionals/nearby`
- **Access**: Public
- **Query Parameters**:
  - `lat` (number, required): Customer latitude (e.g. `28.6139`)
  - `lng` (number, required): Customer longitude (e.g. `77.2090`)
  - `radius` (number, optional, default: `10`): Search radius in km
  - `category` (string, optional): Category slug (`ac-repair`) or Category UUID
  - `rating` (number, optional): Minimum rating filter (`4.0`, `4.5`)
  - `availability` (boolean, optional): Only online professionals (`true`/`false`)
  - `sortBy` (enum, optional): `recommended`, `distance`, `rating`, `experience`, `price_low_to_high`
  - `page` & `limit` (pagination)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": "3541b12a-da2f-4589-8248-12e8f05b0a93",
        "name": "Rahul Kumar",
        "avatarUrl": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a",
        "bio": "Certified technician with 8 years of experience",
        "category": "AC Repair & Service",
        "categorySlug": "ac-repair",
        "rating": 4.8,
        "totalReviews": 36,
        "experience": 8,
        "visitingCharge": 199,
        "distance": 2.4,
        "isVerified": true,
        "isAvailable": true,
        "latitude": 28.6139,
        "longitude": 77.209
      }
    ]
  }
  ```

#### 2. Get Professional Profile & Portfolio
- **Method**: `GET /professionals/:id`
- **Access**: Public
- **Query Parameters**:
  - `lat` & `lng` (optional): Customer coordinates to compute dynamic distance
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "3541b12a-da2f-4589-8248-12e8f05b0a93",
      "userId": "9369d71c-8e72-475c-9c76-2f477038e4a9",
      "name": "Rahul Kumar",
      "businessName": "Sharma Cooling & Electrical Solutions",
      "bio": "Certified technician with 8 years of experience",
      "avatarUrl": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a",
      "experienceYears": 8,
      "experience": 8,
      "visitingCharge": 199,
      "isOnline": true,
      "isAvailable": true,
      "isVerified": true,
      "kycStatus": "VERIFIED",
      "rating": 4.8,
      "totalReviews": 36,
      "serviceRadiusKm": 15,
      "distance": 2.4,
      "latitude": 28.6139,
      "longitude": 77.209,
      "portfolio": [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758"
      ],
      "services": [
        {
          "id": "...",
          "categoryId": "74331644-aff2-4565-89eb-1ec0618ca8b9",
          "categoryName": "AC Repair & Service",
          "categorySlug": "ac-repair",
          "customRate": 199,
          "isActive": true
        }
      ],
      "reviews": [
        {
          "id": "...",
          "rating": 5,
          "comment": "Quick diagnosis and prompt repair. Highly recommended!",
          "customerName": "Pooja Sharma",
          "customerAvatar": null,
          "createdAt": "2026-08-20T10:00:00.000Z"
        }
      ]
    }
  }
  ```

---

### Professional Partner Management Endpoints

#### 1. Setup / Create Professional Profile
- **Method**: `POST /professionals/profile`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Request Body**:
  ```json
  {
    "businessName": "Sharma Cooling & Electrical Solutions",
    "bio": "Certified HVAC & Electrical expert with 8+ years experience",
    "experienceYears": 8,
    "visitingCharge": 199,
    "serviceRadiusKm": 15,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "categoryIds": ["74331644-aff2-4565-89eb-1ec0618ca8b9"]
  }
  ```

#### 2. Get My Partner Profile
- **Method**: `GET /professionals/me/profile`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)

#### 3. Update Availability / Location / Charges
- **Method**: `PATCH /professionals/me/profile`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Request Body**:
  ```json
  {
    "isOnline": true,
    "visitingCharge": 249,
    "latitude": 28.6139,
    "longitude": 77.2090
  }
  ```

#### 4. Link Service Categories
- **Method**: `POST /professionals/services`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Request Body**:
  ```json
  {
    "categoryIds": ["74331644-aff2-4565-89eb-1ec0618ca8b9"],
    "customRate": 249
  }
  ```

#### 5. Submit KYC Documents
- **Method**: `POST /professionals/kyc`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Request Body**:
  ```json
  {
    "documentType": "AADHAAR",
    "documentNumber": "1234-5678-9012",
    "documentUrl": "https://storage.firstchoose.com/kyc/aadhaar.pdf"
  }
  ```

#### 6. Get Incoming Visit Requests (Phase 8)
- **Method**: `GET /api/v1/partner/requests`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Description**: Returns visit requests in `REQUESTED` (`PENDING`) status with Customer, Category, Problem, Distance, Date, Time, Visiting Charge, and 5-minute countdown timer.

#### 7. Accept Visit Request (Phase 8)
- **Method**: `POST /api/v1/partner/requests/:id/accept`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Description**: Transitions visit request from `REQUESTED` to `ACCEPTED` before the 5-minute timeout.

#### 8. Decline Visit Request (Phase 8)
- **Method**: `POST /api/v1/partner/requests/:id/decline`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Description**: Declines visit request and transitions state to `DECLINED`.

#### 9. Get Single Active Ongoing Job (Phase 8)
- **Method**: `GET /api/v1/partner/active-job`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Description**: Returns the active job currently being executed by the partner.

#### 10. Update Partner Availability (Phase 8)
- **Method**: `PATCH /api/v1/partner/availability`
- **Access**: Bearer JWT (`PROFESSIONAL` / `ADMIN`)
- **Request Body**:
  ```json
  {
    "isOnline": true,
    "latitude": 28.6139,
    "longitude": 77.2090
  }
  ```

---

### Visit Booking Endpoints

#### 1. Calculate Visiting Charge Breakdown
- **Method**: `POST /bookings/calculate`
- **Access**: Public / Customer
- **Description**: Computes visiting charge, 18% GST taxes, ₹19 platform fee, and coupon discounts.
- **Request Body**:
  ```json
  {
    "professionalId": "3541b12a-da2f-4589-8248-12e8f05b0a93",
    "categoryId": "74331644-aff2-4565-89eb-1ec0618ca8b9",
    "couponCode": "FIRST50"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "visitingCharge": 199,
      "taxAmount": 39.24,
      "platformFee": 19,
      "discountAmount": 50,
      "totalAmount": 207.24,
      "currency": "INR"
    }
  }
  ```

#### 2. Create Visit Booking
- **Method**: `POST /bookings`
- **Access**: Bearer JWT (`CUSTOMER` / `ADMIN`)
- **Request Body**:
  ```json
  {
    "professionalId": "3541b12a-da2f-4589-8248-12e8f05b0a93",
    "categoryId": "74331644-aff2-4565-89eb-1ec0618ca8b9",
    "problemId": "18cfd145-8fe0-410a-8a60-a2924198ee67",
    "problemDescription": "AC making loud rattling sound and cooling is low in master bedroom.",
    "address": {
      "addressLine1": "Flat 402, Sunshine Heights",
      "addressLine2": "Sector 14",
      "city": "New Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "landmark": "Near Metro Gate 2"
    },
    "latitude": 28.6139,
    "longitude": 77.2090,
    "scheduledDate": "2026-08-25T10:00:00.000Z",
    "timeSlot": "10:00 AM - 12:00 PM",
    "paymentMethod": "UPI"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "id": "e89c3f41-0f4b-4b47-975f-5373a0058b76",
      "bookingNumber": "BK-20260824-A1B2",
      "customerId": "9369d71c-8e72-475c-9c76-2f477038e4a9",
      "professionalId": "3541b12a-da2f-4589-8248-12e8f05b0a93",
      "categoryId": "74331644-aff2-4565-89eb-1ec0618ca8b9",
      "problemId": "18cfd145-8fe0-410a-8a60-a2924198ee67",
      "problemDescription": "AC making loud rattling sound and cooling is low in master bedroom.",
      "address": {
        "addressLine1": "Flat 402, Sunshine Heights",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001"
      },
      "scheduledDate": "2026-08-25T10:00:00.000Z",
      "visitingCharge": 199,
      "status": "PENDING",
      "createdAt": "2026-08-24T00:48:00.000Z",
      "professional": {
        "id": "3541b12a-da2f-4589-8248-12e8f05b0a93",
        "name": "Rahul Kumar",
        "businessName": "Sharma Cooling & Electrical Solutions",
        "avatarUrl": "https://...",
        "phone": "+919999988888",
        "rating": 4.8,
        "experienceYears": 8
      },
      "payments": [
        {
          "id": "...",
          "paymentType": "VISITING_CHARGE",
          "method": "UPI",
          "status": "PENDING",
          "amount": 199,
          "currency": "INR"
        }
      ],
      "statusHistory": [
        {
          "id": "...",
          "status": "PENDING",
          "notes": "Visit booking requested by customer",
          "createdAt": "2026-08-24T00:48:00.000Z"
        }
      ]
    }
  }
  ```

#### 3. List Active Ongoing Bookings
- **Method**: `GET /bookings/customer/active`
- **Access**: Bearer JWT (`CUSTOMER` / `ADMIN`)
- **Returns**: Bookings in statuses `PENDING`, `ACCEPTED`, `ON_THE_WAY`, `ARRIVED`, `INSPECTION`, `DIAGNOSIS_PENDING`, `QUOTE_CREATED`, `QUOTE_APPROVED`, `IN_PROGRESS`.

#### 4. List Past Booking History
- **Method**: `GET /bookings/customer/history`
- **Access**: Bearer JWT (`CUSTOMER` / `ADMIN`)
- **Returns**: Bookings in statuses `COMPLETED`, `CANCELLED`, `CLOSED`, `DECLINED`, `QUOTE_REJECTED`.

#### 5. Get Booking Details by ID
- **Method**: `GET /bookings/:id`
- **Access**: Bearer JWT (`CUSTOMER` / `PROFESSIONAL` / `ADMIN`)
- **Description**: Returns full booking information, quote breakdown, payments, and chronological status history.

#### 6. Cancel Booking
- **Method**: `POST /bookings/:id/cancel`
- **Access**: Bearer JWT (`CUSTOMER` / `PROFESSIONAL` / `ADMIN`)
- **Request Body**:
  ```json
  {
    "reason": "Customer had to reschedule due to travel"
  }
  ```

---

### System & Health Endpoints

#### 1. System Health Check
- **Method**: `GET /health`
- **Access**: Public
- **Description**: Checks database (PostgreSQL) and cache (Redis) connection latency.
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "info": {
      "database": { "status": "up" },
      "redis": { "status": "up" }
    }
  }
  ```

#### 2. Interactive OpenAPI / Swagger Docs
- **URL**: `http://localhost:3000/api/docs`
- Complete OpenAPI schema with direct interactive request testing.
