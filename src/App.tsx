import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import AssessmentsPage from "./pages/AssessmentsPage";
import { useUIStore } from "./stores/uiStore";
import { useJobsStore } from "./stores/jobsStore";
import { useCandidatesStore } from "./stores/candidatesStore";
import { useAssessmentsStore } from "./stores/assessmentsStore";
import { seedDatabase } from "./lib/db";
import "./App.css";

seedDatabase().then(() => {
  console.log("Database ready!");
});

function App() {
  const { isGlobalLoading, globalError, clearGlobalError } = useUIStore();
  const retryJobs = useJobsStore((state) => state.retryLastAction);
  const retryCandidates = useCandidatesStore((state) => state.retryLastAction);
  const retryAssessments = useAssessmentsStore(
    (state) => state.retryLastAction,
  );

  const handleRetry = () => {
    retryJobs();
    retryCandidates();
    retryAssessments();
  };

  return (
    <BrowserRouter>
      <div>
        {isGlobalLoading && (
          <div className="global-loading-overlay">
            <div className="loading-box">
              <div className="loading-spinner" />
              <p className="loading-text">Loading...</p>
            </div>
          </div>
        )}

        {globalError && (
          <div className="global-error-banner">
            <div className="error-content">
              <div className="error-header">
                <span>⚠️</span>
                <strong className="error-title">Error</strong>
              </div>
              <p className="error-message">{globalError}</p>
            </div>
            <div className="error-buttons">
              <button onClick={handleRetry} className="error-btn-retry">
                Retry
              </button>
              <button onClick={clearGlobalError} className="error-btn-dismiss">
                Dismiss
              </button>
            </div>
          </div>
        )}

        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              TalentFlow
            </Link>
            <Link to="/jobs" className="nav-link">
              Jobs
            </Link>
            <Link to="/candidates" className="nav-link">
              Candidates
            </Link>
            <Link to="/assessments" className="nav-link">
              Assessments
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateProfilePage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
