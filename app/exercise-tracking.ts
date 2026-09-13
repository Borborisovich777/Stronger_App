import type { WorkoutSession, WorkoutSet } from "./storage";

export type ExerciseTracking = "weight-reps" | "reps" | "duration" | "distance-duration";
export type ExerciseWeightMode = "external" | "added" | "assistance";
export type SetMeasurements = Pick<WorkoutSet, "weightKg" | "reps" | "durationSeconds" | "distanceMeters">;
export type SetMeasurementUpdate = Partial<SetMeasurements>;

export function isTimedTracking(tracking: ExerciseTracking): boolean {
  return tracking === "duration" || tracking === "distance-duration";
}

export function resolveExerciseTracking(exercise: {
  tracking?: ExerciseTracking;
  sets?: SetMeasurements[];
  targetReps?: number;
  targetDurationSeconds?: number;
  targetDistanceMeters?: number;
}, catalogTracking: ExerciseTracking = "weight-reps"): ExerciseTracking {
  if (exercise.tracking) return exercise.tracking;
  if (exercise.sets?.some((set) => set.distanceMeters !== undefined) || exercise.targetDistanceMeters !== undefined) return "distance-duration";
  if (exercise.sets?.some((set) => set.durationSeconds !== undefined) || exercise.targetDurationSeconds !== undefined) return "duration";
  // Old records stored repetitions, even for holds. Never reinterpret those values as seconds.
  if (exercise.sets?.length || exercise.targetReps !== undefined) return "weight-reps";
  return catalogTracking;
}

export function defaultSetMeasurements(tracking: ExerciseTracking): SetMeasurements {
  return {
    weightKg: 0,
    reps: isTimedTracking(tracking) ? 0 : 8,
    ...(isTimedTracking(tracking) ? { durationSeconds: tracking === "duration" ? 30 : 0 } : {}),
    ...(tracking === "distance-duration" ? { distanceMeters: 0 } : {}),
  };
}

export function setCompletionError(set: SetMeasurements, tracking: ExerciseTracking): string | null {
  const positive = (value: number | undefined) => typeof value === "number" && Number.isFinite(value) && value > 0;
  if (isTimedTracking(tracking)) {
    if (!positive(set.durationSeconds)) return "Enter a duration before completing this set.";
    if (tracking === "distance-duration" && !positive(set.distanceMeters)) return "Enter a distance before completing this set.";
    return null;
  }
  return positive(set.reps) ? null : "Enter at least 1 rep before completing this set.";
}

export function resolveExerciseWeightMode(exercise: { weightMode?: ExerciseWeightMode; sets?: SetMeasurements[]; targetReps?: number }, catalogMode: ExerciseWeightMode = "external"): ExerciseWeightMode {
  if (exercise.weightMode) return exercise.weightMode;
  return exercise.sets?.length || exercise.targetReps !== undefined ? "external" : catalogMode;
}

export function findPreviousSet(history: WorkoutSession[], exerciseKey: string, setIndex: number, tracking?: ExerciseTracking, weightMode?: ExerciseWeightMode): WorkoutSet | undefined {
  for (const session of history) {
    const exercise = session.exercises.find((item) => item.exerciseKey === exerciseKey);
    if (!exercise) continue;
    if (tracking && resolveExerciseTracking(exercise, tracking) !== tracking) continue;
    if (weightMode && resolveExerciseWeightMode(exercise, weightMode) !== weightMode) continue;
    const comparable = exercise.sets[setIndex] ?? [...exercise.sets].reverse().find((set) => set.completed);
    if (comparable?.completed) return comparable;
  }
  return undefined;
}

export function formatSetDuration(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export function formatDistanceKm(distanceMeters: number): string {
  return (distanceMeters / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

export function summarizeTrackedSets(sets: WorkoutSet[], tracking: ExerciseTracking, weightMode: ExerciseWeightMode = "external") {
  const completed = sets.filter((set) => set.completed && setCompletionError(set, tracking) === null);
  const maximum = (values: number[]) => Math.max(0, ...values);
  const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);
  const weighted = tracking === "weight-reps";
  const repetitions = weighted || tracking === "reps";
  const timed = isTimedTracking(tracking);
  return {
    setCount: completed.length,
    bestWeightKg: weighted ? weightMode === "assistance" && completed.length ? Math.min(...completed.map((set) => set.weightKg)) : maximum(completed.map((set) => set.weightKg)) : 0,
    bestEstimatedKg: weighted && weightMode === "external" ? maximum(completed.map((set) => set.weightKg > 0 && set.reps > 0 && set.reps <= 12
      ? set.reps === 1 ? set.weightKg : set.weightKg * (1 + set.reps / 30) : 0)) : 0,
    volumeKg: weighted && weightMode !== "assistance" ? total(completed.map((set) => set.weightKg * set.reps)) : 0,
    bestReps: repetitions ? maximum(completed.map((set) => set.reps)) : 0,
    totalReps: repetitions ? total(completed.map((set) => set.reps)) : 0,
    bestDurationSeconds: timed ? maximum(completed.map((set) => set.durationSeconds ?? 0)) : 0,
    totalDurationSeconds: timed ? total(completed.map((set) => set.durationSeconds ?? 0)) : 0,
    bestDistanceMeters: tracking === "distance-duration" ? maximum(completed.map((set) => set.distanceMeters ?? 0)) : 0,
    totalDistanceMeters: tracking === "distance-duration" ? total(completed.map((set) => set.distanceMeters ?? 0)) : 0,
  };
}
