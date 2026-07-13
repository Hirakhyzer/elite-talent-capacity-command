"""Fairness and workforce-risk audits for synthetic talent intelligence."""

from __future__ import annotations

import pandas as pd


def group_fairness_audit(employees: pd.DataFrame, burnout: pd.DataFrame, learning_paths: pd.DataFrame) -> pd.DataFrame:
    """Audit synthetic subgroup differences in allocation, burnout, and learning access."""
    merged = burnout[["employee_id", "group", "utilization", "burnout_risk_score", "burnout_band"]].copy()
    learning_counts = learning_paths.groupby("employee_id").size().rename("learning_recommendations").reset_index() if not learning_paths.empty else pd.DataFrame(columns=["employee_id", "learning_recommendations"])
    merged = merged.merge(learning_counts, on="employee_id", how="left").fillna({"learning_recommendations": 0})
    rows = []
    for group, subset in merged.groupby("group"):
        rows.append({
            "group": group,
            "employee_count": int(len(subset)),
            "mean_utilization": float(subset["utilization"].mean()),
            "mean_burnout_risk": float(subset["burnout_risk_score"].mean()),
            "high_burnout_rate": float(subset["burnout_band"].isin(["high", "severe"]).mean()),
            "mean_learning_recommendations": float(subset["learning_recommendations"].mean()),
        })
    audit = pd.DataFrame(rows)
    for column in ["mean_utilization", "mean_burnout_risk", "high_burnout_rate", "mean_learning_recommendations"]:
        audit[f"{column}_gap_from_best"] = (audit[column].max() - audit[column]).round(4)
    return audit


def fairness_summary(audit: pd.DataFrame) -> dict[str, float]:
    return {
        "burnout_risk_group_gap": float(audit["mean_burnout_risk"].max() - audit["mean_burnout_risk"].min()),
        "high_burnout_rate_gap": float(audit["high_burnout_rate"].max() - audit["high_burnout_rate"].min()),
        "learning_access_gap": float(audit["mean_learning_recommendations"].max() - audit["mean_learning_recommendations"].min()),
    }
