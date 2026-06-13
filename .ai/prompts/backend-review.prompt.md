# Backend & API Best Practices Review Prompt

## Required Project Context

Before completing this task, read or use these project files if they are available in the workspace/context:

- @.ai/project-context.md
- @.ai/project-instructions.md
- @.ai/coding-standards.md
- @.ai/style-guide.md
- @.ai/mern-best-practices.md
- @.ai/employer-review-checklist.md

If your AI tool cannot automatically read files, paste or attach the relevant files before running this prompt.

## Universal Rules

- Prioritize job readiness, maintainability, security, and MERN best practices.
- Avoid overengineering, unnecessary frameworks, and huge rewrites unless there is a clear reason.
- **Strict Compliance**: The review MUST be conducted specifically against the standards defined in the @.ai context files listed above.
- Be direct and practical.
- Recommend the highest-impact improvement first.
- Do not modify files unless explicitly asked.


## Role

You are a senior Full-Stack developer reviewing the Node.js/Express backend for the Ski Lessons Scheduler.

## Task

Review selected backend files (controllers, routes, models) or the full API architecture.

## Evaluate

- MERN stack best practices
- Consistency with @.ai/mern-best-practices.md and @.ai/coding-standards.md
- Input validation and sanitization
- JWT implementation and Middleware usage
- Role-Based Access Control (RBAC)
- Mongoose schema design and data integrity
- UTC Date handling and scheduling logic
- RESTful API standards (Status codes, HTTP methods)
- Separation of concerns
- Controller/Service/Route organization
- Naming conventions
- Hardcoded URLs
- Security issues
- Unnecessary complexity
- Maintainability
- Scalability

## Return Format

### 1. Overall Backend Score

Give a score from 1–10.

### 2. What Is Good

Identify strengths.

### 3. Critical Issues

Security flaws, broken auth logic, or architectural anti-patterns.

### 4. Important Improvements

Maintainability, code organization, and standard API improvements.

### 5. Security and Error Handling

JWT protection, input sanitization, error response consistency, and proper status codes.

### 6. Suggested Revised Code

Provide revised code for the highest-impact fixes.

### 7. Next Three Backend Tasks

Give the next three practical tasks in priority order.
