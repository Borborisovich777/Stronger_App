# Wave 6A — Read-only Next-set Preview

Wave 6A implements the smallest responsible slice of the roadmap's deterministic next-set concept. The feature is user-approved, evidence-visible, and unable to apply its own suggestion. Equipment substitutions, deload planning, readiness scores, and silent program changes remain out of scope.

## Why this feature comes next

Stronger now captures completed sets and optional effort context, so it can identify one narrow repeated-result pattern without inventing a general training algorithm. A read-only preview tests whether that evidence is useful before the product is given any set-writing or program-changing authority.

## Consent and deterministic rules

- **Settings → Next-set previews** is off by default and persists only the user's consent choice.
- The candidate is the first unfinished set in an active exercise.
- The candidate must have a positive planned weight and rep count.
- The immediately preceding completed set today must meet or exceed both candidate values.
- The latest saved History session with completed sets for the same stable exercise key must contain a set that meets or exceeds both values.
- The latest comparable session is authoritative. The rule cannot skip a newer miss to use an older success.
- When effort tracking is enabled, today's evidence set must have effort entered before a preview can appear.
- If an evidence set has effort recorded, RPE 9–10 or RIR 0–1 suppresses the preview. RPE 8.5 or RIR 2 is the allowed boundary. Missing historical effort stays unknown and is not described as easy.
- The displayed possibility is exactly one 2.5 kg increment in kg mode or one 5 lb increment in lb mode.
- The evidence and current unchanged plan are shown beside the possible load.

## Safety boundary

- No apply, accept, automatic fill, or workout-update action.
- The derived preview is never saved; only the off-by-default consent setting is stored and included in backups.
- No routine, program block, completed set, History entry, Progress value, or exercise identity is changed.
- No progressive overload schedule, rep-range inference, fatigue model, readiness score, deload, or medical interpretation.
- The copy explicitly says the rule cannot assess fatigue, pain, technique, or equipment.
- Manual editing of the existing next-set field remains the only way to act on the preview.

## Verification gate

Pure helper tests cover successful evidence, pre-completion silence, latest-session authority, near-limit effort suppression, RPE/RIR boundaries, exercise identity, incomplete evidence, input immutability, kg/lb increments, and maximum-weight bounds. Storage tests protect opt-in compatibility and validation. Browser QA must verify default-off consent, real appearance after matching evidence, absence of set mutation, 320-pixel layout, switch semantics, and zero runtime error overlay before checkpointing.
