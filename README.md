# Lessons App README

## Overview

The Lessons App is designed to empower ski and snowboard instructors by giving them greater autonomy over their own schedules. Rather than relying on managers or supervisors for lesson changes, instructors can directly manage, trade, and request lessons through an intuitive interface.

This project aims to streamline communication, reduce bottlenecks, and improve transparency and fairness in lesson allocation.

## Key Features

- **Lesson Viewing:** Instructors can view upcoming lessons, including details like client names, skill level, and time slots.
- **Lesson Trading:** Instructors can request to trade lessons with other instructors based on availability and preference.
- **Drop Requests:** Instructors can request to be taken off a lesson, making the spot available for others to pick up.
- **Private Requests:** Instructors can view and manage client requests for private lessons.
- **Authentication:** Secure login and token-based authentication to ensure only authorized users can access and modify their lesson data.
- **Token Blacklisting on Logout:** Ensures that logging out invalidates the token and prevents reuse.

## Tech Stack

- **Frontend:** React (planned or in development)
- **Backend:** Node.js with Express
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT with token blacklisting

## Folder Structure (planned or evolving)

```
lessons-app/
├── controllers/
├── models/
├── routes/
├── utilities/
├── app.js
├── server.js
├── .env
```

## Future Improvements

- Build out full frontend interface
- Notification system for trade and drop requests
- Admin panel for overrides and higher-level adjustments
- UI for filtering by ability level, age, and request type

## Purpose and Vision

This app is built out of a desire to simplify lesson management for snow sports instructors. At most resorts, instructors have little control over their daily assignments and must rely on management for even minor changes. This system offers a decentralized, instructor-friendly alternative that still respects operational needs.

By giving instructors better tools, we hope to:

- Improve satisfaction and engagement
- Enhance client experience through better-matched lessons
- Save managers time and reduce human error in assignments

## Author

Riley Childs – Snowboard Instructor and Web Developer

---

*This is a work in progress. Contributions and feedback are welcome.*

