export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  salary: string;
  description: string;
  requirements: string[];
  postedAt: string;
  status: "open" | "closed";
  order: number;
  archived: boolean;
  slug?: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string[];
  resume: string;
  status: "new" | "screening" | "interview" | "offer" | "rejected";
  appliedAt: string;
  location: string;
  expectedSalary: string;
  notes?: Note[];
  statusHistory?: StatusChange[];
}

export interface Note {
  id: string;
  candidateId: string;
  text: string;
  mentions: string[];
  createdBy: string;
  createdAt: string;
}

export interface StatusChange {
  from: Candidate["status"] | null;
  to: Candidate["status"];
  timestamp: string;
  changedBy: string;
}

export interface Question {
  id: string;
  text: string;
  type: "multiple-choice" | "short-answer" | "long-answer" | "coding";
  options?: string[];
  correctAnswer?: string;
  timeLimit?: number;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}
