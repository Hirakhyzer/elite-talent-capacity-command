import { useEffect, useMemo, useState } from "react";
import { cloneInitialState } from "./data";
import { capacitySummary, hiringAnalysis, money, projectAnalysis, reportText } from "./engine";
import { Button } from "./ui";
import { Dashboard } from "./Dashboard";
import { Planner } from "./Planner";
import { Team } from "./Team";
import { Hiring } from "./Hiring";
import { Reports } from "./Reports";

const STORAGE_KEY = "elite-talent-capacity-command-v1";

function loadWorkspace() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    const fresh = cloneInitialState();
    return saved ? {
      ...fresh,
      ...saved,
      people: Array.isArray(saved.people) ? saved.people : fresh.people,
      contractors: Array.isArray(saved.contractors) ? saved.contractors : fresh.contractors,
      projects: Array.isArray(saved.projects) ? saved.projects : fresh.projects,
      assignments: Array.isArray(saved.assignments) ? saved.assignments : fresh.assignments,
      candidates: Array.isArray(saved.candidates) ? saved.candidates : fresh.candidates,
      roleRequests: Array.isArray(saved.roleRequests) ? saved.roleRequests : fresh.roleRequests,
      savedReports: Array.isArray(saved.savedReports) ? saved.savedReports : [],
    } : fresh;
  } catch {
    return cloneInitialState();
  }
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [state, setState] = useState(loadWorkspace);
  const [tab, setTab] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(() => loadWorkspace().projects[0]?.id || "");
  const [toast, setToast] = useState("");
  const summary = useMemo(() => capacitySummary(state), [state]);
  const selectedProject = state.projects.find((project) => project.id === selectedProjectId) || state.projects[0];
  const selectedAnalysis = useMemo(() => projectAnalysis(selectedProject, state.people, state.assignments), [selectedProject, state.people, state.assignments]);

  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(timer); }, [toast]);

  const notify = (message) => setToast(message);
  const selectProject = (id) => setSelectedProjectId(id);
  const updateState = (updater) => setState((current) => updater(current));

  function addAssignment(projectId, personId, hours) {
    const number = Math.max(1, Number(hours) || 0);
    updateState((current) => {
      const existing = current.assignments.find((assignment) => assignment.projectId === projectId && assignment.personId === personId);
      if (existing) return { ...current, assignments: current.assignments.map((assignment) => assignment.id === existing.id ? { ...assignment, hours: assignment.hours + number } : assignment) };
      return { ...current, assignments: [...current.assignments, { id: `assignment-${Date.now()}`, projectId, personId, hours: number, role: "Capacity coverage" }] };
    });
    notify("Project capacity updated");
  }

  function createContractorRequest(project, contractor) {
    updateState((current) => ({
      ...current,
      roleRequests: [{
        id: `role-${Date.now()}`,
        title: contractor.title,
        reason: `Provide ${contractor.skills.join(", ")} coverage for ${project.name}.`,
        skill: contractor.skills[0],
        type: "Contract",
        monthlyCost: Math.round(contractor.hourlyRate * contractor.weeklyCapacity * 4),
        contractorRate: contractor.hourlyRate,
        hoursNeeded: Math.min(contractor.weeklyCapacity, Math.max(8, project.targetHours)),
        status: "Finance Review",
        approvals: { founder: false, finance: false },
        created: "2026-07-03",
      }, ...current.roleRequests],
    }));
    setTab("hiring");
    notify("Contractor capacity request drafted");
  }

  function updateProjectStatus(id, status) {
    updateState((current) => ({ ...current, projects: current.projects.map((project) => project.id === id ? { ...project, status } : project) }));
    notify("Project delivery status updated");
  }

  function updatePersonAvailability(id, availability) {
    updateState((current) => ({ ...current, people: current.people.map((person) => person.id === id ? { ...person, availability } : person) }));
    notify("Team availability updated");
  }

  function setHiringMode(hiringMode) {
    updateState((current) => ({ ...current, hiringMode }));
  }

  function toggleRoleApproval(id, key) {
    updateState((current) => ({
      ...current,
      roleRequests: current.roleRequests.map((role) => {
        if (role.id !== id) return role;
        const approvals = { ...role.approvals, [key]: !role.approvals[key] };
        const status = approvals.finance && approvals.founder ? "Approved" : approvals.finance ? "Founder Review" : "Finance Review";
        return { ...role, approvals, status };
      }),
    }));
    notify("Role approval updated");
  }

  function updateCandidateStage(id, stage) {
    updateState((current) => ({ ...current, candidates: current.candidates.map((candidate) => candidate.id === id ? { ...candidate, stage } : candidate) }));
    notify("Candidate stage updated");
  }

  function saveReport() {
    const coverage = selectedProject.targetHours ? selectedAnalysis.assignedHours / selectedProject.targetHours * 100 : 0;
    const report = { id: `snapshot-${Date.now()}`, project: selectedProject.name, client: selectedProject.client, risk: selectedAnalysis.riskScore, band: selectedAnalysis.band, coverage, gap: selectedAnalysis.capacityGap, createdAt: new Date().toLocaleString() };
    updateState((current) => ({ ...current, savedReports: [report, ...current.savedReports].slice(0, 20) }));
    notify("Capacity snapshot saved");
  }

  function removeReport(id) {
    updateState((current) => ({ ...current, savedReports: current.savedReports.filter((report) => report.id !== id) }));
    notify("Saved snapshot removed");
  }

  function exportText() {
    download("elite-talent-capacity-report.txt", reportText(state, summary, selectedProject, selectedAnalysis), "text/plain");
    notify("TXT report downloaded");
  }

  function exportJson() {
    download("elite-talent-capacity-analysis.json", JSON.stringify({ generatedAt: new Date().toLocaleString(), company: "Elite Era Development L.L.C", selectedProject, selectedAnalysis, summary }, null, 2), "application/json");
    notify("JSON analysis downloaded");
  }

  function resetWorkspace() {
    if (!window.confirm("Reset all talent and capacity demo data in this browser?")) return;
    const reset = cloneInitialState();
    setState(reset);
    setSelectedProjectId(reset.projects[0].id);
    setTab("dashboard");
    notify("Demo workspace reset");
  }

  const tabs = [["dashboard", "Command center", "◆"], ["planner", "Staffing planner", "◫"], ["team", "Team & skills", "◉"], ["hiring", "Hiring decisions", "↗"], ["reports", "Reports", "▤"]];
  const shared = { state, summary, selectedProject, selectedAnalysis, setTab, selectProject, addAssignment, createContractorRequest, updateProjectStatus, updatePersonAvailability, setHiringMode, toggleRoleApproval, updateCandidateStage, saveReport, removeReport, exportText, exportJson, resetWorkspace };
  const pages = {
    dashboard: <Dashboard {...shared}/>,
    planner: <Planner {...shared}/>,
    team: <Team {...shared}/>,
    hiring: <Hiring {...shared}/>,
    reports: <Reports {...shared}/>,
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">E</div><div><span>Elite Era Development L.L.C</span><strong>Talent Capacity</strong></div></div>
      <nav>{tabs.map(([id, label, icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><i>{icon}</i>{label}</button>)}</nav>
      <div className="side-card"><span>Selected project</span><strong>{selectedProject.name}</strong><small>{selectedAnalysis.riskScore}/100 risk · {selectedAnalysis.capacityGap}h uncovered</small><div><i className={selectedAnalysis.band === "Low" ? "good" : selectedAnalysis.band === "Medium" ? "watch" : "risk"}/><b>{selectedProject.status}</b><em>{money(selectedProject.revenue)}</em></div></div>
      <div className="profile"><span>HK</span><div><strong>Hira Khyzer</strong><small>Founder · Elite Era</small></div></div>
    </aside>
    <main className="workspace">
      <header className="topbar"><div><p>Workforce planning and delivery coverage system</p><h2>{selectedProject.name}</h2></div><div><span className="saved">● Saved locally</span><Button variant="outline" onClick={exportText}>Export report</Button><Button onClick={() => setTab("planner")}>Plan staffing</Button></div></header>
      <div className="mobile-tabs">{tabs.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</div>
      <section className="content">{pages[tab]}</section>
      <footer className="footer"><strong>Made by Hira Khyzer</strong><span>Elite Era Development L.L.C</span><b>#f4af00</b></footer>
    </main>
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
