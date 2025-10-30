#  TalentFlow – Local Talent Management System

![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Dexie](https://img.shields.io/badge/Dexie-IndexedDB-blue)
![Zustand](https://img.shields.io/badge/State-Zustand-green)


> A modern, offline-capable recruitment management platform built with React, Dexie (IndexedDB), Zustand, and MSW.  
> TalentFlow manages jobs, candidates, applications, and assessments — all running 100% locally in the browser.

---

## Core Idea

TalentFlow is a **self-contained talent management system** where everything — data persistence, API mocks, and UI — runs locally.  
It mimics a full production-grade HRM system (like Lever or Greenhouse) but with **no backend dependency**.

---

##  Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| Frontend | React + Vite | Fast SPA with modular architecture |
| State | Zustand | Lightweight global store |
| Persistence | Dexie (IndexedDB) | Offline-first local DB |
| Mock API | MSW (Mock Service Worker) | Simulated backend for realistic API behavior |
| Styling | Tailwind + CSS Modules | Clean, scalable UI |
| Types | TypeScript | Type safety and better DX |

---

## Technical Decisions Summary

| Area | Decision | Reason |
|------|-----------|--------|
| **State Management** | Zustand over Redux | Simpler API, less boilerplate, faster dev loop |
| **Persistence** | Dexie (IndexedDB) | Enables offline-first and larger data storage |
| **Mocking** | MSW (Service Worker) | Realistic API simulation without backend |
| **Build Tool** | Vite | Fast HMR and smaller bundle output |
| **Styling** | Tailwind / CSS Modules | Modular, scalable, responsive UI |
| **Error Handling** | Global retry + optimistic UI | Smooth UX and resilient async flows |

---

##  Architecture Overview

```text
┌─────────────────────────────┐
│          Frontend (Vite)    │
│  ┌───────────────────────┐  │
│  │ React Components      │  │
│  │ Zustand Store          │──┐
│  │ Dexie (IndexedDB)     │  │ │
│  └───────────────────────┘  │ │
└─────────────────────────────┘ │
        ▲                        │
        │ http mock (MSW) │
        ▼                        │
┌─────────────────────────────┐  │
│        Mock API Layer       │  │
│     (MSW Handlers + Data)   │◄─┘
└─────────────────────────────┘
```

---

##  Local Database Schema (Dexie)

```ts
jobs:        id, title, department, location, status, createdAt
applications: id, jobId, candidateId, stage, appliedAt
candidates:   id, name, email, experience, skills, status
assessments:  id, jobId, sections, questions
```

Each entity supports full CRUD operations locally using Dexie transactions.

---

##  Core Features

### 1. Jobs Management
- Create, edit, delete, archive jobs.
- Drag & drop job reordering.
- Inline filtering by department, location, and status.

### 2. Candidate Management
- Add / edit candidate profiles.
- Assign candidates to jobs.
- Change candidate status (new → screening → interview → hired).

### 3. Application Tracking
- Each candidate’s application is linked to a specific job.
- Stage transitions update automatically in DB.
- Real-time updates reflected across UI using Zustand.

### 4. Assessment Builder
- Add sections & multiple question types:
  - Single-choice, multi-choice, short/long text, numeric, file upload.
- Live preview pane for dynamic rendering.
- Validation rules 
- All builder state stored in IndexedDB.

---

##  Flow Example: Creating a Job → Candidate → Application

1. User creates a new **Job** → stored in `jobs` table.
2. User adds a **Candidate** → stored in `candidates`.
3. On applying, an **Application** entry is created linking `jobId` + `candidateId`.
4. When job is archived, its related applications remain viewable.
5. All state changes are synced across UI via Zustand selectors.

---

##  Common Setup & Debugging Issues

| Issue | Cause | Fix |
|-------|--------|-----|
| **MSW Registration Error (`unsupported MIME type 'text/html'`)** | Vite served mockServiceWorker.js with wrong MIME type | Rebuild service worker using `npx msw init public/ --save` |
| **Dexie “VersionError”** | Schema changed between builds | Clear IndexedDB from browser dev tools or increment version in `db.ts` |
| **Jobs not rendering** | Seed data not loading properly | Ensure `db.jobs.bulkPut(seedJobs)` runs once on app load |
| **MSW not starting in production** | Service worker auto-disabled in prod build | Keep `if (import.meta.env.DEV) worker.start()` guard only in `main.tsx` |
| **“Cannot read properties of undefined (setState)”** | Zustand store mutation issue | Always mutate through `set()` not direct state edit |

---

##  Challenges Solved

- Offline persistence without any backend.
- Complex relational data (job–application–candidate) entirely local.
- Dynamic form builder with conditional logic in Dexie.
- Large local dataset management with pagination.
- Mocked APIs that behave exactly like live REST endpoints.

---

## 🚦 How to Run

```bash
# Clone the repo
git clone https://github.com/your-username/talentflow.git
cd talentflow

# Install dependencies
npm install

# Start mock backend and UI
npm run dev
```

Your app runs locally on [http://localhost:5173](http://localhost:5173)

---

## 📁 Folder Structure

```text
src/
 ┣ components/        → UI Components (JobCard, CandidateList, etc.)
 ┣ pages/             → JobsPage, CandidatesPage, AssessmentsPage
 ┣ stores/            → Zustand global stores
 ┣ lib/db.ts          → Dexie schema + migrations
 ┣ mocks/             → MSW handlers + mock data
 ┣ types/             → Shared TypeScript types
 ┗ main.tsx           → Entry point (MSW setup + React root)
```

---

