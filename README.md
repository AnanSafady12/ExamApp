# ExamApp — Online Examination Management System

> A full-stack web application for managing online exams, live student monitoring, and graded submissions.

**Team:** Anan Safady & Anan Farhat
**Repository:** https://github.com/fullstackAnans/ExamApp/
**Deployment:** Runs locally via Docker Compose (see [Running the Application](#running-the-application))

---

## Table of Contents

1. [Main Features](#main-features)
2. [Main Pages](#main-pages)
3. [Main API Endpoints](#main-api-endpoints)
4. [Overall System Architecture](#overall-system-architecture)
5. [Client Architecture](#client-architecture)
6. [Server Architecture](#server-architecture)
7. [Database ERD & JSON Models](#database-erd--json-models)
8. [OOP UML Diagram](#oop-uml-diagram)
9. [Sequence Diagrams](#sequence-diagrams)
10. [Milestones & Branch History](#milestones--branch-history)
11. [Work Process & Deployment](#work-process--deployment)

---

## Main Features

### Teacher Features
- ✅ **Exam CRUD** — Create, edit, and delete exams with full question management (text, options, correct answer, question type)
- ✅ **Exam Status Control** — Toggle exams between `draft`, `published`, and `closed` states
- ✅ **Exam Configuration** — Set time limits, passing grade threshold, and question shuffle
- ✅ **Live Student Monitor** — Real-time split-pane dashboard showing connected students, their current question, timer, and progress bar (via WebSockets)
- ✅ **Live Chat** — Bidirectional real-time messaging during active exams; broadcast to all or message individual students
- ✅ **Anti-Cheating Alerts** — Live warning badge counter for students who switch tabs or windows
- ✅ **Score Review** — View all student submissions per exam in a data table with grade distribution chart (Recharts)
- ✅ **Publish Results** — Release grades so students can view their scores
- ✅ **CSV Export** — Download all exam scores as a `.csv` file

### Student Features
- ✅ **Registration & Login** — Full auth flow with password strength meter, confirm-password check, and real-time username availability
- ✅ **Exam Listing** — Browse all published exams with title, question count, and time limit
- ✅ **Timed Exam Taking** — Per-question navigation, countdown timer, progress sidebar, auto-submit on time expiry
- ✅ **Chat Support** — In-exam real-time chat widget to message the teacher
- ✅ **Score & Review** — After submission: instant score display with correct/incorrect highlights per question
- ✅ **Published Grades** — View released results from the student portal

### System Features
- ✅ **JWT Authentication** — Stateless JWT tokens; role-based API protection (Teacher vs Student)
- ✅ **Docker Compose** — One-command launch of all 3 services (frontend, backend, PostgreSQL)
- ✅ **Persistent Database** — PostgreSQL 15 with named volume; data survives container restarts
- ✅ **47 Automated Tests** — Vitest suite covering auth, services, routing, CRUD, status, and student flows
- ✅ **OOP Service Layer** — 4 domain-agnostic reusable services (Storage, Logger, Notification, Configuration)

---

## Main Pages

| Route | Role | Description |
|---|---|---|
| `/login` | Public | Username + password form with show/hide toggle and error handling |
| `/register` | Public | Full registration form with real-time strength meter, username check, and confirm password |
| `/teacher` | Teacher | Exam table with inline status control, score view, live monitor, and create/edit/delete flows |
| `/student` | Student | Published exam list, active exam taking view, results display |
| `/sandbox` | Any authenticated | Interactive test bench for all 4 OOP generic services |

---

## Main API Endpoints

### Auth — `/api/users`
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users/register` | Create a new account (name, username, password, role) |
| `POST` | `/api/users/login` | Authenticate and receive a JWT token |
| `GET` | `/api/users/by-username/:username` | Check if a username is already taken |

### Exams — `/api/exams` *(JWT required)*
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/exams` | Any | List exams (role-filtered) |
| `GET` | `/api/exams/:id` | Any | Get a single exam with questions |
| `POST` | `/api/exams` | Teacher | Create a new exam |
| `PUT` | `/api/exams/:id` | Teacher | Update an exam |
| `DELETE` | `/api/exams/:id` | Teacher | Delete an exam (cascades submissions) |
| `POST` | `/api/exams/:id/publish-results` | Teacher | Release grades to students |

### Scores — `/api/scores` *(JWT required)*
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/scores/:examId` | Teacher | Get all submissions for an exam |
| `POST` | `/api/scores` | Student | Submit a new score record |

---

## Overall System Architecture

The system is split into three containerized services communicating over a shared Docker bridge network:

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Bridge Network                   │
│                                                             │
│  ┌─────────────┐      HTTP REST       ┌──────────────────┐  │
│  │             │ ──────────────────► │                  │  │
│  │   Frontend  │                     │     Backend      │  │
│  │  React/Vite │ ◄────────────────── │  Node.js/Express │  │
│  │  Port 5173  │   JSON responses    │    Port 3001     │  │
│  │             │                     │                  │  │
│  │             │ ══════════════════► │  Socket.io WS    │  │
│  └─────────────┘   WebSocket events  └────────┬─────────┘  │
│                                               │             │
│                                           SQL │pg driver    │
│                                               ▼             │
│                                    ┌──────────────────┐     │
│                                    │    PostgreSQL 15  │     │
│                                    │      Port 5432    │     │
│                                    │   Volume: pgdata  │     │
│                                    └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Who communicates with whom

| From | To | Protocol | What |
|---|---|---|---|
| Browser | Frontend (React) | HTTP | Serves the SPA HTML/JS/CSS |
| Frontend | Backend | HTTP REST | Exam CRUD, auth, scores |
| Frontend | Backend | WebSocket (Socket.io) | Live chat, student progress |
| Backend | PostgreSQL | TCP (pg driver) | All persistent data queries |

### Where data is stored

| Data | Location |
|---|---|
| Users (accounts, passwords, roles) | PostgreSQL `users` table |
| Exams (title, questions, config, status) | PostgreSQL `exams` table (questions as JSONB) |
| Student submissions and scores | PostgreSQL `submissions` table |
| Active user session (JWT token) | Browser `localStorage` |
| In-exam chat history | Server in-memory `Map` (keyed by examId) |
| Application logs, notifications | Browser in-memory (OOP service classes) |

### How data flows

**Login flow:** Browser → POST /api/users/login → Backend verifies bcrypt hash → Signs JWT → Frontend stores JWT in localStorage → All future API calls send `Authorization: Bearer <token>`

**Exam taking flow:** Student opens exam → Countdown timer starts → Answers saved in React state → On submit: POST /api/scores → PostgreSQL stores submission → Teacher later fetches GET /api/scores/:id

**Live monitoring flow:** Student and Teacher both connect via Socket.io → Student progress emitted every 5 seconds → Server broadcasts to teacher-only room → Teacher Activity Board updates in real time

---

## Client Architecture

### Technology Packages

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.x",
  "socket.io-client": "^4.x",
  "recharts": "^2.x",
  "bootstrap": "^5.3.x",
  "vitest": "^4.x",
  "@testing-library/react": "^16.x"
}
```

### Architecture Pattern
The client follows a **Component-Based Architecture** with clearly separated layers:

```
pages/          → Full-page route views (one per URL)
components/     → Reusable sub-view panels
components/modals/ → Overlay dialog components
hooks/          → Custom React state and socket hooks
api/            → HTTP service wrappers (communicate with Express)
services/       → OOP utility classes (Storage, Auth, Logger, etc.)
__tests__/      → Vitest automated test suite
```

### Component Hierarchy

```
App.jsx  (Router + theme + auth state)
│
├── /login        → LoginPage.jsx
├── /register     → RegisterPage.jsx
├── /sandbox      → SandboxPage.jsx
│
├── /teacher  [PROTECTED: TEACHER]
│   └── TeacherDashboard.jsx
│       ├── ExamList.jsx
│       │   └── (inline per-row actions)
│       ├── ExamForm.jsx           (create / edit)
│       ├── ScoreTable.jsx         (submissions + chart + CSV)
│       └── modals/
│           ├── DeleteExamModal.jsx
│           └── LiveMonitorModal.jsx
│               └── ChatWidget.jsx (embedded)
│
└── /student  [PROTECTED: STUDENT]
    └── StudentPortal.jsx
        ├── StudentExamList.jsx
        └── ExamTakingView.jsx
            ├── QuestionCard.jsx   (per question)
            └── ChatWidget.jsx
│
└── NavigationMenu.jsx  (global navbar, rendered on all authenticated pages)
└── ProtectedRoute.jsx  (route guard wrapper)
└── HomeRedirect.jsx    (role-based redirect)
```

### Custom React Hooks
| Hook | Purpose |
|---|---|
| `useChat.js` | Socket.io connection per exam — manages messages, progress state, send functions |
| `useTeacherNotifications.js` | Background socket across all published exams — unread counts + toast alerts |

---

## Server Architecture

### Technology Packages

```json
{
  "express": "^4.x",
  "socket.io": "^4.x",
  "pg": "^8.x",
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "cors": "^2.x"
}
```

### Architecture Pattern — MVC

The server follows the **MVC (Model–View–Controller)** pattern:

| Layer | Folder | Responsibility |
|---|---|---|
| **Model** | `db/` | PostgreSQL schema, seed data, connection pool |
| **Service** | `services/` | Business logic and DB query helpers |
| **Controller** | `controllers/` | HTTP request handlers (parse req, call service, send res) |
| **View** | *(none)* | The React frontend acts as the view layer |
| **Router** | `routes/` | Maps HTTP methods + paths to controllers |
| **Middleware** | `middlewares/` | JWT verification, role checks |

### Server File Structure

```
server/src/
├── index.js                  # Entry point: creates HTTP server, mounts Express + Socket.io
├── db/
│   ├── schema.sql            # CREATE TABLE statements
│   ├── seed.js               # Inserts default users + exams
│   └── connect.js            # pg.Pool connection factory
├── routes/
│   ├── userRoutes.js         # /api/users
│   ├── examRoutes.js         # /api/exams
│   └── scoreRoutes.js        # /api/scores
├── controllers/
│   ├── UserController.js     # register, login, findByUsername
│   ├── ExamController.js     # CRUD + publish-results
│   └── ScoreController.js    # getByExam, submit
├── services/
│   ├── UserService.js        # bcrypt hash/compare, DB user queries
│   ├── ExamService.js        # Exam + question DB queries
│   ├── ScoreService.js       # Submission DB queries, score calc
│   └── socketHandler.js      # Socket.io room management + event handlers
└── middlewares/
    └── authMiddleware.js     # JWT Bearer token verification
```

### Request Lifecycle

```
HTTP Request
    │
    ▼
Express Router (routes/)
    │  matches method + path
    ▼
authMiddleware.js
    │  verifies JWT token
    │  injects req.user
    ▼
Controller (controllers/)
    │  parses req body/params
    │  calls Service
    ▼
Service (services/)
    │  runs SQL query via pg.Pool
    ▼
PostgreSQL
    │  returns result
    ▼
Controller
    │  formats response
    ▼
JSON Response
```

---

## Database ERD & JSON Models

> 📌 The ERD diagram is provided as a separate attached image.

### JSON Models

#### `questions` JSONB array (stored inside `exams.questions`):
```json
[
  {
    "id": "q_1",
    "text": "What does HTML stand for?",
    "type": "SINGLE_CHOICE",
    "options": [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Mode Link",
      "Home Tool Markup Language"
    ],
    "correctAnswer": "Hyper Text Markup Language"
  }
]
```

#### `answers` JSONB object (stored inside `submissions.answers`):
```json
{
  "q_1": "Hyper Text Markup Language",
  "q_2": "CSS",
  "q_3": "React"
}
```

#### `users` row:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "teacher1",
  "password": "$2b$10$hashed...",
  "role": "TEACHER",
  "name": "John Smith",
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

## OOP UML Diagram

> 📌 UML will be provided in a separate file.

---

## Sequence Diagrams

> 📌 Sequence diagrams for all 3 scenarios are provided as separate attached images.

## Milestones & Branch History

The project was developed across **40+ Pull Requests** in phases, each on its own dedicated feature branch:

### Phase 1 — Foundation & Setup
| PR | Branch | Milestone |
|---|---|---|
| #3 | `feature/initreact` | Initial React + Vite project scaffold |
| #5 | `dev` | Base routing and project structure |
| #6 | `feature/6-login` | Simple login page prototype |
| #8 | `feature/8-student-portal-ui` | Student portal UI prototype |

### Phase 2 — Core Architecture (Mock API)
| PR | Branch | Milestone |
|---|---|---|
| #13 | `feature/auth-login-register` | Full auth module (login, register, logout, roles) |
| #14 | `feature/generic-services` | OOP services (Storage, Logger, Notification, Configuration) + Sandbox |
| #15 | `feature/routing-navigation` | React Router, ProtectedRoute, NavigationMenu |
| #16 | `feature/teacher-dashboard` | Modular TeacherDashboard with mock API |
| #17 | `feature/teacher-exam-crud` | Exam Create, Edit, Delete management |
| #18 | `feature/teacher-exam-status` | Exam status lifecycle (draft/published/closed) |
| #19 | `feature/student-exam-list-start` | Student exam list and taking view |
| #20 | `feature/student-exam-submission-score` | Submission, scoring, and persistence |
| #21 | `feature/final-documentation` | SPEC.md diagrams and documentation |
| #22 | `feature/code-comments` | Code comments across all components |

### Phase 3 — Full Stack Migration
| PR | Branch | Milestone |
|---|---|---|
| #23 | `feature/design-change` | Full UI redesign with HSL glassmorphism theme |
| #24 | `feature/express-server` | Express backend server setup |
| #25 | `feature/db-integration` | PostgreSQL integration (JSONB hybrid schema) |

### Phase 4 — Backend Hardening
| PR | Branch | Milestone |
|---|---|---|
| #28 | `feature/db-setup` | Schema constraints + hashed password seeding |
| #29 | `feature/auth-clean` | Full JWT auth middleware + clean architecture |
| #30 | `feature/exams-types` | Question types + full exam CRUD via real API |
| #31 | `feature/submissions-reviews` | Student submissions + score storage in PostgreSQL |
| #32 | `feature/integration-polish` | Integration polish + unit test updates |

### Phase 5 — Advanced Features
| PR | Branch | Milestone |
|---|---|---|
| — | `feature/exam-timer` | Countdown timer + auto-submit |
| #34 | `feature/websocket-chat` | Real-time Socket.io chat + one-time exam attempts |
| #35 | `feature/export-csv` | CSV score export on Teacher Dashboard |
| #36 | `feature/exam-pagination` | Question pagination + sidebar navigation + chat widget |
| #37 | `feature/exam-randomization` | Exam question and option shuffle |
| #38 | `feature/teacher-analytics` | Grade distribution chart (Recharts) + student result gating |
| #39 | `organize` | Full UI redesign: auth screen polish, Live Student Activity Board |
| #40 | `tab-focus-monitor` | Anti-cheating tab visibility monitor + WebSocket warning broadcast |

---

## Work Process & Deployment

### Docker Compose
The entire application is containerized and started with one command:

```bash
docker compose up -d --build
```

Three services are defined in `docker-compose.yml`:

| Service | Image | Port | Description |
|---|---|---|---|
| `db` | postgres:15-alpine | 5432 | PostgreSQL database with persistent volume |
| `backend` | Custom Dockerfile | 3001 | Node.js/Express REST API + Socket.io |
| `frontend` | Custom Dockerfile | 5173 | React/Vite SPA |

All services communicate via a Docker Bridge Network (`app-network`). PostgreSQL data is persisted in a named volume (`pgdata`) that survives container restarts.

```bash
# Start everything
docker compose up -d --build

# Stop everything
docker compose down

# View logs
docker compose logs -f backend
```

### Unit Tests (Vitest)
47 automated tests covering all key flows:

```bash
cd client
npm run test
```

| File | Tests | What is tested |
|---|---|---|
| `AuthService.test.js` | 12 | Login, register, logout, role checks |
| `GenericServices.test.js` | 12 | Storage, Logger, Notification, Configuration |
| `NavigationAndRouting.test.jsx` | 5 | ProtectedRoute, NavigationMenu rendering |
| `TeacherDashboard.test.jsx` | 3 | Exam loading, score fetch |
| `ExamCrud.test.jsx` | 4 | Create, edit, delete, validation |
| `ExamStatus.test.jsx` | 4 | Status changes, visibility, submission block |
| `StudentExamList.test.jsx` | 7 | Exam list, start, submit, score display |

### Application Logging
The `LoggerService` maintains a FIFO in-memory log buffer (capped at 10 entries) tracking all application events. The `NotificationService` dispatches real-time toast alerts to any subscribed UI component. Both services are viewable live in the Services Sandbox page (`/sandbox`).

### Environment Configuration
```bash
# server/.env
PORT=3001
DATABASE_URL=postgresql://postgres:password@db:5432/examapp
JWT_SECRET=super_secret_jwt_key_123
```

```bash
# client (set via docker-compose.yml)
VITE_API_URL=http://localhost:3001
```

### Git Workflow
- `main` — stable releases only
- `dev` — integration branch, all features merged here first
- Feature branches created from `dev` and merged via **Pull Requests**
- Remote feature branches deleted after PR merge
- Local cleanup: `git checkout dev && git pull origin dev && git branch -d <branch>`
