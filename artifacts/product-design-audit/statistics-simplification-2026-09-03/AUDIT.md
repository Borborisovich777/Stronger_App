# Statistics simplification audit

Date: 2026-09-03
Viewport: 390 x 844 (mobile)
Scope: the existing Progress tab, treated as the app's Statistics experience.

## Evidence

- `01-progress-overview.png` — current top of Progress at the target viewport.
- `02-progress-lower.png` — current Weekly review section at the target viewport.
- `01-current-progress.png` was rejected because a full-page capture duplicated fixed navigation and introduced blank space; it is not used as evidence.

## What works

- The period selector has appropriately large touch targets.
- The current cream, charcoal, lime, and red palette is consistent with the rest of Stronger.
- Per-exercise progress and recent trends are the right conceptual boundary for answering whether a lift is improving.
- Date ranges make the comparison period explicit.

## Main comprehension problems

1. Too many numbers receive the same visual importance, so the screen has no obvious answer to “Am I getting stronger?”
2. Overall progress and Weekly review overlap in time and intent, forcing the user to reconcile two summaries.
3. Workouts, completed sets, and total volume mainly describe activity, not improvement.
4. Repeated zero values, previous-zero values, and “No change” labels create noise when history is sparse or empty.
5. Weekly target and next-routine planning are mixed into performance statistics.
6. Useful exercise-level signals are pushed below several summary cards.
7. “Estimated 1RM” and “total volume” need explanation and are too technical for the primary view.
8. Nested cards and long explanatory sentences increase scanning effort on a narrow phone.

## Accessibility and evidence limits

- A screenshot review can assess hierarchy, density, apparent contrast, and visible target sizing, but cannot verify screen-reader semantics, keyboard behavior, or computed WCAG contrast.
- Any redesign should retain 44 px minimum touch targets and 16 px editable fields while using a clearer, smaller hierarchy for headings and metadata.

## Redesign principles

- Make one plain-language answer dominant and demote supporting numbers.
- Put strength improvement ahead of workload accounting.
- Replace technical labels with familiar language; keep advanced metrics behind an optional detail view.
- Use progressive disclosure and one level of grouping rather than cards inside cards.
- Suppress comparisons until enough history exists.
- Keep routine planning visually separate from progress evidence.
- Preserve the existing palette, system font family, fixed header, and fixed bottom navigation.
