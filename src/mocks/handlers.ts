import { http, HttpResponse } from "msw";
import { db } from "../lib/db";

// Import candidates data - will be loaded at build time
let candidatesData: any[] = [];
interface StatusChange {
  from: string | null;
  to: string;
  timestamp: string;
  changedBy: string;
}
const statusHistoryMap = new Map<string, StatusChange[]>();
// Dynamically import the JSON file
async function loadCandidatesData() {
  if (candidatesData.length === 0) {
    try {
      const module = await import("../data/candidates.json");
      candidatesData = module.default || module;
      console.log("✅ Loaded", candidatesData.length, "candidates from JSON");
    } catch (error) {
      console.error("❌ Failed to load candidates.json:", error);
      candidatesData = [];
    }
  }
  return candidatesData;
}
function addStatusChange(candidateId: string, from: string | null, to: string) {
  if (!statusHistoryMap.has(candidateId)) {
    statusHistoryMap.set(candidateId, []);
  }

  const history = statusHistoryMap.get(candidateId)!;
  history.push({
    from,
    to,
    timestamp: new Date().toISOString(),
    changedBy: "John Doe", // In real app, get from auth
  });
}

// Simulate random failures (10% chance)
const shouldSimulateError = () => Math.random() < 0.1;

const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 300));

export const handlers = [
  // Get all jobs (ordered)
  http.get("/api/jobs", async () => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch jobs" },
        { status: 500 },
      );
    }

    const jobs = await db.jobs.orderBy("order").toArray();
    return HttpResponse.json(jobs);
  }),

  // Get single job
  http.get("/api/jobs/:id", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch job details" },
        { status: 500 },
      );
    }

    const { id } = params;
    const job = await db.jobs.get(id as string);

    if (!job) {
      return HttpResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return HttpResponse.json(job);
  }),

  // Create job
  http.post("/api/jobs", async ({ request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to create job" },
        { status: 500 },
      );
    }

    const newJob = (await request.json()) as any;
    const allJobs = await db.jobs.toArray();
    const maxOrder =
      allJobs.length > 0 ? Math.max(...allJobs.map((j) => j.order)) : -1;

    const job = {
      ...newJob,
      id: crypto.randomUUID(),
      postedAt: new Date().toISOString(),
      status: "open",
      order: maxOrder + 1,
    };

    await db.jobs.add(job);
    return HttpResponse.json(job, { status: 201 });
  }),

  // Update job
  http.put("/api/jobs/:id", async ({ params, request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to update job" },
        { status: 500 },
      );
    }

    const { id } = params;
    const updates = (await request.json()) as any;

    await db.jobs.update(id as string, updates);
    const job = await db.jobs.get(id as string);

    return HttpResponse.json(job);
  }),

  // Delete job
  http.delete("/api/jobs/:id", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to delete job" },
        { status: 500 },
      );
    }

    const { id } = params;
    await db.jobs.delete(id as string);
    return HttpResponse.json({ success: true });
  }),

  // Reorder jobs
  http.patch("/api/jobs/reorder", async ({ request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to reorder jobs" },
        { status: 500 },
      );
    }

    const { jobIds } = (await request.json()) as { jobIds: string[] };

    // Update order for each job in Dexie
    const updatePromises = jobIds.map((id, index) =>
      db.jobs.update(id, { order: index }),
    );

    await Promise.all(updatePromises);

    // Return updated jobs
    const jobs = await db.jobs.orderBy("order").toArray();

    return HttpResponse.json({ success: true, jobs });
  }),

  // Get applications for a job
  http.get("/api/jobs/:id/applications", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch applications" },
        { status: 500 },
      );
    }

    const { id } = params;
    const applications = await db.applications
      .where("jobId")
      .equals(id as string)
      .toArray();

    return HttpResponse.json(applications);
  }),

  // Submit application
  http.post("/api/applications", async ({ request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to submit application" },
        { status: 500 },
      );
    }

    const data = (await request.json()) as any;
    const application = {
      ...data,
      id: crypto.randomUUID(),
      status: "pending",
      appliedAt: new Date().toISOString(),
    };

    await db.applications.add(application);
    return HttpResponse.json(application, { status: 201 });
  }),
  http.get("/api/candidates", async ({ request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch candidates" },
        { status: 500 },
      );
    }

    const candidates = await loadCandidatesData();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "all";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    let filtered = [...candidates];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower),
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((c) => c.status === status);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }),

  http.get("/api/candidates/:id", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch candidate" },
        { status: 500 },
      );
    }

    const candidates = await loadCandidatesData();
    const { id } = params;
    const candidate = candidates.find((c) => c.id === id);

    if (!candidate) {
      return HttpResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(candidate);
  }),

  http.patch("/api/candidates/:id/status", async ({ params, request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to update candidate status" },
        { status: 500 },
      );
    }

    const candidates = await loadCandidatesData();
    const { id } = params;
    const { status } = (await request.json()) as any;

    const candidateIndex = candidates.findIndex((c) => c.id === id);

    if (candidateIndex === -1) {
      return HttpResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    candidates[candidateIndex].status = status;

    return HttpResponse.json(candidates[candidateIndex]);
  }),

  http.delete("/api/candidates/:id", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to delete candidate" },
        { status: 500 },
      );
    }

    const candidates = await loadCandidatesData();
    const { id } = params;
    const index = candidates.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    candidates.splice(index, 1);

    return HttpResponse.json({ success: true });
  }),

  http.get("/api/assessments", async () => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch assessments" },
        { status: 500 },
      );
    }

    const assessments = await db.assessments.toArray();
    return HttpResponse.json(assessments);
  }),

  http.get("/api/assessments/job/:jobId", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch assessment" },
        { status: 500 },
      );
    }

    const { jobId } = params;
    const assessment = await db.assessments
      .where("jobId")
      .equals(jobId as string)
      .first();

    if (!assessment) {
      return HttpResponse.json(
        { error: "Assessment not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(assessment);
  }),

  http.get("/api/assessments/:id", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch assessment" },
        { status: 500 },
      );
    }

    const { id } = params;
    const assessment = await db.assessments.get(id as string);

    if (!assessment) {
      return HttpResponse.json(
        { error: "Assessment not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(assessment);
  }),

  http.post("/api/assessments", async ({ request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to create assessment" },
        { status: 500 },
      );
    }

    const data = (await request.json()) as any;

    const existing = await db.assessments
      .where("jobId")
      .equals(data.jobId)
      .first();

    if (existing) {
      return HttpResponse.json(
        { error: "Assessment already exists for this job" },
        { status: 400 },
      );
    }

    const assessment = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.assessments.add(assessment);
    return HttpResponse.json(assessment, { status: 201 });
  }),

  // Update assessment
  http.put("/api/assessments/:id", async ({ params, request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to update assessment" },
        { status: 500 },
      );
    }

    const { id } = params;
    const updates = (await request.json()) as any;

    await db.assessments.update(id as string, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    const assessment = await db.assessments.get(id as string);

    return HttpResponse.json(assessment);
  }),

  http.delete("/api/assessments/:id", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to delete assessment" },
        { status: 500 },
      );
    }

    const { id } = params;
    await db.assessments.delete(id as string);
    return HttpResponse.json({ success: true });
  }),
  // Archive job
  http.patch("/api/jobs/:id/archive", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to archive job" },
        { status: 500 },
      );
    }

    const { id } = params;
    await db.jobs.update(id as string, { archived: true });
    const job = await db.jobs.get(id as string);

    return HttpResponse.json(job);
  }),

  // Unarchive job
  http.patch("/api/jobs/:id/unarchive", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to unarchive job" },
        { status: 500 },
      );
    }

    const { id } = params;
    await db.jobs.update(id as string, { archived: false });
    const job = await db.jobs.get(id as string);

    return HttpResponse.json(job);
  }),

  http.get("/api/jobs/validate-slug", async ({ request }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    const excludeId = url.searchParams.get("excludeId");

    console.log("Validating slug:", slug, "excludeId:", excludeId);

    if (!slug) {
      return HttpResponse.json({ isValid: false });
    }

    const existing = await db.jobs.where("slug").equals(slug).first();

    if (!existing) {
      return HttpResponse.json({ isValid: true });
    }

    if (excludeId && existing.id === excludeId) {
      return HttpResponse.json({ isValid: true });
    }

    return HttpResponse.json({ isValid: false });
  }),
  http.post("/api/candidates/:id/notes", async ({ params, request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to add note" },
        { status: 500 },
      );
    }

    const { id } = params;
    const note = (await request.json()) as any;

    const candidateIndex = candidatesData.findIndex((c) => c.id === id);

    if (candidateIndex === -1) {
      return HttpResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    if (!candidatesData[candidateIndex].notes) {
      candidatesData[candidateIndex].notes = [];
    }

    candidatesData[candidateIndex].notes.push(note);

    return HttpResponse.json(note, { status: 201 });
  }),
  http.get("/api/candidates/:id/history", async ({ params }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to fetch status history" },
        { status: 500 },
      );
    }

    const { id } = params;
    const history = statusHistoryMap.get(id as string) || [];

    return HttpResponse.json(history);
  }),

  http.patch("/api/candidates/:id/status", async ({ params, request }) => {
    await simulateDelay();

    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: "Network error: Failed to update candidate status" },
        { status: 500 },
      );
    }

    const candidates = await loadCandidatesData();
    const { id } = params;
    const { status } = (await request.json()) as any;

    const candidateIndex = candidates.findIndex((c) => c.id === id);

    if (candidateIndex === -1) {
      return HttpResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    const oldStatus = candidates[candidateIndex].status;

    candidates[candidateIndex].status = status;

    if (oldStatus !== status) {
      addStatusChange(id as string, oldStatus, status);
    }

    return HttpResponse.json(candidates[candidateIndex]);
  }),
];
