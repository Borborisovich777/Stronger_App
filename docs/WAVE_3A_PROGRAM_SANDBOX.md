# Wave 3A — Program Block Sandbox

Wave 3A implements only the safest half of the roadmap's Experiment stage: multi-week program blocks on copied routine data. Dismissible deload planning remains out of scope.

## Why this feature comes first

The competitor benchmark identified multi-week program construction as a useful planning capability, but coupling a plan directly to live training would create unnecessary overwrite and automation risk. Stronger therefore starts with a sandbox that makes the data boundary visible and testable.

## User control

- The user explicitly chooses a routine and a 2–12 week duration.
- Each week starts at 100% of the copied target load.
- The user may choose 50–120% in five-point steps for any week.
- Percentages are labeled as arithmetic previews, not recommendations.
- There is no apply, activate, schedule, or start-workout action.
- A copy can be deleted without affecting its source routine, workouts, history, or Progress.

## Data contract and safety

- Storage format remains version 1.
- `programBlocks` is an optional additive collection.
- Each block records its source identity and name, creation time, copied exercises, and independent weeks.
- A copied exercise snapshot is not read from the source routine after creation.
- Existing backups without `programBlocks` remain valid.
- Invalid week counts, duplicate week IDs, percentages outside 50–120% or between five-point steps, and resource-limit violations reject the selected backup as a whole.
- A maximum of 50 blocks, 12 weeks per block, and the existing routine exercise limits bound rendering and storage work.

## Deliberate exclusions

- No deload detection or advice.
- No automatic progression or percentage generation.
- No automatic changes based on RPE, RIR, history, or Progress.
- No calendar scheduling or notifications.
- No workout creation from a block.
- No cloud processing or account data.

## Verification gate

The helper tests prove that routine copying is immutable, every week starts neutral, week edits stay inside the block, and preview math is deterministic. Storage fixtures prove old format-version-1 data remains compatible and malformed program blocks are rejected. Browser QA must confirm creation, persistence, editing, source-routine isolation, focus behavior, and a 320-pixel layout before checkpointing. The deletion handler is separately constrained to filtering the sandbox collection after explicit confirmation.
