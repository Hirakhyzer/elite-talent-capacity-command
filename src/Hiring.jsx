import { hiringAnalysis, money } from "./engine";
import { Badge, Button, Metric, PageHeading, Panel, Progress } from "./ui";

const stageTone = (stage) => stage === "Offer" || stage === "Hired" ? "success" : stage === "Interview" ? "warning" : stage === "Rejected" ? "danger" : "neutral";

export function Hiring({ state, summary, setHiringMode, toggleRoleApproval, updateCandidateStage, setTab }) {
  const modeLabel = state.hiringMode === "hire" ? "Permanent hire" : "Contractor coverage";
  const totalSelectedCost = summary.roleAnalyses.reduce((sum, { analysis }) => sum + analysis.selectedCost, 0);
  return <div className="page">
    <PageHeading eyebrow="Talent investment planning" title="Hire, train, or use a contractor" text="Compare durable payroll investment with flexible contractor coverage, then route the role decision through Finance and Founder approval before spending is committed." action={<Button onClick={() => setTab("planner")}>See project gaps</Button>}/>
    <section className="mode-hero"><div><p>Selected coverage model</p><h2>{modeLabel}</h2><span>{state.hiringMode === "hire" ? "Use permanent capacity when delivery demand and the skill gap will continue beyond the current project cycle." : "Use specialist contractor coverage when urgency is high, demand is temporary, or the capability is narrow."}</span><div className="mode-buttons"><Button variant={state.hiringMode === "hire" ? "primary" : "outline"} onClick={() => setHiringMode("hire")}>Model permanent hire</Button><Button variant={state.hiringMode === "contractor" ? "primary" : "outline"} onClick={() => setHiringMode("contractor")}>Model contractor</Button></div></div><div className="mode-price"><b>{money(totalSelectedCost)}</b><small>Combined monthly selected-model cost</small></div></section>
    <section className="metrics">
      <Metric label="Open role requests" value={state.roleRequests.length} detail="Capacity requests awaiting final decision" tone="gold" icon="◫"/>
      <Metric label="Interview pipeline" value={summary.recruitment.interview} detail={`${summary.recruitment.offer} candidate${summary.recruitment.offer === 1 ? "" : "s"} at offer stage`} tone="blue" icon="◉"/>
      <Metric label="Candidate quality" value={`${summary.recruitment.averageScore}/100`} detail="Average current candidate score" tone={summary.recruitment.averageScore >= 80 ? "success" : "warning"} icon="◆"/>
      <Metric label="Monthly payroll" value={money(summary.monthlyPayroll)} detail="Current employee team cost" tone="ink" icon="↗"/>
    </section>
    <section className="two-col">
      <Panel eyebrow="Role approval flow" title="Requested capacity"><div className="role-list">{summary.roleAnalyses.map(({ role, analysis }) => <article key={role.id}><div className="role-top"><div><strong>{role.title}</strong><small>{role.skill} · {role.hoursNeeded} weekly hours · created {role.created}</small></div><Badge tone={role.status.includes("Review") ? "warning" : "success"}>{role.status}</Badge></div><p>{role.reason}</p><div className="cost-compare"><span>Permanent hire <b>{money(analysis.monthlyHireCost)}/mo</b></span><span>Contractor <b>{money(analysis.contractorMonthlyCost)}/mo</b></span></div><div className="approval-box"><span>Finance</span><button className={role.approvals.finance ? "approved" : ""} onClick={() => toggleRoleApproval(role.id, "finance")}>{role.approvals.finance ? "✓ Approved" : "Approve"}</button><span>Founder</span><button className={role.approvals.founder ? "approved" : ""} onClick={() => toggleRoleApproval(role.id, "founder")}>{role.approvals.founder ? "✓ Approved" : "Approve"}</button></div><small className="recommendation">{analysis.recommendation}</small></article>)}</div></Panel>
      <Panel eyebrow="Recruitment pipeline" title="Candidates and next steps"><div className="candidate-list">{state.candidates.map((candidate) => <article key={candidate.id}><div><span className="candidate-avatar">{candidate.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{candidate.name}</strong><small>{candidate.role} · {candidate.skills.join(", ")}</small></div></div><b>{candidate.score}</b><select value={candidate.stage} onChange={(event) => updateCandidateStage(candidate.id, event.target.value)}><option>Applied</option><option>Screening</option><option>Interview</option><option>Offer</option><option>Hired</option><option>Rejected</option></select><Badge tone={stageTone(candidate.stage)}>{candidate.stage}</Badge><p>{candidate.notes}</p></article>)}</div></Panel>
    </section>
  </div>;
}
