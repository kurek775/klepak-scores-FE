# klepak-scores-FE

Angular 21 frontend for the Klepak Scores competition-management platform. Provides a mobile-friendly UI for importing events, assigning evaluators, entering scores (manually or via AI-assisted OCR), viewing leaderboards, designing diplomas, and managing users — with offline scoring support via IndexedDB.

---

## Tech Stack

| Component | Library / Version |
|---|---|
| Framework | Angular 21 |
| Styling | Tailwind CSS 4.1 |
| i18n | @jsverse/transloco 8.2 |
| PDF generation | jsPDF 4.1 |
| Offline storage | Dexie 4.3 (IndexedDB wrapper) |
| HTTP | Angular `HttpClient` + functional interceptors |
| State | Angular signals (`signal`, `computed`, `effect`) |
| Tests | Karma + Jasmine |

---

## Project Structure

```
klepak-scores-FE/client/src/app/
├── app.ts                        # Root component
├── app.config.ts                 # provideRouter, provideHttpClient, Transloco config
├── app.routes.ts                 # Top-level lazy-loaded route definitions
├── transloco-loader.ts           # HTTP loader for translation JSON files
│
├── auth/
│   ├── auth.service.ts           # JWT storage, login/logout/register, signal-based user state
│   ├── login/login.ts            # Login page component
│   └── register/register.ts     # Registration page component
│
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts         # Redirects unauthenticated users to /login
│   │   └── admin.guard.ts        # Redirects non-admins to /dashboard
│   ├── interceptors/
│   │   └── auth.interceptor.ts   # Attaches Bearer token; shows error toasts on non-401 failures
│   ├── models/                   # TypeScript interfaces (mirrors backend schemas)
│   │   ├── user.model.ts
│   │   ├── event.model.ts
│   │   ├── activity.model.ts
│   │   ├── age-category.model.ts
│   │   ├── leaderboard.model.ts
│   │   └── diploma.model.ts
│   └── services/
│       ├── offline-scores.db.ts  # Dexie database definition (IndexedDB)
│       └── offline-sync.service.ts # Save / sync pending offline records
│
├── dashboard/
│   └── dashboard.ts             # Landing page after login
│
├── events/
│   ├── event.service.ts         # HTTP calls for events, age-categories, leaderboard, CSV export
│   ├── group.service.ts         # HTTP calls for group/evaluator management
│   ├── diploma.service.ts       # HTTP calls for diploma template CRUD
│   ├── event-list/event-list.ts # List of all events
│   ├── event-detail/event-detail.ts # Event tree view + evaluator assignment (admin)
│   ├── event-import/event-import.ts # CSV upload form (admin only)
│   └── leaderboard/leaderboard.ts   # Per-activity ranked leaderboard view
│
├── scoring/
│   ├── scoring.service.ts        # HTTP calls for record submission + OCR
│   ├── scoring-view/scoring-view.ts # Score entry table; manual + AI-assisted
│   └── ai-review-modal/ai-review-modal.ts # OCR result review before saving
│
├── admin/
│   ├── user-list/user-list.ts   # User management (activate, change role)
│   └── diploma-editor/diploma-editor.ts # Diploma template designer + PDF preview
│
└── shared/
    ├── layout/navbar/navbar.ts  # Top navigation bar
    ├── toast.service.ts         # Global toast notification service
    └── toast.component.ts       # Toast display component
```

---

## How to Run Locally

The backend must be running first (see `klepak-scores-BE/README.md`).

```bash
cd klepak-scores-FE/client

# Install dependencies
npm install

# Start the development server (proxies /api → http://localhost:8000)
ng serve

# App available at: http://localhost:4200
```

The Angular dev server is pre-configured to proxy all requests to `http://localhost:4200/api/*` through to the FastAPI backend at `http://localhost:8000`.

---

## Routes

| Path | Component | Guard | Who can access |
|---|---|---|---|
| `/login` | `Login` | — | Everyone (public) |
| `/register` | `Register` | — | Everyone (public) |
| `/dashboard` | `Dashboard` | `authGuard` | Any authenticated user |
| `/events` | `EventList` | `authGuard` | Any authenticated user |
| `/events/import` | `EventImport` | `authGuard` + `adminGuard` | ADMIN only |
| `/events/:id` | `EventDetailComponent` | `authGuard` | Any authenticated user |
| `/events/:id/leaderboard` | `Leaderboard` | `authGuard` | Any authenticated user |
| `/events/:eventId/score/:activityId` | `ScoringView` | `authGuard` | Any authenticated user (evaluator access checked by API) |
| `/admin/users` | `UserList` | `authGuard` + `adminGuard` | ADMIN only |
| `/admin/events/:id/diploma` | `DiplomaEditor` | `authGuard` + `adminGuard` | ADMIN only |
| `/` | — | — | Redirects to `/dashboard` |

---

## Building for Production

```bash
cd klepak-scores-FE/client

ng build --configuration production
```

Output is written to `dist/client/browser/`. Serve the directory with any static file server or the nginx container defined in the production Docker Compose setup at the repository root.

The production build enables:
- Tree-shaking and minification
- AOT compilation
- `environment.production.ts` (sets `apiUrl` to the production backend URL)

---

## Key Design Decisions

### Signal-based State
All component state uses Angular signals (`signal()`, `computed()`, `effect()`) instead of RxJS BehaviorSubjects. `AuthService` exposes `user`, `isAuthenticated`, and `isAdmin` as read-only computed signals consumed directly in templates.

### Standalone Components
Every component is `standalone: true` with an explicit `imports: [...]` array. There are no `NgModule` declarations. Routes are lazy-loaded via `loadComponent`.

### Signal Inputs and Effects
Components that receive inputs from routes (e.g., event ID from route params) use `effect()` to react to input changes rather than `ngOnChanges`, consistent with Angular's signal-first model.

### Functional Guards and Interceptors
`authGuard` and `adminGuard` are functional guards (`CanActivateFn`). The auth interceptor is a functional `HttpInterceptorFn` registered in `app.config.ts` via `withInterceptors([authInterceptor])`.

### Offline-first Scoring
`OfflineSyncService` wraps Dexie (IndexedDB) to store score records locally when the network is unavailable. On reconnect the evaluator can trigger a bulk sync that calls `POST /records/bulk` and clears the local queue on success.

### Diploma PDF Generation
Diploma templates are designed visually in the `DiplomaEditor` component and stored on the backend as JSON (background image URL + positioned text/image items + font list). At generation time, the frontend reconstructs the diploma in the browser using jsPDF and the stored layout — no server-side PDF rendering is needed.

### i18n
All UI strings are managed with Transloco. Translation files live in `client/src/assets/i18n/`. The active locale is stored in `localStorage` and loaded via an HTTP loader on startup.
