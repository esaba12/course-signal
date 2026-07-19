# Two-Minute Visual QA

Run this in a normal browser on the laptop that will present the demo.

## Desktop check

1. Open `http://localhost:8000` after running the server.
2. Confirm the title reads “UIUC CS Course Signal” and the orange emphasis is readable.
3. Choose CS 225 and Fall. Confirm chart, estimate, and latest backtest are visible without scrolling the first screen on a typical laptop.
4. Change to Spring and then to CS 173. Confirm no stale course/title/chart data remains.
5. Click “How to read this” and confirm the explanatory panel can be closed.
6. Confirm the status panel either shows a real timestamped snapshot or an explicit unavailable message—never fake sample data.

## Small-screen check

1. Narrow the browser to roughly phone width.
2. Confirm controls wrap, cards stack, and no text is cut off.
3. Confirm dropdowns and “How to read this” remain usable.

## Accessibility and clarity check

- Zoom to 200%; headings, cards, and chart labels stay usable.
- Navigate with Tab: course selector, term selector, and method button must all receive focus.
- Read every important number without relying on color alone.
- Ask a partner: “What does this estimate measure?” The correct answer is “students receiving a final grade in a comparable future term,” not seats or capacity.

## Capture for the submission

Take one clean desktop screenshot of the CS 225 Fall screen. It should show the chart, estimate, backtest, and guardrail sentence. Do not screenshot an unavailable status panel unless you are explicitly discussing the integration limitation.

