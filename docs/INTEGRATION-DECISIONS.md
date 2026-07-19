# Integration Decisions and Known Risks

## Course Explorer live-status integration

**Decision:** The dashboard consumes a deliberately cached snapshot, never a continuously polled feed.

**Why:** The official Explorer documentation describes publicly accessible schedule data and per-section live status such as open/closed. Its endpoint behavior is brittle in automated environments, and a live call during a judge demo creates an unnecessary failure point.

**Evidence observed during development (2026-07-17):** A direct request to the documented course cascade path completed with an empty response body. The importer now refuses to save empty content, preserves successful raw XML only after parsing, and leaves the dashboard in an explicit “snapshot unavailable” state when no verified snapshot exists.

## Demo rule

Show real cached status only when a team member has verified the raw response and visible timestamp. Otherwise, omit the panel from your spoken demo or call it out as the next integration step. Do not use the included example JSON as though it were live data.

## Institutional implication

This is useful evidence for the future product story: a production integration needs a supported data-access arrangement, monitoring, test fixtures, and agreed refresh behavior—not just a scrape loop. The hackathon prototype proves the historical decision-support wedge without depending on that future integration.
