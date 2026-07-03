export const TODAY = "2026-07-03";

export const SKILLS = ["Frontend", "Backend", "API", "AI", "Data", "DevOps", "QA", "Design", "Project Management", "Security", "Research"];
export const STATUSES = ["Planned", "Active", "At risk", "Paused", "Complete"];
export const CANDIDATE_STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

export const initialState = {
  people: [
    { id: "hira", name: "Hira Khyzer", initials: "HK", title: "AI Systems Lead", type: "Employee", capacity: 32, monthlyCost: 8500, skills: ["AI", "API", "Data", "Security", "Research"], availability: "Available", notes: "Leads AI system design, senior technical review, and high-risk security work." },
    { id: "musa", name: "Musa Khan", initials: "MK", title: "Full-Stack Engineer", type: "Employee", capacity: 36, monthlyCost: 6900, skills: ["Frontend", "Backend", "API", "DevOps"], availability: "Limited", notes: "Primary delivery engineer across portal and automation initiatives." },
    { id: "nora", name: "Nora Lee", initials: "NL", title: "QA & Reliability Engineer", type: "Employee", capacity: 32, monthlyCost: 5700, skills: ["QA", "Frontend", "DevOps", "Security"], availability: "Available", notes: "Owns quality gates, incident prevention, and release validation." },
    { id: "amina", name: "Amina Noor", initials: "AN", title: "Service Delivery Lead", type: "Employee", capacity: 30, monthlyCost: 6400, skills: ["Project Management", "QA", "API", "Research"], availability: "Limited", notes: "Manages client delivery, commercial alignment, and delivery recovery." },
    { id: "omar", name: "Omar Rahman", initials: "OR", title: "Brand & Growth Strategist", type: "Employee", capacity: 28, monthlyCost: 5100, skills: ["Design", "Research", "Project Management"], availability: "Available", notes: "Leads client experience, research, and brand-system engagements." },
    { id: "junaid", name: "Junaid Shah", initials: "JS", title: "Data Engineer", type: "Employee", capacity: 30, monthlyCost: 6100, skills: ["Data", "API", "AI", "DevOps"], availability: "Limited", notes: "Builds data pipelines, reporting infrastructure, and workflow observability." },
  ],
  contractors: [
    { id: "contract-fe", name: "Frontend specialist", initials: "FS", title: "Contract Frontend Engineer", weeklyCapacity: 24, hourlyRate: 92, skills: ["Frontend", "QA"], leadDays: 14, availability: "Available" },
    { id: "contract-sec", name: "Security assessor", initials: "SA", title: "Contract Security Specialist", weeklyCapacity: 16, hourlyRate: 135, skills: ["Security", "QA", "API"], leadDays: 10, availability: "Available" },
    { id: "contract-data", name: "Analytics specialist", initials: "AS", title: "Contract Data Analyst", weeklyCapacity: 20, hourlyRate: 86, skills: ["Data", "Research", "Design"], leadDays: 21, availability: "Limited" },
  ],
  projects: [
    { id: "atlas", client: "Atlas Holdings", name: "Operations Automation Portal", status: "At risk", deadline: "2026-08-28", revenue: 42000, requiredSkills: ["Frontend", "API", "QA", "Project Management"], targetHours: 104, managerId: "amina", notes: "SSO recovery and automation milestone need additional frontend capacity." },
    { id: "lumen", client: "Lumen Logistics", name: "AI Exception Intelligence", status: "Active", deadline: "2026-09-18", revenue: 30000, requiredSkills: ["AI", "Data", "API", "QA"], targetHours: 86, managerId: "hira", notes: "Data-pipeline scale work and client dashboard validation are in the next sprint." },
    { id: "northstar", client: "Northstar Studio", name: "Client Portal v2", status: "Active", deadline: "2026-07-25", revenue: 36000, requiredSkills: ["Frontend", "Backend", "QA", "Design"], targetHours: 72, managerId: "musa", notes: "Final portal release and executive insights handoff are near completion." },
    { id: "verdant", client: "Verdant & Co.", name: "Growth Brand Program", status: "Planned", deadline: "2026-08-14", revenue: 18000, requiredSkills: ["Design", "Research", "Project Management"], targetHours: 48, managerId: "omar", notes: "New quarterly campaign system and research deliverables are beginning this month." },
  ],
  assignments: [
    { id: "a1", personId: "hira", projectId: "lumen", hours: 16, role: "AI architecture" },
    { id: "a2", personId: "hira", projectId: "atlas", hours: 11, role: "Security review" },
    { id: "a3", personId: "musa", projectId: "atlas", hours: 22, role: "Portal engineering" },
    { id: "a4", personId: "musa", projectId: "northstar", hours: 13, role: "Release engineering" },
    { id: "a5", personId: "nora", projectId: "atlas", hours: 12, role: "Release validation" },
    { id: "a6", personId: "nora", projectId: "lumen", hours: 9, role: "Workflow QA" },
    { id: "a7", personId: "nora", projectId: "northstar", hours: 5, role: "Portal acceptance QA" },
    { id: "a8", personId: "amina", projectId: "atlas", hours: 17, role: "Client delivery" },
    { id: "a9", personId: "amina", projectId: "lumen", hours: 11, role: "Delivery coordination" },
    { id: "a10", personId: "amina", projectId: "verdant", hours: 5, role: "Project setup" },
    { id: "a11", personId: "omar", projectId: "verdant", hours: 15, role: "Creative strategy" },
    { id: "a12", personId: "omar", projectId: "northstar", hours: 4, role: "Executive visual review" },
    { id: "a13", personId: "junaid", projectId: "lumen", hours: 18, role: "Data pipeline" },
    { id: "a14", personId: "junaid", projectId: "atlas", hours: 11, role: "Observability integration" },
  ],
  candidates: [
    { id: "c1", name: "Leena Qureshi", role: "Frontend Engineer", skills: ["Frontend", "QA", "Design"], stage: "Interview", salary: 6800, score: 88, notes: "Strong React and design-system portfolio. Available in 30 days." },
    { id: "c2", name: "Bilal Ahmed", role: "Data Analyst", skills: ["Data", "Research", "Design"], stage: "Screening", salary: 5600, score: 76, notes: "Relevant analytics background; needs technical interview." },
    { id: "c3", name: "Sara Malik", role: "Security Engineer", skills: ["Security", "QA", "API"], stage: "Offer", salary: 7900, score: 91, notes: "Strong audit and cloud-security experience. Offer decision pending." },
  ],
  roleRequests: [
    { id: "role-01", title: "Frontend Engineer", reason: "Atlas and Northstar delivery overlap requires protected frontend capacity.", skill: "Frontend", type: "Hire", monthlyCost: 6800, contractorRate: 92, hoursNeeded: 24, status: "Finance Review", approvals: { founder: false, finance: false }, created: "2026-07-01" },
    { id: "role-02", title: "Security Engineer", reason: "Enterprise client security reviews exceed available in-house capacity.", skill: "Security", type: "Contract", monthlyCost: 7900, contractorRate: 135, hoursNeeded: 16, status: "Founder Review", approvals: { founder: false, finance: true }, created: "2026-07-02" },
  ],
  hiringMode: "contractor",
  savedReports: [],
};

export function cloneInitialState() {
  return JSON.parse(JSON.stringify(initialState));
}
