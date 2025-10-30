import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Candidate } from "../types/job";
import NotesSection from "../components/NotesSection";
import { useCandidatesStore } from "../stores/candidatesStore";
import "./CandidateProfilePage.css";

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

interface StatusChange {
  from: Candidate["status"] | null;
  to: Candidate["status"];
  timestamp: string;
  changedBy: string;
}

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { updateCandidateStatus, deleteCandidate, addNote } =
    useCandidatesStore();

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/candidates/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch candidate");
      }

      const data = await response.json();
      setCandidate(data);

      const historyResponse = await fetch(`/api/candidates/${id}/history`);
      if (historyResponse.ok) {
        const history = await historyResponse.json();
        setStatusHistory(history);
      }

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Candidate["status"]) => {
    if (!candidate) return;

    if (candidate.status === newStatus) {
      return;
    }

    try {
      await updateCandidateStatus(candidate.id, newStatus);
      setCandidate({ ...candidate, status: newStatus });
      setTimeout(() => {
        fetchCandidate();
      }, 500);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async () => {
    if (!candidate) return;

    if (window.confirm(`Are you sure you want to delete ${candidate.name}?`)) {
      try {
        await deleteCandidate(candidate.id);
        navigate("/candidates");
      } catch (err) {
        console.error("Failed to delete candidate:", err);
      }
    }
  };

  const handleAddNote = async (text: string, mentions: string[]) => {
    if (!candidate) return;

    try {
      await addNote(candidate.id, text, mentions);
      fetchCandidate();
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="profile-error">
        <h2>Error</h2>
        <p>{error || "Candidate not found"}</p>
        <button onClick={() => navigate("/candidates")} className="back-btn">
          Back to Candidates
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate("/candidates")} className="back-btn">
          ← Back to Candidates
        </button>
        <button onClick={handleDelete} className="delete-btn">
          Delete Candidate
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-card">
            <div className="profile-name-section">
              <h1>{candidate.name}</h1>
              <div
                className="status-badge"
                style={{
                  backgroundColor: STATUS_COLORS[candidate.status].bg,
                  color: STATUS_COLORS[candidate.status].text,
                }}
              >
                {candidate.status}
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">📧 Email</span>
                <span className="info-value">{candidate.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📱 Phone</span>
                <span className="info-value">{candidate.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📍 Location</span>
                <span className="info-value">{candidate.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label">💼 Position</span>
                <span className="info-value">{candidate.position}</span>
              </div>
              <div className="info-item">
                <span className="info-label">⏱️ Experience</span>
                <span className="info-value">{candidate.experience} years</span>
              </div>
              <div className="info-item">
                <span className="info-label">💰 Expected Salary</span>
                <span className="info-value">{candidate.expectedSalary}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📅 Applied</span>
                <span className="info-value">
                  {new Date(candidate.appliedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="skills-section">
              <h3>Skills</h3>
              <div className="skills-list">
                {candidate.skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="resume-section">
              <h3>Resume</h3>
              <a
                href={candidate.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="resume-link"
              >
                📄 View Resume
              </a>
            </div>

            <div className="status-change-section">
              <h3>Change Status</h3>
              <div className="status-buttons">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`status-btn ${candidate.status === status ? "active" : ""}`}
                    style={{
                      backgroundColor:
                        candidate.status === status
                          ? STATUS_COLORS[status].bg
                          : "#f3f4f6",
                      color:
                        candidate.status === status
                          ? STATUS_COLORS[status].text
                          : "#374151",
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h2>Notes</h2>
            <NotesSection
              candidateId={candidate.id}
              notes={candidate.notes || []}
              onAddNote={handleAddNote}
            />
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="profile-card">
            <h2>Status History</h2>
            <div className="timeline">
              {statusHistory.length === 0 ? (
                <p className="timeline-empty">No status changes yet</p>
              ) : (
                statusHistory.map((change, idx) => (
                  <div key={idx} className="timeline-item">
                    <div
                      className="timeline-dot"
                      style={{
                        backgroundColor: STATUS_COLORS[change.to].text,
                      }}
                    ></div>
                    <div className="timeline-content">
                      <div className="timeline-status-change">
                        {change.from && (
                          <>
                            <span
                              className="timeline-status"
                              style={{
                                backgroundColor: STATUS_COLORS[change.from].bg,
                                color: STATUS_COLORS[change.from].text,
                              }}
                            >
                              {change.from}
                            </span>
                            <span className="timeline-arrow">→</span>
                          </>
                        )}
                        <span
                          className="timeline-status"
                          style={{
                            backgroundColor: STATUS_COLORS[change.to].bg,
                            color: STATUS_COLORS[change.to].text,
                          }}
                        >
                          {change.to}
                        </span>
                      </div>
                      <div className="timeline-meta">
                        <span className="timeline-user">
                          {change.changedBy}
                        </span>
                        <span className="timeline-time">
                          {new Date(change.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
