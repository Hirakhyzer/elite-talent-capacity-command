# Workforce data boundary

This repository now has two layers: the existing browser dashboard and a Python synthetic workforce-intelligence lab.

The Python lab runs with fictional data only:

```bash
python scripts/run_synthetic_workforce_lab.py
```

Do not commit real employee, compensation, performance, HR, recruiting, health, contractor, or utilization data to GitHub.

Future authorized data should stay under:

```text
data/raw/
```

Required fields for any future adapter should be documented and reviewed before use: employee identifier, role, skill records, capacity, project demand, learning records, contractor options, and access permissions. Real workforce analytics require privacy, HR, legal, employee-relations, and fairness review.
