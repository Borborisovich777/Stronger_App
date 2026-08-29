# Wave 4A — Read-only Weekly Review

The original R&D roadmap ends at Wave 3. Wave 4A deliberately extends it with the safest deferred low-risk item from the Derive stage: a weekly review built from existing history and settings. Plate math, next-set prompts, substitutions, and deload planning remain out of scope.

## Why this feature comes next

Stronger already stores the inputs needed to answer three practical questions: how many sessions were completed this week, whether any completed weight exceeded an earlier result, and which routine follows the latest completed routine. Deriving those answers adds value without creating a new writable planning system or changing workout data.

## Deterministic rules

- A week runs Monday through Sunday using local calendar date keys.
- A session counts only when it is saved in History during that week and contains at least one completed set.
- The target comes from the existing `weeklyDays` setting.
- Weekly progress can show sessions above the target, while the visual bar caps at 100%.
- A recent best weight requires an earlier completed weight for the same exercise key and a strictly heavier completed set with at least one rep this week.
- An exercise's first logged result is a baseline, not a personal record claim.
- The next routine is the item after the latest completed, still-existing source routine in saved routine order; the rotation wraps to the first routine.
- Blank workouts, incomplete sets, deleted routines, and the active workout cannot advance the rotation.

## Safety boundary

- No storage or backup schema change.
- No score or weekly-review snapshot is saved.
- The existing training goal is displayed as context but does not change calculations or generate advice.
- No workout, routine, program block, history entry, setting, RPE, or RIR value is mutated.
- No medical, fatigue, readiness, recovery, or adherence interpretation.
- No automatic reminder, schedule, workout start, or coaching recommendation.
- Empty and first-use states remain useful without manufacturing progress claims.

## Verification gate

Pure helper tests cover Monday/Sunday boundaries across months and years, completed-session counting, target capping, strict best-weight comparison, newest-history ordering, routine rotation, blank-workout exclusion, and input immutability. Browser QA must verify the current-data summary, 320-pixel layout, semantic progress bar, dark mode, and zero console warnings before checkpointing.
