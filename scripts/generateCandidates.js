import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample data pools
const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Dorothy",
  "Kevin",
  "Carol",
  "Brian",
  "Amanda",
  "George",
  "Melissa",
  "Edward",
  "Deborah",
  "Ronald",
  "Stephanie",
  "Timothy",
  "Rebecca",
  "Jason",
  "Sharon",
  "Jeffrey",
  "Laura",
  "Ryan",
  "Cynthia",
  "Jacob",
  "Kathleen",
  "Gary",
  "Amy",
  "Nicholas",
  "Shirley",
  "Eric",
  "Angela",
  "Jonathan",
  "Helen",
  "Stephen",
  "Anna",
  "Larry",
  "Brenda",
  "Justin",
  "Pamela",
  "Scott",
  "Nicole",
  "Brandon",
  "Emma",
  "Benjamin",
  "Samantha",
  "Samuel",
  "Katherine",
  "Raymond",
  "Christine",
  "Gregory",
  "Debra",
  "Alexander",
  "Rachel",
  "Patrick",
  "Catherine",
  "Frank",
  "Carolyn",
  "Raymond",
  "Janet",
  "Jack",
  "Ruth",
  "Dennis",
  "Maria",
  "Jerry",
  "Heather",
  "Tyler",
  "Diane",
  "Aaron",
  "Virginia",
  "Jose",
  "Julie",
  "Adam",
  "Joyce",
  "Henry",
  "Victoria",
  "Nathan",
  "Olivia",
  "Douglas",
  "Kelly",
  "Zachary",
  "Christina",
  "Peter",
  "Lauren",
  "Kyle",
  "Joan",
  "Walter",
  "Evelyn",
  "Ethan",
  "Judith",
  "Jeremy",
  "Megan",
  "Harold",
  "Cheryl",
  "Keith",
  "Andrea",
  "Christian",
  "Hannah",
  "Roger",
  "Martha",
  "Noah",
  "Jacqueline",
  "Gerald",
  "Frances",
  "Carl",
  "Gloria",
  "Terry",
  "Ann",
  "Sean",
  "Teresa",
  "Austin",
  "Kathryn",
  "Arthur",
  "Sara",
  "Lawrence",
  "Janice",
  "Jesse",
  "Jean",
  "Dylan",
  "Alice",
  "Bryan",
  "Madison",
  "Joe",
  "Doris",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
  "Ruiz",
  "Hughes",
  "Price",
  "Alvarez",
  "Castillo",
  "Sanders",
  "Patel",
  "Myers",
  "Long",
  "Ross",
  "Foster",
  "Jimenez",
  "Powell",
  "Jenkins",
  "Perry",
  "Russell",
];

const positions = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UX Designer",
  "UI Designer",
  "QA Engineer",
  "Security Engineer",
  "Cloud Architect",
  "Mobile Developer",
  "Technical Writer",
  "Business Analyst",
  "Scrum Master",
  "Database Administrator",
  "Systems Engineer",
  "Network Engineer",
  "Site Reliability Engineer",
];

const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Redis",
  "Elasticsearch",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Git",
  "CI/CD",
  "Jenkins",
  "GraphQL",
  "REST API",
  "Microservices",
  "Agile",
  "Scrum",
  "TDD",
  "System Design",
  "Data Structures",
  "Algorithms",
];

const cities = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "San Francisco, CA",
  "Seattle, WA",
  "Denver, CO",
  "Washington, DC",
  "Boston, MA",
  "Nashville, TN",
  "Portland, OR",
  "Las Vegas, NV",
  "Detroit, MI",
  "Miami, FL",
  "Atlanta, GA",
  "Remote",
  "Remote",
];

const statuses = ["new", "screening", "interview", "offer", "rejected"];

// Helper functions
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

const randomItems = (array, min, max) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateEmail = (firstName, lastName) => {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "email.com",
  ];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomItem(domains)}`;
};

const generatePhone = () => {
  const areaCode = randomNumber(200, 999);
  const prefix = randomNumber(200, 999);
  const line = randomNumber(1000, 9999);
  return `+1 (${areaCode}) ${prefix}-${line}`;
};

const generateSalary = (experience) => {
  const base = 60000 + experience * 10000;
  const min = base + randomNumber(-10000, 0);
  const max = base + randomNumber(20000, 40000);
  return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
};

const generateAppliedDate = () => {
  const daysAgo = randomNumber(1, 365);
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
};

// Generate candidates
function generateCandidates(count) {
  const candidates = [];

  for (let i = 1; i <= count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const experience = randomNumber(0, 15);

    const candidate = {
      id: `candidate-${i}`,
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      position: randomItem(positions),
      experience,
      skills: randomItems(skills, 3, 8),
      resume: `https://example.com/resume/${firstName.toLowerCase()}-${lastName.toLowerCase()}.pdf`,
      status: randomItem(statuses),
      appliedAt: generateAppliedDate(),
      location: randomItem(cities),
      expectedSalary: generateSalary(experience),
    };

    candidates.push(candidate);
  }

  return candidates;
}

// Generate and save
const candidates = generateCandidates(1500);

const outputPath = join(__dirname, "..", "src", "data", "candidates.json");
writeFileSync(outputPath, JSON.stringify(candidates, null, 2));

console.log(`✅ Generated ${candidates.length} candidates at ${outputPath}`);
console.log(`📊 Distribution:`);

const statusCounts = candidates.reduce((acc, c) => {
  acc[c.status] = (acc[c.status] || 0) + 1;
  return acc;
}, {});

Object.entries(statusCounts).forEach(([status, count]) => {
  console.log(`   ${status}: ${count}`);
});
