import { Job } from "../../types/job";

interface JobsHeaderProps {
  showArchived: boolean;
  jobs: Job[];
  toggleShowArchived: () => void;
  onCreateNew: () => void;
}

export default function JobsHeader({
  showArchived,
  jobs,
  toggleShowArchived,
  onCreateNew,
}: JobsHeaderProps) {
  const count = jobs.filter((j) =>
    showArchived ? j.archived : !j.archived,
  ).length;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
      }}
    >
      <h1>
        {showArchived ? "Archived Jobs" : "Open Positions"} ({count})
      </h1>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button onClick={toggleShowArchived}>
          {showArchived ? "📂 Show Active" : "🗄️ Show Archived"}
        </button>

        {!showArchived && (
          <>
            <div
              style={{
                background: "#f0f9ff",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
              }}
            >
              ↕️ Drag to reorder
            </div>
            <button
              onClick={onCreateNew}
              style={{ background: "#3b82f6", color: "white" }}
            >
              + Create Job
            </button>
          </>
        )}
      </div>
    </div>
  );
}
