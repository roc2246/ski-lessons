# Project Master Context & Standards (GEMINI.md)

This document consolidates all project-specific rules, standards, and context for Gemini Code Assist.

---

## 1. Project Context
**Project:** Ski Lessons Scheduler

**Purpose:**
A full-stack MERN application for managing ski lesson bookings, featuring administrative dashboards, instructor interfaces, and student registration.

**Current Goals:**
- Implement secure JWT-based authentication and role-based access control.
- Build a responsive React frontend with a functional lesson calendar.
- Develop a robust Node.js/Express API with MongoDB/Mongoose models.
- Maintain high code quality with centralized validation and error handling.
- Ensure the application is portfolio-ready and employer-presentable.

**Primary Technologies:**
- React (Vite)
- Node.js & Express
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- SCSS

---

## 2. Project Instructions

**Main Goals**
* Build a professional, employer-presentable booking management system
* Use clean React functional components and hooks
* Implement a secure and scalable Express backend
* Maintain a clear separation between client and server logic
* Prioritize accessibility, responsiveness, and maintainability

**When Helping With This Project**
* Explain code clearly and simply
* Mention which file code belongs in
* Keep solutions beginner-to-intermediate friendly
* Prefer practical production-ready patterns
* Follow MERN stack best practices (RESTful APIs, JWT security)
* Follow the project's coding standards and style guide
* Prioritize maintainability over cleverness

**Code Changes**
When providing code:
* Specify the file path
* Explain why the change is being made
* Note any security implications (JWT, input sanitization, RBAC)
* Preserve the existing project architecture unless a change is justified

**Reviews**
Prioritize:
1. Maintainability
2. Accessibility
3. Responsive design
4. RESTful API standards
5. Security
6. Reusability
7. Employer readiness

**Git Commit Messages**
Always provide a suggested Git commit message at the end of the response.
Format: `Git commit message: [message]`

---

## 3. Coding Standards

**JavaScript / Node.js / Express**
Use:
- ESM modules (`import`/`export`)
- Async/Await for asynchronous operations
- Centralized error handling middleware
- Mongoose schemas for data modeling
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- `camelCase` for variables and functions

Prefer:
- Separation of routes, controllers, and models
- JWT for stateless authentication
- Joi or custom validation utilities (see `server/utilities/validation.js`)

**React**
Use:
- Functional components with Hooks
- `PascalCase` for component names
- Descriptive prop names
- React Router for client-side navigation

Prefer:
- Reusable UI components in `src/components/`
- Context API or state management only when necessary
- Semantic HTML within JSX

**SCSS**
Use:
- Mobile-first styles
- `rem` units when possible
- CSS custom properties for theme values
- Grid for page layouts
- Flexbox for component alignment
- Component-based partials

Avoid:
- Overly specific selectors
- Random one-off styles
- Large files with unrelated styles
- Styling generated build files directly

**JavaScript (General)**
Use:
- Small focused modules
- Clear event listeners
- Progressive enhancement
- Accessible interactions

---

## 4. Style Guide

**General Style**
Prioritize:
- Readability, Consistency, Accessibility, Responsive design.

**Layout**
Use:
- Mobile-first CSS
- CSS Grid for page-level layouts
- Flexbox for alignment inside components
- A consistent `.container` or layout wrapper
- Reasonable max-widths so content does not stretch too wide

**Spacing Scale**
```scss
0.25rem
0.5rem
0.75rem
1rem
1.5rem
2rem
3rem
4rem
```

---

## 5. MERN Best Practices

**Backend (Node.js & Express)**
- **RESTful Design**: Use consistent resource naming and proper HTTP verbs (GET, POST, PUT, DELETE).
- **Security & RBAC**: Use JWT for stateless authentication. Implement Role-Based Access Control (Admin, Instructor, Student).
- **Sanitization**: Sanitize user input to prevent NoSQL injection and Cross-Site Scripting (XSS).
- **Validation**: Validate all incoming request data (body, query, params) using centralized utilities.
- **Error Handling**: Use centralized error-handling middleware.

**Database (MongoDB & Mongoose)**
- **Schema Integrity**: Define strict Mongoose schemas with clear validation.
- **Indexing**: Index fields frequently used in search/filter operations.
- **Lean Queries**: Use `.lean()` for read-only operations.
- **Date Management**: **CRITICAL:** Store all lesson timestamps in **UTC** to ensure scheduling consistency across different time zones.

**Frontend (React)**
- **Component Architecture**: Use functional components with modern Hooks.
- **Performance**: Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders in complex UI elements like calendars.
- **Accessibility (A11y)**: Use semantic HTML and provide ARIA labels.

**Employer Readiness**
- **Professionalism**: Prioritize code readability and clear separation of concerns.
- **Documentation**: Use JSDoc for complex logic.
- **Reliability**: Ensure graceful failure states for both the API and the UI components.