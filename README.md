# URL Shortener API

A secure, production-ready RESTful API for the Authenticated URL Shortener application. Built with Node.js, Express, TypeScript, MongoDB (Mongoose), and JWT-based authentication with email OTP verification.

---

## Features

- **User Registration** with email OTP verification (single-use, 10-minute expiry, 5-attempt brute-force lock)
- **Secure Login** with bcrypt password verification and unverified account blocking
- **JWT Authentication** stored in HTTP-Only, SameSite cookies (XSS-proof)
- **Email OTP System** with 60-second resend cooldown and previous-OTP invalidation
- **URL Shortening** with cryptographically secure 7-character short codes and collision-safe retry loop
- **Ownership Enforcement** — users can only manage their own URLs (server-side IDOR protection)
- **Public Redirect** endpoint (`GET /s/:shortCode`) with atomic click counter increment
- **Rate Limiting** — 100 req/15min globally, 10 req/15min on auth routes
- **Security Headers** via Helmet
- **Centralized Error Handling** with operational vs programmer error distinction
- **Fail-Fast Environment Validation** via Zod

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| Runtime | Node.js (LTS v20+) |
| Framework | Express.js v5 |
| Language | TypeScript (strict mode) |
| Database | MongoDB via Mongoose ODM |
| Authentication | JSON Web Tokens (jsonwebtoken) |
| Password Hashing | bcryptjs (12 salt rounds) |
| Validation | Zod v4 |
| Email | Nodemailer (console logger in development) |
| Security | Helmet, express-rate-limit, cookie-parser |
| Code Quality | ESLint, Prettier |

---

## Architecture

```
React Client
    │
    ▼
Express Router
    │
    ▼
Middleware Pipeline (Helmet, CORS, Rate Limiter, Cookie Parser, Auth Guard, Zod Validator)
    │
    ▼
Controller (HTTP request/response handling)
    │
    ▼
Service Layer (Business logic, password hashing, OTP generation, ownership checks)
    │
    ▼
Mongoose ODM
    │
    ▼
MongoDB Atlas
```

### Directory Structure

```
src/
├── config/          # Environment variables (Zod validated)
├── controllers/     # HTTP request handlers
├── middleware/      # Auth guard, error handler, rate limiter, validator
├── models/          # Mongoose User, Url, and Otp schemas
├── routes/          # Express route definitions
├── services/        # Business logic (AuthService, UrlService, EmailService)
├── validators/      # Zod request schemas
├── types/           # Express Request type extensions
├── lib/             # Mongoose connection manager
├── utils/           # AppError, token utilities, short-code generator
├── app.ts           # Express application configuration
└── server.ts        # HTTP server bootstrap and DB connection
```

---

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MongoDB Atlas account (free tier) or local MongoDB instance

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/mhdadil-kk/url-shortener-api.git
cd url-shortener-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/url_shortener_dev
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=2h

# Optional: Production SMTP email delivery
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@email.com
SMTP_PASS=your_smtp_password
FROM_EMAIL="ShortLink <noreply@shortlink.app>"
```

> **Note**: In development mode, OTP codes are printed directly to the server terminal. SMTP configuration is only used in production (`NODE_ENV=production`).

### 4. Start development server

```bash
npm run dev
```

The server starts on `http://localhost:5000`.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to JavaScript (`dist/`) |
| `npm run start` | Run compiled production build |
| `npx tsc --noEmit` | Type-check without compiling |

---

## Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | No (default: 5000) | HTTP server port |
| `NODE_ENV` | No (default: development) | Environment mode |
| `CLIENT_ORIGIN` | Yes | React frontend URL (CORS) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes (min 32 chars) | Token signing secret |
| `JWT_EXPIRES_IN` | No (default: 2h) | Token expiry duration |
| `SMTP_HOST` | No | SMTP server (production email) |
| `SMTP_PORT` | No | SMTP port |
| `SMTP_SECURE` | No | Use TLS (`true`/`false`) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `FROM_EMAIL` | No | Sender address in emails |

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register user, send OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP, activate account, issue JWT |
| `POST` | `/api/auth/resend-otp` | Public | Resend OTP (60s cooldown) |
| `POST` | `/api/auth/login` | Public | Login (verified accounts only) |
| `GET` | `/api/auth/me` | Protected | Get current user profile |
| `POST` | `/api/auth/logout` | Protected | Clear auth cookie |

### URL Management

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/urls` | Protected | Create shortened URL |
| `GET` | `/api/urls` | Protected | List user's URLs |
| `GET` | `/api/urls/:id` | Protected | Get single URL (ownership enforced) |
| `DELETE` | `/api/urls/:id` | Protected | Delete URL (ownership enforced) |

### Public

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server health check |
| `GET` | `/s/:shortCode` | Public | Redirect to original URL (increments clicks) |

---

## Request & Response Examples

### Register

**Request**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "message": "Registration initiated. Please verify your email with the 6-digit code sent.",
  "data": {
    "email": "user@example.com",
    "requiresVerification": true
  }
}
```

### Verify OTP

**Request**
```json
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "message": "Email verified successfully. Account activated.",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "isVerified": true,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJ..."
  }
}
```

### Create Short URL

**Request**
```json
POST /api/urls
Authorization: Bearer <token>
{
  "originalUrl": "https://developer.mozilla.org/en-US/docs/Web"
}
```

**Response (201 Created)**
```json
{
  "status": "success",
  "message": "Short URL created successfully",
  "data": {
    "url": {
      "_id": "...",
      "originalUrl": "https://developer.mozilla.org/en-US/docs/Web",
      "shortCode": "2zJeEgW",
      "clicks": 0,
      "userId": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

## Error Responses

All errors follow a consistent structure:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Human-readable error description"
}
```

Validation errors include field-level details:

```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "password", "message": "Password must contain at least one uppercase letter" }
  ]
}
```

| Status Code | Meaning |
| :--- | :--- |
| `400` | Validation error or bad request |
| `401` | Missing or invalid authentication token |
| `403` | Authenticated but forbidden (unverified account or wrong ownership) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email) |
| `429` | Too many requests (rate limit or OTP attempt limit) |
| `500` | Internal server error |

---

## Security Considerations

- **Passwords**: Hashed using bcryptjs with 12 salt rounds. Plaintext passwords are never stored or logged.
- **OTP Security**: 6-digit codes are hashed with bcrypt before storage. Single-use, 10-minute expiry, 5-attempt limit.
- **JWT Storage**: Tokens are stored in HTTP-Only, SameSite=Lax cookies, preventing XSS-based token theft.
- **CORS**: Restricted to `CLIENT_ORIGIN` with `credentials: true`.
- **Rate Limiting**: Auth endpoints limited to 10 requests per 15 minutes per IP.
- **Input Validation**: All request bodies validated with Zod before reaching controllers.
- **IDOR Protection**: All URL ownership checks are enforced at the service layer via database queries.
- **Error Responses**: Stack traces are hidden in production. Generic messages used for auth failures.

---

## Known Limitations

- JWT tokens cannot be immediately revoked server-side upon logout (stateless design). The browser's HTTP-Only cookie is cleared, which removes the client's ability to present the credential.
- OTP delivery in development uses console logging. Production email requires SMTP configuration.
- No refresh token rotation implemented in the current version.

---

## AI-Assisted Development Disclosure

This project was developed with the assistance of **Google Antigravity (AI assistant)** as a technical mentor and code reviewer throughout the development process.

AI assistance was used for:
- **Technical Planning**: Architecture design, database schema decisions, and API endpoint planning.
- **Concept Explanation**: Understanding JWT authentication, bcrypt hashing, MongoDB TTL indexes, Express middleware pipelines, and TypeScript generics.
- **Implementation Guidance**: Step-by-step guidance on implementing each feature incrementally.
- **Code Review**: Identifying TypeScript errors, security vulnerabilities, and code quality improvements.
- **Debugging**: Resolving Express v5 compatibility issues, Zod v4 API changes, and PowerShell testing syntax.
- **Security Design**: Designing the OTP brute-force protection, attempt limits, cooldown enforcement, and JWT cookie configuration.

**All code was manually written, understood, tested, and committed by the developer.** No code was blindly copied without understanding its purpose and behavior. Every implementation decision was explained and verified before proceeding to the next step.

This transparent AI-assistance disclosure is provided as required by the assignment guidelines and to demonstrate genuine learning and engineering judgment throughout the project.
