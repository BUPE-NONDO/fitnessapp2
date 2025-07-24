# TECHNICAL DESIGN DOCUMENT

---

### MY BENEFIT

**One‑sentence pitch:**
A fitness tracking app that helps users set, monitor, and achieve fitness goals through personalized dashboards and data-driven progress tracking.

---

## 1. OVERVIEW

**Goal:**

* Enable users to set measurable health/fitness goals.
* Let users log progress with context (e.g., weight, reps, distance).
* Visualize progress and habits over time.

**Key features:**

* Account creation and secure login.
* Create/edit goals (e.g., "Run 5km 3x per week").
* Log activity with timestamp and metrics.
* Goal progress dashboard and activity history.
* Optional streaks, milestones, and badges.

**Target users & success criteria:**

* Fitness-conscious individuals, trainers, and beginners.
* Success = consistent log-ins, goal completion rates, user retention.

---

## 2. TECH STACK (GOLDEN PATH)

| Layer              | Tech                                     |
| ------------------ | ---------------------------------------- |
| Runtime            | Node (Firebase Cloud Functions)          |
| Language           | TypeScript (strict)                      |
| Frontend           | React + Vite                             |
| UI Kit             | shadcn/ui (Radix + Tailwind source‑copy) |
| Styling            | Tailwind CSS + tokens                    |
| State / Fetching   | TanStack Query                           |
| Forms & Validation | React Hook Form + Zod                    |
| Shared Validation  | Zod (shared in `packages/shared`)        |
| API Layer          | tRPC (typed, router-based)               |
| Backend Services   | Firebase Auth · Firestore · Storage      |
| Monorepo Tooling   | PNPM workspaces + Turborepo              |
| Testing            | Vitest + Playwright + Storybook          |
| CI/CD              | GitHub Actions + Firebase Hosting        |
| Env Management     | T3 Env (Zod-validated + gitignored)      |
| Versioning         | Changesets                               |

---

## 3. MONOREPO LAYOUT (PNPM)

```
.
├── apps/
│   └── web/            ← React frontend (auth, dashboard, forms)
├── functions/          ← Firebase Functions + tRPC routers
├── packages/
│   ├── shared/         ← Zod schemas, utils, types
│   └── seeding/        ← Firestore seeding for emulator/dev
├── docs/               ← TDD, ADRs, API docs
└── .github/            ← GitHub Actions workflows
```

---

## 4. ARCHITECTURE

```
Client (React + TanStack Query)
     ⇄
tRPC (Cloud Functions)
     ⇄
Firestore + Firebase Auth
```

* Client fetches via TanStack Query + tRPC.
* Backend validates with Zod, writes to Firestore.
* Auth via Firebase; protected routes + server procedures.

---

## 5. DATA MODEL

| Entity   | Key fields                                   | Notes                   |
| -------- | -------------------------------------------- | ----------------------- |
| User     | uid, email, name, avatar                     | Auth via Firebase       |
| Goal     | id, userId, title, metric, frequency, target | Associated with a user  |
| LogEntry | id, goalId, date, value, notes               | Tied to a specific goal |
| Badge    | id, userId, title, unlockedAt                | Optional gamification   |

**Security rules:**

* Users can only read/write their own `goals`, `logs`, and `badges`.
* Admin-only write to `badges` metadata (if system-defined).

**Index strategy:**

* Composite: `logs` by `userId + date`, `goalId + date`

---

## 6. API DESIGN (tRPC)

| Router | Procedure     | Input Zod Schema      | Output      |
| ------ | ------------- | --------------------- | ----------- |
| user   | getSelf       | session               | User        |
| goal   | create        | title, metric, target | Goal        |
| goal   | getAll        | none                  | Goal\[]     |
| goal   | update/delete | id, updates           | Goal        |
| log    | create        | goalId, date, value   | LogEntry    |
| log    | getByGoal     | goalId                | LogEntry\[] |
| badge  | getUnlocked   | userId                | Badge\[]    |

**Error-handling conventions:**

* 401 on unauthenticated access.
* 403 on unauthorized access (wrong userId).
* 400 for Zod validation failures.
* Global error transformer in tRPC middleware.

---

## 7. TESTING STRATEGY

| Level / focus        | Toolset                                | Scope                      |
| -------------------- | -------------------------------------- | -------------------------- |
| Unit                 | Vitest                                 | Pure functions, Zod, utils |
| Component            | Vitest + Testing Library               | Form, card, UI layouts     |
| Visual / interaction | Storybook + @storybook/testing-library | Modal behavior, buttons    |
| End-to-end           | Playwright                             | Sign in, goal creation     |

**Coverage target:** ≥ 80% statements
**Seeding:**

```bash
pnpm seed  # Writes dummy users/goals/logs to Firestore emulator
```

---

## 8. CI / CD PIPELINE (GITHUB ACTIONS)

1. Setup PNPM + Turbo remote cache.
2. `pnpm exec turbo run lint typecheck` — ESLint + `tsc`.
3. `pnpm exec turbo run test` — Vitest test suite.
4. `pnpm exec turbo run build-storybook` — for hosting previews.
5. `pnpm exec turbo run e2e` — Playwright headless tests.
6. Deploy staging on PR via Firebase Hosting preview channel.
7. On merge to `main`:

   * Changesets release
   * Promote to production

---

## 9. ENVIRONMENTS & SECRETS

| Env        | URL                          | Notes                                   |
| ---------- | ---------------------------- | --------------------------------------- |
| local      | `http://localhost:5173`      | Uses Firebase emulator and `.env.stage` |
| preview-\* | Firebase Hosting preview     | Per-branch deploys                      |
| prod       | `https://app.yourdomain.com` | Main production hosting                 |

* Secrets stored via Firebase `functions:config:set` and GitHub repo secrets.
* Never checked into `.env`.

---

## 10. PERFORMANCE & SCALABILITY

* Firestore writes denormalized (avoid shared counters).
* Query performance: paginated, indexed reads.
* TanStack Query cache tuned (e.g., `staleTime`, `retry`, `prefetching`).
* Code splitting via Vite's dynamic imports.

---

## 11. MONITORING & LOGGING

| Concern        | Tool                          | Notes                      |
| -------------- | ----------------------------- | -------------------------- |
| Runtime errors | Firebase Crashlytics / Sentry | Captures frontend crashes  |
| Server logs    | Google Cloud Logging          | Functions log via `logger` |
| Analytics      | PostHog (or GA4)              | Funnels, goal conversions  |

---

## 12. ACCESSIBILITY & I18N

* `shadcn/ui` (Radix-based) ensures semantic HTML, keyboard focus.
* Storybook a11y addon for color contrast + ARIA checks.
* All pages pass WCAG 2.1 AA audits.
* Internationalization via `react-i18next` (planned post-MVP).

---

## 13. CODE QUALITY & FORMATTING

* Prettier auto-formats on save/commit.
* ESLint enforced in CI, including `eslint-plugin-perfectionist`.
* Husky + `lint-staged` run pre-commit checks (`tsc`, `lint`, `test`).

---

## 14. OPEN QUESTIONS / RISKS

| Item                        | Owner | Resolution date |
| --------------------------- | ----- | --------------- |
| Gamification system logic   | PM    | TBD             |
| i18n rollout (MVP or later) | Dev   | TBD             |

---

## 15. APPENDICES

* Setup script:

  ```bash
  pnpm exec turbo run setup
  ```
* Branching model: Conventional commits + Changesets.
* Links:

  * Figma: \[Link here]
  * Storybook: \[Link here]
  * Product Spec: \[Link here]
  * ADRs: `/docs/adr-*`
