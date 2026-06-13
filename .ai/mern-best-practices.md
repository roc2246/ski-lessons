# MERN Best Practices

## General Rules

Always write application code that is:
- Secure
- Readable
- Maintainable
- Accessible

## Backend (Node.js & Express)
- **RESTful Design**: Use consistent resource naming and proper HTTP verbs (GET, POST, PUT, DELETE).
- **Security & RBAC**: Use JWT for stateless authentication. Implement Role-Based Access Control (Admin, Instructor, Student) to protect sensitive lesson and user data.
- **Sanitization**: Sanitize user input to prevent NoSQL injection and Cross-Site Scripting (XSS).
- **Validation**: Validate all incoming request data (body, query, params) using centralized utilities.
- **Error Handling**: Use centralized error-handling middleware to ensure consistent JSON responses and avoid leaking stack traces.
- **Statelessness**: Ensure the API remains stateless by relying on tokens rather than server-side sessions.

## Database (MongoDB & Mongoose)
- **Schema Integrity**: Define strict Mongoose schemas with clear validation and type constraints.
- **Indexing**: Index fields frequently used in search/filter operations (e.g., student emails or lesson dates).
- **Lean Queries**: Use `.lean()` for read-only operations to improve performance by bypassing Mongoose document hydration.
- **Middleware**: Utilize Mongoose `pre` and `post` hooks for tasks like password hashing.
- **Date Management**: Store all lesson timestamps in UTC to ensure scheduling consistency across different time zones.

## Frontend (React)
- **Component Architecture**: Use functional components with modern Hooks (`useState`, `useEffect`, `useContext`).
- **State Management**: Keep state local where possible; use Context API for global state like authentication.
- **Performance**: Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders in complex UI elements like calendars.
- **Accessibility (A11y)**: Use semantic HTML and provide ARIA labels for interactive elements (e.g., booking buttons, forms).

## UI & Styling (SCSS)
- **Mobile-First**: Write styles for mobile views first, using media queries for larger screen enhancements.
- **Architecture**: Use a structured naming convention (like BEM) and component-based partials.
- **Consistency**: Use `rem` units and a defined spacing scale to ensure layout rhythm.

## Employer Readiness
- **Professionalism**: Prioritize code readability and clear separation of concerns over condensed "clever" logic.
- **Documentation**: Use JSDoc for complex logic and keep README files updated with setup instructions.
- **Reliability**: Ensure graceful failure states for both the API and the UI components.
