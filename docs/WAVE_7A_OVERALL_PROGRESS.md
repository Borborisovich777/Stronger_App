# Wave 7A — Read-only overall progress

## Why this change

The Progress tab opened with the first saved exercise selected. Its numbers were correct for that exercise, but they could look like whole-app totals. The tab now begins with a clearly separate overview of all completed training.

## What changed

- Overall completed workout count
- Overall completed set count
- Total logged volume across completed sets
- Number of exercises with completed work
- Recent total workout-volume trend for up to eight workouts
- A clear “Strength by exercise” heading above the existing exercise-specific records

## Measurement rules

- Only saved workouts with completed sets and positive reps count.
- Volume is `weight × reps` summed across completed sets.
- Bodyweight sets with zero external load still count as completed work, but add zero external-load volume.
- Best weight and estimated 1RM are never combined across exercises.
- Workout mix and workout size can change total-volume trends, so the UI states this limitation.

## Safety boundary

- The overview is fully derived and read-only.
- It does not change workouts, routines, History, settings, storage, or backups.
- The existing exercise-specific calculations remain unchanged.
