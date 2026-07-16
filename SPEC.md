# ExamApp — Technical Specification

## Project Goal
A full-stack online examination platform where teachers create and manage exams, monitor live student activity, and publish graded results. Students register, take timed assessments, and view their grades. The system is containerized with Docker Compose and backed by a PostgreSQL database.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | SPA framework and build tool |
| React Router 6 (HashRouter) | Client-side routing |
| Bootstrap 5.3 | Layout and UI primitives |
| Vanilla CSS (custom tokens) | Themed design system (Light / Dark) |
| Socket.io-client | Real-time WebSocket communication |
| Recharts | Score distribution chart visualization |
| Vitest + jsdom | Automated test suite (47 tests) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.io | WebSocket server (chat + live monitoring) |
| pg (node-postgres) | PostgreSQL driver |
| bcryptjs | Password hashing (10 rounds) |
| jsonwebtoken | Stateless JWT authentication |

### Infrastructure
| Technology | Purpose |
|---|---|
| PostgreSQL 15 (Alpine) | Primary relational database |
| Docker Compose | Multi-container orchestration |
| Docker Bridge Network | Isolated service-to-service networking |
| Named Volume (pgdata) | Persistent PostgreSQL data storage |

---

## Users & Roles

| Role | Capabilities |
|---|---|
| TEACHER | Create/edit/delete exams, manage questions, set status, monitor live sessions, publish results, view/export scores |
| STUDENT | Register/login, view published exams, take timed exams, submit answers, view released grades |

---

## Database Schema

Three PostgreSQL tables (defined in `server/src/db/schema.sql`):

### `users`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY, auto-generated |
| username | VARCHAR(255) | UNIQUE NOT NULL |
| password | VARCHAR(255) | NOT NULL (bcrypt hashed) |
| role | VARCHAR(50) | CHECK ('TEACHER' \| 'STUDENT') |
| name | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now() |

### `exams`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY, auto-generated |
| title | VARCHAR(255) | NOT NULL |
| time_limit | INTEGER | DEFAULT 60 (minutes) |
| passing_grade | INTEGER | DEFAULT 60 (percentage) |
| shuffle_questions | BOOLEAN | DEFAULT FALSE |
| questions | JSONB | NOT NULL (array of question objects) |
| status | VARCHAR(50) | CHECK ('draft' \| 'published' \| 'closed') |
| results_released | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT now() |

### `submissions`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY, auto-generated |
| exam_id | UUID | FK → exams(id) ON DELETE CASCADE |
| student_id | UUID | FK → users(id) ON DELETE CASCADE |
| score | INTEGER | NOT NULL (0-100 percentage) |
| answers | JSONB | NOT NULL (questionId → studentAnswer map) |
| submitted_at | TIMESTAMP | DEFAULT now() |

---

## REST API Endpoints

All endpoints require a valid JWT Bearer token (except `/register` and `/login`). Teacher-only routes return `403` if a student attempts access.

### Authentication — `/api/users`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | None | Register a new user account |
| POST | `/api/users/login` | None | Log in and receive a JWT |
| GET | `/api/users/by-username/:username` | Token | Check username availability |

### Exams — `/api/exams`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/exams` | Token | Get all exams (filtered by role) |
| GET | `/api/exams/:id` | Token | Get a single exam with questions |
| POST | `/api/exams` | Teacher | Create a new exam |
| PUT | `/api/exams/:id` | Teacher | Update an exam |
| DELETE | `/api/exams/:id` | Teacher | Delete an exam (cascades submissions) |
| POST | `/api/exams/:id/publish-results` | Teacher | Release results to students |

### Scores — `/api/scores`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/scores/:examId` | Teacher | Get all submissions for an exam |
| POST | `/api/scores` | Student | Submit a new score record |

---

## Routing Schema (HashRouter)

| Route | Access | Component |
|---|---|---|
| `/` | Any | HomeRedirect → role-based redirect |
| `/login` | Public | LoginPage |
| `/register` | Public | RegisterPage |
| `/teacher` | TEACHER only | TeacherDashboard |
| `/student` | STUDENT only | StudentPortal |
| `/sandbox` | Any authenticated | SandboxPage |
| `*` (wildcard) | Any | Redirect to `/` |

---

## Folder Structure

```
ExamApp/
├── docker-compose.yml
├── SPEC.md
├── FEATURES_EXPLANATION.txt
│
├── server/
│   ├── Dockerfile
│   ├── .env / .env.example
│   └── src/
│       ├── index.js                   # Express + Socket.io entry point
│       ├── db/
│       │   ├── schema.sql             # PostgreSQL table definitions
│       │   ├── seed.js                # Default accounts and exam data
│       │   └── connect.js             # pg.Pool connection factory
│       ├── routes/
│       │   ├── userRoutes.js
│       │   ├── examRoutes.js
│       │   └── scoreRoutes.js
│       ├── controllers/
│       │   ├── UserController.js
│       │   ├── ExamController.js
│       │   └── ScoreController.js
│       ├── services/
│       │   ├── UserService.js
│       │   ├── ExamService.js
│       │   ├── ScoreService.js
│       │   └── socketHandler.js       # Socket.io event registry
│       └── middlewares/
│           └── authMiddleware.js      # JWT Bearer token verification
│
└── client/
    ├── Dockerfile
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                    # Router, auth state, theme management
        ├── App.css
        ├── index.css                  # Global CSS custom properties (theme tokens)
        │
        ├── pages/                     # One component per route
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── TeacherDashboard.jsx
        │   ├── StudentPortal.jsx
        │   └── SandboxPage.jsx
        │
        ├── components/                # Reusable sub-views
        │   ├── ExamList.jsx
        │   ├── ExamForm.jsx
        │   ├── ExamCard.jsx
        │   ├── ExamTakingView.jsx
        │   ├── QuestionCard.jsx
        │   ├── StudentExamList.jsx
        │   ├── ScoreTable.jsx
        │   ├── ChatWidget.jsx
        │   ├── NavigationMenu.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── HomeRedirect.jsx
        │   └── modals/
        │       ├── DeleteExamModal.jsx
        │       └── LiveMonitorModal.jsx
        │
        ├── api/                       # HTTP wrappers for REST API
        │   ├── examService.js
        │   └── userService.js
        │
        ├── hooks/                     # Custom React hooks
        │   ├── useChat.js             # Socket.io exam chat + progress
        │   └── useTeacherNotifications.js
        │
        ├── services/                  # OOP utility services
        │   ├── AuthService.js
        │   ├── StorageService.js
        │   ├── NotificationService.js
        │   ├── LoggerService.js
        │   └── ConfigurationService.js
        │
        └── __tests__/                 # Vitest test suite
            ├── AuthService.test.js
            ├── GenericServices.test.js
            ├── NavigationAndRouting.test.jsx
            ├── TeacherDashboard.test.jsx
            ├── ExamCrud.test.jsx
            ├── ExamStatus.test.jsx
            └── StudentExamList.test.jsx
```

---

## Auth & Security

### Server-side
- Passwords hashed with **bcryptjs** (10 rounds) before PostgreSQL storage.
- Login uses `bcrypt.compare()` to verify submitted password against stored hash.
- Successful login signs and returns a **JWT** (payload: `id`, `role`, `name`).
- `authMiddleware.js` verifies the Bearer token on every protected request:
  - Missing token → `401 Access token required`
  - Invalid/expired → `403 Invalid or expired token`
  - Valid → injects `req.user` and calls `next()`
- Teacher-only routes apply an additional inline role check — students receive `403`.

### Client-side
- `AuthService.js` manages login, logout, register, and role helpers.
- Session stored in `localStorage` via `StorageService` (prefixed key).
- `ProtectedRoute.jsx` blocks access: no session → `/login`, wrong role → home route.
- All API calls in `examService.js` / `userService.js` attach the JWT as `Authorization: Bearer <token>`.

---

## WebSocket System (Socket.io)

### Socket Rooms
| Room Key | Members |
|---|---|
| `exam_{id}_all` | All participants (students + teacher) |
| `exam_{id}_teachers` | Teachers monitoring the exam |
| `exam_{id}_user_{userId}` | Private per-student room |

### Server Events (socketHandler.js)
| Event | Direction | Description |
|---|---|---|
| `join_exam_chat` | Client → Server | Joins appropriate rooms; server sends back filtered chat history |
| `send_message` | Client → Server | Routes message based on `target` ('all', 'teacher', or userId) |
| `student_progress` | Client → Server | Student sends metrics; server broadcasts to teacher room |
| `chat_history` | Server → Client | Full history sent on join |
| `receive_message` | Server → Client | New chat message delivered to target rooms |
| `receive_student_progress` | Server → Client | Live metrics delivered to teacher room |

### Client Hooks
- **`useChat.js`**: Scoped socket connection per exam. Exposes `messages`, `isConnected`, `sendMessage()`, `sendProgress()`, `studentProgress`.
- **`useTeacherNotifications.js`**: Background socket maintained by TeacherDashboard. Tracks unread counts per exam; fires notification toasts when messages arrive in a non-monitored exam.

---

## Anti-Cheating System

Implemented in `ExamTakingView.jsx` using native browser APIs:

| Trigger | API Used |
|---|---|
| Student switches browser tab | `document.visibilitychange` |
| Student alt-tabs to another app / opens DevTools | `window.blur` |

**Grace period**: Events within 1,500ms of component mount are ignored (prevents false positive from page-load browser focus sequence).

**Student experience**: Full-screen warning modal overlay. Student must acknowledge before resuming.

**Teacher experience**: Warning count badge (`⚠️ N`) on the student's card in the Live Activity Board. Card border turns alert red when warnings > 0.

---

## Live Monitor Modal

Split-pane overlay accessible from any published exam row on the Teacher Dashboard:

| Panel | Contents |
|---|---|
| Left — Chat Support | Real-time bidirectional chat. "Broadcast to All" or target individual students. |
| Right — Student Activity Board | Live student list: connection status (🟢 / ⚪), question progress, MM:SS timer, progress bar, ⚠️ warning count |

Connection status: A student is `Offline` if no progress heartbeat was received in the last 10 seconds.

---

## Exam Status Lifecycle

```
draft  →  published  →  closed
  ↑            |
  └────────────┘  (teacher can toggle freely)
```

| Status | Teacher sees | Student sees | Student can submit |
|---|---|---|---|
| draft | ✅ | ❌ | ❌ |
| published | ✅ | ✅ | ✅ |
| closed | ✅ | ❌ | ❌ (blocked mid-exam) |

---

## Score & Results Lifecycle

1. Student submits → score calculated client-side → `POST /api/scores`
2. Server saves to `submissions` table
3. Teacher opens ScoreTable → `GET /api/scores/:examId` → table + chart rendered
4. Teacher clicks "Publish Results" → `POST /api/exams/:id/publish-results` → `results_released = TRUE`
5. Students can now view their score in the portal

---

## OOP Generic Services

All four services have zero domain-specific references and are fully reusable in any project:

| Service | Purpose | Key Methods |
|---|---|---|
| `StorageService` | localStorage wrapper with prefix namespacing and JSON serialization | `set`, `get`, `remove`, `clear` |
| `NotificationService` | Alert publisher and subscriber system with history | `success`, `error`, `warning`, `info`, `subscribe`, `getHistory` |
| `LoggerService` | FIFO in-memory log buffer (10-entry cap) | `info`, `success`, `error`, `warning`, `getLogs`, `clearLogs` |
| `ConfigurationService` | Runtime key-value configuration store | `get`, `set`, `getAll` |

---

## Auth Flow (Step by Step)

```
1. User opens app
2. App reads localStorage for JWT session (via StorageService)
3. No session → ProtectedRoute redirects to /login
4. User submits login form
5. Client: POST /api/users/login
6. Server: verifies credentials with bcrypt.compare()
7. Server: signs and returns JWT {id, role, name}
8. Client: stores JWT + user in localStorage
9. React state updates → NavigationMenu renders
10. HomeRedirect sends user to /teacher or /student
11. All API calls attach JWT as Authorization: Bearer <token>
12. authMiddleware.js verifies token on each request
```

---

## Testing Suite (47 Tests)

| Test File | Count | Coverage Area |
|---|---|---|
| `AuthService.test.js` | 12 | Login, register, logout, role checks |
| `GenericServices.test.js` | 12 | Storage, Logger, Notification, Configuration |
| `NavigationAndRouting.test.jsx` | 5 | ProtectedRoute guards, Nav link rendering |
| `TeacherDashboard.test.jsx` | 3 | Exam loading, list binding, score fetch |
| `ExamCrud.test.jsx` | 4 | Create, edit, delete, validation |
| `ExamStatus.test.jsx` | 4 | Status changes, student visibility, submission block |
| `StudentExamList.test.jsx` | 7 | Exam list filter, start exam, submit, score display |

---

## Deployment

```bash
# Start all three services
docker compose up -d --build

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up -d --build
```

| Container | Port | Description |
|---|---|---|
| db (PostgreSQL 15) | 5432 | Persistent database |
| backend (Node.js) | 3001 | REST API + WebSocket server |
| frontend (React/Vite) | 5173 | SPA client application |

---

## Development Workflow

- `main` branch: stable production releases
- `dev` branch: integration branch for all features
- Feature branches created from `dev` (e.g. `feature/auth`, `tab-focus-monitor`)
- Pull Requests opened from feature branch into `dev`
- PR merged on GitHub, remote branch deleted after merge
- Local cleanup: `git checkout dev && git pull origin dev && git branch -d <branch>`
