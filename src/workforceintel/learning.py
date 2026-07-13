"""Learning-path recommendations for skill-gap mitigation."""

from __future__ import annotations

import pandas as pd


def recommend_learning_paths(gaps: pd.DataFrame, skills: pd.DataFrame, learning_catalog: pd.DataFrame, max_rows: int = 60) -> pd.DataFrame:
    """Recommend courses for employees near high-priority skill gaps.

    Recommendations are planning artifacts and require manager/employee review.
    """
    rows = []
    gap_focus = gaps.loc[gaps["shortage"] > 0].head(25)
    for gap in gap_focus.itertuples(index=False):
        nearby = skills.loc[(skills["skill"] == gap.skill) & (skills["level"] < gap.required_level)].copy()
        nearby["distance"] = gap.required_level - nearby["level"]
        for emp in nearby.sort_values("distance").head(3).itertuples(index=False):
            courses = learning_catalog.loc[(learning_catalog["skill"] == gap.skill) & (learning_catalog["target_level"] >= gap.required_level)].sort_values(["hours", "cost"])
            if courses.empty:
                continue
            course = courses.iloc[0]
            rows.append({
                "employee_id": emp.employee_id,
                "project_id": gap.project_id,
                "skill": gap.skill,
                "current_level": int(emp.level),
                "target_level": int(gap.required_level),
                "course_id": course["course_id"],
                "learning_hours": int(course["hours"]),
                "course_cost": int(course["cost"]),
                "expected_gap_reduction": round(1 / max(int(gap.shortage), 1), 3),
                "recommendation_boundary": "recommendation only; manager and employee development review required",
            })
    return pd.DataFrame(rows).head(max_rows)


def learning_roi_summary(paths: pd.DataFrame) -> dict[str, float | int]:
    if paths.empty:
        return {"learning_recommendation_count": 0, "total_learning_hours": 0, "total_learning_cost": 0, "mean_expected_gap_reduction": 0.0}
    return {
        "learning_recommendation_count": int(len(paths)),
        "total_learning_hours": int(paths["learning_hours"].sum()),
        "total_learning_cost": int(paths["course_cost"].sum()),
        "mean_expected_gap_reduction": float(paths["expected_gap_reduction"].mean()),
    }
