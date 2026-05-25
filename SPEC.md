# ExamApp Specification

## Project Goal
Online examination system where teachers create and manage exams, and students take them with instant grading.

## Tech Stack
- React 19 + Vite 8
- Bootstrap 5.3
- Vitest + jsdom (testing)
- Mock API layer (simulated async services)
- Deployment: GitHub Pages

## Users
| Role    | Capabilities                                      |
|---------|---------------------------------------------------|
| Teacher | Create/edit/delete exams, view scores, set status  |
| Student | Browse exams, take quizzes, view results           |

## Pages
1. **Login** — username/password form, demo credentials, link to register
2. **Register** — full name, username, password, role selector
3. **Teacher Dashboard** — exam list, score viewer
4. **Student Portal** — exam lookup, quiz taking, results

## Auth Flow
- Login/Register via AuthService (OOP class)
- User persisted in localStorage via StorageService (OOP class)
- Role-based rendering: TEACHER → TeacherDashboard, STUDENT → StudentPortal
- Logout clears storage and returns to login

## Architecture
- `mockDb.js` — in-memory data store (users, exams, scores)
- `userService.js` — async user auth operations with simulated delay
- `examService.js` — async exam CRUD wrappers with simulated delay
- `StorageService.js` — OOP localStorage wrapper with prefix namespacing
- `AuthService.js` — OOP auth logic (login, register, logout, role checks)
- Components render data from services, ready for real backend swap

## Testing
- Vitest with jsdom environment
- Auth tests: login success/fail, register success/duplicate/validation, logout, getCurrentUser, role checks

## Development Workflow
- Feature branches created from `dev`
- One commit per module/feature
- Comments committed separately
- Merge to `dev` via PR, deploy from `dev` for testing
