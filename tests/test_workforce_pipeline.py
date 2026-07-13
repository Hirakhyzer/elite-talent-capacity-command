from workforceintel.analysis import burnout_risk, hire_or_contractor_options, skill_gap_analysis
from workforceintel.fairness import group_fairness_audit
from workforceintel.learning import recommend_learning_paths
from workforceintel.synthetic import SyntheticWorkforceConfig, generate_synthetic_workforce


def test_workforce_pipeline_outputs_decision_tables():
    data = generate_synthetic_workforce(SyntheticWorkforceConfig(employees=42, projects=7, seed=11))
    gaps = skill_gap_analysis(data["projects"], data["demand"], data["skills"])
    burnout = burnout_risk(data["employees"])
    paths = recommend_learning_paths(gaps, data["skills"], data["learning"])
    options = hire_or_contractor_options(gaps, data["contractors"])
    fairness = group_fairness_audit(data["employees"], burnout, paths)
    assert not gaps.empty
    assert burnout["burnout_risk_score"].between(0, 100).all()
    assert set(fairness["group"]) == {"A", "B", "C"}
    assert "recommended_action" in options.columns or options.empty
