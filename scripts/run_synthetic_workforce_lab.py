"""Run the synthetic workforce skills and talent intelligence lab.

The run uses only fictional workforce records. It demonstrates skill-gap analytics,
learning recommendations, burnout-risk screening, contractor alternatives,
fairness auditing, visualizations, reporting, and audit logging without using
real employee data.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from workforceintel.analysis import burnout_risk, hire_or_contractor_options, portfolio_summary, skill_gap_analysis, skill_supply
from workforceintel.audit import append_record, verify_log
from workforceintel.config import ensure_output_dirs, set_seed
from workforceintel.fairness import fairness_summary, group_fairness_audit
from workforceintel.learning import learning_roi_summary, recommend_learning_paths
from workforceintel.reporting import write_report
from workforceintel.synthetic import SyntheticWorkforceConfig, generate_synthetic_workforce
from workforceintel.visualization import plot_burnout_distribution, plot_fairness_audit, plot_gap_risk, plot_learning_paths, plot_staffing_alternatives


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a synthetic workforce intelligence lab.")
    parser.add_argument("--employees", type=int, default=90)
    parser.add_argument("--projects", type=int, default=18)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output-dir", default="outputs")
    args = parser.parse_args()

    set_seed(args.seed)
    data = generate_synthetic_workforce(SyntheticWorkforceConfig(employees=args.employees, projects=args.projects, seed=args.seed))
    employees = data["employees"]
    skills = data["skills"]
    projects = data["projects"]
    demand = data["demand"]
    learning = data["learning"]
    contractors = data["contractors"]

    supply = skill_supply(skills)
    gaps = skill_gap_analysis(projects, demand, skills)
    burnout = burnout_risk(employees)
    learning_paths = recommend_learning_paths(gaps, skills, learning)
    alternatives = hire_or_contractor_options(gaps, contractors)
    fairness = group_fairness_audit(employees, burnout, learning_paths)
    summary = portfolio_summary(employees, gaps, burnout)
    summary.update(learning_roi_summary(learning_paths))
    summary.update(fairness_summary(fairness))
    summary.update({"seed": args.seed, "data_origin": "synthetic fictional workforce data"})

    outputs = ensure_output_dirs(args.output_dir)
    employees.to_csv(outputs["results"] / "synthetic_employees.csv", index=False)
    skills.to_csv(outputs["results"] / "synthetic_employee_skills.csv", index=False)
    projects.to_csv(outputs["results"] / "synthetic_projects.csv", index=False)
    demand.to_csv(outputs["results"] / "synthetic_project_skill_demand.csv", index=False)
    supply.to_csv(outputs["results"] / "synthetic_skill_supply.csv", index=False)
    gaps.to_csv(outputs["results"] / "synthetic_skill_gaps.csv", index=False)
    burnout.to_csv(outputs["results"] / "synthetic_burnout_risk.csv", index=False)
    learning_paths.to_csv(outputs["results"] / "synthetic_learning_paths.csv", index=False)
    alternatives.to_csv(outputs["results"] / "synthetic_staffing_alternatives.csv", index=False)
    fairness.to_csv(outputs["results"] / "synthetic_fairness_audit.csv", index=False)
    contractors.to_csv(outputs["results"] / "synthetic_contractors.csv", index=False)

    plot_gap_risk(gaps, outputs["figures"] / "synthetic_skill_gap_risk.png")
    plot_burnout_distribution(burnout, outputs["figures"] / "synthetic_burnout_distribution.png")
    plot_learning_paths(learning_paths, outputs["figures"] / "synthetic_learning_path_mix.png")
    plot_staffing_alternatives(alternatives, outputs["figures"] / "synthetic_staffing_alternatives.png")
    plot_fairness_audit(fairness, outputs["figures"] / "synthetic_fairness_audit.png")

    audit_path = outputs["audit"] / "workforce_audit_log.jsonl"
    append_record(audit_path, {**summary, "boundary": "synthetic planning evidence only; not for real employment decisions"})
    summary["audit_log"] = verify_log(audit_path)
    (outputs["results"] / "synthetic_workforce_summary.json").write_text(json.dumps(summary, indent=2, default=str), encoding="utf-8")
    write_report(outputs["reports"] / "synthetic_workforce_report.md", summary, gaps, burnout, learning_paths, alternatives, fairness)
    print(json.dumps(summary, indent=2, default=str))


if __name__ == "__main__":
    main()
