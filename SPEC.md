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
5. **Services Sandbox** — interactive panel to manually inspect and verify all generic service endpoints

## Auth Flow
- Login/Register via AuthService (OOP class)
- User persisted in localStorage via StorageService (OOP class)
- Role-based rendering: TEACHER → TeacherDashboard, STUDENT → StudentPortal
- Logout clears storage and returns to login

## Architecture & Generic Services
Modular, decoupled, and OOP-oriented structure:
- `mockDb.js` — in-memory data store (users, exams, scores)
- `userService.js` — async user auth operations with simulated delay
- `examService.js` — async exam CRUD wrappers with simulated delay
- `StorageService.js` — OOP localStorage wrapper with prefix namespacing and JSON support
- `AuthService.js` — OOP auth logic (login, register, logout, role checks)
- `LoggerService.js` — OOP FIFO logger storing at most the last 10 logs
- `NotificationService.js` — OOP alerts listener and activities history tracker
- `ConfigurationService.js` — OOP key-value configuration overrides engine

### Reusability
The services (`StorageService`, `LoggerService`, `NotificationService`, `ConfigurationService`) contain zero domain-specific references, allowing drop-in application inside any future client-side modules or other standalone web projects.

## Testing & Validation
Unit tests execute in Vitest with a browser-like `jsdom` sandbox environment:
- **Auth tests**: login success/fail, register success/duplicate/validation, logout, getCurrentUser, role checks
- **Services tests**: Storage serialization/defaults/prefixes, Logger FIFO log buffer, Notification publishers/history/categories, Configuration runtime overrides

## Development Workflow
- Feature branches created from `dev`
- One commit per module/feature
- Comments committed separately
- Merge to `dev` via PR, deploy from `dev` for testing
