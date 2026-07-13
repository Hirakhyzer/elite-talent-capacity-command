"""Markdown report generation for workforce intelligence runs."""

from __future__ import annotations

from pathlib import Path
from typing import Any
import pandas as pd


def write_report(path: str | Path, summary: dict[str, Any], gaps: pd.DataFrame, burnout: pd.DataFrame, paths: pd.DataFrame, options: pd.DataFrame, fairness: pd.DataFrame) -> None:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Workforce Skills and Talent Intelligence Report",
        "",
        "> Synthetic research warning: this report uses fictional employees, skills, projects, contractors, and workloads. It is not HR advice and must not be used for real employment decisions.",
        "",
        "## Portfolio summary",
        "",
        f"- Employees: `{summary['employee_count']}`",
        f"- Open skill gaps: `{summary['open_skill_gaps']}`",
        f"- Critical/high-priority gaps: `{summary['critical_or_high_gap_count']}`",
        f"- High burnout-risk count: `{summary['high_burnout_count']}`",
        f"- Mean utilization: `{summary['mean_utilization']:.3f}`",
        "",
        "## Top skill gaps",
        "",
        "| Project | Skill | Shortage | Risk | Priority |",
        "| --- | --- | ---: | ---: | --- |",
    ]
    for row in gaps.head(10).itertuples(index=False):
        lines.append(f"| {row.project_id} | {row.skill} | {row.shortage} | {row.gap_risk_score:.2f} | {row.priority} |")
    lines.extend(["", "## Burnout watch list", "", "| Employee | Role | Utilization | Risk | Band |", "| --- | --- | ---: | ---: | --- |"])
    for row in burnout.head(10).itertuples(index=False):
        lines.append(f"| {row.employee_id} | {row.role} | {row.utilization:.2f} | {row.burnout_risk_score:.2f} | {row.burnout_band} |")
    lines.extend(["", "## Staffing alternatives", "", "| Project | Skill | Action | Cost | Rationale |", "| --- | --- | --- | ---: | --- |"])
    for row in options.head(10).itertuples(index=False):
        lines.append(f"| {row.project_id} | {row.skill} | {row.recommended_action} | {row.estimated_cost} | {row.rationale} |")
    lines.extend(["", "## Fairness audit", "", "| Group | Employees | Mean utilization | Mean burnout risk | High burnout rate | Learning recommendations |", "| --- | ---: | ---: | ---: | ---: | ---: |"])
    for row in fairness.itertuples(index=False):
        lines.append(f"| {row.group} | {row.employee_count} | {row.mean_utilization:.3f} | {row.mean_burnout_risk:.2f} | {row.high_burnout_rate:.3f} | {row.mean_learning_recommendations:.3f} |")
    lines.extend(["", "## Human review boundary", "", "All outputs are planning evidence. Real workforce decisions require manager, HR, legal, and employee-development review with privacy protections."])
    destination.write_text("\n".join(lines), encoding="utf-8")
