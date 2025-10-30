import { useState } from "react";
import { Job } from "../../types/job";
import JobCard from "./JobCard";

interface JobsListProps {
  filteredJobs: Job[];
  showArchived: boolean;
  deleteJob: (id: string) => Promise<void>;
  archiveJob: (id: string) => Promise<void>;
  unarchiveJob: (id: string) => Promise<void>;
  reorderJobs: (from: number, to: number) => Promise<void>;
  currentPage: number;
  itemsPerPage: number;
  onEdit: (job: Job) => void;
  openModal: () => void;
}

export default function JobsList({
  filteredJobs,
  showArchived,
  deleteJob,
  archiveJob,
  unarchiveJob,
  reorderJobs,
  currentPage,
  itemsPerPage,
  onEdit,
  openModal,
}: JobsListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    await reorderJobs(draggedIndex, dropIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (filteredJobs.length === 0)
    return (
      <p style={{ textAlign: "center", color: "#6b7280" }}>No jobs found.</p>
    );

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {filteredJobs.map((job, index) => (
        <JobCard
          key={job.id}
          job={job}
          index={index}
          showArchived={showArchived}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          draggedIndex={draggedIndex}
          dragOverIndex={dragOverIndex}
          setDraggedIndex={setDraggedIndex}
          setDragOverIndex={setDragOverIndex}
          handleDrop={handleDrop}
          onEdit={onEdit}
          openModal={openModal}
          deleteJob={deleteJob}
          archiveJob={archiveJob}
          unarchiveJob={unarchiveJob}
        />
      ))}
    </div>
  );
}
