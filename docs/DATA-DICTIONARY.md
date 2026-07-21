# Data Dictionary

## Dashboard fields

| Field | Meaning | Source / calculation | Do not interpret as |
| --- | --- | --- | --- |
| Observed course-term metric | Institution-defined aggregate for a course and academic term | Configured source adapter and measurement definition; UIUC demo uses public GPA `Students` values | Capacity, waitlist size, or direct demand unless the source explicitly measures it |
| Comparable term | The same calendar term across years, such as Fall-to-Fall | User-selected term filter | A full-year total |
| Next comparable estimate | Rounded prediction for the next year’s selected term | Best rolling-backtest performer among linear trend, 3-term average, and last-value baseline | A promise or staffing recommendation |
| Typical historic absolute error | Mean absolute error across rolling historic holdouts for the selected method | Absolute differences between prior predictions and observed values | A confidence guarantee |
| Latest historical backtest | Most recent prior target predicted without using its observed value | Train-before-target evaluation | The current forecast’s eventual error |
| Current status | Published categorical status, if an authorized reviewed snapshot is loaded | Optional institution-specific connector with timestamp | Numeric fill rate or waitlist count unless explicitly supplied |

## Availability rules

A course needs at least five usable records for the selected comparable term before the dashboard displays a numeric estimate. Missing or redacted data are not replaced with zero.

## Source provenance

The local `ingestion_run` table records source URL, SHA-256 hash, ingestion time, aggregate row count, and skipped-row count. This lets the team identify exactly which historical source file produced a demo result.
