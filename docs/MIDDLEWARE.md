# Middleware & Request Validation Pipeline

This document describes the middleware architecture and request validation flow.

---

## Request Lifecycle Overview

Every request follows this pipeline:

```
1. Request arrives
    ↓
2. sanitizeRequest (sanitize input data)
    ↓
3. Specific validation middleware (validateRegisterRequest, validateLoginRequest, etc.)
    ↓
4. Authentication middleware (authenticate)
    ↓
5. Authorization middleware (requireAdmin)
    ↓
6. Controller (business logic + response)
    ↓
7. Response sent to client
```

By the time a request reaches the **controller**, it is guaranteed to be:
- ✅ Sanitized (no XSS/NoSQL injection risk)
- ✅ Validated (correct types, required fields present)
- ✅ Authenticated (JWT verified, not blacklisted)
- ✅ Authorized (admin status checked if required)

This guarantee means **services do NOT need to re-validate data**.

---

## Middleware Details

### 1. sanitizeRequest

**File:** `server/src/middleware/sanitize.ts`

**Purpose:** Remove or escape potentially malicious characters from all request properties to prevent NoSQL injection and XSS attacks.

**Applied to:** All requests (global middleware)

**What it sanitizes:**
- `req.body` (JSON body)
- `req.query` (URL query parameters)
- `req.params` (URL path parameters)

**How it works:**
- Removes `$` prefix characters (prevents NoSQL injection: `{ $ne: null }`)
- Recursively processes nested objects and arrays

**Example:**

```javascript
// Before sanitization
req.body = { username: "user$name", password: "pass" }

// After sanitization
req.body = { username: "username", password: "pass" }
```

**Impact:**
- ✅ Prevents queries like `{ username: { $ne: null } }` from being passed as input
- ✅ Safe to use user input in database queries after this middleware

---

### 2. Validation Middleware

**File:** `server/src/middleware/validation.ts`

**Purpose:** Validate request data against business rules before controller execution.

**Applied to:** Specific routes that need validation (see Routes section below)

**Middleware Functions:**

#### validateRegisterRequest

**Applied to:** `POST /auth/register`

**Validates:**
- `username` is a string, 3+ characters
- `password` is a string, 6+ characters
- Sets `admin: false` on the request body

**Rejects:**
- Empty username/password
- Username < 3 chars
- Password < 6 chars

**Example:**

```javascript
// Request body before validation
{ username: "jo", password: "pass" }

// Response (400 Bad Request)
{
  "error": "Validation failed",
  "message": "Username must be at least 3 characters"
}
```

---

#### validateLoginRequest

**Applied to:** `POST /auth/login`

**Validates:**
- `username` is a string (non-empty)
- `password` is a string (non-empty)

**Rejects:**
- Missing username or password
- Empty strings

**Example:**

```javascript
// Request body before validation
{ username: "john_doe" }  // missing password

// Response (400 Bad Request)
{
  "error": "Validation failed",
  "message": "Username and password are required"
}
```

---

#### validateCreateLessonRequest

**Applied to:** `POST /lessons` (with `requireAdmin`)

**Validates:**
- `lessonData` object is present
- `type` is one of: beginner, intermediate, advanced, expert
- `timeLength` is one of: 9-12, 1-4, 9-4
- `date` is a valid YYYY-MM-DD or ISO date string
- `guests` is a positive integer

**Rejects:**
- Missing `lessonData`
- Invalid enum values
- Invalid date format
- Non-numeric guests

**Example:**

```javascript
// Request body
{
  "lessonData": {
    "type": "expert",
    "date": "2025-02-15",
    "timeLength": "9-12",
    "guests": "5"  // Note: string instead of number
  }
}

// Response (201 Created if valid, else 400)
```

---

#### validateUpdateLessonRequest

**Applied to:** `PUT /lessons/:lessonId` (with `requireAdmin`)

**Validates:**
- Same as `validateCreateLessonRequest`
- Ensures updated lesson data is valid before reaching service layer

---

#### validateAssignLessonRequest

**Applied to:** `PATCH /lessons/:lessonId` and `PUT /lessons/:lessonId`

**Validates:**
- `lessonId` in URL is a valid MongoDB ObjectId
- `assignedTo` field is present in body (either null or valid ObjectId)

**Rejects:**
- Invalid ObjectId format
- Missing `assignedTo`

---

### 3. authenticate Middleware

**File:** `server/src/middleware/auth.ts`

**Purpose:** Verify JWT token and attach user info to request.

**Applied to:** All routes requiring authentication

**What it does:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies JWT signature using `JWT_SECRET`
3. Checks if token is in the blacklist (revoked)
4. Attaches user info to `req.user`: `{ userId, username, admin }`

**Rejects:**
- Missing `Authorization` header
- Malformed token
- Invalid signature
- Expired token
- Blacklisted token

**Example:**

```javascript
// Request
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// After middleware (if valid)
req.user = {
  userId: "507f1f77bcf86cd799439011",
  username: "john_doe",
  admin: false
}

// If invalid or blacklisted
// Response (401 Unauthorized)
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Implementation Note:**
- Token expires in 1 hour (set during login)
- Users must log in again after expiration
- Logout blacklists the token to revoke it immediately

---

### 4. requireAdmin Middleware

**File:** `server/src/middleware/auth.ts`

**Purpose:** Ensure authenticated user has admin privileges.

**Applied to:** Admin-only endpoints

**What it does:**
1. Checks if `req.user.admin === true`
2. Calls next() if true
3. Rejects with 403 if false

**Prerequisites:**
- Must run AFTER `authenticate` middleware
- `req.user` must be populated

**Rejects:**
- User is not admin

**Example:**

```javascript
// User is authenticated but not admin
// Response (403 Forbidden)
{
  "error": "Unauthorized",
  "message": "Admin access required"
}
```

---

## Route Configuration

All routes in `server/src/routes/index.ts` are configured with the appropriate middleware:

```typescript
// Public routes (no middleware)
router.post("/auth/register", validateRegisterRequest, controllers.manageNewUser);
router.post("/auth/login", validateLoginRequest, controllers.manageLogin);

// Authenticated routes (authenticate only)
router.post("/auth/logout", authenticate, controllers.manageLogout);
router.get("/users/me", authenticate, controllers.decodeUser);
router.delete("/users/me", authenticate, controllers.selfDeleteAccount);
router.get("/lessons", authenticate, controllers.manageLessonRetrieval);
router.patch("/lessons/:lessonId", authenticate, validateAssignLessonRequest, controllers.manageSwitchLessonAssignment);

// Admin-only routes (authenticate + requireAdmin)
router.post("/lessons", authenticate, requireAdmin, validateCreateLessonRequest, controllers.manageCreateLesson);
router.put("/lessons/:lessonId", authenticate, requireAdmin, validateAssignLessonRequest, validateUpdateLessonRequest, controllers.manageUpdateLesson);
router.delete("/lessons/:lessonId", authenticate, requireAdmin, controllers.manageRemoveLesson);
router.get("/users", authenticate, requireAdmin, controllers.manageUserRetrieval);
router.get("/users/:userId", authenticate, requireAdmin, manageUserDetail);
```

---

## Error Handling

### Validation Failure

When validation middleware rejects a request:

```javascript
// Response: 400 Bad Request
{
  "error": "Validation failed",
  "message": "Username must be at least 3 characters",
  "path": "/api/auth/register"
}
```

### Authentication Failure

When `authenticate` middleware rejects a request:

```javascript
// Response: 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "path": "/api/lessons"
}
```

### Authorization Failure

When `requireAdmin` middleware rejects a request:

```javascript
// Response: 403 Forbidden
{
  "error": "Unauthorized",
  "message": "Admin access required",
  "path": "/api/lessons"
}
```

### Global Error Handler

If an unhandled error occurs in the controller, the global error handler catches it:

```typescript
// server/src/index.ts
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});
```

---

## Service Layer Trust Model

Because middleware guarantees data quality, **services trust their inputs**:

```typescript
// server/src/services/auth.ts
export async function loginUser(username: string, password: string): Promise<string> {
  // Don't re-validate username/password (middleware already did)
  // Don't check if username is a string (middleware already did)
  
  const user = await UserModel.findOne({ username });
  
  // Proceed with business logic
  if (!user) {
    throw new Error("User not found");
  }
  
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid password");
  }
  
  return createJWT(user);
}
```

**Benefits:**
- ✅ Simpler, cleaner service code
- ✅ No redundant validation
- ✅ Consistent error messages (validated in middleware)
- ✅ Better performance (single validation pass)

---

## Adding New Middleware

### Step 1: Create the middleware function

```typescript
// server/src/middleware/new-middleware.ts
import type { NextFunction, Request, Response } from "express";

export function myNewMiddleware(req: Request, res: Response, next: NextFunction) {
  // Your validation or logic here
  
  if (invalid) {
    return res.status(400).json({ error: "Something is wrong" });
  }
  
  // Attach data to request if needed
  req.customData = "value";
  
  next();  // Continue to next middleware/controller
}
```

### Step 2: Add to router

```typescript
// server/src/routes/index.ts
router.post("/some-endpoint", myNewMiddleware, authenticate, controller.handler);
```

### Step 3: Test

Run `npm test` to ensure the middleware works with existing tests.

---

## Best Practices

1. **Order matters:** Sanitize → Validate → Authenticate → Authorize → Controller
2. **Don't re-validate in services:** Trust that middleware did its job
3. **Clear error messages:** Validation errors should be specific (e.g., "Username < 3 chars" not "Invalid input")
4. **Use consistent status codes:** 400 for validation, 401 for auth, 403 for authorization
5. **Log failures:** Middleware should log rejected requests (already done in error handler)
6. **Test middleware separately:** Write unit tests for each middleware function

---

## Testing Middleware

Example test:

```typescript
// server/src/middleware/__tests__/validation.test.ts
import { describe, it, expect } from "vitest";
import { validateRegisterRequest } from "../validation";

describe("validateRegisterRequest", () => {
  it("should reject username < 3 chars", () => {
    const req = { body: { username: "ab", password: "password123" } };
    const res = { status: () => ({ json: (data) => ({ ...data }) }) };
    const next = () => {};
    
    validateRegisterRequest(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
```

---

## Debugging Middleware Issues

### Token not recognized

Check:
1. Token format: `Authorization: Bearer <token>` (space required)
2. Token expiration: Has it been 1 hour since login?
3. Token revocation: Did the user log out? (check `BlacklistedToken` collection)

### Validation always failing

Check:
1. Request Content-Type is `application/json`
2. Fields match expected names (case-sensitive)
3. Data types are correct (string, number, not string "5" for number)

### Middleware not executing

Check:
1. Middleware is added to the router
2. Middleware is added BEFORE the controller handler
3. Middleware calls `next()` (or returns error response)

---

## Performance Notes

- Sanitization: O(n) where n = request body size (minimal overhead)
- Validation: O(1) for simple checks, O(n) for complex lookups
- Authentication: 1 JWT verification + 1 database query (blacklist check)
- Authorization: O(1) boolean check

For high-traffic applications, consider:
- Caching blacklisted tokens in-memory (Redis)
- Reducing validation field count per endpoint
- Batch token revocation cleanup
