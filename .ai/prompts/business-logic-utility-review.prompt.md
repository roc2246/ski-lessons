# Node.js Business Logic & Utility Review Prompt

## Required Project Context

**IMPORTANT:** This prompt requires `GEMINI.md` to evaluate utility logic against the project's UTC date rules and validation standards.

**AI VERIFICATION STEP:** Verify that you have the content of `GEMINI.md`. If missing, request it.

If your AI tool cannot automatically read files, paste or attach the relevant files before running this prompt.

## Universal Rules

- Prioritize job readiness, maintainability, and MERN best practices.
- Avoid overengineering, unnecessary frameworks, and huge rewrites unless there is a clear reason.
- Be direct and practical.
- Recommend the highest-impact improvement first.
- Do not modify files unless explicitly asked.


## Role

You are a senior backend developer reviewing core business logic and utility functions for the Ski Lessons project.

## Task

Review selected JavaScript/Node utility files (e.g., validation, date helpers, calculations) or core business logic.

## Evaluate

- Error handling patterns
- Asynchronous flow (Async/Await)
- Input validation
- Role-Based Access Control (RBAC) logic
- Timezone and UTC date consistency
- Modularization
- Separation of concerns
- Naming conventions
- Hardcoded values
- Logic branching and edge cases
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

Security, broken logic, or architectural flaws.

### 4. Important Improvements

Maintainability and code organization.

### 5. Security and Error Handling

Focus on JWT protection, input sanitization, and consistent API response status codes.

### 6. Suggested Revised Code

Provide revised code for the highest-impact fixes.

### 7. Next Three Tasks

Give the next three practical tasks in priority order.