import { useEffect, useState, useMemo } from "react";
import { useJobsStore } from "../stores/jobsStore";
import { Job } from "../types/job";
import JobModal from "../components/JobModal";
import "./JobsPage.css";

export default function JobsPage() {
  const {
    jobs,
    isLoading,
    error,
    showArchived,
    filters,
    currentPage,
    itemsPerPage,
    fetchJobs,
    deleteJob,
    archiveJob,
    unarchiveJob,
    toggleShowArchived,
    setFilter,
    setPage,
    reorderJobs,
  } = useJobsStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const { filteredJobs, totalPages } = useMemo(() => {
    let filtered = jobs.filter((job) =>
      showArchived ? job.archived : !job.archived,
    );

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower),
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((job) => job.status === filters.status);
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((job) => job.type === filters.type);
    }

    const total = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    return { filteredJobs: paginated, totalPages: total };
  }, [jobs, showArchived, filters, currentPage, itemsPerPage]);

  // ===== HANDLERS =====
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number,
  ) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    await reorderJobs(draggedIndex, dropIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      window.confirm("Are you sure you want to permanently delete this job?")
    ) {
      await deleteJob(id);
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await archiveJob(id);
  };

  const handleUnarchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await unarchiveJob(id);
  };

  const handleEdit = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="jobs-page-container">
      <div className="jobs-page-header">
        <div className="header-top">
          <h1>
            {showArchived ? "Archived Jobs" : "Open Positions"} (
            {
              jobs.filter((j) => (showArchived ? j.archived : !j.archived))
                .length
            }
            )
          </h1>

          <div className="header-actions">
            <button
              onClick={toggleShowArchived}
              className="toggle-archived-btn"
            >
              {showArchived ? " Show Active" : " Show Archived"}
            </button>

            {!showArchived && (
              <>
                <div className="drag-hint">
                  <span className="drag-hint-text">Drag to reorder</span>
                </div>

                <button onClick={handleCreateNew} className="create-job-btn">
                  + Create Job
                </button>
              </>
            )}
          </div>
        </div>

        {!showArchived && (
          <div className="filters-grid">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              className="filter-input"
            />

            <select
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilter("type", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        )}

        <div className="results-count">
          Showing {filteredJobs.length} of{" "}
          {jobs.filter((j) => (showArchived ? j.archived : !j.archived)).length}{" "}
          jobs
          {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <p>
            {filters.search ||
            filters.status !== "all" ||
            filters.type !== "all"
              ? "No jobs match your filters."
              : showArchived
                ? "No archived jobs."
                : "No active jobs. Create your first job posting!"}
          </p>
        </div>
      ) : (
        <>
          <div className="jobs-grid">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                draggable={!showArchived}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`job-card ${!showArchived ? "draggable" : ""} ${dragOverIndex === index ? "drag-over" : ""} ${draggedIndex === index ? "dragging" : ""}`}
              >
                <h3>{job.title}</h3>
                <p className="job-info">
                  {job.company} • {job.location}
                </p>

                <div className="job-actions">
                  <button onClick={(e) => handleEdit(e, job)}>Edit</button>
                  {!showArchived ? (
                    <button onClick={(e) => handleArchive(e, job.id)}>
                      Archive
                    </button>
                  ) : (
                    <button onClick={(e) => handleUnarchive(e, job.id)}>
                      Unarchive
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, job.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!showArchived && totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <JobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={editingJob}
      />
    </div>
  );
}
