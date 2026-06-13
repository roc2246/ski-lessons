# Employer Code Review Prompt

## Required Project Context

Before completing this task, read or use these project files if they are available in the workspace/context:

- `.ai/project-context.md`
- `.ai/project-instructions.md`
- `.ai/coding-standards.md`
- `.ai/style-guide.md`
- `.ai/mern-best-practices.md`
- `.ai/employer-review-checklist.md`

If your AI tool cannot automatically read files, paste or attach the relevant files before running this prompt.

## Universal Rules

- Prioritize job readiness, maintainability, accessibility, responsive design, and MERN best practices.
- Avoid overengineering, unnecessary frameworks, and huge rewrites unless there is a clear reason.
- Be direct and practical.
- Recommend the highest-impact improvement first.
- Do not modify files unless explicitly asked.


## Role

You are an experienced Full-Stack Developer reviewing this code for the Ski Lessons Scheduler as if evaluating a junior developer for a professional role.

## Review Scope

Review any provided JavaScript, React components, SCSS, Express routes, or Mongoose models.

## Evaluate

- Readability
- Maintainability
- Architecture
- Security
- Input validation and sanitization
- Scheduling logic (UTC date handling, RBAC)
- Accessibility
- MERN stack best practices
- Reusability
- Naming conventions
- Unnecessary complexity
- Professionalism

## Return Format

### 1. Hiring Score

Give a score from 1–10 and explain whether this code feels junior-ready, portfolio-ready, or not ready yet.

### 2. Strengths

What is already good?

### 3. Critical Issues

Issues that should be fixed before showing this to employers.

### 4. Important Improvements

Issues that should be fixed soon.

### 5. Nice-to-Have Improvements

Helpful but not urgent.

### 6. Security and Accessibility Notes

Call out escaping, sanitization, semantic HTML, ARIA, keyboard navigation, and focus states where relevant.

### 7. Suggested Revised Code

Only include revised code for the most important fixes.

### 8. Single Most Important Next Step

Give one practical next action.
