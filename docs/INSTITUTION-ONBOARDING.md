# Institution Onboarding

Course Signal is deployed as an isolated, configured instance per institution. It does not pool course data across institutions.

## Minimum baseline

An institution supplies a term-by-term historical course extract and names a data owner. The source must map to the canonical records used by the core: course identifier, subject, course number, title, year, term, comparable-term key, and the institution-defined observed headcount.

The measurement must be labeled exactly as supplied—for example, completed grades or recorded enrollment. Missing and suppressed records are never converted to zero.

## Configuration and validation

1. Copy a configuration in `config/institutions/` and select either the `canonical_csv` adapter or an approved adapter.
2. Record the source, measurement definition, supported terms, default course, and whether a current-status connector is authorized.
3. Run `python3 validate_institution.py --institution <id>` before ingesting.
4. Run `python3 ingest.py --institution <id>` and `COURSE_SIGNAL_INSTITUTION=<id> python3 audit_data.py`.

## Governance checklist

- Named registrar/planning owner and intended decision workflow.
- Approved refresh cadence and source retention rules.
- Definition of headcount and treatment of withdrawals, cross-listings, renames, and suppressed values.
- Explicit authorization for optional registration, capacity, waitlist, room, or staffing connectors.
- Human review remains required; this tool does not recommend or enact schedule changes.
