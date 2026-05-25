# ExamApp Specification

## Project Goal
Online examination system where teachers create and manage exams, and students take them with instant grading.

## Tech Stack
- React 19 + Vite 8
- Bootstrap 5.3
- Mock API layer (simulated async services)
- Deployment: GitHub Pages

## Users
| Role    | Capabilities                                      |
|---------|---------------------------------------------------|
| Teacher | Create/edit/delete exams, view scores, set status  |
| Student | Browse exams, take quizzes, view results           |

## Pages
1. **Login** — shared entry for both roles
2. **Teacher Dashboard** — exam list, score viewer
3. **Student Portal** — exam lookup, quiz taking, results

## Architecture
- `mockDb.js` — in-memory data store (exams + scores)
- `examService.js` — async CRUD wrappers with simulated delay
- Components render data from services, ready for real backend swap

## Development Workflow
- Feature branches created from `dev`
- One commit per module/feature
- Comments committed separately
- Merge to `dev` via PR, deploy from `dev` for testing
