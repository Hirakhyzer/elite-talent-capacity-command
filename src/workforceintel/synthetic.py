"""Synthetic workforce dataset for safe talent-intelligence experiments.

All employees, projects, skills, salaries, contractors, and workloads are fictional.
The generator supports portfolio demonstrations without exposing real HR data.
"""

from __future__ import annotations

from dataclasses import dataclass
import numpy as np
import pandas as pd

SKILLS = ["python", "react", "cloud", "data_engineering", "ml", "cybersecurity", "product", "ux", "qa", "devops", "finance", "salesforce"]
ROLES = ["engineer", "designer", "data_scientist", "security_analyst", "product_manager", "qa_engineer", "consultant"]
GROUPS = ["A", "B", "C"]

@dataclass(frozen=True)
class SyntheticWorkforceConfig:
    employees: int = 90
    projects: int = 18
    seed: int = 42

    def __post_init__(self) -> None:
        if self.employees < 30:
            raise ValueError("Use at least 30 synthetic employees for talent analytics.")
        if self.projects < 5:
            raise ValueError("Use at least 5 synthetic projects.")


def generate_synthetic_workforce(config: SyntheticWorkforceConfig | None = None) -> dict[str, pd.DataFrame]:
    cfg = config or SyntheticWorkforceConfig()
    rng = np.random.default_rng(cfg.seed)
    employees = _employees(cfg, rng)
    skills = _employee_skills(employees, rng)
    projects = _projects(cfg, rng)
    demand = _project_skill_demand(projects, rng)
    learning = _learning_catalog(rng)
    contractors = _contractors(rng)
    return {"employees": employees, "skills": skills, "projects": projects, "demand": demand, "learning": learning, "contractors": contractors}


def _employees(cfg: SyntheticWorkforceConfig, rng: np.random.Generator) -> pd.DataFrame:
    rows = []
    for i in range(cfg.employees):
        role = str(rng.choice(ROLES, p=[.32,.10,.15,.12,.12,.10,.09]))
        group = GROUPS[i % len(GROUPS)]
        base_capacity = float(np.clip(rng.normal(37, 5), 22, 45))
        current_load = float(np.clip(rng.normal(34, 7), 12, 55))
        engagement = float(np.clip(rng.normal(.68, .14), .20, .98))
        tenure = int(rng.integers(1, 84))
        rows.append({
            "employee_id": f"E-{i+1:04d}", "role": role, "group": group,
            "capacity_hours": round(base_capacity, 1), "allocated_hours": round(current_load, 1),
            "engagement": round(engagement, 3), "tenure_months": tenure,
            "attrition_signal": round(float(np.clip(.18 + .35*(current_load/base_capacity > 1.05) + .20*(engagement < .55) + rng.normal(0,.06),0,1)),3),
            "location": str(rng.choice(["onsite", "hybrid", "remote"], p=[.25,.45,.30]))
        })
    return pd.DataFrame(rows)


def _employee_skills(employees: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    rows = []
    role_bias = {
        "engineer": ["python", "react", "cloud", "devops"],
        "designer": ["ux", "product"],
        "data_scientist": ["python", "ml", "data_engineering"],
        "security_analyst": ["cybersecurity", "cloud", "devops"],
        "product_manager": ["product", "ux", "finance"],
        "qa_engineer": ["qa", "python", "devops"],
        "consultant": ["salesforce", "finance", "product"],
    }
    for emp in employees.itertuples(index=False):
        preferred = set(role_bias.get(emp.role, []))
        for skill in SKILLS:
            probability = .58 if skill in preferred else .18
            if rng.random() < probability:
                level = int(np.clip(rng.normal(3.3 if skill in preferred else 2.1, .9), 1, 5))
                rows.append({"employee_id": emp.employee_id, "skill": skill, "level": level, "target_level": min(5, level + int(rng.random() < .35))})
    return pd.DataFrame(rows)


def _projects(cfg: SyntheticWorkforceConfig, rng: np.random.Generator) -> pd.DataFrame:
    rows = []
    for i in range(cfg.projects):
        priority = str(rng.choice(["low", "medium", "high", "critical"], p=[.12,.36,.34,.18]))
        rows.append({
            "project_id": f"P-{i+1:03d}", "project_name": f"Strategic Initiative {i+1:02d}",
            "priority": priority, "deadline_weeks": int(rng.integers(3, 24)),
            "business_value": int(rng.integers(40, 100)), "status": str(rng.choice(["planned", "active", "at_risk"], p=[.35,.45,.20]))
        })
    return pd.DataFrame(rows)


def _project_skill_demand(projects: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    rows = []
    for p in projects.itertuples(index=False):
        needed = rng.choice(SKILLS, size=int(rng.integers(3, 7)), replace=False)
        for skill in needed:
            rows.append({"project_id": p.project_id, "skill": str(skill), "required_level": int(rng.integers(2, 6)), "required_people": int(rng.integers(1, 5))})
    return pd.DataFrame(rows)


def _learning_catalog(rng: np.random.Generator) -> pd.DataFrame:
    rows = []
    for skill in SKILLS:
        for level in [2, 3, 4, 5]:
            rows.append({"course_id": f"L-{skill[:3].upper()}-{level}", "skill": skill, "target_level": level, "hours": int(rng.integers(6, 28)), "cost": int(rng.integers(150, 1400)), "mode": str(rng.choice(["self-paced", "mentor", "bootcamp"]))})
    return pd.DataFrame(rows)


def _contractors(rng: np.random.Generator) -> pd.DataFrame:
    rows = []
    for i, skill in enumerate(SKILLS):
        for vendor in range(2):
            rows.append({"contractor_id": f"C-{i:02d}-{vendor}", "skill": skill, "level": int(rng.integers(3, 6)), "weekly_rate": int(rng.integers(1800, 6800)), "availability_weeks": int(rng.integers(1, 10)), "quality_score": round(float(rng.uniform(.62, .96)), 3)})
    return pd.DataFrame(rows)
