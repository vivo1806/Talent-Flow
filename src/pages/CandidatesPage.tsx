import { useEffect, useState } from "react";
import { useCandidatesStore } from "../stores/candidatesStore";
import { Candidate } from "../types/job";
import NotesSection from "../components/NotesSection";
import { useNavigate } from "react-router-dom";
import "./CandidatesPage.css";

const STATUS_COLORS: Record<Candidate["status"], { bg: string; text: string }> =
  {
    new: { bg: "#dbeafe", text: "#1e40af" },
    screening: { bg: "#fef3c7", text: "#92400e" },
    interview: { bg: "#e0e7ff", text: "#3730a3" },
    offer: { bg: "#d1fae5", text: "#065f46" },
    rejected: { bg: "#fee2e2", text: "#991b1b" },
  };

const STATUS_OPTIONS: Candidate["status"][] = [
  "new",
  "screening",
  "interview",
  "offer",
  "rejected",
];

export default function CandidatesPage() {
  const navigate = useNavigate();
  const {
    candidates,
    pagination,
    isLoading,
    error,
    filters = { search: "", status: "all" },
    fetchCandidates,
    updateCandidateStatus,
    deleteCandidate,
    addNote,
    setSearch,
    setStatusFilter,
  } = useCandidatesStore();

  const [localSearch, setLocalSearch] = useState(filters?.search || "");
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(
    null,
  );
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (setSearch) {
        setSearch(localSearch);
        fetchCandidates(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, setSearch, fetchCandidates]);

  const handleStatusChange = async (
    id: string,
    newStatus: Candidate["status"],
  ) => {
    await updateCandidateStatus(id, newStatus);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      await deleteCandidate(id);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchCandidates(1);
  };

  const handlePageChange = (page: number) => {
    fetchCandidates(page);
  };

  const handleAddNote = async (
    candidateId: string,
    text: string,
    mentions: string[],
  ) => {
    await addNote(candidateId, text, mentions);
  };

  const handleDragStart = (candidate: Candidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragEnd = () => {
    setDraggedCandidate(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (
    e: React.DragEvent,
    newStatus: Candidate["status"],
  ) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedCandidate && draggedCandidate.status !== newStatus) {
      await handleStatusChange(draggedCandidate.id, newStatus);
    }
    setDraggedCandidate(null);
  };

  if (isLoading && candidates.length === 0) {
    return (
      <div className="candidates-loading">
        <p>Loading candidates...</p>
      </div>
    );
  }

  const groupedCandidates = STATUS_OPTIONS.reduce(
    (acc, status) => {
      acc[status] = candidates.filter((c) => c.status === status);
      return acc;
    },
    {} as Record<Candidate["status"], Candidate[]>,
  );

  return (
    <div className="candidates-page-container">
      <div className="candidates-page-header">
        <h1 className="candidates-page-title">
          Candidates
          {pagination && ` (${pagination.total} total)`}
        </h1>

        <div className="candidates-filter-bar">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="candidates-search-input"
          />

          <select
            value={filters?.status || "all"}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="candidates-status-filter"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {pagination && (
          <div className="candidates-results-info">
            Showing {candidates.length} of {pagination.total} candidates
            {localSearch && ` (filtered by "${localSearch}")`}
          </div>
        )}
      </div>

      {error && <div className="candidates-error">{error}</div>}

      {(filters?.status || "all") === "all" ? (
        <div className="candidates-kanban-grid">
          {STATUS_OPTIONS.map((status) => (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`kanban-column ${
                dragOverColumn === status ? "drag-over" : ""
              }`}
            >
              <div
                className="kanban-column-header"
                style={{
                  backgroundColor: STATUS_COLORS[status].bg,
                  color: STATUS_COLORS[status].text,
                }}
              >
                <span>{status}</span>
                <span className="kanban-column-count">
                  {groupedCandidates[status]?.length || 0}
                </span>
              </div>

              <div className="kanban-column-body">
                <div className="kanban-column-cards">
                  {groupedCandidates[status]?.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onAddNote={handleAddNote}
                      onDragStart={() => handleDragStart(candidate)}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedCandidate?.id === candidate.id}
                      onViewProfile={() =>
                        navigate(`/candidates/${candidate.id}`)
                      }
                    />
                  ))}

                  {(!groupedCandidates[status] ||
                    groupedCandidates[status].length === 0) && (
                    <div className="kanban-empty-state">
                      {dragOverColumn === status
                        ? "Drop here"
                        : "No candidates"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="candidates-list-view">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onAddNote={handleAddNote}
              onViewProfile={() => navigate(`/candidates/${candidate.id}`)}
              listView
            />
          ))}

          {candidates.length === 0 && (
            <div className="candidates-empty-state">
              No candidates found matching your filters.
            </div>
          )}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="candidates-pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
            className="pagination-btn"
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || isLoading}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  onStatusChange: (id: string, status: Candidate["status"]) => void;
  onDelete: (id: string) => void;
  onAddNote: (candidateId: string, text: string, mentions: string[]) => void;
  onViewProfile: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  listView?: boolean;
}

function CandidateCard({
  candidate,
  onStatusChange,
  onDelete,
  onAddNote,
  onViewProfile,
  onDragStart,
  onDragEnd,
  isDragging = false,
  listView = false,
}: CandidateCardProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div
      className={`candidate-card ${isDragging ? "dragging" : ""}`}
      draggable={!listView}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <h3
        className="candidate-card-title"
        onClick={onViewProfile}
        style={{ cursor: "pointer" }}
      >
        {candidate.name}
      </h3>
      <p className="candidate-card-text"> {candidate.email}</p>
      <p className="candidate-card-text"> {candidate.phone}</p>
      <p className="candidate-card-text"> {candidate.location}</p>
      <p className="candidate-card-position">{candidate.position}</p>
      <p className="candidate-card-text">
        Experience: {candidate.experience} years
      </p>
      <p className="candidate-card-salary">{candidate.expectedSalary}</p>

      <div className="candidate-card-actions">
        <div className="candidate-skills">
          {candidate.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="candidate-skill-tag">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="candidate-skills-more">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>

        {listView && (
          <div
            className="candidate-status-badge"
            style={{
              backgroundColor: STATUS_COLORS[candidate.status].bg,
              color: STATUS_COLORS[candidate.status].text,
            }}
          >
            {candidate.status}
          </div>
        )}

        <select
          value={candidate.status}
          onChange={(e) =>
            onStatusChange(candidate.id, e.target.value as Candidate["status"])
          }
          className="candidate-status-select"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="candidate-notes-toggle"
        >
          {showNotes ? "Hide" : "Show"} Notes{" "}
          {candidate.notes &&
            candidate.notes.length > 0 &&
            `(${candidate.notes.length})`}
        </button>

        <button
          onClick={() => onDelete(candidate.id)}
          className="candidate-delete-btn"
        >
          Delete
        </button>
      </div>

      {showNotes && (
        <div className="candidate-notes-section">
          <NotesSection
            candidateId={candidate.id}
            notes={candidate.notes || []}
            onAddNote={(text, mentions) =>
              onAddNote(candidate.id, text, mentions)
            }
          />
        </div>
      )}

      <div className="candidate-applied-date">
        Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
