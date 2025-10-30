import { useState, useEffect } from "react";
import { Question } from "../types/job";
import "./AssessmentPreview.css";

interface AssessmentPreviewProps {
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  questions: Question[];
}

export default function AssessmentPreview({
  title,
  description,
  duration,
  passingScore,
  questions,
}: AssessmentPreviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const progress =
    questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const answeredCount = Object.keys(answers).length;

  if (questions.length === 0) {
    return (
      <div className="preview-container">
        <div className="preview-empty">
          <h3>Assessment Preview</h3>
          <p>Add questions to see the preview</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="preview-container">
      {/* Header */}
      <div className="preview-header">
        <div className="preview-header-content">
          <h2 className="preview-title">{title || "Untitled Assessment"}</h2>
          {description && <p className="preview-description">{description}</p>}
        </div>

        <div className="preview-meta">
          <div className="preview-timer">
            <span className="timer-icon">⏱️</span>
            <span
              className={`timer-text ${timeRemaining < 300 ? "timer-warning" : ""}`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
          {!isTimerRunning && (
            <button
              className="start-timer-btn"
              onClick={() => setIsTimerRunning(true)}
            >
              Start Timer
            </button>
          )}
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="question-preview-card">
        <div className="question-header-preview">
          <h3 className="question-number">Question {currentQuestion + 1}</h3>
          {currentQ.timeLimit && (
            <span className="question-time-limit">
              ⏱️ {currentQ.timeLimit} min
            </span>
          )}
        </div>

        <p className="question-text-preview">
          {currentQ.text || "Question text will appear here..."}
        </p>

        <div className="answer-section">
          {currentQ.type === "multiple-choice" && (
            <div className="multiple-choice-options">
              {currentQ.options?.map((option, idx) => (
                <label key={idx} className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={(e) =>
                      handleAnswerChange(currentQ.id, e.target.value)
                    }
                    className="option-radio"
                  />
                  <span className="option-text">
                    {option || `Option ${idx + 1}`}
                  </span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === "short-answer" && (
            <input
              type="text"
              placeholder="Type your answer here..."
              value={answers[currentQ.id] || ""}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              className="answer-input"
            />
          )}

          {currentQ.type === "long-answer" && (
            <textarea
              placeholder="Type your detailed answer here..."
              value={answers[currentQ.id] || ""}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              rows={6}
              className="answer-textarea"
            />
          )}

          {currentQ.type === "coding" && (
            <textarea
              placeholder="// Write your code here..."
              value={answers[currentQ.id] || ""}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              rows={12}
              className="answer-textarea coding-textarea"
            />
          )}
        </div>

        <div className="navigation-buttons">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="nav-btn nav-btn-prev"
          >
            ← Previous
          </button>

          <div className="question-indicators">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`question-indicator ${
                  idx === currentQuestion ? "indicator-active" : ""
                } ${answers[questions[idx].id] ? "indicator-answered" : ""}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="nav-btn nav-btn-next"
            >
              Next →
            </button>
          ) : (
            <button className="nav-btn nav-btn-submit">
              Submit Assessment
            </button>
          )}
        </div>
      </div>

      <div className="preview-footer">
        <div className="footer-info">
          <span>📝 {questions.length} questions</span>
          <span>⏱️ {duration} minutes</span>
          <span>✓ {passingScore}% to pass</span>
        </div>
      </div>
    </div>
  );
}
