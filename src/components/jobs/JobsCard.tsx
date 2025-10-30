import { Job } from "../../types/job";

interface JobCardProps {
  job: Job;
  index: number;
  showArchived: boolean;
  currentPage: number;
  itemsPerPage: number;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  setDraggedIndex: (i: number | null) => void;
  setDragOverIndex: (i: number | null) => void;
  handleDrop: (i: number) => void;
  onEdit: (job: Job) => void;
  openModal: () => void;
  deleteJob: (id: string) => Promise<void>;
  archiveJob: (id: string) => Promise<void>;
  unarchiveJob: (id: string) => Promise<void>;
}

export default function JobCard({
  job,
  index,
  showArchived,
  currentPage,
  itemsPerPage,
  draggedIndex,
  dragOverIndex,
  setDraggedIndex,
  setDragOverIndex,
  handleDrop,
  onEdit,
  openModal,
  deleteJob,
  archiveJob,
  unarchiveJob,
}: JobCardProps) {
  return (
    <div
      draggable={!showArchived}
      onDragStart={() => setDraggedIndex(index)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOverIndex(index);
      }}
      onDrop={() => handleDrop(index)}
      style={{
        border:
          dragOverIndex === index ? "2px solid #3b82f6" : "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1.5rem",
        background: draggedIndex === index ? "#f3f4f6" : "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2>{job.title}</h2>
          <p>
            {job.company} • {job.location} • {job.type}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {!showArchived ? (
            <>
              <button
                onClick={() => {
                  onEdit(job);
                  openModal();
                }}
              >
                Edit
              </button>
              <button onClick={() => archiveJob(job.id)}>Archive</button>
            </>
          ) : (
            <button onClick={() => unarchiveJob(job.id)}>Unarchive</button>
          )}
          <button onClick={() => deleteJob(job.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
