# klepak-scores-FE

Angular SPA for the Klepak Scores competition-management platform. Provides event management, live scoring with offline support, AI-assisted OCR review, leaderboards, diploma editing, and multi-language support.

## Tech Stack

| Component | Library / Version |
|---|---|
| Framework | Angular 21.1 (standalone components) |
| CSS | Tailwind CSS v4 (CSS-first config) |
| Offline storage | Dexie 4.3 (IndexedDB) |
| PDF generation | jsPDF 4.1 |
| i18n | @jsverse/transloco 8.2 (Czech + English) |
| PWA | @angular/service-worker |
| Image compression | browser-image-compression 2.0 |
| Test runner | Vitest 4.0 |
| Build system | Angular CLI (esbuild) |

## Key Features

- **Dark mode** — Class-based toggle with anti-FOUC, persisted via `ThemeService`
- **Offline scoring** — Dexie-backed queue, syncs bulk records when back online
- **AI OCR review** — Modal for reviewing Gemini-extracted scores before saving
- **Diploma editor** — Visual template designer with jsPDF generation
- **Signal-based state** — `signal()`, `input()`, `output()`, `effect()` throughout
- **Lazy-loaded routes** — All feature components loaded on demand
- **PWA** — Service worker with prefetch for app shell, freshness strategy for API
- **i18n** — Czech (default) and English via Transloco
- **Invitation flow** — Token-based account setup for new evaluators
- **Password reset** — Forgot/reset flow with email token

## Project Structure

```
src/app/
├── auth/                     # Authentication pages
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── setup-account/        # Invitation-based onboarding
│   └── auth.service.ts
│
├── events/                   # Event management
│   ├── event-list/
│   ├── event-create/
│   ├── event-detail/
│   ├── event-import/         # CSV import wizard (preview → map → import)
│   ├── leaderboard/
│   ├── event.service.ts
│   ├── group.service.ts
│   └── diploma.service.ts
│
├── scoring/                  # Score entry
│   ├── scoring-view/         # Main scoring interface
│   ├── ai-review-modal/      # OCR result review
│   └── scoring.service.ts
│
├── admin/                    # Admin-only pages
│   ├── diploma-editor/       # Visual diploma template designer
│   ├── invitation-list/      # Manage user invitations
│   ├── user-list/            # Super-admin user management
│   └── invitation.service.ts
│
├── dashboard/                # Post-login landing
├── pages/
│   └── landing/              # Public landing page
│
├── core/
│   ├── guards/               # auth, admin, super-admin guards
│   ├── interceptors/         # JWT auth interceptor
│   ├── models/               # TypeScript interfaces (6 model files)
│   ├── services/             # offline-scores.db.ts, offline-sync.service.ts
│   ├── validators/           # Shared password validator
│   └── utils/                # destroy helper
│
├── shared/
│   ├── layout/navbar/        # Top navigation bar
│   ├── theme.service.ts      # Dark mode toggle
│   ├── toast.component.ts    # Toast notifications
│   └── toast.service.ts
│
├── app.routes.ts             # All routes (lazy-loaded)
├── app.config.ts             # Providers (Transloco, SW, HttpClient)
└── transloco-loader.ts       # i18n JSON loader
```

## Routes

| Path | Component | Guards |
|---|---|---|
| `/` | Landing | — |
| `login` | Login | — |
| `register` | Register | — |
| `forgot-password` | ForgotPassword | — |
| `reset-password` | ResetPassword | — |
| `setup-account` | SetupAccount | — |
| `dashboard` | Dashboard | auth |
| `events/create` | EventCreate | auth, admin |
| `events/import` | EventImport | auth, admin |
| `events/:id` | EventDetail | auth |
| `events/:id/leaderboard` | Leaderboard | auth |
| `events/:eventId/score/:activityId` | ScoringView | auth |
| `admin/events/:id/diploma` | DiplomaEditor | auth, admin |
| `admin/invitations` | InvitationList | auth, admin |
| `admin/users` | UserList | auth, superAdmin |

## Development

```bash
cd klepak-scores-FE/client

# Install dependencies
npm install

# Start dev server (port 4200, proxies /api → localhost:8001)
npm start
```

The proxy config (`proxy.conf.json`) rewrites `/api/*` requests to `http://localhost:8001` with the `/api` prefix stripped. Make sure the backend is running via `docker compose up` from the repo root.

## Build

```bash
# Production build
npm run build

# Output: dist/client/browser/
```

Production builds enable the service worker, output hashing, and tree shaking. Budget limits: 500kB warning / 1MB error for initial bundle.

## Tests

```bash
# Run unit tests (Vitest)
npm test
```

## Angular Patterns

- **Standalone components** — No NgModules, all components use `imports: [...]` in decorator
- **Signal-based state** — `signal()`, `input()`, `output()`, `effect()` for reactive state
- **Lazy loading** — All routes use `loadComponent` for code splitting
- **Cleanup** — All subscriptions use `takeUntilDestroyed(destroyRef)` pattern
- **Signal inputs** — React to changes via `effect()` (not `ngOnChanges`)
- **Auth guard** — Checks JWT expiry, not just token existence
- **Dark mode** — `ThemeService` toggles `.dark` class on `<html>`, anti-FOUC inline script in `index.html`
- **Tailwind v4** — CSS-first config with `@custom-variant dark` in `styles.css`
