"""Core workforce intelligence analytics."""

from __future__ import annotations

import numpy as np
import pandas as pd

PRIORITY_WEIGHT = {"low": .35, "medium": .55, "high": .80, "critical": 1.0}


def skill_supply(skills: pd.DataFrame) -> pd.DataFrame:
    """Aggregate available skill supply by skill and level."""
    return skills.groupby("skill").agg(people=("employee_id", "nunique"), average_level=("level", "mean"), senior_people=("level", lambda s: int((s >= 4).sum()))).reset_index()


def skill_gap_analysis(projects: pd.DataFrame, demand: pd.DataFrame, skills: pd.DataFrame) -> pd.DataFrame:
    """Compare project skill demand with current employee skill supply."""
    supply = skill_supply(skills)
    project_context = demand.merge(projects[["project_id", "priority", "deadline_weeks", "business_value"]], on="project_id", how="left")
    rows = []
    for row in project_context.itertuples(index=False):
        candidates = skills.loc[(skills["skill"] == row.skill) & (skills["level"] >= row.required_level)]
        available = int(candidates["employee_id"].nunique())
        shortage = max(int(row.required_people) - available, 0)
        urgency = 1 / max(float(row.deadline_weeks), 1)
        risk = 100 * (0.42 * (shortage / max(row.required_people, 1)) + 0.28 * PRIORITY_WEIGHT.get(row.priority, .55) + 0.18 * urgency + 0.12 * (row.business_value / 100))
        rows.append({"project_id": row.project_id, "skill": row.skill, "required_level": int(row.required_level), "required_people": int(row.required_people), "qualified_internal_people": available, "shortage": shortage, "gap_risk_score": round(float(risk), 2), "priority": row.priority, "deadline_weeks": int(row.deadline_weeks)})
    return pd.DataFrame(rows).sort_values("gap_risk_score", ascending=False).reset_index(drop=True)


def burnout_risk(employees: pd.DataFrame) -> pd.DataFrame:
    """Estimate synthetic burnout risk from workload, engagement, tenure, and attrition signal."""
    df = employees.copy()
    utilization = df["allocated_hours"] / df["capacity_hours"].clip(lower=1)
    risk = 100 * (0.45 * utilization.clip(0, 1.4) / 1.4 + 0.24 * (1 - df["engagement"]) + 0.20 * df["attrition_signal"] + 0.11 * (df["tenure_months"] < 6).astype(float))
    df["utilization"] = utilization.round(3)
    df["burnout_risk_score"] = risk.round(2)
    df["burnout_band"] = pd.cut(df["burnout_risk_score"], [-1, 40, 60, 75, 101], labels=["low", "watch", "high", "severe"]).astype(str)
    return df.sort_values("burnout_risk_score", ascending=False).reset_index(drop=True)


def hire_or_contractor_options(gaps: pd.DataFrame, contractors: pd.DataFrame) -> pd.DataFrame:
    """Recommend internal learning, hiring, or contractor alternatives for gaps."""
    rows = []
    for gap in gaps.loc[gaps["shortage"] > 0].itertuples(index=False):
        pool = contractors.loc[(contractors["skill"] == gap.skill) & (contractors["level"] >= gap.required_level)].copy()
        if pool.empty:
            rows.append({"project_id": gap.project_id, "skill": gap.skill, "recommended_action": "hire", "rationale": "No qualified contractor option in synthetic market", "estimated_cost": None, "coverage_weeks": None})
            continue
        pool["option_score"] = 100 * (0.44 * pool["quality_score"] + 0.31 * (1 / pool["availability_weeks"].clip(lower=1)) + 0.25 * (1 - pool["weekly_rate"] / pool["weekly_rate"].max()))
        best = pool.sort_values("option_score", ascending=False).iloc[0]
        action = "contractor" if gap.deadline_weeks <= 8 or gap.priority in {"high", "critical"} else "hire_or_upskill"
        rows.append({"project_id": gap.project_id, "skill": gap.skill, "recommended_action": action, "contractor_id": best["contractor_id"], "estimated_cost": int(best["weekly_rate"] * min(max(gap.deadline_weeks, 1), 12)), "coverage_weeks": int(best["availability_weeks"]), "rationale": "balances urgency, skill fit, contractor quality, and cost"})
    return pd.DataFrame(rows)


def portfolio_summary(employees: pd.DataFrame, gaps: pd.DataFrame, burnout: pd.DataFrame) -> dict[str, float | int]:
    return {
        "employee_count": int(len(employees)),
        "open_skill_gaps": int((gaps["shortage"] > 0).sum()),
        "critical_or_high_gap_count": int(((gaps["shortage"] > 0) & (gaps["priority"].isin(["high", "critical"]))).sum()),
        "mean_gap_risk": float(gaps["gap_risk_score"].mean()),
        "high_burnout_count": int(burnout["burnout_band"].isin(["high", "severe"]).sum()),
        "mean_utilization": float(burnout["utilization"].mean()),
    }
