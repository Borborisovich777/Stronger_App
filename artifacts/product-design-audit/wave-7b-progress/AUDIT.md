# Wave 7B Progress audit

Audit date: 2026-08-29
Viewport: 390 × 844, in-app browser
Scope: Progress tab only

## Evidence captured before implementation

1. `01-current-empty-progress.png` — empty Progress state
2. `02-current-populated-progress.png` — populated Overall progress
3. `03-current-exercise-detail.png` — existing exercise-specific trend

## Findings

### 1. Empty Progress — needs attention

The Overall card and the page-level exercise area both explained that no data existed. The repeated empty state added length without giving the user another action. There was also no way to understand what “overall” meant by day, week, or month.

### 2. Populated Overall progress — needs attention

All-time workouts, sets, and volume were clear, but the large recent-workout chart occupied most of the first screen. It showed when volume happened, not which exercises contributed to it. Its comparison also mixed workouts of different sizes and exercise combinations.

### 3. Exercise detail — healthy and preserved

Best weight, estimated 1RM, completed sets, and the per-exercise trend were already kept within one selected exercise. That is the correct boundary for strength records and should not be merged into an overall score.

## Implemented design response

- Keep one Overall progress card.
- Add Day, Week, Month, and All filters.
- Compare only matching elapsed periods, with visible date ranges.
- Replace the large workout-volume chart with a ranked Volume by exercise list.
- Show current and earlier values together using concise “Was …” language.
- Keep the first four exercise rows visible and expand the rest on demand.
- Preserve Weekly Review and Strength by exercise as separate sections.

## Measurement and safety

Only saved, completed sets with positive reps are counted. Volume is external load multiplied by reps. Bodyweight work with zero external load still counts as a set but adds zero volume. All values are read-only derivations; the implementation does not write to History or alter existing workout data.

## Accessibility evidence and limits

The new period selector uses a labelled button group, exposes selection with `aria-pressed`, and preserves the product's 44-pixel touch target. Date ranges and earlier values are visible text rather than color-only signals. Screenshot review alone cannot prove complete keyboard, screen-reader, or WCAG conformance, so those claims are not made here.

## After evidence

Implementation screenshots are added after browser verification as `04-implemented-week-progress.png` and `05-implemented-all-exercises.png`.
