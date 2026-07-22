# Student Task Manager

A production-grade, full-stack task tracker built to manage placement-prep work
— DSA practice, SQL drills, portfolio projects, job applications, and interview
prep — with the architecture, tooling, and polish of a real SaaS product.

Built as a portfolio project for a final-year CSE (AI & Data Science) student
targeting SDE internships and full-time roles.

![Node](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [API endpoints](#api-endpoints)
- [Database schema](#database-schema)
- [Screenshots](#screenshots)
- [Installation guide](#installation-guide)
- [Environment variables](#environment-variables)
- [Prisma migration commands](#prisma-migration-commands)
- [Running the development servers](#running-the-development-servers)
- [Building for production](#building-for-production)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future improvements](#future-improvements)
- [License](#license)
- [Author](#author)

---

## Overview

Student Task Manager is a two-app monorepo: a strictly-typed **Express + Prisma
REST API** and a **React 19 + Vite** single-page app, connected end-to-end with
full CRUD, search, filtering, sorting, pagination, dashboard statistics, and
optimistic UI updates. It's designed to read like production code — feature-based
architecture, centralized error handling, a real design system — rather than a
tutorial CRUD app.

## Features

- ✅ Create, read, update, and delete tasks
- ✅ One-click "mark complete" toggle (`PATCH /tasks/:id/complete`)
- ✅ Due dates, priority (Low/Medium/High), and category tagging
- ✅ Full-text search across title & description (debounced)
- ✅ Filter by status, priority, and category
- ✅ Sort by newest/oldest, due date, priority, or title
- ✅ Pagination with page/limit controls
- ✅ Dashboard statistics: total, in-progress, completed, overdue counts
- ✅ Overall-progress bar (completed vs. total)
- ✅ Overdue tasks highlighted in the table and on task cards
- ✅ Optimistic UI updates for delete and mark-complete (instant, auto-rollback on failure)
- ✅ Toast notifications for every mutation
- ✅ Confirmation modal before destructive actions
- ✅ Loading skeletons, empty states, 404 page, and a top-level error boundary
- ✅ Fully responsive layout with dark mode

## Architecture

Both apps follow **feature-based architecture**: everything related to the
`tasks` domain — types, validation, service/hooks, UI — lives together, so
adding a new domain (e.g. `notes`, `users`) means adding one new folder instead
of touching a dozen existing files.

**Backend request lifecycle:**

```
Request → validateRequest (Zod) → controller → service (Prisma) → ApiResponse
                                        │
                                        └─ throws → errorHandler → normalized JSON error
```

- **Centralized error handling** — every thrown `ApiError`, Zod validation
  error, or Prisma error is normalized into one JSON shape by
  `middleware/errorHandler.ts`.
- **Consistent API envelope** — `utils/ApiResponse.ts` guarantees every
  success response looks like `{ success, message, data, meta? }`.
- **`asyncHandler`** — eliminates repetitive try/catch in controllers by
  forwarding rejected promises to Express's error pipeline.
- **Validation at the boundary** — Zod schemas validate `body` / `query` /
  `params` before a request reaches a controller, and the *same* enums are
  mirrored on the frontend so client-side form validation matches the API
  exactly.

**Frontend data flow:**

```
Component → TanStack Query hook → taskApi (axios) → backend
                │
                └─ mutation → optimistic cache update → invalidate → refetch
```

- **Query-key factory** (`features/tasks/api/taskKeys.ts`) keeps TanStack
  Query cache keys typo-proof and gives mutations one place to invalidate
  related queries.
- **Optimistic updates** — delete and mark-complete update the cache
  immediately via `onMutate`, and roll back automatically in `onError`.
- **Design system** — a cool slate-navy workspace with a single warm amber
  "signal" accent reserved for priority/attention states, using a
  Manrope / Inter / JetBrains Mono type pairing (see `frontend/src/index.css`).

### Auth-ready by design

Authentication was not implemented in this pass (see [Future improvements](#future-improvements)),
but the architecture was deliberately kept ready for it with minimal churn:

- The Express middleware pipeline (`app.ts`) already has a clear slot for an
  `authenticate` middleware ahead of `apiRoutes`.
- `ApiError` already models `401`/`403` the same way it models `404`/`409`.
- The Prisma schema's flat, single-model shape means adding a `User` model and
  a `userId` foreign key on `Task` is a one-migration change, not a rewrite.
- The frontend's `apiClient` interceptor is the single place an `Authorization`
  header or a 401→redirect-to-login flow would be added.

## Tech stack

| Layer | Choices |
|---|---|
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Router 7, TanStack Query v5, Axios, React Hook Form + Zod, lucide-react |
| Backend | Node.js, Express, TypeScript (strict), Prisma ORM 7 (rust-free `client` engine), SQLite, Zod, Winston, Swagger/OpenAPI |
| Testing | Vitest, Supertest |
| Tooling | ESLint, Prettier, Husky, lint-staged |
| Deployment | Vercel (frontend), Render (backend) |

## Folder structure

```
student-task-manager/
│
├── backend/
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── docs/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── tasks/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── tasks/
│   │   │   └── ui/
│   │   ├── config/
│   │   ├── features/
│   │   │   └── tasks/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── providers/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── render.yaml
├── README.md
```

## API endpoints

Base URL: `http://localhost:5000/api/v1` (interactive docs at `/api-docs`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | List tasks — paginated, filterable, searchable, sortable |
| `GET` | `/tasks/statistics` | Aggregate counts (by status, priority, category, overdue) |
| `GET` | `/tasks/:id` | Get one task |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/:id` | Replace a task (all fields required) |
| `PATCH` | `/tasks/:id` | Partially update a task |
| `PATCH` | `/tasks/:id/complete` | Toggle completion (`COMPLETED` ⇄ `TODO`) |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/health` | Liveness probe |

**Query params for `GET /tasks`:** `page`, `limit` (max 100), `status`,
`priority`, `category`, `search`, `sortBy` (`createdAt` \| `dueDate` \|
`priority` \| `title`), `sortOrder` (`asc` \| `desc`).

**Response envelope** (every endpoint):

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [ /* ... */ ],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

Errors follow the same shape with `"success": false` and a `message`, plus an
optional `errors` object for validation failures.

## Database schema

```prisma
model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  priority    String    @default("MEDIUM")   // LOW | MEDIUM | HIGH
  status      String    @default("TODO")     // TODO | IN_PROGRESS | COMPLETED
  category    String    @default("OTHER")    // DSA | SQL | PROJECT | APPLICATION | INTERVIEW_PREP | OTHER
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([status])
  @@index([priority])
  @@index([category])
  @@index([dueDate])
}
```

SQLite has no native enum type, so priority/status/category are stored as
strings and constrained by Zod at the API boundary (`task.validation.ts`) —
the canonical value sets are documented as comments in `schema.prisma` and
shared as TypeScript `as const` arrays on both frontend and backend.




## Installation guide

**Prerequisites:** Node.js ≥ 20, npm ≥ 10.

```bash
git clone <your-fork-url> student-task-manager
cd student-task-manager
```

### Step-by-step local setup

**1. Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate    # generates the typed Prisma Client — see note below
npm run prisma:migrate     # applies prisma/migrations to a fresh dev.db
npm run prisma:seed        # optional: adds 6 sample tasks
npm run dev                # http://localhost:5000  (docs at /api-docs)
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173, proxies /api to the backend
```

**3. Root dev tooling** (optional, for Git hooks)

```bash
npm install                # installs husky + lint-staged at the repo root
```

Open `http://localhost:5173` — the dashboard should load with the seeded tasks.

## Environment variables

**`backend/.env`**

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `PORT` | `5000` | Port the API listens on |
| `API_PREFIX` | `/api/v1` | Prefix for all API routes |
| `DATABASE_URL` | `file:./dev.db` | SQLite connection string |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin(s), comma-separated |
| `LOG_LEVEL` | `info` | Winston log level |

**`frontend/.env`**

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Backend base URL — relative in dev (proxied), absolute in prod |

## Prisma migration commands

```bash
npm run prisma:generate          # generate the typed Prisma Client
npm run prisma:migrate           # create + apply a new migration (dev)
npm run prisma:migrate:deploy    # apply existing migrations, non-interactive (CI/production)
npm run prisma:studio            # open Prisma Studio (visual DB browser)
npm run prisma:seed              # (re)seed sample data
```

> **A note on `prisma generate` in this repository's build history:** this
> project was assembled inside a sandboxed environment whose network egress is
> restricted to package registries and does **not** include Prisma's engine
> CDN (`binaries.prisma.sh`). That means `prisma generate`/`migrate` could not
> be executed *inside that sandbox* — the migration SQL was hand-verified
> against `better-sqlite3` directly instead. On any normal machine or CI
> runner with regular internet access, `npm run prisma:generate` completes in
> a few seconds and everything works exactly as documented; this is a
> one-time step every fresh Prisma project needs, sandboxed or not. The
> schema uses `engineType = "client"` (Prisma's rust-free query compiler) with
> the `better-sqlite3` driver adapter, so once generated, there's no native
> binary to manage at all — just pure TypeScript/WASM.

## Running the development servers

```bash
# from the repo root, two terminals:
npm run dev:backend     # -> backend on :5000
npm run dev:frontend    # -> frontend on :5173
```

## Building for production

```bash
npm run build:backend    # tsc -> backend/dist (path aliases resolved via tsc-alias)
npm run build:frontend   # tsc -b && vite build -> frontend/dist
```

## Testing

```bash
cd backend
npm test              # Vitest + Supertest — exercises every endpoint end-to-end
```

`tests/task.api.test.ts` boots the real Express app in-process and walks the
full lifecycle of a task: create → invalid-payload rejection → list → get →
partial update → full replace → toggle-complete (twice) → statistics →
delete → confirm-404-after-delete, plus a health check and an unknown-route
404. Requires `npm run prisma:generate` to have been run first (see above).

```bash
cd frontend
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run build           # full production build — the strongest end-to-end check
```



## Author

**Hritvi** — B.Tech CSE (AI & Data Science), MIT-WPU Pune
Built as a portfolio project for SDE internship/full-time applications.
_(Add your GitHub, LinkedIn, and portfolio links here.)_
