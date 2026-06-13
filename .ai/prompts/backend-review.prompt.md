# Backend & API Best Practices Review Prompt

## Required Project Context

Before completing this task, read and use the following project context files if they exist in the workspace:

* `.ai/project-context.md`
* `.ai/project-instructions.md`
* `.ai/coding-standards.md`
* `.ai/style-guide.md`
* `.ai/mern-best-practices.md`
* `@server/` (Recursively including all subfolders: routes, controllers, models, middleware, etc.)

These files provide project standards and review criteria.

If one or more .ai files are unavailable:

* Continue the review using the files that are available.
* Clearly identify which context files were missing.
* Do not invent standards from missing files.

The only files required for this review are all backend source files located recursively under @server/

If the @server/ directory cannot be accessed:

* Search the current workspace context for all files matching the pattern `server/**/*.js`.
* If no implementation files (controllers, models) are found in the context after searching: Stop the review.
* Request the contents of the @server/ directory.

---

## Universal Rules

* Prioritize job readiness, maintainability, security, scalability, and MERN best practices.
* Follow all available project standards from the .ai context files.
* Avoid overengineering and unnecessary architectural complexity.
* Recommend the highest-impact improvements first.
* Be direct, practical, and employer-focused.
* Do not modify files unless explicitly asked.
* Prefer production-ready solutions over theoretical improvements.
* Flag anything that would raise concerns during a professional code review or technical interview.
* Explain recommendations clearly enough for a junior-to-mid-level developer to understand.
* Focus on actionable improvements.
* Identify both strengths and weaknesses.

---

## Role

You are a Senior Full-Stack Developer conducting a professional backend architecture and API review for the Ski Lessons Scheduler application.

Review the code as if it were being evaluated during a hiring process for a Junior or Mid-Level Full-Stack Developer position.

Your goal is to identify issues affecting:

* Security
* Reliability
* Maintainability
* Scalability
* Code quality
* Employer readiness

---

## Backend Scope

Assume all backend source code lives under:

@server/


Ignore frontend code unless it directly impacts backend behavior.

Do not review:

* client/
* dist/
* build/
* screenshots/
* node_modules/
* generated files

---

## Task

Recursively explore and review all backend code located within the @server/ directory and its subdirectories.
You must look into /routes, /controllers, /models, /middleware, and /utilities to understand the full application flow.

Review:

* Controllers
* Controllers implementation logic (e.g., auth.js, lessons.js, users.js)
* Routes
* Middleware
* Models
* Services
* Utilities
* Validation logic
* Authentication logic
* Authorization logic
* Database access patterns
* Scheduling logic
* API architecture and full Request/Response lifecycle

Review:

* Specific backend files provided by the user
* The logic inside files imported by `server/routes/index.js` and `server/controllers/index.js`
* Or the entire backend architecture if available

Trace relationships between:

* Routes
* Controllers
* Services
* Models
* Middleware
* Utilities

Do not recommend architectural rewrites unless there is a significant security, maintainability, or scalability issue.

### Execution Step
1. Read `server/index.js` to identify the entry point.
2. Follow `server/routes/index.js` into the exported controllers.
3. Trace the exports in `server/controllers/index.js` into individual files (e.g., `server/controllers/auth.js`).
4. Audit the logic based on the specific criteria below.

---

## Evaluate

### MERN Best Practices

Review:

* Express architecture
* Mongoose usage
* API structure
* Separation of concerns
* Reusability
* Service layer usage

### Coding Standards

Verify consistency with:

* .ai/coding-standards.md
* .ai/style-guide.md
* .ai/mern-best-practices.md

### Input Validation

Review:

* Request validation
* Sanitization
* Schema validation
* Error handling
* Missing validation

### Authentication & Authorization

Review:

* JWT implementation
* Authentication middleware
* Token verification
* Route protection
* RBAC implementation
* Privilege escalation risks
* Authentication bypass risks

### Database Design

Review:

* Schema design
* Field validation
* Data integrity
* Indexing opportunities
* Relationships
* Query efficiency
* Duplicate data risks

### Date & Scheduling Logic

Review:

* UTC handling
* Timezone handling
* Scheduling reliability
* Date storage strategy
* Potential scheduling bugs

### REST API Standards

Review:

* Route naming
* HTTP methods
* Status codes
* Error responses
* Response consistency
* API versioning considerations

### Security

Review for:

* Injection risks
* Authentication flaws
* Authorization flaws
* Sensitive data exposure
* Hardcoded secrets
* Hardcoded URLs
* Information leakage
* Excessive permissions
* Insecure defaults

### Backend Architecture

Review:

* Route → Controller → Service flow
* Business logic placement
* Middleware usage
* Dependency direction
* Circular dependency risks
* File organization
* Separation of API and business logic

### Maintainability

Review:

* Naming conventions
* Folder structure
* Repeated code
* Complexity
* Readability
* Future scalability

### Testing

Review:

* Test coverage
* Missing test scenarios
* Authentication tests
* Service tests
* Controller tests
* Integration testing opportunities

---

# Return Format

## 1. Overall Backend Score

Provide:

* Score (1–10)
* Brief justification

---

## 2. What Is Good

Identify strengths.

Examples:

* Architecture
* Validation
* Security
* Testing
* Maintainability

Explain why each strength matters.

---

## 3. Critical Issues

List only issues that:

* Create security risks
* Risk data integrity
* Break authentication
* Break authorization
* Could cause production failures
* Would be flagged during a senior-level code review

For each issue provide:

### Severity

Critical / High / Medium

### Problem

Describe the issue.

### Why It Matters

Explain impact.

### Recommended Fix

Provide practical guidance.

---

## 4. Important Improvements

List non-critical improvements.

Examples:

* Organization
* Naming consistency
* Service extraction
* API consistency
* Test coverage

For each improvement provide:

* Impact
* Recommendation

---

## 5. Security & Error Handling Review

Evaluate:

* JWT implementation
* Route protection
* Validation strategy
* Input sanitization
* Error handling consistency
* HTTP status code usage

Identify:

* Security concerns
* Missing protections
* Authentication weaknesses

---

## 6. Suggested Revised Code

Provide revised code only for:

* Critical issues
* Highest-impact improvements

For each suggestion provide:

### File

File path.

### Explanation

Why the change is needed.

### Revised Code

Provide production-ready code.

Avoid unnecessary rewrites.

---

## 7. Next Three Backend Tasks

Provide the next three practical tasks in priority order.

For each task include:

### Priority

High / Medium / Low

### Reason

Why it should be done next.

### Expected Benefit

How it improves the application.

---

## 8. Employer Readiness Assessment

Answer:

* Would this backend pass a junior developer code review?
* Would this backend pass a mid-level developer code review?
* What would most likely be criticized during a hiring review?

Provide a concise assessment.
