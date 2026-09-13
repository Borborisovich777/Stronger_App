# Reporting renovation implementation status

Updated: 3 September 2026

This file tracks execution of `REPORTING_RENOVATION_PLAN.md`. The audit remains the design specification; this status file records implementation progress without rewriting the original evidence.

## Phase 0 — metric contract and tests: complete

- Added one read-only `reportMetrics` derivation for live, completed, comparison, and rolling-baseline periods.
- Defined sessions, days trained, working sets, drops, reps, external-load volume, duration coverage, effort coverage, primary-category coverage, exercise detail, highlights, and data-quality outputs.
- Kept working sets and drop continuations separate. Valid drops contribute reps and external-load volume but cannot create strength records.
- Added deterministic date, rename, custom-exercise, bodyweight, corrupt-drop, duration, sparse-history, active-workout, adoption-window, decimal-load, and overflow coverage.
- Added 19 focused report-metric tests and connected the shared contract to the existing overall-progress compatibility layer.

Goal-aware ordering and deleted-routine next-action behavior remain intentionally assigned to Phases 2–3; they do not change Phase 0 metric facts.

## Phase 1 — unified Live progress: complete

- Removed the competing full-week summary from the Progress screen.
- Kept live week and month comparisons matched to elapsed calendar days and named both date ranges.
- Kept the weekly goal and next-routine action.
- Added a compact narrative training-dose section with working sets, reps, drops, external-load volume, tracked duration, and primary-category coverage.
- Added explicit copy when reportable work in an active workout is excluded.
- Added bodyweight, drop-volume, Unclassified, and missing-duration explanations only when relevant.
- Limited exercise choices and records to the selected Week, Month, or All-time period.
- Preserved the existing palette and the selected plain-language, phone-first hierarchy.

## Next planned milestone

Phase 2: add the Live/Reports switch, completed week and month navigation, session drill-down, monthly calendar, full-period comparison, and visible personal baselines.
