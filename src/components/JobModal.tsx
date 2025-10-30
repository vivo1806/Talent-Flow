import { useState, useEffect } from "react";
import { Job } from "../types/job";
import { useJobsStore } from "../stores/jobsStore";
import { generateSlug } from "../lib/db";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
}

export default function JobModal({ isOpen, onClose, job }: JobModalProps) {
  const { addJob, updateJob, validateSlug } = useJobsStore();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "full-time" as Job["type"],
    salary: "",
    description: "",
    requirements: "",
  });

  const [slug, setSlug] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements.join(", "),
      });
      setSlug(job.slug || "");
    } else {
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "full-time",
        salary: "",
        description: "",
        requirements: "",
      });
      setSlug("");
    }
    setErrors({});
  }, [job, isOpen]);

  useEffect(() => {
    if (!job && formData.title) {
      const generatedSlug = generateSlug(formData.title);
      setSlug(generatedSlug);
    }
  }, [formData.title, job]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(value);
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: "" }));
    }
  };
  const validate = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.salary.trim()) {
      newErrors.salary = "Salary is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "At least one requirement is needed";
    }

    if (!slug.trim()) {
      newErrors.slug = "Slug is required";
    } else {
      try {
        const isSlugValid = await validateSlug(slug, job?.id);
        if (isSlugValid) {
          newErrors.slug = "This slug is already taken";
        }
      } catch (error) {
        console.error("Slug validation error:", error);
        // Don't block submission if validation fails
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validate();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements
          .split(",")
          .map((r) => r.trim())
          .filter((r) => r),
        slug,
      };

      if (job) {
        // Update existing job
        await updateJob(job.id, jobData);
      } else {
        // Create new job
        await addJob(jobData);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
            {job ? "Edit Job" : "Create New Job"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0.25rem",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior React Developer"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${errors.title ? "#dc2626" : "#e5e7eb"}`,
                borderRadius: "6px",
                fontSize: "1rem",
              }}
            />
            {errors.title && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {errors.title}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              URL Slug *
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  fontWeight: "normal",
                }}
              >
                {" "}
                (unique identifier for URL)
              </span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="senior-react-developer"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${errors.slug ? "#dc2626" : "#e5e7eb"}`,
                borderRadius: "6px",
                fontSize: "1rem",
                fontFamily: "monospace",
              }}
            />
            {errors.slug && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {errors.slug}
              </p>
            )}
          </div>

          {/* Company */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Company *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., TechCorp"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${errors.company ? "#dc2626" : "#e5e7eb"}`,
                borderRadius: "6px",
                fontSize: "1rem",
              }}
            />
            {errors.company && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {errors.company}
              </p>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                }}
              >
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Remote"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: `1px solid ${errors.location ? "#dc2626" : "#e5e7eb"}`,
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
              {errors.location && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  {errors.location}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                }}
              >
                Job Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Salary *
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $120k - $160k"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${errors.salary ? "#dc2626" : "#e5e7eb"}`,
                borderRadius: "6px",
                fontSize: "1rem",
              }}
            />
            {errors.salary && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {errors.salary}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role and responsibilities..."
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${errors.description ? "#dc2626" : "#e5e7eb"}`,
                borderRadius: "6px",
                fontSize: "1rem",
                resize: "vertical",
              }}
            />
            {errors.description && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {errors.description}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Requirements *
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  fontWeight: "normal",
                }}
              >
                {" "}
                (comma-separated)
              </span>
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="e.g., 5+ years React, TypeScript, State management"
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${errors.requirements ? "#dc2626" : "#e5e7eb"}`,
                borderRadius: "6px",
                fontSize: "1rem",
                resize: "vertical",
              }}
            />
            {errors.requirements && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {errors.requirements}
              </p>
            )}
          </div>

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: isSubmitting ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              {isSubmitting ? "Saving..." : job ? "Update Job" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
