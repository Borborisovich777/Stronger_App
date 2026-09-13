# Wave 2A — Optional Effort Context

Wave 2A implements only the first feature from the R&D roadmap's Guide phase: optional RPE or RIR notes on completed sets. Explainable next-set suggestions and equipment substitutions remain out of scope.

## Why this feature comes first

Weight and reps show what happened, but not how difficult the set felt. A small subjective note can add useful context without allowing the app to control training. Capturing that context comes before recommendations so the input and its friction can be evaluated independently.

## User control

- Effort tracking is off by default.
- Settings offers Off, RPE, or RIR.
- RPE uses 6–10 in half steps; RPE 10 means maximal effort.
- RIR uses 0–10 whole reps; RIR 0 means no reps were left.
- The selector appears only after a set is completed and remains optional.
- Turning the setting off hides inputs but preserves recorded entries.

Each set stores its own scale with its value. A historical `RPE 8.5` therefore stays RPE even if the current setting changes to RIR. If a completed set is marked incomplete, its effort entry is removed with its completion timestamp. Duplicating a workout does not prefill subjective effort.

## Data contract and safety

- Storage format remains version 1.
- `settings.effortScale` is optional and accepts `off`, `rpe`, or `rir`.
- `set.effort` is an optional `{ scale, value }` object.
- Older backups without either field remain valid.
- Older code preserves both additive fields during version-1 normalization.
- Invalid scales or out-of-range values reject the selected backup as a whole.
- The existing paused-workout mutation guard also protects effort edits.

## Deliberate exclusions

- No automatic load, rep, or routine changes.
- No readiness, fatigue, recovery, injury, or medical interpretation.
- No score aggregation in Progress.
- No next-set recommendation in this wave.
- No cloud account or external data processing.

## Verification

The effort helper tests cover available values, inline explanations, and scale-preserving labels. Storage fixtures cover additive version-1 normalization and whole-backup rejection for invalid values. The full Wave 0 and Wave 1 suites must remain green before this wave can be checkpointed.
