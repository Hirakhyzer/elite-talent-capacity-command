import { money, percent } from "./engine";
import { Badge, Button, Metric, PageHeading, Panel, Progress } from "./ui";

const riskTone = (band) => band === "Low" ? "success" : band === "Medium" ? "warning" : "danger";
const loadTone = (risk) => risk === "Available" ? "success" : risk === "Active" ? "blue" : risk === "Watch" ? "warning" : "danger";

export function Dashboard({ summary, selectedProject, selectedAnalysis, setTab, selectProject }) {
  const priority = summary.projects.slice().sort((a, b) => b.analysis.riskScore - a.analysis.riskScore)[0];
  return <div className="page">
    <PageHeading eyebrow="Elite Era Development L.L.C" title="Talent & capacity command center" text="See which delivery commitments are protected, where your team is overloaded, which skills are missing, and whether hiring or contractor coverage is the safer next move." action={<Button onClick={() => setTab("planner")}>Open staffing planner</Button>}/>
    <section className={`hero ${riskTone(priority.analysis.band)}`}><div><p>Highest staffing priority</p><h2>{priority.project.name}</h2><span>{priority.project.client} · {priority.analysis.riskScore}/100 staffing risk · {priority.analysis.capacityGap} uncovered weekly hours · deadline {priority.analysis.deadlineDays} days away.</span><div className="hero-actions"><Button onClick={() => { selectProject(priority.project.id); setTab("planner"); }}>Plan coverage →</Button><Button variant="outline" onClick={() => setTab("hiring")}>Review hire decisions</Button></div></div><div className="risk-orb"><div><b>{priority.analysis.riskScore}</b><small>staffing risk</small><Badge tone={riskTone(priority.analysis.band)}>{priority.analysis.band}</Badge></div></div></section>
    <section className="metrics">
      <Metric label="Team utilization" value={percent(summary.utilization)} detail={`${summary.available} weekly hours available`} tone={summary.utilization >= 90 ? "warning" : "success"} icon="◷"/>
      <Metric label="Overloaded people" value={summary.overloaded.length} detail={`${summary.watch.length} more at watch level`} tone={summary.overloaded.length ? "danger" : "success"} icon="!"/>
      <Metric label="Staffing risks" value={summary.atRiskProjects.length} detail="Projects with high delivery pressure" tone={summary.atRiskProjects.length ? "warning" : "success"} icon="◆"/>
      <Metric label="Monthly payroll" value={money(summary.monthlyPayroll)} detail="Employee cost forecast" tone="ink" icon="↗"/>
    </section>
    <section className="two-col">
      <Panel eyebrow="Founder action plan" title="What needs an owner now"><div className="action-list">{summary.actions.map((item, index) => <article key={`${item.title}-${index}`}><i>{index + 1}</i><div><strong>{item.title}</strong><small>{item.detail}</small></div></article>)}</div></Panel>
      <Panel eyebrow="Skill-gap radar" title="Capacity the team cannot currently cover"><div className="gap-list">{summary.gaps.length ? summary.gaps.slice(0, 4).map((gap) => <article key={gap.skill}><div><strong>{gap.skill}</strong><small>{Math.ceil(gap.hours)} weekly hours across {gap.projects.length} project{gap.projects.length === 1 ? "" : "s"}</small></div><Badge tone={riskTone(gap.risk >= 70 ? "High" : gap.risk >= 40 ? "Medium" : "Low")}>{gap.risk}/100</Badge></article>) : <div className="empty"><i>✓</i><strong>No uncovered skills</strong><p>Current active work has staffing coverage for required capabilities.</p></div>}</div><Button variant="outline" onClick={() => setTab("hiring")}>Open hiring plan</Button></Panel>
    </section>
    <section className="two-col">
      <Panel eyebrow="Team load" title="Utilization and burnout pressure"><div className="team-pulse">{summary.people.slice().sort((a, b) => b.load.utilization - a.load.utilization).map(({ person, load }) => <article key={person.id}><div><span className="avatar">{person.initials}</span><div><strong>{person.name}</strong><small>{person.title} · {Math.round(load.allocated)}/{load.capacity}h assigned</small></div></div><div className="pulse-score"><Badge tone={loadTone(load.risk)}>{Math.round(load.utilization)}%</Badge><Progress value={load.utilization} tone={load.utilization > 100 ? "red" : load.utilization >= 88 ? "gold" : "green"}/></div></article>)}</div><Button variant="outline" onClick={() => setTab("team")}>Open skill matrix</Button></Panel>
      <Panel eyebrow="Project delivery" title="Capacity risk by commitment"><div className="project-pulse">{summary.projects.slice().sort((a, b) => b.analysis.riskScore - a.analysis.riskScore).map(({ project, analysis }) => <button key={project.id} onClick={() => { selectProject(project.id); setTab("planner"); }}><div><strong>{project.name}</strong><small>{project.client} · {analysis.assignedHours}/{project.targetHours} weekly hours</small></div><Badge tone={riskTone(analysis.band)}>{analysis.riskScore}/100</Badge><span>→</span></button>)}</div></Panel>
    </section>
    <section className="selected-note"><span>Selected project</span><strong>{selectedProject.name}</strong><p>{selectedAnalysis.suggestion}</p></section>
  </div>;
}
