# 📋 Project TODO — Fitness Tracker App

---

## ✅ Milestone 1 — Project & Environment Setup

> Goal: Get a working development environment with Firebase integration.

* [x] Create GitHub repo and clone locally.
* [x] Setup monorepo with Turborepo and PNPM workspaces.
* [x] Add `.gitignore`, `README.md`, and `docs/technical-design-doc.md`.
* [x] Create Firebase project (stage) with:

  * [x] Firestore
  * [x] Firebase Auth (email/password)
  * [x] Hosting
* [x] Add Firebase config to `.env.stage` with `VITE_` prefixes.
* [x] Confirm `.env*` files are gitignored.
* [x] Create placeholder tRPC router and Zod schema.
* [ ] Deploy to Firebase Hosting (staging).
* [ ] Validate working login page with Firebase Auth.

---

## 🔄 Milestone 2 — Core UI & Auth Flows

> Goal: Scaffold UI with Tailwind and shadcn/ui, implement sign in/up.

* [ ] Install and configure:

  * Tailwind CSS
  * shadcn/ui
  * React Router or App Router
* [ ] Build layouts:

  * [ ] Auth layout (login/register pages)
  * [ ] App shell (nav, sidebar, main)
* [ ] Integrate Firebase Auth:

  * [ ] Email/password login
  * [ ] Auth state sync with TanStack Query
  * [ ] Auth-protected routes
* [ ] Add `useUser()` hook + `requireAuth()` wrapper.
* [ ] Test login, logout, and protected routing locally.

---

## 🧱 Milestone 3 — Goals & Logging Functionality

> Goal: Build backend logic for setting goals and logging progress.

* [ ] Define Zod schemas:

  * [ ] Goal schema
  * [ ] LogEntry schema
* [ ] tRPC procedures:

  * [ ] `goal.create`, `goal.getAll`, `goal.update`, `goal.delete`
  * [ ] `log.create`, `log.getByGoal`
* [ ] Firestore rules:

  * [ ] Users can only access their own data.
  * [ ] Add composite index for goalId + date.
* [ ] Create seeding script (`pnpm seed`) for dummy data.

---

## 📊 Milestone 4 — Dashboard & Progress Tracking

> Goal: Build UI to visualize user progress over time.

* [ ] Dashboard:

  * [ ] List of current goals
  * [ ] Recent logs
  * [ ] Add log form (per goal)
* [ ] Charts:

  * [ ] Weekly progress chart (goal completion %)
  * [ ] Goal streak indicator
* [ ] Add badge logic (optional gamification).
* [ ] Build GoalDetails page with:

  * [ ] Log timeline
  * [ ] Edit/delete buttons

---

## 🧪 Milestone 5 — Testing & Validation

> Goal: Ensure app is reliable and well-tested.

* [ ] Add Vitest tests for:

  * [ ] tRPC procedures
  * [ ] Zod validation
* [ ] Component tests:

  * [ ] Goal form
  * [ ] Log entry list
* [ ] Storybook stories for all UI components.
* [ ] Playwright E2E tests:

  * [ ] Sign in/out
  * [ ] Create goal
  * [ ] Log activity
* [ ] Target ≥ 80% coverage (statements).

---

## 🚀 Milestone 6 — CI/CD & Production Deploy

> Goal: Harden and ship a production-ready version.

* [ ] Setup GitHub Actions:

  * [ ] `lint`, `typecheck`, `test`
  * [ ] Build Storybook
  * [ ] Deploy preview per PR
* [ ] Create Firebase Prod project
* [ ] Add `.env.prod`
* [ ] Run Changeset release on `main` merge
* [ ] Promote to production
* [ ] Confirm hosting + auth + Firestore rules work correctly

---

## 🧼 Milestone 7 — Polish, Accessibility & Launch

> Goal: Refine UX and meet a11y standards for a smooth launch.

* [ ] Add visual feedback (loading states, error messages)
* [ ] Storybook accessibility audit (contrast, focus traps)
* [ ] Confirm keyboard nav on all pages
* [ ] Implement i18n placeholder config (e.g. `react-i18next`)
* [ ] Run Lighthouse audit (90+ target)
* [ ] Final changelog + release notes
* [ ] Share to test users!
