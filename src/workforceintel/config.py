"""Configuration and reproducibility helpers."""

from __future__ import annotations

from pathlib import Path
import random
from typing import Any

import numpy as np
import yaml


def load_config(path: str | Path) -> dict[str, Any]:
    with Path(path).open("r", encoding="utf-8") as handle:
        config = yaml.safe_load(handle)
    if not isinstance(config, dict):
        raise ValueError("Configuration must be a YAML mapping.")
    return config


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)


def ensure_output_dirs(base: str | Path = "outputs") -> dict[str, Path]:
    root = Path(base)
    folders = {"root": root, "results": root / "results", "figures": root / "figures", "reports": root / "reports", "audit": root / "audit"}
    for folder in folders.values():
        folder.mkdir(parents=True, exist_ok=True)
    return folders
