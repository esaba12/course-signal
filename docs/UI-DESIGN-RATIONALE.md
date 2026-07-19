# UI Design Rationale

Updated 2026-07-19. This redesign follows the project’s [data dictionary](DATA-DICTIONARY.md), [model card](MODEL-CARD.md), and [integration decisions](INTEGRATION-DECISIONS.md).

## Product decisions reflected in the UI

| Design choice | Why it is here |
| --- | --- |
| Data-status strip at the top | The dashboard makes system state visible: historical source readiness and whether a verified current-status snapshot exists. It never makes a missing live overlay look current. |
| Three separate summary cards | Observed change, forecast, and backtest are intentionally separated so an estimate is never confused with a fact or validation result. |
| Status panel labels “Cached” or “Unavailable” | The integration document requires a timestamped, verified snapshot. No synthetic status values are shown. |
| Chart summary and data table | The chart is paired with a plain-text summary and a comparable-term table, so the main information does not depend on visual bars alone. |
| Guardrail panel and method dialog | The model card’s scope is visible in the experience: this is decision support, not capacity, waitlist, staffing, or automated-action advice. |

## Research applied

- W3C guidance says complex visual content needs an equivalent description; the dashboard adds a dynamic text summary and table to the chart. [W3C guidance](https://www.w3.org/TR/WCAG10/)
- W3C’s non-text contrast guidance says meaningful graphical objects need sufficient contrast or an alternate form of the information. The chart uses an orange latest-term bar plus text labels, title tooltips, and a table rather than relying on color alone. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast?level=0)
- The U.S. Web Design System is a useful reference for accessible, mobile-friendly component structure; this design uses visible focus states, plain status language, responsive stacking, and text-plus-color status. [USWDS](https://designsystem.digital.gov/)

## What not to add without a product decision

- Numeric capacity, fill-rate, or waitlist visualizations.
- “Recommend action” language such as cut, expand, or staff this course.
- An unverified status value or a continuously-refreshing claim.
- A confidence score that appears more certain than historic error evidence supports.
