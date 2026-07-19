# Model Card — Completed-Grade Headcount Estimate v1

## Purpose

Provide an understandable next-like-term estimate for an advisor/course-planning conversation. The estimate is a signal for review, not an automated action.

## Target

The target is the public dataset’s aggregated `Students` count for a selected course and comparable calendar term. In plain language: students receiving a final grade. It excludes withdrawals and does not measure initial enrollment, capacity, waitlist demand, or individual intent.

## Candidate methods

- Last comparable-term value.
- Three-comparable-term moving average.
- Linear trend across comparable-term years.

## Selection procedure

For each candidate, the project repeatedly hides a historic comparable term, fits only on earlier terms, predicts the hidden term, and calculates absolute error. The candidate with the lowest mean absolute error becomes the course/term’s displayed method. The app reports the method, number of usable terms, and typical historic absolute error.

## Eligibility

At least five usable comparable historical terms are required. Otherwise, the dashboard withholds the numerical estimate.

## Known limitations

- It cannot see capacity, waitlists, rooms, staffing, degree requirements, policy changes, cross-listings, or changing student preferences.
- A past model error is descriptive, not a probability guarantee.
- Course renames or structural changes can create misleading trend breaks.
- Small or redacted source records may reduce usable history.

## Appropriate use

Use the output to ask: “Should a human look more closely at this course’s planning context?” Do not use it alone to add/cut sections, assign instructors, set budgets, or make student-facing decisions.

