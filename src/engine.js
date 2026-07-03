import { TODAY } from "./data";

export const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);
export const percent = (value) => `${Math.round(Number(value) || 0)}%`;
export const dateLabel = (value) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "—";
export const daysUntil = (date, today = TODAY) => Math.round((new Date(`${date}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function personLoad(person, assignments) {
  const entries = assignments.filter((item) => item.personId === person.id);
  const allocated = entries.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  const capacity = Number(person.capacity || 0);
  const utilization = capacity ? allocated / capacity * 100 : 0;
  const free = Math.max(0, capacity - allocated);
  const overload = Math.max(0, allocated - capacity);
  const burnout = Math.round(clamp(utilization * 0.72 + (person.availability === "Limited" ? 18 : 0) + (entries.length >= 3 ? 8 : 0), 0, 100));
  const risk = utilization > 105 ? "Overloaded" : utilization >= 88 ? "Watch" : utilization >= 65 ? "Active" : "Available";
  return { entries, allocated, capacity, utilization, free, overload, burnout, risk };
}

export function projectAnalysis(project, people, assignments) {
  const entries = assignments.filter((item) => item.projectId === project.id);
  const team = entries.map((entry) => people.find((person) => person.id === entry.personId)).filter(Boolean);
  const assignedHours = entries.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  const capacityGap = Math.max(0, Number(project.targetHours || 0) - assignedHours);
  const coveredSkills = new Set(team.flatMap((person) => person.skills));
  const missingSkills = (project.requiredSkills || []).filter((skill) => !coveredSkills.has(skill));
  const deadlineDays = daysUntil(project.deadline);
  const teamPressure = team.length ? team.reduce((sum, person) => sum + personLoad(person, assignments).utilization, 0) / team.length : 100;
  const riskScore = Math.round(clamp(
    (project.status === "At risk" ? 25 : project.status === "Paused" ? 18 : 0) +
    Math.min(28, capacityGap / Math.max(1, project.targetHours) * 50) +
    missingSkills.length * 14 +
    (deadlineDays <= 21 ? 13 : deadlineDays <= 45 ? 6 : 0) +
    Math.max(0, teamPressure - 85) * 0.55,
    0,
    100,
  ));
  const band = riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";
  const suggestion = missingSkills.length
    ? `Cover ${missingSkills.join(", ")} before the next delivery milestone.`
    : capacityGap > 0
      ? `Add ${Math.ceil(capacityGap)} weekly hours to protect the current delivery plan.`
      : riskScore >= 40
        ? "Rebalance the assigned team and review the milestone plan."
        : "Current staffing profile supports the planned delivery scope.";
  return { entries, team, assignedHours, capacityGap, missingSkills, deadlineDays, teamPressure, riskScore, band, suggestion };
}

export function staffingOptions(project, people, contractors, assignments) {
  const analysis = projectAnalysis(project, people, assignments);
  const needSkills = analysis.missingSkills.length ? analysis.missingSkills : project.requiredSkills;
  const internal = people.map((person) => {
    const load = personLoad(person, assignments);
    const skillMatch = needSkills.length ? needSkills.filter((skill) => person.skills.includes(skill)).length / needSkills.length : 1;
    const availability = person.availability === "Available" ? 1 : person.availability === "Limited" ? .55 : 0;
    const score = Math.round(skillMatch * 65 + Math.min(1, load.free / Math.max(1, person.capacity)) * 25 + availability * 10);
    return { ...person, kind: "Employee", score, skillMatch, free: load.free, weeklyCost: person.monthlyCost / 4 };
  });
  const external = contractors.map((contractor) => {
    const skillMatch = needSkills.length ? needSkills.filter((skill) => contractor.skills.includes(skill)).length / needSkills.length : 1;
    const availability = contractor.availability === "Available" ? 1 : .55;
    const score = Math.round(skillMatch * 75 + availability * 15 + Math.min(1, contractor.weeklyCapacity / 24) * 10);
    return { ...contractor, kind: "Contractor", score, skillMatch, free: contractor.weeklyCapacity, weeklyCost: contractor.hourlyRate * Math.min(contractor.weeklyCapacity, Math.max(8, analysis.capacityGap || 16)) };
  });
  return [...internal, ...external].sort((a, b) => b.score - a.score);
}

export function skillGaps(projects, people, assignments) {
  const gaps = {};
  projects.filter((project) => !["Complete", "Paused"].includes(project.status)).forEach((project) => {
    const analysis = projectAnalysis(project, people, assignments);
    analysis.missingSkills.forEach((skill) => {
      const current = gaps[skill] || { skill, projects: [], hours: 0, risk: 0 };
      current.projects.push(project.name);
      current.hours += Math.max(8, analysis.capacityGap || 12);
      current.risk = Math.max(current.risk, analysis.riskScore);
      gaps[skill] = current;
    });
    if (analysis.capacityGap > 0 && !analysis.missingSkills.length) {
      const leadSkill = project.requiredSkills[0];
      const current = gaps[leadSkill] || { skill: leadSkill, projects: [], hours: 0, risk: 0 };
      current.projects.push(project.name);
      current.hours += analysis.capacityGap;
      current.risk = Math.max(current.risk, analysis.riskScore);
      gaps[leadSkill] = current;
    }
  });
  return Object.values(gaps).sort((a, b) => b.risk - a.risk || b.hours - a.hours);
}

export function hiringAnalysis(roleRequest, hiringMode) {
  const monthlyHireCost = Number(roleRequest.monthlyCost || 0);
  const contractorMonthlyCost = Number(roleRequest.contractorRate || 0) * Number(roleRequest.hoursNeeded || 0) * 4;
  const selectedCost = hiringMode === "hire" ? monthlyHireCost : contractorMonthlyCost;
  const breakevenMonths = contractorMonthlyCost > monthlyHireCost && monthlyHireCost ? Math.max(1, Math.ceil((monthlyHireCost * 1.5) / (contractorMonthlyCost - monthlyHireCost))) : null;
  const recommendation = hiringMode === "hire"
    ? "Use a permanent hire when this capacity need will continue beyond the next delivery cycle."
    : "Use contractor coverage when urgency is high or the demand is temporary and skill-specific.";
  return { monthlyHireCost, contractorMonthlyCost, selectedCost, breakevenMonths, recommendation };
}

export function capacitySummary(state) {
  const people = state.people.map((person) => ({ person, load: personLoad(person, state.assignments) }));
  const projects = state.projects.map((project) => ({ project, analysis: projectAnalysis(project, state.people, state.assignments) }));
  const gaps = skillGaps(state.projects, state.people, state.assignments);
  const activeProjects = projects.filter((item) => !["Complete", "Paused"].includes(item.project.status));
  const atRiskProjects = activeProjects.filter((item) => item.analysis.band === "High" || item.project.status === "At risk");
  const overloaded = people.filter((item) => item.load.utilization > 100);
  const watch = people.filter((item) => item.load.utilization >= 88 && item.load.utilization <= 100);
  const totalCapacity = people.reduce((sum, item) => sum + item.load.capacity, 0);
  const allocated = people.reduce((sum, item) => sum + item.load.allocated, 0);
  const monthlyPayroll = state.people.reduce((sum, person) => sum + Number(person.monthlyCost || 0), 0);
  const roleAnalyses = state.roleRequests.map((role) => ({ role, analysis: hiringAnalysis(role, state.hiringMode) }));
  const recruitment = {
    total: state.candidates.length,
    interview: state.candidates.filter((candidate) => candidate.stage === "Interview").length,
    offer: state.candidates.filter((candidate) => candidate.stage === "Offer").length,
    averageScore: state.candidates.length ? Math.round(state.candidates.reduce((sum, candidate) => sum + Number(candidate.score || 0), 0) / state.candidates.length) : 0,
  };
  const actions = [];
  overloaded.forEach(({ person, load }) => actions.push({ type: "overload", title: `Rebalance ${person.name}`, detail: `${Math.round(load.utilization)}% utilization · ${Math.round(load.overload)} weekly hours above capacity` }));
  atRiskProjects.forEach(({ project, analysis }) => actions.push({ type: "delivery", title: `Protect ${project.name}`, detail: `${analysis.riskScore}/100 staffing risk · ${analysis.suggestion}` }));
  gaps.slice(0, 3).forEach((gap) => actions.push({ type: "skill", title: `Cover ${gap.skill} capacity`, detail: `${Math.ceil(gap.hours)} weekly hours across ${gap.projects.length} project${gap.projects.length === 1 ? "" : "s"}` }));
  roleAnalyses.filter(({ role }) => !role.approvals.founder || !role.approvals.finance).forEach(({ role }) => actions.push({ type: "hiring", title: `Decide ${role.title} request`, detail: `${role.status} · ${role.hoursNeeded} weekly hours requested` }));
  if (!actions.length) actions.push({ type: "success", title: "Capacity controls are stable", detail: "Current demand is covered without an active staffing exception." });
  return {
    people,
    projects,
    gaps,
    activeProjects,
    atRiskProjects,
    overloaded,
    watch,
    totalCapacity,
    allocated,
    available: Math.max(0, totalCapacity - allocated),
    utilization: totalCapacity ? allocated / totalCapacity * 100 : 0,
    monthlyPayroll,
    roleAnalyses,
    recruitment,
    actions: actions.slice(0, 8),
  };
}

export function reportText(state, summary, selectedProject, analysis) {
  return [
    "ELITE ERA DEVELOPMENT L.L.C — TALENT & CAPACITY COMMAND",
    "Made by Hira Khyzer",
    "",
    `Selected project: ${selectedProject.name}`,
    `Client: ${selectedProject.client}`,
    `Status: ${selectedProject.status}`,
    `Deadline: ${dateLabel(selectedProject.deadline)}`,
    `Staffing risk: ${analysis.riskScore}/100 (${analysis.band})`,
    `Assigned weekly hours: ${analysis.assignedHours}/${selectedProject.targetHours}`,
    `Capacity gap: ${analysis.capacityGap} hours`,
    `Missing skills: ${analysis.missingSkills.length ? analysis.missingSkills.join(", ") : "None"}`,
    "",
    "--- PORTFOLIO ---",
    `Team utilization: ${percent(summary.utilization)}`,
    `Available weekly capacity: ${summary.available} hours`,
    `Overloaded team members: ${summary.overloaded.length}`,
    `High-risk projects: ${summary.atRiskProjects.length}`,
    `Skill gaps: ${summary.gaps.length}`,
    `Monthly payroll forecast: ${money(summary.monthlyPayroll)}`,
    "",
    "--- ACTION PLAN ---",
    ...summary.actions.map((action) => `- ${action.title}: ${action.detail}`),
    "",
  ].join("\n");
}
