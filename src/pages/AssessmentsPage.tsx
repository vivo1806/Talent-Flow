import { useEffect, useState } from "react";
import { useJobsStore } from "../stores/jobsStore";
import { useAssessmentsStore } from "../stores/assessmentsStore";
import { Question } from "../types/job";
import AssessmentPreview from "./AssessmentPreview";
import "./AssessmentsPage.css";

export default function AssessmentsPage() {
  const { jobs, fetchJobs } = useJobsStore();
  const {
    assessments,
    fetchAssessments,
    fetchAssessmentByJobId,
    createAssessment,
    updateAssessment,
    deleteAssessment,
  } = useAssessmentsStore();

  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchAssessments();
  }, [fetchJobs, fetchAssessments]);

  const handleJobSelect = async (jobId: string) => {
    setSelectedJobId(jobId);
    setError("");

    if (!jobId) {
      resetForm();
      return;
    }

    const assessment = await fetchAssessmentByJobId(jobId);

    if (assessment) {
      // Load existing assessment
      setEditingAssessmentId(assessment.id);
      setTitle(assessment.title);
      setDescription(assessment.description);
      setDuration(assessment.duration);
      setPassingScore(assessment.passingScore);
      setQuestions(assessment.questions);
      setIsCreating(false);
    } else {
      // No assessment exists, prepare to create
      resetForm();
      setIsCreating(true);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDuration(60);
    setPassingScore(70);
    setQuestions([]);
    setIsCreating(false);
    setEditingAssessmentId(null);
    setShowPreview(false);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      timeLimit: 5,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options![optionIndex] = value;
      setQuestions(updatedQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedJobId) {
      setError("Please select a job");
      return;
    }

    if (!title.trim() || questions.length === 0) {
      setError("Please provide a title and at least one question");
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.text.trim()) {
        setError("All questions must have text");
        return;
      }
      if (
        q.type === "multiple-choice" &&
        (!q.options || q.options.some((opt) => !opt.trim()))
      ) {
        setError("Multiple choice questions must have all options filled");
        return;
      }
    }

    try {
      const assessmentData = {
        jobId: selectedJobId,
        title,
        description,
        duration,
        passingScore,
        questions,
      };

      if (editingAssessmentId) {
        await updateAssessment(editingAssessmentId, assessmentData);
        alert("Assessment updated successfully!");
      } else {
        await createAssessment(assessmentData);
        alert("Assessment created successfully!");
      }

      fetchAssessments();
      resetForm();
      setSelectedJobId("");
    } catch (err: any) {
      setError(err.message || "Failed to save assessment");
    }
  };

  const handleDelete = async () => {
    if (!editingAssessmentId) return;

    if (window.confirm("Are you sure you want to delete this assessment?")) {
      await deleteAssessment(editingAssessmentId);
      alert("Assessment deleted successfully!");
      resetForm();
      setSelectedJobId("");
      fetchAssessments();
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="assessments-page-container">
      <h1 className="assessments-page-title">Assessment Builder</h1>

      {/* Job Selection */}
      <div className="job-selection-container">
        <label className="job-selection-label">Select Job Position</label>
        <select
          value={selectedJobId}
          onChange={(e) => handleJobSelect(e.target.value)}
          className="job-selection-select"
        >
          <option value="">-- Select a job --</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} - {job.company}
            </option>
          ))}
        </select>
      </div>

      {(isCreating || editingAssessmentId) && selectedJob && (
        <>
          {questions.length > 0 && (
            <div className="preview-toggle-container">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="preview-toggle-btn"
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
          )}

          {showPreview ? (
            <AssessmentPreview
              title={title}
              description={description}
              duration={duration}
              passingScore={passingScore}
              questions={questions}
            />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="assessment-form-container">
                <h2 className="assessment-form-title">
                  {editingAssessmentId
                    ? "Edit Assessment"
                    : "Create New Assessment"}
                </h2>

                {error && <div className="assessment-error">{error}</div>}

                <div className="form-field">
                  <label className="form-label">Assessment Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., React Developer Technical Assessment"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this assessment tests"
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                <div className="form-grid-2col">
                  <div>
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      min="1"
                      max="300"
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Passing Score (%) *</label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="questions-container">
                <div className="questions-header">
                  <h3>Questions ({questions.length})</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="add-question-btn"
                  >
                    + Add Question
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="questions-empty-state">
                    <p>
                      No questions added yet. Click "Add Question" to get
                      started.
                    </p>
                  </div>
                ) : (
                  <div className="questions-list">
                    {questions.map((question, index) => (
                      <div key={question.id} className="question-card">
                        <div className="question-card-header">
                          <h4>Question {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="remove-question-btn"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="question-field">
                          <label className="question-label">
                            Question Type
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(index, {
                                type: e.target.value as Question["type"],
                              })
                            }
                            className="question-select"
                          >
                            <option value="multiple-choice">
                              Multiple Choice
                            </option>
                            <option value="short-answer">Short Answer</option>
                            <option value="long-answer">Long Answer</option>
                            <option value="coding">Coding Challenge</option>
                          </select>
                        </div>

                        <div className="question-field">
                          <label className="question-label">
                            Question Text *
                          </label>
                          <textarea
                            value={question.text}
                            onChange={(e) =>
                              updateQuestion(index, { text: e.target.value })
                            }
                            placeholder="Enter your question here"
                            rows={3}
                            className="question-textarea"
                            required
                          />
                        </div>

                        {question.type === "multiple-choice" && (
                          <div className="question-field">
                            <label className="question-label">Options *</label>
                            {question.options?.map((option, optionIndex) => (
                              <input
                                key={optionIndex}
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateQuestionOption(
                                    index,
                                    optionIndex,
                                    e.target.value,
                                  )
                                }
                                placeholder={`Option ${optionIndex + 1}`}
                                className="question-option-input"
                                required
                              />
                            ))}

                            <label className="correct-answer-label">
                              Correct Answer
                            </label>
                            <select
                              value={question.correctAnswer || ""}
                              onChange={(e) =>
                                updateQuestion(index, {
                                  correctAnswer: e.target.value,
                                })
                              }
                              className="question-select"
                            >
                              <option value="">
                                -- Select correct answer --
                              </option>
                              {question.options?.map((option, optionIndex) => (
                                <option key={optionIndex} value={option}>
                                  {option || `Option ${optionIndex + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="question-label">
                            Time Limit (minutes)
                          </label>
                          <input
                            type="number"
                            value={question.timeLimit || 5}
                            onChange={(e) =>
                              updateQuestion(index, {
                                timeLimit: Number(e.target.value),
                              })
                            }
                            min="1"
                            max="60"
                            className="question-input"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="action-buttons">
                {editingAssessmentId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="delete-assessment-btn"
                  >
                    Delete Assessment
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setSelectedJobId("");
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingAssessmentId
                    ? "Update Assessment"
                    : "Create Assessment"}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {!isCreating && !editingAssessmentId && (
        <div className="existing-assessments-section">
          <h2 className="existing-assessments-title">
            Existing Assessments ({assessments.length})
          </h2>
          {assessments.length === 0 ? (
            <div className="assessments-empty-state">
              No assessments created yet. Select a job above to create one.
            </div>
          ) : (
            <div className="assessments-grid">
              {assessments.map((assessment) => {
                const job = jobs.find((j) => j.id === assessment.jobId);
                return (
                  <div key={assessment.id} className="assessment-card">
                    <div className="assessment-card-content">
                      <div>
                        <h3 className="assessment-card-title">
                          {assessment.title}
                        </h3>
                        <p className="assessment-card-info">
                          Job: <strong>{job?.title || "Unknown"}</strong> -{" "}
                          {job?.company}
                        </p>
                        <p className="assessment-card-info">
                          {assessment.description}
                        </p>
                        <div className="assessment-card-meta">
                          <span className="assessment-meta-item">
                            ⏱️ {assessment.duration} min
                          </span>
                          <span className="assessment-meta-item">
                            ✓ {assessment.passingScore}% passing
                          </span>
                          <span className="assessment-meta-item">
                            📝 {assessment.questions.length} questions
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJobSelect(assessment.jobId)}
                        className="edit-assessment-btn"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
