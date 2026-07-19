# Data Dictionary

## Dashboard fields

| Field | Meaning | Source / calculation | Do not interpret as |
| --- | --- | --- | --- |
| Completed-grade headcount | Total students recorded as receiving a final grade for a course and term | Sum of public GPA dataset `Students` values for included CS course rows | Initial enrollment, seats filled, capacity, or direct demand |
| Comparable term | The same calendar term across years, such as Fall-to-Fall | User-selected term filter | A full-year total |
| Next comparable estimate | Rounded prediction for the next year’s selected term | Best rolling-backtest performer among linear trend, 3-term average, and last-value baseline | A promise or staffing recommendation |
| Typical historic absolute error | Mean absolute error across rolling historic holdouts for the selected method | Absolute differences between prior predictions and observed values | A confidence guarantee |
| Latest historical backtest | Most recent prior target predicted without using its observed value | Train-before-target evaluation | The current forecast’s eventual error |
| Current section status | Published categorical status, if a reviewed snapshot is loaded | Cached Course Explorer XML-derived observation with timestamp | Numeric fill rate or waitlist count |

## Availability rules

A course needs at least five usable records for the selected comparable term before the dashboard displays a numeric estimate. Missing or redacted data are not replaced with zero.

## Source provenance

The local `ingestion_run` table records source URL, SHA-256 hash, ingestion time, aggregate row count, and skipped-row count. This lets the team identify exactly which historical source file produced a demo result.

