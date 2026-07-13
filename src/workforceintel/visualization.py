"""Figures for synthetic workforce intelligence runs."""

from __future__ import annotations

from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd


def _path(path: str | Path) -> Path:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    return destination


def plot_gap_risk(gaps: pd.DataFrame, path: str | Path) -> None:
    top = gaps.head(12).sort_values("gap_risk_score")
    labels = top["project_id"] + "\n" + top["skill"]
    fig, ax = plt.subplots(figsize=(9, 5.5))
    ax.barh(labels, top["gap_risk_score"])
    ax.set(xlabel="Gap risk score", ylabel="Project / skill", title="Highest synthetic skill gaps")
    ax.grid(True, axis="x", alpha=.25)
    fig.tight_layout(); fig.savefig(_path(path), dpi=250); plt.close(fig)


def plot_burnout_distribution(burnout: pd.DataFrame, path: str | Path) -> None:
    order = ["low", "watch", "high", "severe"]
    counts = burnout["burnout_band"].value_counts().reindex(order, fill_value=0)
    fig, ax = plt.subplots(figsize=(7, 4.8))
    ax.bar(counts.index, counts.values)
    ax.set(xlabel="Burnout band", ylabel="Employee count", title="Synthetic burnout-risk distribution")
    ax.grid(True, axis="y", alpha=.25)
    fig.tight_layout(); fig.savefig(_path(path), dpi=250); plt.close(fig)


def plot_learning_paths(paths: pd.DataFrame, path: str | Path) -> None:
    counts = paths["skill"].value_counts().sort_values(ascending=True) if not paths.empty else pd.Series(dtype=int)
    fig, ax = plt.subplots(figsize=(8, 5))
    if counts.empty:
        ax.text(.5, .5, "No learning recommendations", ha="center", va="center")
    else:
        ax.barh(counts.index, counts.values)
    ax.set(xlabel="Recommendation count", ylabel="Skill", title="Learning path recommendations by skill")
    ax.grid(True, axis="x", alpha=.25)
    fig.tight_layout(); fig.savefig(_path(path), dpi=250); plt.close(fig)


def plot_fairness_audit(audit: pd.DataFrame, path: str | Path) -> None:
    fig, ax = plt.subplots(figsize=(8, 4.8))
    ax.plot(audit["group"], audit["mean_burnout_risk"], marker="o", label="Burnout risk")
    ax.plot(audit["group"], audit["mean_utilization"] * 100, marker="o", label="Utilization x100")
    ax.set(xlabel="Synthetic group", ylabel="Score", title="Workforce fairness audit signals")
    ax.grid(True, alpha=.25); ax.legend()
    fig.tight_layout(); fig.savefig(_path(path), dpi=250); plt.close(fig)


def plot_staffing_alternatives(options: pd.DataFrame, path: str | Path) -> None:
    counts = options["recommended_action"].value_counts().sort_values(ascending=True) if not options.empty else pd.Series(dtype=int)
    fig, ax = plt.subplots(figsize=(7, 4.8))
    if counts.empty:
        ax.text(.5, .5, "No staffing alternatives required", ha="center", va="center")
    else:
        ax.barh(counts.index, counts.values)
    ax.set(xlabel="Count", ylabel="Recommended action", title="Hire / upskill / contractor alternatives")
    ax.grid(True, axis="x", alpha=.25)
    fig.tight_layout(); fig.savefig(_path(path), dpi=250); plt.close(fig)
