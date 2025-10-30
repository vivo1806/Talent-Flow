import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="home-page-container">
      <h1 className="home-page-title">TalentFlow</h1>
      <p className="home-page-subtitle">A Modern Mini Hiring Platform</p>
      <div className="home-page-nav">
        <Link to="/jobs" className="home-page-link jobs">
          Browse Jobs
        </Link>
        <Link to="/candidates" className="home-page-link candidates">
          View Candidates
        </Link>
        <Link to="/assessments" className="home-page-link assessments">
          Assessments
        </Link>
      </div>
    </div>
  );
}
