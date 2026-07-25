# Ski Lessons Scheduler

Full-stack MERN application for managing ski lesson bookings with role-based access for admins and instructors.

## Features

- JWT authentication with server-side token revocation support.
- Role-based access control for admin-only operations.
- Lesson calendar views for available lessons and assigned lessons.
- Admin lesson creation flow with input validation.
- MongoDB data model with indexed lesson/user collections.
- Migration tooling for legacy lesson data (`date` and `assignedTo` normalization).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express, Nodemon |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens (JWT) |
| Styling | SCSS + CSS modules/partials |
| Testing | Vitest |

## Repository Structure

```text
client/
  src/
    components/
    pages/
    utils/
    scss/

server/
  controllers/
  middleware/
  models/
  routes/
  utilities/
  scripts/
  email/
```

## Quick Start

### Prerequisites

- Node.js 22.x (matches `engines.node`)
- npm
- MongoDB instance

### Install

```bash
# from project root
npm install

cd server
npm install

cd ../client
npm install
```

### Environment Variables

Create `server/config/.env` with:

```env
PORT=2000
URI=mongodb://localhost:27017/
JWT_SECRET=your_jwt_secret
APP_PASSWORD=your_email_app_password
SMTP_USER=you@example.com
NODE_ENV=development
```

### Run Development Servers

Terminal 1 (backend):

```bash
cd server
npm run dev
```

Terminal 2 (frontend):

```bash
cd client
npm run dev
```

Frontend runs on Vite default (`http://localhost:5173`) and calls backend API routes mounted at `/api`.

## Scripts

Root (`package.json`):

- `npm run build` builds client
- `npm run test` runs Vitest
- `npm run start` starts `server/index.js`

Server (`server/package.json`):

- `npm run dev` starts nodemon
- `npm run start` starts node server
- `npm run test` runs server Vitest tests
- `npm run migrate:lessons` migrates legacy lesson records

Client (`client/package.json`):

- `npm run dev` starts Vite
- `npm run build` creates production build
- `npm run test` runs client Vitest tests

## API Overview

All endpoints are mounted under `/api`.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a user (server always stores `admin: false`) |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/auth/logout` | Authenticated | Revoke current token |
| GET | `/api/users/me` | Authenticated | Return current decoded user credentials |
| DELETE | `/api/users/me` | Authenticated | Delete current user and unassign their lessons |
| GET | `/api/lessons` | Authenticated | Retrieve lessons (see lesson query behavior below) |
| POST | `/api/lessons` | Admin | Create lesson |
| PATCH | `/api/lessons/:lessonId` | Authenticated | Assign lesson to current user |
| DELETE | `/api/lessons/:lessonId` | Admin | Remove lesson |
| GET | `/api/users` | Admin | Retrieve all users (without passwords) |
| GET | `/api/users/:userId` | Admin | Retrieve one user by id |

### Lesson Query Behavior

`GET /api/lessons` supports `assignedTo` query modes:

- `assignedTo=None`: only unassigned lessons
- `assignedTo=all`: all lessons
- `assignedTo=<userId>`: lessons for a specific user id
- no `assignedTo`: lessons for the authenticated user (`req.user.userId`)

### Validation Rules

Auth payloads:

- register: `username` minimum 3 chars, `password` minimum 6 chars
- login: `username` and `password` are required

Create lesson payload (`lessonData`):

- `type`: `beginner | intermediate | advanced | expert`
- `timeLength`: `9-12 | 1-4 | 9-4`
- `date`: must be a parseable date string
- `guests`: integer from 1 to 12
- `assignedTo`: `null`, empty string, or valid 24-char Mongo ObjectId

Assign lesson payload:

- `lessonId` route param must be a valid 24-char Mongo ObjectId

## Auth and RBAC

- Protected routes require `Authorization: Bearer <token>`.
- Middleware verifies JWT and checks blacklist revocation status.
- Expired tokens return `401 Unauthorized: Token expired`.
- Invalid or malformed tokens return `401 Unauthorized: Invalid token`.
- `requireAdmin` middleware gates admin-only endpoints.
- Logout persists revoked tokens in `BlacklistedToken` with TTL expiration.

### Client Behavior on Expired Token

- On startup, expired tokens are removed from local storage.
- If protected requests return `401`, the client clears the token and resets auth state.

## Data Model (Current)

### User

- `username: String` (unique, indexed)
- `password: String` (hashed)
- `admin: Boolean`
- timestamps (`createdAt`, `updatedAt`)

### Lesson

- `type: String`
- `date: Date` (UTC)
- `timeLength: String`
- `guests: Number`
- `assignedTo: ObjectId | null` (ref `User`)
- timestamps (`createdAt`, `updatedAt`)

### BlacklistedToken

- `token: String` (unique)
- `expiresAt: Date` (TTL index)

## Migration

If you have legacy lessons with string dates or `assignedTo: "None"`, run:

```bash
cd server
npm run migrate:lessons
```

This script converts:

- `date` string -> `Date`
- `assignedTo: "None"` -> `null`
- `assignedTo` ObjectId-like string -> `ObjectId`

## Architecture Flow

Request lifecycle:

1. Route selection in `server/routes/index.js`
2. Middleware execution (`authenticate`, `requireAdmin`, request validation)
3. Controller orchestration (`server/controllers/*.js`)
4. Model/data access (`server/models/*.js`)
5. Utility and schema support (`server/utilities/*.js`)

Frontend/back-end split:

- `client/` handles pages, components, calendar rendering, and user interaction.
- `server/` handles auth, RBAC, validation, persistence, and API responses.

## Screenshots

![Login](screenshots/login.png)
![Create Lesson](screenshots/create-lesson.png)
![Instructor Calendar](screenshots/instructor-calendar.png)

## License

MIT

