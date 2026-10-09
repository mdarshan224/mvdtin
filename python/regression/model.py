"""A clearly labeled numerical example, independent of the Java service."""
from __future__ import annotations
import numpy as np

def fit_linear(x, y):
    x, y = np.asarray(x, dtype=float), np.asarray(y, dtype=float)
    if x.ndim != 1 or y.ndim != 1 or len(x) != len(y) or len(x) < 2:
        raise ValueError('Use equal-length vectors with at least two points.')
    if not np.isfinite(x).all() or not np.isfinite(y).all() or np.ptp(x) == 0:
        raise ValueError('Use finite values with varying x coordinates.')
    slope, intercept = np.polyfit(x, y, 1)
    predicted = slope*x+intercept
    residual = float(np.sum((y-predicted)**2))
    total = float(np.sum((y-y.mean())**2))
    return {'slope':float(slope),'intercept':float(intercept),'r_squared':1-residual/total if total else None}
