# API Endpoints Reference

The ski-lessons API is RESTful and uses JWT-based authentication. All responses are JSON.

## Base URL

```
http://localhost:2000/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require:

```
Authorization: Bearer <jwt_token>
```

Requests without a valid token receive `401 Unauthorized`.

---

## Status Codes Reference

| Code | Meaning | Common Cause |
|------|---------|-------------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Missing fields, validation failure, invalid data type |
| `401` | Unauthorized | Missing/invalid/expired token, or token is blacklisted |
| `403` | Forbidden | Authenticated but not authorized (e.g., non-admin accessing admin endpoint) |
| `409` | Conflict | Duplicate username, lesson time window conflict, or schedule overlap |
| `500` | Server Error | Unhandled exception |
| `503` | Service Unavailable | Database offline |

---

## Authentication Endpoints

### POST /auth/register

Registers a new user.

**Request:**

```json
{
  "username": "string (3+ chars, alphanumeric/underscore)",
  "password": "string (6+ chars)"
}
```

**Response:**

- **201 Created**: `{ message: "USERNAME registered" }`
- **400 Bad Request**: 
  - Username < 3 chars or empty
  - Password < 6 chars or empty
  - Invalid characters
- **409 Conflict**: Username already exists in database

**Rate Limit:** 20 requests per 15 minutes

**Notes:**
- Passwords are hashed with bcrypt (salt rounds: 12)
- All new users are created with `admin: false`
- Username must be unique; attempt to register existing username fails

---

### POST /auth/login

Authenticates user and returns JWT.

**Request:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

- **200 OK**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **400 Bad Request**: Username or password missing
- **401 Unauthorized**: Wrong password or username doesn't exist

**Rate Limit:** 20 requests per 15 minutes

**Token Details:**
- JWT expires in 1 hour
- Tokens are signed with `JWT_SECRET` from environment
- Store token in localStorage on client: `localStorage.setItem("token", token)`

---

### POST /auth/logout

Revokes the current JWT token (adds to blacklist).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

- **200 OK**: `{ message: "Successfully logged out" }`
- **401 Unauthorized**: Invalid or expired token
- **503 Service Unavailable**: Database offline (cannot write to blacklist)

**Notes:**
- Token is added to the `BlacklistedToken` collection
- Attempting to use a blacklisted token on any subsequent request fails with `401 Unauthorized`

---

## User Endpoints

### GET /users/me

Retrieve current user's credentials.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

- **200 OK**:
  ```json
  {
    "message": "Retrieved credentials for USERNAME",
    "credentials": {
      "userId": "ObjectId",
      "username": "string",
      "admin": "boolean"
    }
  }
  ```
- **401 Unauthorized**: Invalid or expired token
- **503 Service Unavailable**: Database offline

---

### DELETE /users/me

Deletes current user and unassigns all their lessons.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

- **200 OK**: `{ message: "User \"USERNAME\" deleted successfully" }`
- **401 Unauthorized**: Invalid or expired token
- **500 Server Error**: Database write failure
- **503 Service Unavailable**: Database offline

**Notes:**
- This is a cascading delete: user record is deleted AND all lessons assigned to the user are unassigned
- After deletion, the user's token becomes invalid

---

### GET /users (admin only)

Retrieve all users (paginated).

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Number of records to return (default: 50)

**Response:**

- **200 OK**:
  ```json
  {
    "message": "Users retrieved successfully",
    "users": [
      { "userId": "ObjectId", "username": "string", "admin": "boolean" },
      ...
    ]
  }
  ```
- **401 Unauthorized**: Invalid token
- **403 Forbidden**: User is not admin
- **503 Service Unavailable**: Database offline

---

### GET /users/:userId (admin only)

Retrieve details for a specific user.

**Headers:**

```
Authorization: Bearer <token>
```

**Path Parameters:**

- `userId`: Valid MongoDB ObjectId

**Response:**

- **200 OK**:
  ```json
  {
    "userId": "ObjectId",
    "username": "string",
    "admin": "boolean"
  }
  ```
- **400 Bad Request**: Invalid ObjectId format
- **401 Unauthorized**: Invalid token
- **403 Forbidden**: User is not admin
- **404 Not Found**: User doesn't exist
- **503 Service Unavailable**: Database offline

---

## Lesson Endpoints

### GET /lessons

Retrieve lessons with optional filtering.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `assignedTo` (optional): Filter by assigned user
  - Omit or leave empty: all lessons (assigned and unassigned)
  - `"null"` or empty string: only unassigned lessons
  - `ObjectId` (user ID): only lessons assigned to that user

**Response:**

- **200 OK**:
  ```json
  {
    "lessons": [
      {
        "_id": "ObjectId",
        "type": "beginner|intermediate|advanced|expert",
        "date": "YYYY-MM-DD",
        "timeLength": "9-12|1-4|9-4",
        "guests": "number (1-12)",
        "assignedTo": null | "ObjectId"
      },
      ...
    ]
  }
  ```
- **401 Unauthorized**: Invalid or expired token
- **503 Service Unavailable**: Database offline

**Notes:**
- Lessons are sorted by date ascending
- `assignedTo: null` means the lesson is unassigned

---

### POST /lessons (admin only)

Create a new lesson.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "lessonData": {
    "type": "beginner|intermediate|advanced|expert",
    "date": "YYYY-MM-DD",
    "timeLength": "9-12|1-4|9-4",
    "guests": "number (1-12)",
    "assignedTo": null
  }
}
```

**Response:**

- **201 Created**:
  ```json
  {
    "message": "Lesson created",
    "lesson": {
      "_id": "ObjectId",
      "type": "string",
      "date": "YYYY-MM-DD",
      "timeLength": "string",
      "guests": "number",
      "assignedTo": null,
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp"
    }
  }
  ```
- **400 Bad Request**:
  - Missing `lessonData` or required fields
  - Invalid enum values (`type`, `timeLength`)
  - Invalid date format
  - `guests` not a number
- **401 Unauthorized**: Invalid token
- **403 Forbidden**: User is not admin
- **409 Conflict**: Duplicate lesson (same date, type, timeLength already exists)
- **503 Service Unavailable**: Database offline

**Validation:**
- `type`: Must be one of: `beginner`, `intermediate`, `advanced`, `expert`
- `timeLength`: Must be one of: `9-12`, `1-4`, `9-4`
- `date`: Valid YYYY-MM-DD format
- `guests`: Integer between 1 and 12

---

### PUT /lessons/:lessonId (admin only)

Update an existing lesson (change type, date, timeLength, or guests).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**

- `lessonId`: Valid MongoDB ObjectId

**Request:**

```json
{
  "lessonData": {
    "type": "beginner|intermediate|advanced|expert",
    "date": "YYYY-MM-DD",
    "timeLength": "9-12|1-4|9-4",
    "guests": "number (1-12)",
    "assignedTo": null | "ObjectId"
  }
}
```

**Response:**

- **200 OK**:
  ```json
  {
    "message": "Lesson updated",
    "updatedLesson": { ...lesson object }
  }
  ```
- **400 Bad Request**: Invalid validation, invalid ObjectId
- **401 Unauthorized**: Invalid token
- **403 Forbidden**: User is not admin
- **404 Not Found**: Lesson doesn't exist
- **409 Conflict**: Update would create duplicate or time window conflict
- **503 Service Unavailable**: Database offline

**Notes:**
- Cannot unassign a lesson via PUT; use PATCH instead
- If `assignedTo` is included, it must match the existing value
- `assignedTo` defaults to `null` (unassigned)

---

### PATCH /lessons/:lessonId

Assign an unassigned lesson to the current user (or unassign if admin).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**

- `lessonId`: Valid MongoDB ObjectId

**Request (instructor):**

```json
{
  "assignedTo": "userId"
}
```

**Request (admin, to unassign):**

```json
{
  "assignedTo": null
}
```

**Response:**

- **200 OK**:
  ```json
  {
    "message": "Lesson assigned",
    "updatedLesson": { ...lesson object }
  }
  ```
- **400 Bad Request**: Invalid ObjectId or missing `assignedTo`
- **401 Unauthorized**: Invalid token
- **403 Forbidden**: User attempts to assign to another user (non-admin)
- **404 Not Found**: Lesson doesn't exist
- **409 Conflict**: User already has a lesson at overlapping time on that date
- **503 Service Unavailable**: Database offline

**Notes:**
- Instructors can only assign to themselves
- Admins can assign to any user or unassign (set to null)
- Conflict detection prevents double-booking on same date/time window

---

### DELETE /lessons/:lessonId (admin only)

Delete a lesson.

**Headers:**

```
Authorization: Bearer <token>
```

**Path Parameters:**

- `lessonId`: Valid MongoDB ObjectId

**Response:**

- **200 OK**: `{ message: "Lesson deleted" }`
- **400 Bad Request**: Invalid ObjectId
- **401 Unauthorized**: Invalid token
- **403 Forbidden**: User is not admin
- **404 Not Found**: Lesson doesn't exist
- **503 Service Unavailable**: Database offline

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "short error name",
  "message": "Detailed error message",
  "path": "/api/endpoint"
}
```

**Example:**

```json
{
  "error": "Validation failed",
  "message": "Username must be at least 3 characters",
  "path": "/api/auth/register"
}
```

---

## Rate Limiting

- **`/api/auth/login`**: 20 requests per 15 minutes
- **`/api/auth/register`**: 20 requests per 15 minutes
- All other endpoints: No limit (but respects token expiration)

---

## Example Workflow

### 1. Register

```bash
curl -X POST http://localhost:2000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "mypassword123"}'
```

### 2. Login

```bash
curl -X POST http://localhost:2000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "mypassword123"}'
```

Response contains `token`. Store it.

### 3. Fetch Lessons

```bash
curl -X GET http://localhost:2000/api/lessons \
  -H "Authorization: Bearer <token>"
```

### 4. Assign Lesson

```bash
curl -X PATCH http://localhost:2000/api/lessons/<lessonId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"assignedTo": "<userId>"}'
```

### 5. Logout

```bash
curl -X POST http://localhost:2000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

---

## Testing the API

Use Postman, Thunder Client, or curl to test endpoints. Example `.env` for local testing:

```env
PORT=2000
URI=mongodb://localhost:27017/
JWT_SECRET=test_secret_key_12345
NODE_ENV=development
```

Then start the server and use the examples above.
