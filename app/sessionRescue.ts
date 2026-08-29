import type { WorkoutSession } from "./storage";

export const SESSION_RESCUE_INACTIVITY_MS = 6 * 60 * 60 * 1000;

const MAX_TIMER_MS = 8_640_000_000_000_000;

function safeEpoch(value: number, fallback: number): number {
  return Number.isInteger(value) && value >= 0 ? Math.min(value, MAX_TIMER_MS) : fallback;
}

export function latestWorkoutActivityAt(workout: WorkoutSession): number {
  let latest = Math.max(
    workout.startedAt,
    workout.timerResumedAt === undefined ? workout.startedAt : safeEpoch(workout.timerResumedAt, workout.startedAt),
  );
  for (const exercise of workout.exercises) {
    for (const set of exercise.sets) {
      if (set.completed && set.completedAt !== undefined) {
        latest = Math.max(latest, safeEpoch(set.completedAt, workout.startedAt));
      }
    }
  }
  return latest;
}

export function sessionInactivityMs(workout: WorkoutSession, now: number): number {
  const safeNow = safeEpoch(now, workout.startedAt);
  return Math.max(0, safeNow - latestWorkoutActivityAt(workout));
}

export function shouldOfferSessionRescue(
  workout: WorkoutSession | null,
  now: number,
  thresholdMs = SESSION_RESCUE_INACTIVITY_MS,
): boolean {
  if (!workout || workout.timerPausedAt !== undefined) return false;
  return sessionInactivityMs(workout, now) >= thresholdMs;
}

export function workoutElapsedSeconds(workout: WorkoutSession, now: number): number {
  const endAt = workout.finishedAt ?? workout.timerPausedAt ?? safeEpoch(now, workout.startedAt);
  const pausedDurationMs = workout.timerPausedDurationMs ?? 0;
  return Math.floor(Math.max(0, endAt - workout.startedAt - pausedDurationMs) / 1000);
}

export function pauseWorkoutTimer(workout: WorkoutSession, now: number): WorkoutSession {
  if (workout.timerPausedAt !== undefined) return workout;
  const safeNow = Math.max(workout.startedAt, safeEpoch(now, workout.startedAt));
  const pauseAt = Math.min(safeNow, Math.max(workout.startedAt, latestWorkoutActivityAt(workout)));
  return {
    ...workout,
    timerPausedAt: pauseAt,
    restEndsAt: undefined,
  };
}

export function resumeWorkoutTimer(workout: WorkoutSession, now: number): WorkoutSession {
  if (workout.timerPausedAt === undefined) return workout;
  const { timerPausedAt, ...resumed } = workout;
  const resumedAt = Math.max(timerPausedAt, safeEpoch(now, timerPausedAt));
  const pausedDurationMs = Math.min(
    MAX_TIMER_MS,
    (workout.timerPausedDurationMs ?? 0) + (resumedAt - timerPausedAt),
  );
  return {
    ...resumed,
    timerResumedAt: resumedAt,
    timerPausedDurationMs: pausedDurationMs || undefined,
  };
}

export function finishWorkoutTimer(
  workout: WorkoutSession,
  now: number,
  closeAtLastActivity = false,
): WorkoutSession {
  const timerPausedAt = workout.timerPausedAt;
  const finished = { ...workout };
  delete finished.timerPausedAt;
  delete finished.timerResumedAt;
  const requestedFinishAt = closeAtLastActivity ? latestWorkoutActivityAt(workout) : safeEpoch(now, workout.startedAt);
  const finishedAt = Math.max(workout.startedAt, timerPausedAt ?? requestedFinishAt);
  return {
    ...finished,
    finishedAt,
    restEndsAt: undefined,
  };
}
