"""Process aggregate events only; no visitor identifiers are accepted."""
from __future__ import annotations
import pandas as pd
ALLOWED = {'PAGE_VIEW','PROJECT_VIEW','RESUME_VIEW','CONTACT_SUBMISSION','ARTICLE_VIEW'}
def validate_aggregates(frame: pd.DataFrame) -> pd.DataFrame:
    required = {'date', 'event_type', 'count'}
    if not required.issubset(frame.columns):
        raise ValueError('CSV must contain date, event_type and count columns.')
    if set(frame.columns) != required:
        raise ValueError('Only aggregate date, event_type and count fields are supported.')
    result = frame.copy()
    result['date'] = pd.to_datetime(result['date'], errors='raise', utc=True).dt.date
    result['count'] = pd.to_numeric(result['count'], errors='raise')
    if result['count'].isna().any() or (result['count'] < 0).any() or (result['count'] % 1 != 0).any():
        raise ValueError('Counts must be non-negative whole numbers.')
    if not result['event_type'].isin(ALLOWED).all():
        raise ValueError('Unknown event type.')
    return result

def summarize(frame: pd.DataFrame) -> pd.DataFrame:
    data = validate_aggregates(frame)
    return data.groupby(['date','event_type'], as_index=False)['count'].sum().sort_values('date')

def total_by_type(frame: pd.DataFrame) -> pd.Series:
    return validate_aggregates(frame).groupby('event_type')['count'].sum().sort_values(ascending=False)
