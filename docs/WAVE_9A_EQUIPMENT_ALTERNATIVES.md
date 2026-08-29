# Wave 9A — Explicit equipment alternatives

## Why this change

The R&D roadmap identified equipment substitutions as useful when a planned station is busy or unavailable. A full automatic swap system would be risky because exercises can differ in technique, loading, assistance, and history identity. Wave 9A adds only a conservative discovery aid inside the existing exercise picker.

## Product boundary

- Alternatives appear only for curated built-in exercises with a clear shared movement pattern.
- Every suggestion uses a different equipment type from the selected exercise.
- At most one suggestion is shown per equipment type and at most three are shown in total.
- Custom exercises and ambiguous movement groups receive no suggestions.
- Choosing an alternative is an explicit selection in the existing add-exercise flow.
- Nothing replaces an exercise automatically or rewrites routines, active workouts, or History.
- Loads and difficulty are not treated as equivalent across equipment.
- No setting, storage field, migration, or backup-format change is required.

## UX

Eligible exercise rows include an **Alternatives** action. Opening it shows the shared movement pattern, different-equipment choices, and a short warning that loads and difficulty are not equivalent. Selecting an option follows the same path as choosing it directly from the library.

The main exercise button remains the fastest path. The alternatives panel is optional, collapsible, keyboard reachable, and uses the existing compact button scale with a minimum 44-pixel touch target.

## Verification

Focused tests prove that suggestions:

- stay within the curated movement group;
- exclude the current equipment type;
- avoid duplicate equipment types;
- use only existing built-in exercise keys;
- leave the source catalog unchanged; and
- return nothing for unsupported or custom exercises.

The full data, build, deployment-shell, lint, and responsive browser checks must remain green before this wave is checkpointed.
