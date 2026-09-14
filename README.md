# First Choose Backend API

Production-grade NestJS backend for the **First Choose** home & professional service platform.

---

## 🏛 Architecture Overview

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: PostgreSQL with PostGIS extension support
- **ORM**: [Prisma](https://www.prisma.io/)
- **Cache & Key-Value**: Upstash Redis (REST) & Local Redis fallback
- **Authentication**: JWT & Supabase Auth
- **File Storage**: Supabase Storage
- **Documentation**: Swagger OpenAPI at `/api/docs`
- **API Base**: `/api/v1`

---

## 📁 Project Structure

```
first-choose-backend/
├── prisma/
│   └── schema.prisma               # Complete database schema (17 tables & relations)
├── src/
│   ├── config/                     # Environment configuration loaders
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── storage.config.ts
│   ├── common/                     # Cross-cutting concerns
│   │   ├── filters/                # Global exception handling
│   │   ├── interceptors/           # Response transformer & logging
│   │   ├── pipes/                  # Request validation pipe
│   │   ├── decorators/
│   │   └── guards/
│   ├── modules/                    # Feature modules
│   │   ├── prisma/                 # Prisma client & connection manager
│   │   ├── redis/                  # Upstash / ioredis client service
│   │   └── health/                 # Health check endpoint
│   ├── app.module.ts
│   └── main.ts                     # Bootstrap with versioning & Swagger
├── Dockerfile                      # Multi-stage production container
├── docker-compose.yml              # Local PostgreSQL (PostGIS) & Redis
├── .env.example                    # Environment template
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20
- npm >= 10
- Docker & Docker Compose (optional for local Postgres/Redis)

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 3. Start Infrastructure (Optional Local DB & Redis)
```bash
docker compose up -d
```

### 4. Generate Prisma Client & Run Migrations
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Application in Development
```bash
npm run start:dev
```

---

## 📖 Complete API Documentation & Architecture

For a comprehensive guide detailing every endpoint, request/response schema, authentication lifecycles, PostGIS discovery queries, customer & partner flows, and the visit booking state machine, see:

👉 **[API_DOCUMENTATION_AND_FLOW.md](./API_DOCUMENTATION_AND_FLOW.md)**

---

## 🔗 Key Endpoints Overview

| Module | Method & Path | Description | Access |
|---|---|---|---|
| **Docs** | `GET /api/docs` | Interactive Swagger OpenAPI documentation | Public |
| **Health** | `GET /api/v1/health` | PostgreSQL & Redis connection latency health check | Public |
| **Auth** | `POST /api/v1/auth/request-otp` | Request 6-digit OTP for phone authentication | Public |
| **Auth** | `POST /api/v1/auth/verify-otp` | Verify OTP and obtain JWT access + refresh tokens | Public |
| **Users** | `GET /api/v1/users/me` | Fetch authenticated user profile details | Bearer JWT |
| **Categories** | `GET /api/v1/categories` | Browse service categories and problem types | Public |
| **Categories** | `GET /api/v1/categories/:id/problems` | List problem types under a specific category | Public |
| **Discovery** | `GET /api/v1/professionals/nearby` | PostGIS / Geospatial professional discovery & ranking | Public |
| **Discovery** | `GET /api/v1/professionals/:id` | Professional public profile, portfolio & reviews | Public |
| **Partners** | `POST /api/v1/professionals/profile` | Create or update professional business profile | Professional |
| **Partners** | `POST /api/v1/professionals/services` | Link offered service categories & custom rates | Professional |
| **Partners** | `POST /api/v1/professionals/kyc` | Submit government ID for admin verification | Professional |
| **Bookings** | `POST /api/v1/bookings/calculate` | Calculate visiting charge, GST taxes, and fees | Public / Customer |
| **Bookings** | `POST /api/v1/bookings` | Book an in-person professional visit | Customer |
| **Bookings** | `GET /api/v1/bookings/customer/active` | List customer's active in-progress bookings | Customer |
| **Bookings** | `GET /api/v1/bookings/customer/history` | List customer's past completed/cancelled bookings | Customer |
| **Bookings** | `GET /api/v1/bookings/:id` | Get full booking details & status history audit trail | Customer / Pro |
| **Bookings** | `POST /api/v1/bookings/:id/cancel` | Cancel active visit booking via state machine | Customer / Pro |

