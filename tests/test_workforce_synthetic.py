from workforceintel.synthetic import SyntheticWorkforceConfig, generate_synthetic_workforce


def test_synthetic_workforce_is_reproducible():
    config = SyntheticWorkforceConfig(employees=36, projects=6, seed=7)
    first = generate_synthetic_workforce(config)
    second = generate_synthetic_workforce(config)
    assert first["employees"].equals(second["employees"])
    assert first["projects"].equals(second["projects"])
    assert first["demand"].equals(second["demand"])


def test_synthetic_workforce_has_required_tables():
    data = generate_synthetic_workforce(SyntheticWorkforceConfig(employees=36, projects=6, seed=3))
    assert {"employees", "skills", "projects", "demand", "learning", "contractors"}.issubset(data)
    assert len(data["employees"]) == 36
    assert len(data["projects"]) == 6
    assert not data["skills"].empty
