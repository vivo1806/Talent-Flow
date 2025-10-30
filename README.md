# TalentFlow – A Mini Hiring Platform

A modern, feature-rich hiring platform built with React, TypeScript, and cutting-edge frontend technologies. TalentFlow demonstrates advanced frontend development practices including state management, data persistence, API mocking, and drag-and-drop functionality.

![TalentFlow](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Vite](https://img.shields.io/badge/Vite-5.x-purple) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Data Flow Architecture](#data-flow-architecture)
- [Key Implementation Details](#key-implementation-details)
- [Deployment](#deployment)
- [Interview Questions & Answers](#interview-questions--answers)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

TalentFlow is a comprehensive hiring management system that allows organizations to:
- **Manage Job Postings** with drag-and-drop prioritization
- **Track Candidates** through a Kanban-style pipeline
- **Create Assessments** with multiple question types
- **Persist Data Locally** using IndexedDB for offline capability
- **Handle Errors Gracefully** with retry mechanisms

This project showcases production-ready patterns for building scalable React applications without a backend.

---

## ✨ Features

### 🔹 Job Management
- Create, read, update, and delete job postings
- **Native HTML5 drag-and-drop** for reordering jobs by priority
- Real-time search and filtering
- Status management (Open/Closed)
- Optimistic UI updates with rollback on failure

### 🔹 Candidate Pipeline
- **Kanban board** with 5 status columns:
  - New → Screening → Interview → Offer → Rejected
- Drag-and-drop status updates
- Detailed candidate profiles with skills, experience, and salary expectations
- Bulk actions and filtering

### 🔹 Assessment Builder
- Create custom technical assessments for each job
- Support for 4 question types:
  - Multiple Choice (with correct answers)
  - Short Answer
  - Long Answer
  - Coding Challenges
- Set time limits per question
- Define passing scores

### 🔹 Advanced Features
- **Global Loading Overlay** - Visual feedback for all async operations
- **Error Handling** - 10% random error simulation with retry mechanism
- **Data Persistence** - IndexedDB via Dexie for offline-first experience
- **Mock API** - MSW (Mock Service Worker) simulates realistic backend delays
- **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🛠 Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library for component-based architecture |
| **TypeScript** | 5.5.3 | Type safety and better developer experience |
| **Vite** | 5.4.2 | Fast build tool and dev server |
| **React Router** | 6.26.1 | Client-side routing and navigation |

### State & Data Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 4.5.5 | Lightweight state management (alternative to Redux) |
| **Dexie** | 4.0.8 | IndexedDB wrapper for client-side persistence |
| **MSW** | 2.4.9 | API mocking for development and testing |

### Why This Stack?

1. **Vite over Create React App**: 10-20x faster HMR, optimized builds
2. **Zustand over Redux**: 3x less boilerplate, simpler API, better TypeScript support
3. **Dexie over LocalStorage**: Handles complex queries, supports transactions, 50MB+ storage
4. **MSW over JSON Server**: Intercepts network requests, no separate server needed

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/yourusername/talentflow.git
cd talentflow

# Install dependencies
npm install

# Start development server
npm run dev
```

That's it! Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts
```bash
npm run dev        # Start development server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## 📁 Project Structure
```
talentflow/
├── public/
│   └── mockServiceWorker.js    # MSW service worker (auto-generated)
├── src/
│   ├── lib/
│   │   └── db.ts               # Dexie database setup + seeding
│   ├── mocks/
│   │   ├── browser.ts          # MSW worker initialization
│   │   └── handlers.ts         # API endpoint handlers (CRUD)
│   ├── pages/
│   │   ├── HomePage.tsx        # Landing page
│   │   ├── JobsPage.tsx        # Job listing with drag-and-drop
│   │   ├── CandidatesPage.tsx  # Kanban board for candidates
│   │   └── AssessmentsPage.tsx # Assessment builder
│   ├── stores/
│   │   ├── uiStore.ts          # Global loading/error state
│   │   ├── jobsStore.ts        # Jobs state + actions
│   │   ├── candidatesStore.ts  # Candidates state + actions
│   │   └── assessmentsStore.ts # Assessments state + actions
│   ├── types/
│   │   └── job.ts              # TypeScript interfaces
│   ├── App.tsx                 # Root component with routing
│   ├── main.tsx                # Entry point (MSW + Dexie init)
│   └── index.css               # Global styles
├── vercel.json                 # Vercel deployment config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔄 Data Flow Architecture

### Request Flow Diagram
```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │
       │ (1) User Action (e.g., fetchJobs())
       ▼
┌─────────────────┐
│  Zustand Store  │ ◄─── Global state management
└──────┬──────────┘
       │
       │ (2) fetch('/api/jobs')
       ▼
┌─────────────────┐
│   MSW Handler   │ ◄─── Intercepts network request
└──────┬──────────┘
       │
       │ (3) Query/Update
       ▼
┌─────────────────┐
│  Dexie (IndexedDB) │ ◄─── Client-side database
└──────┬──────────┘
       │
       │ (4) Return Data
       ▼
┌─────────────────┐
│   MSW Handler   │
└──────┬──────────┘
       │
       │ (5) HTTP Response
       ▼
┌─────────────────┐
│  Zustand Store  │
└──────┬──────────┘
       │
       │ (6) setState() triggers re-render
       ▼
┌─────────────────┐
│   User UI       │ ◄─── Updated UI
└─────────────────┘
```

### Example: Adding a New Job
```typescript
// 1. User clicks "Add Job" button
<button onClick={handleAddJob}>Add Job</button>

// 2. Component calls Zustand action
const { addJob } = useJobsStore();
await addJob(newJobData);

// 3. Zustand makes HTTP request
fetch('/api/jobs', {
  method: 'POST',
  body: JSON.stringify(newJobData)
});

// 4. MSW intercepts and handles
http.post('/api/jobs', async ({ request }) => {
  const job = await request.json();
  await db.jobs.add(job);  // Save to Dexie
  return HttpResponse.json(job);
});

// 5. Zustand updates state
set((state) => ({ jobs: [...state.jobs, newJob] }));

// 6. React re-renders UI with new job
```

---

## 🔑 Key Implementation Details

### 1. Native HTML5 Drag-and-Drop
```typescript
// JobsPage.tsx - Simplified
<div
  draggable
  onDragStart={(e) => setDraggedIndex(index)}
  onDrop={(e) => reorderJobs(draggedIndex, dropIndex)}
>
  {job.title}
</div>
```

**Why not use react-beautiful-dnd?**
- Native HTML5 is 20KB lighter
- No external dependencies
- Better performance for simple use cases
- Works across all modern browsers

### 2. Optimistic UI Updates
```typescript
reorderJobs: async (sourceIndex, destinationIndex) => {
  const { jobs } = get();
  
  // Update UI immediately (optimistic)
  const reorderedJobs = reorder(jobs, sourceIndex, destinationIndex);
  set({ jobs: reorderedJobs });
  
  // Persist to backend
  try {
    await fetch('/api/jobs/reorder', { ... });
  } catch (error) {
    // Rollback on failure
    set({ jobs }); 
  }
}
```

### 3. Global Error Handling with Retry
```typescript
// Store the last failed action
let lastAction: (() => Promise<void>) | null = null;

fetchJobs: async () => {
  const action = async () => {
    try {
      const response = await fetch('/api/jobs');
      // ... handle response
    } catch (error) {
      useUIStore.getState().setGlobalError(error.message);
    }
  };
  
  lastAction = action; // Save for retry
  await action();
},

retryLastAction: async () => {
  if (lastAction) {
    await lastAction(); // Re-execute
  }
}
```

### 4. IndexedDB with Dexie
```typescript
// db.ts
export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, string>;
  
  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, company, status, order'
    });
  }
}

// Query examples
await db.jobs.orderBy('order').toArray();          // Get all sorted
await db.jobs.where('status').equals('open').toArray(); // Filter
await db.jobs.update(id, { status: 'closed' });    // Update
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/talentflow.git
   git push -u origin main
```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

3. **Deploy via CLI** (Alternative)
```bash
   npm install -g vercel
   vercel login
   vercel
```

Your app will be live at `https://talentflow-yourusername.vercel.app`

### Environment Variables

No environment variables needed! Everything runs client-side.

---

## 🎤 Interview Questions & Answers

### Architecture & Design

**Q: Why did you choose Zustand over Redux?**

**A:** Zustand offers several advantages for this use case:
- **Less boilerplate**: No actions, reducers, or dispatch needed
- **TypeScript-first**: Better type inference out of the box
- **Simpler API**: `useStore()` vs `useSelector()` + `useDispatch()`
- **Smaller bundle**: ~1KB vs ~8KB (Redux + Toolkit)
- **No provider wrapping**: Works immediately after `create()`

For complex apps with time-travel debugging or strict Redux DevTools needs, Redux is still valuable. But for 90% of use cases, Zustand is faster to develop and easier to maintain.

---

**Q: How does MSW work without a real backend?**

**A:** MSW (Mock Service Worker) uses the Service Worker API to intercept network requests at the network level:

1. During dev, MSW starts a service worker in the browser
2. When app makes `fetch('/api/jobs')`, the service worker catches it
3. MSW routes the request to our handlers in `mocks/handlers.ts`
4. Handlers interact with Dexie (IndexedDB) and return mock responses
5. App receives the response as if it came from a real server

**Benefits:**
- Realistic network delays and error simulation
- No CORS issues (requests don't leave the browser)
- Can be disabled in production by not starting the worker
- Works with any HTTP library (fetch, axios, etc.)

---

**Q: Explain the drag-and-drop implementation.**

**A:** We use native HTML5 Drag and Drop API:
```typescript
// 1. Make element draggable
<div draggable onDragStart={handleDragStart}>

// 2. Track what's being dragged
handleDragStart = (e, index) => {
  setDraggedIndex(index);
  e.dataTransfer.effectAllowed = 'move';
}

// 3. Allow dropping
handleDragOver = (e, index) => {
  e.preventDefault(); // Required to allow drop
  setDragOverIndex(index); // Visual feedback
}

// 4. Handle the drop
handleDrop = (e, dropIndex) => {
  reorderJobs(draggedIndex, dropIndex);
}
```

**Key points:**
- `draggable` attribute makes elements draggable
- `e.preventDefault()` in `onDragOver` enables dropping
- `dataTransfer` API passes data between drag source and target
- We use state (`draggedIndex`, `dragOverIndex`) for visual feedback

**Why not a library?**
- Native API is sufficient for our simple reordering needs
- No extra bundle size
- Full control over behavior and styling

---

**Q: How do you handle offline functionality?**

**A:** TalentFlow is offline-first by design:

1. **IndexedDB via Dexie**: All data stored locally
   - Survives page refreshes
   - 50MB+ storage capacity
   - Works offline immediately

2. **Service Worker (MSW)**: Intercepts requests
   - No actual network calls needed
   - "Backend" is just local database queries

3. **Future Enhancement**: For real backend sync:
```typescript
   // Queue failed requests
   if (navigator.onLine) {
     await syncToBackend();
   } else {
     queueForLater(request);
   }
   
   // Sync when online
   window.addEventListener('online', () => {
     processQueue();
   });
```

---

**Q: Walk me through the error handling strategy.**

**A:** Three-layer error handling approach:

**Layer 1: Local Error State** (per-store)
```typescript
try {
  const response = await fetch('/api/jobs');
  set({ jobs: await response.json() });
} catch (error) {
  set({ error: error.message }); // Local error
}
```

**Layer 2: Global Error Banner** (app-wide)
```typescript
catch (error) {
  useUIStore.getState().setGlobalError(error.message);
}
```

**Layer 3: Retry Mechanism**
```typescript
let lastAction = null;

fetchJobs: async () => {
  const action = async () => { /* ... */ };
  lastAction = action; // Save for retry
  await action();
},

retryLastAction: () => lastAction?.();
```

**Why this approach?**
- Local errors for component-specific handling
- Global errors for network/critical issues
- Retry gives users a way to recover without refresh

---

**Q: How would you add real backend support?**

**A:** Two approaches:

**Option 1: Replace MSW Handlers**
```typescript
// Remove MSW initialization from main.tsx
// Update stores to call real API

fetchJobs: async () => {
  const response = await fetch('https://api.example.com/jobs');
  const jobs = await response.json();
  
  // Optionally cache in Dexie for offline
  await db.jobs.bulkPut(jobs);
  
  set({ jobs });
}
```

**Option 2: Keep MSW for Development**
```typescript
// main.tsx
if (import.meta.env.DEV) {
  await worker.start(); // MSW only in dev
}

// Stores check environment
const BASE_URL = import.meta.env.PROD 
  ? 'https://api.example.com'
  : '/api'; // MSW intercepts in dev
```

**Migration Steps:**
1. Deploy real backend (Node.js, Python, etc.)
2. Update API URLs in stores
3. Add authentication (JWT tokens in headers)
4. Keep Dexie for caching/offline mode
5. Use MSW for testing only

---

**Q: What's the performance impact of IndexedDB?**

**A:** IndexedDB is highly optimized:

**Performance characteristics:**
- **Read**: ~1ms for simple queries, ~10ms for complex filters
- **Write**: ~5-10ms per record
- **Bulk operations**: Much faster (1000 records in ~50ms)

**Best practices we follow:**
```typescript
// ✅ Good: Bulk operations
await db.jobs.bulkAdd(jobs);

// ❌ Bad: Loop with individual inserts
for (const job of jobs) {
  await db.jobs.add(job); // Slow!
}

// ✅ Good: Indexed queries
await db.jobs.where('status').equals('open').toArray();

// ❌ Bad: Full table scan with filter
await db.jobs.toArray().then(jobs => jobs.filter(...));
```

**Comparison:**
- LocalStorage: Sync, blocks UI, max 5-10MB, string-only
- IndexedDB: Async, non-blocking, 50MB+, structured data

---

**Q: How does the assessment builder prevent data loss?**

**A:** Multiple safeguards:

1. **Auto-save to Dexie**: Every change persists immediately
2. **Optimistic UI**: Users see changes instantly
3. **Validation before submit**: Client-side checks
4. **Confirmation dialogs**: For destructive actions
```typescript
// Example: Auto-save draft
const [questions, setQuestions] = useState([]);

useEffect(() => {
  const draft = { jobId, questions };
  db.drafts.put(draft); // Auto-save
}, [questions]);

// Restore on page load
useEffect(() => {
  db.drafts.get(jobId).then(setQuestions);
}, []);
```

---

### Performance & Optimization

**Q: What optimizations did you implement?**

**A:** Several key optimizations:

1. **Code Splitting** (via React Router)
```typescript
   const JobsPage = lazy(() => import('./pages/JobsPage'));
   // Only loads when route is accessed
```

2. **Memoization** for expensive computations
```typescript
   const groupedCandidates = useMemo(() => 
     groupByStatus(candidates),
     [candidates]
   );
```

3. **Debouncing** for search inputs
```typescript
   const debouncedSearch = useDebounce(searchTerm, 300);
```

4. **Optimistic UI updates** to avoid loading states

5. **Indexed queries** in Dexie
```typescript
   // Fast: Uses index
   db.jobs.where('status').equals('open')
   
   // Slow: Full scan
   db.jobs.toArray().then(jobs => jobs.filter(...))
```

---

**Q: How would you add unit tests?**

**A:** Testing strategy:
```typescript
// 1. Test Zustand stores (no mocking needed!)
import { renderHook, act } from '@testing-library/react';
import { useJobsStore } from './jobsStore';

test('fetchJobs updates state', async () => {
  const { result } = renderHook(() => useJobsStore());
  
  await act(async () => {
    await result.current.fetchJobs();
  });
  
  expect(result.current.jobs.length).toBeGreaterThan(0);
});

// 2. Test components with React Testing Library
import { render, screen } from '@testing-library/react';
import JobsPage from './JobsPage';

test('renders job listings', () => {
  render(<JobsPage />);
  expect(screen.getByText(/Open Positions/i)).toBeInTheDocument();
});

// 3. Test MSW handlers
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/jobs', (req, res, ctx) => {
    return res(ctx.json([{ id: '1', title: 'Test' }]));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
```

**Tools needed:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

---

## 🚧 Future Enhancements

### Phase 1: Core Features
- [ ] Search and advanced filtering for jobs/candidates
- [ ] Export data to CSV/PDF
- [ ] Dark mode support
- [ ] Email notifications (via EmailJS)

### Phase 2: Advanced Features
- [ ] Real-time collaboration (WebSockets/Supabase)
- [ ] Video interview scheduling integration
- [ ] Analytics dashboard (charts with Recharts)
- [ ] AI-powered candidate matching

### Phase 3: Enterprise Features
- [ ] Multi-tenant support
- [ ] Role-based access control (RBAC)
- [ ] Audit logs
- [ ] SSO integration (OAuth)

---

## 📝 License

MIT License - feel free to use this project for learning or your portfolio.

---

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss changes.

---

## 📧 Contact

**Your Name**  
Email: your.email@example.com  
Portfolio: https://yourportfolio.com  
LinkedIn: https://linkedin.com/in/yourprofile

---

## 🙏 Acknowledgments

- React Team for the amazing framework
- Zustand for elegant state management
- Dexie.js for making IndexedDB painless
- MSW for revolutionizing API mocking

---

**Built with ❤️ by [Your Name]**
