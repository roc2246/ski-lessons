# documentation-review-and-update.prompt.md

## Required Project Context

Before completing this task, use:

* .ai/project-context.md
* .ai/project-instructions.md
* .ai/coding-standards.md
* .ai/style-guide.md
* .ai/mern-best-practices.md
* .ai/employer-review-checklist.md

Prioritize project standards over generic recommendations.

---

# Documentation Review and Update

## Context

This is a professional portfolio project intended to demonstrate readiness for:

* Junior Web Developer roles
* Front-End Developer roles
* Full-Stack Developer roles
* Agency overflow work
* Freelance web development work

Documentation should help another developer quickly understand:

* What the project does
* How it is structured
* How it is maintained
* Why architectural decisions were made

Documentation should be practical, concise, and maintainable.

---

## Task

Review all provided files and determine whether documentation should be:

* Added
* Updated
* Refactored
* Expanded
* Simplified

Review:

* README files
* JSDoc comments
* Function documentation
* Component documentation
* API documentation (REST endpoints, Request/Response schemas)
* SCSS documentation
* Architecture documentation
* Installation instructions
* Setup instructions

---

## Evaluate

### Project Documentation

Check whether documentation clearly explains:

* Project purpose
* Features
* Technology stack
* Installation
* Client (React) / Server (Express) directory structure
* API endpoints
* Development workflow

---

### Code Documentation

Check for:

* Missing comments for complex logic
* Inaccurate comments
* Outdated comments
* Unnecessary comments
* Poorly explained functions
* Poorly explained business logic

---

### Employer Readiness

Determine whether documentation would help:

* A hiring manager
* A full-stack development team
* A freelance client
* Another developer maintaining the project

---

## Return Format

### 1. Documentation Score (1-10)

### 2. What Is Already Well Documented

### 3. Missing Documentation

For each item provide:

* What is missing
* Why it matters
* Priority (High / Medium / Low)

### 4. Outdated Documentation

Identify anything that no longer matches the code.

### 5. Suggested Documentation Updates

Provide revised documentation where appropriate.

### 6. README Improvements

Identify improvements that would make the project more employer-ready.

### 7. Architecture Documentation Improvements

Identify anything that should be documented about:

* Frontend (React/Vite) vs Backend (Node/Express) structure
* Components
* API/Controllers
* Middleware logic (Auth, Validation, UTC Date handling)
* SCSS architecture
* Build process

### 8. Employer Impression

Would the current documentation make this project appear:

* Professional
* Maintainable
* Agency-ready

Explain why.

### 9. Highest Impact Documentation Improvement

If only one documentation task could be completed, what should it be and why?

---

## Documentation Rules

Prefer:

* Clear language
* Concise explanations
* Practical examples
* Accurate documentation
* Maintainable documentation

Avoid:

* Commenting obvious code
* Repeating code in comments
* Excessive documentation
* Documentation that becomes difficult to maintain

Focus on documentation that improves maintainability, onboarding, and employer perception.

---

## Git Commit Message

If documentation changes are recommended, always provide:

Git commit message: [message]
