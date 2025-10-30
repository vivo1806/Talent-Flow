import Dexie, { Table } from "dexie";
import { Job, Application, Candidate, Assessment } from "../types/job";

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, string>;
  applications!: Table<Application, string>;
  candidates!: Table<Candidate, string>;
  assessments!: Table<Assessment, string>;

  constructor() {
    super("TalentFlowDB");

    this.version(3)
      .stores({
        jobs: "id, title, company, status, postedAt, order, archived, slug",
        applications: "id, jobId, status, appliedAt",
        candidates: "id, name, email, status, appliedAt",
        assessments: "id, jobId, createdAt",
      })
      .upgrade(async (tx) => {
        const jobs = await tx.table("jobs").toArray();
        for (const job of jobs) {
          if (job.archived === undefined) {
            const slug = job.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            await tx.table("jobs").update(job.id, {
              archived: false,
              slug: `${slug}-${job.id.slice(0, 6)}`,
            });
          }
        }
      });

    this.version(2)
      .stores({
        jobs: "id, title, company, status, postedAt, order",
        applications: "id, jobId, status, appliedAt",
        candidates: "id, name, email, status, appliedAt",
        assessments: "id, jobId, createdAt",
      })
      .upgrade(async (tx) => {
        const jobs = await tx.table("jobs").toArray();
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i].order === undefined) {
            await tx.table("jobs").update(jobs[i].id, { order: i });
          }
        }
        console.log("✅ Database upgraded: added order field to jobs");
      });

    this.version(1).stores({
      jobs: "id, title, company, status, postedAt",
      applications: "id, jobId, status, appliedAt",
      candidates: "id, name, email, status, appliedAt",
      assessments: "id, jobId, createdAt",
    });
  }
}

export const db = new TalentFlowDB();

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  const assessmentCount = await db.assessments.count();

  if (jobCount === 0) {
    const mockJobs: Job[] = [
      {
        id: "1",
        title: "Senior React Developer",
        company: "TechCorp",
        location: "Remote",
        type: "full-time",
        salary: "$120k - $160k",
        description:
          "We are looking for an experienced React developer to join our team and build innovative web applications.",
        requirements: [
          "5+ years React experience",
          "TypeScript",
          "State management",
          "Testing",
        ],
        postedAt: new Date().toISOString(),
        status: "open",
        order: 0,
        archived: false,
        slug: "senior-react-developer-1",
      },
      {
        id: "2",
        title: "Full Stack Engineer",
        company: "StartupXYZ",
        location: "San Francisco, CA",
        type: "full-time",
        salary: "$140k - $180k",
        description:
          "Join our fast-growing startup and build scalable web applications from the ground up.",
        requirements: ["React", "Node.js", "PostgreSQL", "AWS"],
        postedAt: new Date(Date.now() - 86400000).toISOString(),
        status: "open",
        order: 1,
        archived: false,
        slug: "full-stack-engineer-2",
      },
      {
        id: "3",
        title: "Frontend Developer",
        company: "DesignHub",
        location: "New York, NY",
        type: "contract",
        salary: "$80/hour",
        description:
          "Create beautiful, responsive user interfaces for our diverse client portfolio.",
        requirements: ["React", "CSS/SCSS", "Figma", "Responsive design"],
        postedAt: new Date(Date.now() - 172800000).toISOString(),
        status: "open",
        order: 2,
        archived: false,
        slug: "frontend-developer-3",
      },
      {
        id: "4",
        title: "Backend Engineer",
        company: "DataCorp",
        location: "Austin, TX",
        type: "full-time",
        salary: "$130k - $150k",
        description:
          "Build robust and scalable backend systems for enterprise clients.",
        requirements: ["Node.js", "Python", "PostgreSQL", "Microservices"],
        postedAt: new Date(Date.now() - 259200000).toISOString(),
        status: "open",
        order: 3,
        archived: false,
        slug: "backend-engineer-4",
      },
      {
        id: "5",
        title: "DevOps Engineer",
        company: "CloudTech",
        location: "Seattle, WA",
        type: "full-time",
        salary: "$140k - $170k",
        description:
          "Manage our cloud infrastructure and automate deployment pipelines.",
        requirements: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
        postedAt: new Date(Date.now() - 345600000).toISOString(),
        status: "open",
        order: 4,
        archived: false,
        slug: "devops-engineer-5",
      },
      {
        id: "6",
        title: "UI/UX Designer",
        company: "Creative Labs",
        location: "Remote",
        type: "full-time",
        salary: "$100k - $130k",
        description:
          "Design intuitive and engaging user experiences for web and mobile applications.",
        requirements: [
          "Figma",
          "Adobe XD",
          "User research",
          "Prototyping",
          "Design systems",
        ],
        postedAt: new Date(Date.now() - 432000000).toISOString(),
        status: "open",
        order: 5,
        archived: false,
        slug: "ui-ux-designer-6",
      },
      {
        id: "7",
        title: "Mobile Developer",
        company: "AppWorks",
        location: "Los Angeles, CA",
        type: "full-time",
        salary: "$125k - $155k",
        description:
          "Build native mobile applications for iOS and Android platforms.",
        requirements: ["React Native", "Swift", "Kotlin", "Mobile UI/UX"],
        postedAt: new Date(Date.now() - 518400000).toISOString(),
        status: "open",
        order: 6,
        archived: false,
        slug: "mobile-developer-7",
      },
      {
        id: "8",
        title: "Data Scientist",
        company: "Analytics Pro",
        location: "Boston, MA",
        type: "full-time",
        salary: "$130k - $165k",
        description:
          "Analyze complex datasets and build machine learning models for business insights.",
        requirements: [
          "Python",
          "SQL",
          "Machine Learning",
          "Statistics",
          "Data Visualization",
        ],
        postedAt: new Date(Date.now() - 604800000).toISOString(),
        status: "open",
        order: 7,
        archived: false,
        slug: "data-scientist-8",
      },
      {
        id: "9",
        title: "QA Engineer",
        company: "Quality First",
        location: "Denver, CO",
        type: "full-time",
        salary: "$90k - $115k",
        description:
          "Ensure software quality through comprehensive testing and automation.",
        requirements: [
          "Selenium",
          "Cypress",
          "Test automation",
          "API testing",
          "Bug tracking",
        ],
        postedAt: new Date(Date.now() - 691200000).toISOString(),
        status: "open",
        order: 8,
        archived: false,
        slug: "qa-engineer-9",
      },
      {
        id: "10",
        title: "Product Manager",
        company: "InnovateCo",
        location: "San Francisco, CA",
        type: "full-time",
        salary: "$140k - $180k",
        description:
          "Lead product development and strategy for our flagship product.",
        requirements: [
          "Product strategy",
          "Agile",
          "Stakeholder management",
          "Data-driven decisions",
        ],
        postedAt: new Date(Date.now() - 777600000).toISOString(),
        status: "open",
        order: 9,
        archived: false,
        slug: "product-manager-10",
      },
      {
        id: "11",
        title: "Security Engineer",
        company: "SecureNet",
        location: "Washington, DC",
        type: "full-time",
        salary: "$145k - $175k",
        description:
          "Protect our systems and data from security threats and vulnerabilities.",
        requirements: [
          "Cybersecurity",
          "Penetration testing",
          "OWASP",
          "Security audits",
        ],
        postedAt: new Date(Date.now() - 864000000).toISOString(),
        status: "open",
        order: 10,
        archived: false,
        slug: "security-engineer-11",
      },
      {
        id: "12",
        title: "Machine Learning Engineer",
        company: "AI Solutions",
        location: "San Francisco, CA",
        type: "full-time",
        salary: "$150k - $190k",
        description: "Build and deploy machine learning models at scale.",
        requirements: [
          "Python",
          "TensorFlow",
          "PyTorch",
          "Deep Learning",
          "MLOps",
        ],
        postedAt: new Date(Date.now() - 950400000).toISOString(),
        status: "open",
        order: 11,
        archived: false,
        slug: "machine-learning-engineer-12",
      },
      {
        id: "13",
        title: "Technical Writer",
        company: "DocuTech",
        location: "Remote",
        type: "contract",
        salary: "$70/hour",
        description:
          "Create clear and comprehensive technical documentation for developers.",
        requirements: [
          "Technical writing",
          "API documentation",
          "Markdown",
          "Git",
        ],
        postedAt: new Date(Date.now() - 1036800000).toISOString(),
        status: "open",
        order: 12,
        archived: false,
        slug: "technical-writer-13",
      },
      {
        id: "14",
        title: "Scrum Master",
        company: "Agile Works",
        location: "Chicago, IL",
        type: "full-time",
        salary: "$110k - $140k",
        description:
          "Facilitate agile development processes and remove team impediments.",
        requirements: [
          "Scrum",
          "Agile methodologies",
          "Team facilitation",
          "CSM certification",
        ],
        postedAt: new Date(Date.now() - 1123200000).toISOString(),
        status: "open",
        order: 13,
        archived: false,
        slug: "scrum-master-14",
      },
      {
        id: "15",
        title: "Database Administrator",
        company: "Data Systems",
        location: "Dallas, TX",
        type: "full-time",
        salary: "$115k - $145k",
        description:
          "Manage and optimize database systems for performance and reliability.",
        requirements: [
          "PostgreSQL",
          "MySQL",
          "Database optimization",
          "Backup strategies",
        ],
        postedAt: new Date(Date.now() - 1209600000).toISOString(),
        status: "open",
        order: 14,
        archived: false,
        slug: "database-administrator-15",
      },
      {
        id: "16",
        title: "Systems Architect",
        company: "Enterprise Solutions",
        location: "Atlanta, GA",
        type: "full-time",
        salary: "$155k - $185k",
        description: "Design and architect large-scale distributed systems.",
        requirements: [
          "System design",
          "Microservices",
          "Cloud architecture",
          "Scalability",
        ],
        postedAt: new Date(Date.now() - 1296000000).toISOString(),
        status: "closed",
        order: 15,
        archived: false,
        slug: "systems-architect-16",
      },
      {
        id: "17",
        title: "Frontend Intern",
        company: "StartupHub",
        location: "Remote",
        type: "part-time",
        salary: "$25/hour",
        description: "Learn and contribute to frontend development projects.",
        requirements: [
          "HTML",
          "CSS",
          "JavaScript",
          "React basics",
          "Eagerness to learn",
        ],
        postedAt: new Date(Date.now() - 1382400000).toISOString(),
        status: "open",
        order: 16,
        archived: false,
        slug: "frontend-intern-17",
      },
      {
        id: "18",
        title: "Site Reliability Engineer",
        company: "ReliableOps",
        location: "Seattle, WA",
        type: "full-time",
        salary: "$140k - $170k",
        description:
          "Ensure high availability and performance of production systems.",
        requirements: [
          "Linux",
          "Monitoring",
          "Incident response",
          "Automation",
          "On-call",
        ],
        postedAt: new Date(Date.now() - 1468800000).toISOString(),
        status: "open",
        order: 17,
        archived: false,
        slug: "site-reliability-engineer-18",
      },
      {
        id: "19",
        title: "Blockchain Developer",
        company: "CryptoTech",
        location: "Miami, FL",
        type: "full-time",
        salary: "$145k - $185k",
        description: "Develop smart contracts and decentralized applications.",
        requirements: [
          "Solidity",
          "Ethereum",
          "Web3.js",
          "Smart contracts",
          "DeFi",
        ],
        postedAt: new Date(Date.now() - 1555200000).toISOString(),
        status: "open",
        order: 18,
        archived: false,
        slug: "blockchain-developer-19",
      },
      {
        id: "20",
        title: "Game Developer",
        company: "GameStudio",
        location: "Los Angeles, CA",
        type: "full-time",
        salary: "$120k - $150k",
        description:
          "Create immersive gaming experiences using modern game engines.",
        requirements: ["Unity", "C#", "Game design", "3D graphics", "Physics"],
        postedAt: new Date(Date.now() - 1641600000).toISOString(),
        status: "open",
        order: 19,
        archived: false,
        slug: "game-developer-20",
      },
      {
        id: "21",
        title: "Cloud Architect",
        company: "CloudFirst",
        location: "Remote",
        type: "full-time",
        salary: "$160k - $200k",
        description: "Design and implement cloud infrastructure solutions.",
        requirements: [
          "AWS",
          "Azure",
          "GCP",
          "Infrastructure as Code",
          "Cost optimization",
        ],
        postedAt: new Date(Date.now() - 1728000000).toISOString(),
        status: "open",
        order: 20,
        archived: false,
        slug: "cloud-architect-21",
      },
      {
        id: "22",
        title: "Business Analyst",
        company: "BizTech",
        location: "Philadelphia, PA",
        type: "full-time",
        salary: "$90k - $120k",
        description:
          "Bridge the gap between business needs and technical solutions.",
        requirements: [
          "Requirements gathering",
          "SQL",
          "Data analysis",
          "Documentation",
        ],
        postedAt: new Date(Date.now() - 1814400000).toISOString(),
        status: "closed",
        order: 21,
        archived: false,
        slug: "business-analyst-22",
      },
      {
        id: "23",
        title: "IoT Engineer",
        company: "SmartDevices",
        location: "San Jose, CA",
        type: "full-time",
        salary: "$135k - $165k",
        description: "Develop firmware and applications for IoT devices.",
        requirements: [
          "Embedded systems",
          "C/C++",
          "MQTT",
          "Sensors",
          "Wireless protocols",
        ],
        postedAt: new Date(Date.now() - 1900800000).toISOString(),
        status: "open",
        order: 22,
        archived: false,
        slug: "iot-engineer-23",
      },
      {
        id: "24",
        title: "AR/VR Developer",
        company: "ImmersiveTech",
        location: "Austin, TX",
        type: "full-time",
        salary: "$130k - $160k",
        description: "Build augmented and virtual reality experiences.",
        requirements: [
          "Unity",
          "Unreal Engine",
          "C#",
          "AR/VR SDKs",
          "3D modeling",
        ],
        postedAt: new Date(Date.now() - 1987200000).toISOString(),
        status: "open",
        order: 23,
        archived: false,
        slug: "ar-vr-developer-24",
      },
      {
        id: "25",
        title: "Growth Hacker",
        company: "GrowthLabs",
        location: "Remote",
        type: "full-time",
        salary: "$100k - $140k",
        description:
          "Drive user acquisition and engagement through creative strategies.",
        requirements: [
          "Marketing",
          "Analytics",
          "A/B testing",
          "SEO",
          "Content strategy",
        ],
        postedAt: new Date(Date.now() - 2073600000).toISOString(),
        status: "open",
        order: 24,
        archived: false,
        slug: "growth-hacker-25",
      },
      {
        id: "26",
        title: "Platform Engineer",
        company: "PlatformCo",
        location: "San Francisco, CA",
        type: "full-time",
        salary: "$150k - $180k",
        description:
          "Build and maintain internal developer platforms and tools.",
        requirements: [
          "Kubernetes",
          "Go",
          "Python",
          "Platform engineering",
          "Developer experience",
        ],
        postedAt: new Date(Date.now() - 2160000000).toISOString(),
        status: "open",
        order: 25,
        archived: false,
        slug: "platform-engineer-26",
      },
      {
        id: "27",
        title: "Data Engineer",
        company: "DataFlow",
        location: "New York, NY",
        type: "full-time",
        salary: "$135k - $170k",
        description: "Build and maintain data pipelines and warehouses.",
        requirements: ["SQL", "Python", "Airflow", "Spark", "Data modeling"],
        postedAt: new Date(Date.now() - 2246400000).toISOString(),
        status: "open",
        order: 26,
        archived: false,
        slug: "data-engineer-27",
      },
      {
        id: "28",
        title: "Engineering Manager",
        company: "TechLeaders",
        location: "Seattle, WA",
        type: "full-time",
        salary: "$170k - $220k",
        description: "Lead and mentor a team of software engineers.",
        requirements: [
          "Leadership",
          "Technical expertise",
          "People management",
          "Strategy",
        ],
        postedAt: new Date(Date.now() - 2332800000).toISOString(),
        status: "open",
        order: 27,
        archived: false,
        slug: "engineering-manager-28",
      },
    ];

    await db.jobs.bulkAdd(mockJobs);
  } else {
    const jobs = await db.jobs.toArray();
    let needsUpdate = false;

    for (let i = 0; i < jobs.length; i++) {
      const updates: any = {};

      if (jobs[i].order === undefined) {
        updates.order = i;
        needsUpdate = true;
      }

      if (jobs[i].archived === undefined) {
        updates.archived = false;
        needsUpdate = true;
      }

      if (!jobs[i].slug) {
        const slug = generateSlug(jobs[i].title);
        updates.slug = `${slug}-${jobs[i].id.slice(0, 6)}`;
      }

      if (Object.keys(updates).length > 0) {
        await db.jobs.update(jobs[i].id, updates);
      }
    }
  }

  if (assessmentCount === 0) {
    const mockAssessments: Assessment[] = [
      {
        id: "1",
        jobId: "1",
        title: "React Developer Technical Assessment",
        description: "Test your React, TypeScript, and state management skills",
        duration: 90,
        passingScore: 70,
        questions: [
          {
            id: "q1",
            text: "What is the purpose of useEffect hook in React?",
            type: "multiple-choice",
            options: [
              "To manage component state",
              "To handle side effects in functional components",
              "To create custom hooks",
              "To optimize performance",
            ],
            correctAnswer: "To handle side effects in functional components",
            timeLimit: 5,
          },
          {
            id: "q2",
            text: "Which hook would you use to preserve a value between renders without triggering a re-render?",
            type: "multiple-choice",
            options: ["useState", "useRef", "useMemo", "useCallback"],
            correctAnswer: "useRef",
            timeLimit: 5,
          },
          {
            id: "q3",
            text: "What is the Virtual DOM in React?",
            type: "multiple-choice",
            options: [
              "A copy of the actual DOM stored in memory",
              "A JavaScript library for DOM manipulation",
              "A browser API for rendering",
              "A database for storing component state",
            ],
            correctAnswer: "A copy of the actual DOM stored in memory",
            timeLimit: 5,
          },
          {
            id: "q4",
            text: "Explain the difference between useMemo and useCallback.",
            type: "short-answer",
            timeLimit: 8,
          },
          {
            id: "q5",
            text: "What are the rules of hooks in React?",
            type: "short-answer",
            timeLimit: 8,
          },
          {
            id: "q6",
            text: "Describe the component lifecycle in React functional components.",
            type: "long-answer",
            timeLimit: 12,
          },
          {
            id: "q7",
            text: "Explain prop drilling and how Context API helps solve it.",
            type: "long-answer",
            timeLimit: 12,
          },
          {
            id: "q8",
            text: "Write a custom React hook that fetches data from an API and handles loading and error states.",
            type: "coding",
            timeLimit: 15,
          },
          {
            id: "q9",
            text: "Create a React component that implements debouncing for a search input field.",
            type: "coding",
            timeLimit: 15,
          },
          {
            id: "q10",
            text: "Implement a custom hook for managing form state with validation.",
            type: "coding",
            timeLimit: 20,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        jobId: "2",
        title: "Backend Developer Technical Assessment",
        description: "Test your Node.js, databases, and API development skills",
        duration: 90,
        passingScore: 70,
        questions: [
          {
            id: "q1",
            text: "What is the difference between SQL and NoSQL databases?",
            type: "multiple-choice",
            options: [
              "SQL is faster than NoSQL",
              "SQL uses structured schema, NoSQL is schema-less",
              "NoSQL cannot handle relationships",
              "SQL is only for small databases",
            ],
            correctAnswer: "SQL uses structured schema, NoSQL is schema-less",
            timeLimit: 5,
          },
          {
            id: "q2",
            text: "What is middleware in Express.js?",
            type: "multiple-choice",
            options: [
              "A database connection layer",
              "Functions that execute during request-response cycle",
              "A routing mechanism",
              "A templating engine",
            ],
            correctAnswer:
              "Functions that execute during request-response cycle",
            timeLimit: 5,
          },
          {
            id: "q3",
            text: "What HTTP status code represents a successful POST request that created a resource?",
            type: "multiple-choice",
            options: [
              "200 OK",
              "201 Created",
              "204 No Content",
              "202 Accepted",
            ],
            correctAnswer: "201 Created",
            timeLimit: 5,
          },
          {
            id: "q4",
            text: "Explain what RESTful API principles are.",
            type: "short-answer",
            timeLimit: 8,
          },
          {
            id: "q5",
            text: "What is the difference between PUT and PATCH HTTP methods?",
            type: "short-answer",
            timeLimit: 8,
          },
          {
            id: "q6",
            text: "Describe how JWT authentication works and its advantages.",
            type: "long-answer",
            timeLimit: 12,
          },
          {
            id: "q7",
            text: "Explain database indexing and when you should use it.",
            type: "long-answer",
            timeLimit: 12,
          },
          {
            id: "q8",
            text: "Write an Express.js middleware function that validates request authentication tokens.",
            type: "coding",
            timeLimit: 15,
          },
          {
            id: "q9",
            text: "Create a RESTful API endpoint for user registration with input validation and password hashing.",
            type: "coding",
            timeLimit: 15,
          },
          {
            id: "q10",
            text: "Implement a database query function with proper error handling and connection pooling.",
            type: "coding",
            timeLimit: 20,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        jobId: "3",
        title: "iOS Developer Technical Assessment",
        description:
          "Test your Swift, iOS frameworks, and mobile development skills",
        duration: 90,
        passingScore: 70,
        questions: [
          {
            id: "q1",
            text: "What is the difference between var, let, and const in Swift?",
            type: "multiple-choice",
            options: [
              "var is mutable, let is immutable, const doesn't exist in Swift",
              "All are the same",
              "var is for strings, let is for numbers",
              "let is deprecated",
            ],
            correctAnswer:
              "var is mutable, let is immutable, const doesn't exist in Swift",
            timeLimit: 5,
          },
          {
            id: "q2",
            text: "What is the purpose of a delegate in iOS development?",
            type: "multiple-choice",
            options: [
              "To manage memory",
              "To enable communication between objects",
              "To handle network requests",
              "To create user interfaces",
            ],
            correctAnswer: "To enable communication between objects",
            timeLimit: 5,
          },
          {
            id: "q3",
            text: "What is the App lifecycle in iOS?",
            type: "multiple-choice",
            options: [
              "Not launched, Inactive, Active, Background, Suspended",
              "Start, Run, Stop",
              "Create, Resume, Pause, Destroy",
              "Init, Load, Run, Terminate",
            ],
            correctAnswer:
              "Not launched, Inactive, Active, Background, Suspended",
            timeLimit: 5,
          },
          {
            id: "q4",
            text: "Explain the difference between strong, weak, and unowned references.",
            type: "short-answer",
            timeLimit: 8,
          },
          {
            id: "q5",
            text: "What is the difference between a struct and a class in Swift?",
            type: "short-answer",
            timeLimit: 8,
          },
          {
            id: "q6",
            text: "Describe the MVC, MVVM, and VIPER architectural patterns in iOS.",
            type: "long-answer",
            timeLimit: 12,
          },
          {
            id: "q7",
            text: "Explain memory management in iOS and how ARC works.",
            type: "long-answer",
            timeLimit: 12,
          },
          {
            id: "q8",
            text: "Write a Swift function that fetches data from an API using URLSession and decodes JSON.",
            type: "coding",
            timeLimit: 15,
          },
          {
            id: "q9",
            text: "Create a custom UITableViewCell subclass with proper reuse handling.",
            type: "coding",
            timeLimit: 15,
          },
          {
            id: "q10",
            text: "Implement a protocol-oriented networking layer with error handling.",
            type: "coding",
            timeLimit: 20,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await db.assessments.bulkAdd(mockAssessments);
    console.log(
      "✅ Database seeded with",
      mockAssessments.length,
      "assessments",
    );
  }
}
