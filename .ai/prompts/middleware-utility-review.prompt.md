# Express Middleware & Utility Review

## Required Project Context

Before reviewing the code, use the standards and requirements defined in:

- @.ai/project-context.md
- @.ai/coding-standards.md
- @.ai/style-guide.md
- @.ai/mern-best-practices.md
- @.ai/employer-review-checklist.md

---

## Context

Review the provided Express middleware or global utility logic for the Ski Lessons Scheduler.

The code may contain:

- Authentication/JWT verification
- Error handling middleware
- Security functionality (e.g., Helmet, Rate Limiting)
- API integrations
- Utility functions (e.g., Date helpers, validation wrappers)
- CORS configurations
- Database connection management

## Task

Review this middleware or utility logic as a senior Full-Stack developer focused on security and scheduling integrity.

Evaluate:

- Architecture
- Separation of concerns
- Maintainability
- Security
- Scalability
- Middleware chain flow (next() usage and error propagation)
- Role-Based Access Control (RBAC) implementation
- Error handling consistency
- Performance
- Agency readiness

## Return Format

1. Overall Score (1-10)
2. What Is Good
3. Major Concerns
4. Security Concerns
5. Architecture Concerns
6. Performance Concerns
7. Suggested Refactoring
8. Agency Readiness

Review for:

- Sanitization
- Validation
- JWT verification
- Reusability
- Long-term maintainability

Prioritize:

1. Maintainability
2. Security
3. Reliability
4. Simplicity
5. Reusability

Flag anything that would become difficult to maintain over time.

Do not recommend enterprise architecture unless justified.