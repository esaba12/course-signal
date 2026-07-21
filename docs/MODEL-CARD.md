# Course-Term Planning Signal Model Card v1

## Purpose

Provide an understandable next-like-term estimate for a registrar or course-planning conversation. The estimate is a signal for review, not an automated action.

## Target

The target is the configured institution’s aggregated observed metric for a course and comparable academic term. Each deployment labels the metric exactly as its source defines it; UIUC’s demo metric is completed-grade headcount.

## Candidate methods

- Last comparable-term value.
- Three-comparable-term moving average.
- Linear trend across comparable-term years.

## Selection procedure

For each candidate, the project repeatedly hides a historic comparable term, fits only on earlier terms, predicts the hidden term, and calculates absolute error. The candidate with the lowest mean absolute error becomes the course/term’s displayed method.

## Eligibility

At least five usable comparable historical terms are required. Otherwise, the dashboard withholds the numerical estimate.

## Known limitations

- The core cannot see any capacity, waitlist, room, staffing, policy, or preference context that the configured source does not provide.
- A past model error is descriptive, not a probability guarantee.
- Course renames, cross-listings, structural changes, and institution-specific calendar rules can create misleading trend breaks.
- Small, suppressed, or missing source records may reduce usable history.

## Appropriate use

Use the output to ask: “Should a human look more closely at this course’s planning context?” Do not use it alone to add/cut sections, assign instructors, set budgets, or make student-facing decisions.
