# Compact weekly training calendar

Research/design brief · 22 September 2026 · Scope: this update to Stronger’s personal workout logger.

## Product read

The user wants to see weekly coverage of legs, arms, back, chest and cardio without enlarging the main Progress screen. Their screenshot and explicit placement under the current goal bar are the strongest evidence for this change. A compact current-week calendar with automatic completion ticks answers what happened and what remains. Hevy’s official statistics show that recent training and muscle coverage are established tracker patterns, but do not prove this design will work for Stronger. Community requests for weekly coverage and confusion about indirect muscle counts are useful directional signals, with unknown prevalence. Default to a clear record of completed training; assigning future workouts to days remains a separate question pending the user’s clarification.

## Evidence and priority

| Priority / type | User goal and friction | Evidence / confidence | Product move |
| --- | --- | --- | --- |
| 1 · Missing feature | On Progress, see whether each requested category happened this week; the existing workout count cannot answer this. | Direct user request and screenshot; high confidence for this user, wider frequency unknown. | Show five weekly goals, each fulfilled by at least one qualifying workout. |
| 2 · UI density | Read coverage quickly without another large card pushing existing progress away. | User explicitly says “NOT BIG”; existing [compact interface plan](2026-09-13-compact-workout-interface.md); high confidence. | Put one small seven-day row and five compact category indicators inside the existing summary. |
| 3 · Trust in counting | Know why a category is ticked; planned/skipped exercises or inferred secondary muscles could mislead. | Direct history of skipped exercises; [community counting confusion](https://www.reddit.com/r/Hevy/comments/1ukvwoa/muscle_distribution_graph/); medium confidence, isolated anecdotes. | Use recorded primary category and completed work only; explain the rule in one short line. |

## Default design and behavior

- Insert **This week** immediately under the weekly goal bar, before Getting stronger. Retain Stronger’s cream/charcoal/lime palette and existing typography. No new top-level card, oversized heading, chart or new navigation destination.
- Show seven equal columns, Monday–Sunday, with short weekday labels and dates. Outline today; show a check for a day with qualifying finished training. Use labels as well as color. Future days stay empty.
- Below, show **Legs · Arms · Back · Chest · Cardio**, each with a pending indicator or check; goal is **once each this week**. One workout may satisfy multiple categories. This is the user’s tracking goal, not a claim about sufficient training volume or a prescribed program.
- Derive results from finished History workouts with actual completed exercise work. An exercise merely present in a template/session, skipped work, an unfinished workout, or a future-dated record earns no credit. Use explicit primary exercise categories; do not infer arms from a chest press or infer cardio from every timed exercise.
- Keep local Monday–Sunday week boundaries consistent with Progress. History deletion and import recalculate indicators automatically. No extra stored completion state.
- Current-week wording stays explicit if shown alongside Month/All time statistics. Manual assignment of categories/templates to future days is unresolved; do not represent an unplanned day as a missed scheduled workout.

## Source map and opportunities

Fresh public scan: [Hevy official statistics](https://help.hevyapp.com/hc/en-us/articles/35702030346903-Hevy-Statistics-Explained-Track-Your-Training-Progress-and-Muscle-Growth) documents recent training, muscle-group set counts and completed-workout calendars. [Weekly/cycle coverage request](https://www.reddit.com/r/Hevy/comments/1s2gxoh/feature_request_total_sets_and_muscle_groups_per/) adds a small, self-selected signal for a weekly view; the counting discussion above adds a clarity risk. Strong help results did not add specific weekly-category evidence. No product analytics, support archive or representative user study was available; no saved Product Design context existed. No billing, onboarding, API or reliability issue is established by this scan.

**This week:** compact automatic calendar and honest counting. **Later, if requested:** configurable weekly goals and week navigation. **Needs clarification/research:** actual future-day scheduling, mixed/custom exercise classification and whether users expect primary versus secondary muscle credit.

## Acceptance criteria and boundaries

Verify empty, partial and complete weeks; multiple categories/workouts per day; skipped and unfinished work; local week/year/DST boundaries; import and deletion; no false cardio/secondary-muscle credit. Check 320–430px mobile widths, both themes, text resizing and accessible date/status labels without horizontal overflow. Preserve template starts/weights/order, progression, History actions, logging, rest timers, exports and existing Progress calculations. No reminders, generated programs, calendar sync, exercise prescriptions or unrelated visual redesign in this update.
