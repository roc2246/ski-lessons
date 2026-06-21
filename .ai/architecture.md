# Architecture

## System Overview

Ski Lessons Scheduler is a full-stack MERN application with a React/Vite frontend and a Node/Express/Mongo backend.

- Frontend responsibilities: UI rendering, route navigation, calendar interactions, token storage.
- Backend responsibilities: authentication, RBAC, validation, business logic, data persistence.

## Runtime Architecture

### Frontend (`client/`)

- `src/pages/`: route-level screens (login, register, admin home, instructor, lesson board).
- `src/components/`: reusable UI components.
- `src/components/calendar-dir/`: calendar display and day/date rendering modules.
- `src/utils/`: API wrappers and calendar/business helpers.
- `src/scss/` and `src/styles/`: global and component styling.

### Backend (`server/`)

- `routes/`: endpoint declarations and middleware composition.
- `middleware/`: auth (`authenticate`, `requireAdmin`) and input validation.
- `controllers/`: HTTP request/response orchestration.
- `models/`: database operations and business constraints.
- `utilities/`: shared validation, schema definitions, error shaping, model helpers.
- `scripts/`: one-off operational scripts (data migration).

## Request Lifecycle

1. Route match in `server/routes/index.js`.
2. Middleware chain executes:
	- Auth and token revocation check where required.
	- Role check for admin-only actions.
	- Request payload validation.
3. Controller handles endpoint-level workflow.
4. Model layer performs Mongoose operations.
5. JSON response returned to frontend.

## Security Architecture

- Stateless JWT auth via `Authorization: Bearer <token>`.
- Persistent token revocation with `BlacklistedToken` collection and TTL expiration.
- Role-based authorization using `requireAdmin` middleware.
- Route-level request validation before business logic execution.

## Data Architecture

### User
- `username` (unique, indexed)
- `password` (hashed)
- `admin` (boolean)

### Lesson
- `type`
- `date` (UTC `Date`)
- `timeLength`
- `guests`
- `assignedTo` (`ObjectId` reference or `null`)

### BlacklistedToken
- `token` (unique)
- `expiresAt` (TTL)

## Operational Notes

- Production serves frontend build from backend `server/index.js`.
- Legacy data migration script: `server/scripts/migrate-lessons.js`.
- Keep API contracts and README synchronized whenever routes, middleware, or schemas change.