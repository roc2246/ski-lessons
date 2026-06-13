# Coding Standards

## JavaScript / Node.js / Express

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

## React

Use:
- Functional components with Hooks
- `PascalCase` for component names
- Descriptive prop names
- React Router for client-side navigation

Prefer:
- Reusable UI components in `src/components/`
- Context API or state management only when necessary
- Semantic HTML within JSX

## SCSS

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

## JavaScript

Use:
- Small focused modules
- Clear event listeners
- Progressive enhancement
- Accessible interactions

Avoid:
- jQuery unless specifically needed
- Global variables when avoidable
- Overcomplicated state logic