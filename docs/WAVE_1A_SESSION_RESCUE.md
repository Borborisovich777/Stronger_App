# Wave 1A — Session Rescue

Wave 1A implements one feature from the R&D recommendation. Weekly Review, Plate Calculator, coaching, and later-wave work remain out of scope.

## Why this feature comes first

Stronger already preserves an unfinished workout across reloads. The audit found the downside of that strength: a forgotten session can return a week later with a 160-hour timer. Session Rescue adds an explicit decision without guessing what the user intended or deleting logged work.

## Trigger

- An active workout is eligible whether it was loaded from persisted data or started during the current app session.
- It is eligible after six hours without a trustworthy activity timestamp.
- Trustworthy activity is the latest of `startedAt`, a completed set's `completedAt`, and an explicit timer resume.
- Incomplete sets and `workoutDate` do not affect inactivity. Future clock values clamp to zero inactivity instead of producing a negative age.
- Detection runs after safe hydration and when the app returns to the foreground. It does not interrupt a live session on a one-second timer tick.
- If another modal is open on foreground return, Rescue waits until that modal closes so focus traps never stack.

## User choices and reasons

### Continue workout

Closes the prompt and returns to the existing workout unchanged. This is the safest default and receives initial keyboard focus. It does not cause a data write by itself.

### Pause timer

Freezes elapsed duration at the last completed set or explicit resume, clears an obsolete rest countdown, and disables workout editing until the timer is explicitly resumed. Three optional version-1 fields persist the state:

- `timerPausedAt`
- `timerPausedDurationMs`
- `timerResumedAt`

Keeping accumulated paused time separate avoids rewriting `startedAt` or any set's `completedAt`. Older backups remain valid because all three fields are optional and additive.

### Close safely

Requires a confirmation, moves the workout to History, and uses the last recorded activity as the finish point. Exercise and set data remain in the history entry; only completed sets contribute to Progress. The feature never discards a workout.

## Safety boundaries

- No automatic pause, finish, or discard.
- No routine, exercise identity, set completion, or history-order rewrite.
- Every mutation uses the guarded Wave 0 autosave path.
- Rescue actions verify the active workout ID before changing state.
- Storage recovery takes priority; Session Rescue is never shown over an unreadable or oversized record.
- A paused workout cannot be edited until its timer is resumed.
- The paused-state edit lock is enforced in both the interface and state update path.
- No background notification, cloud dependency, coaching, or recommendation logic.

## Verification

`tests/session-rescue.test.mjs` covers the inactivity boundary, future-clock handling, completed-set activity, pause/resume duration, timestamp preservation, paused finish, and safe close. `tests/fixtures/format-v1-paused-active.json` proves the additive fields survive backup normalization. The complete Wave 0 storage and deployment suites must remain green.
