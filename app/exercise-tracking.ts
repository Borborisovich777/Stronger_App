import type { WorkoutExercise, WorkoutSession, WorkoutSet } from "./storage";

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


/** Evaluate saved measurements without reinterpreting older repetition-based records. */
export function isCompletedTrackedSet(set: WorkoutSet, exercise: Pick<WorkoutExercise, "tracking" | "sets">): boolean {
  return set.completed && setCompletionError(set, resolveExerciseTracking(exercise)) === null;
}

/** Recorded external or added load can contribute volume; assistance never does. */
export function tracksLoad(exercise: Pick<WorkoutExercise, "tracking" | "weightMode" | "sets">): boolean {
  return resolveExerciseTracking(exercise) === "weight-reps" && resolveExerciseWeightMode(exercise) !== "assistance";
}

/** Strength estimates require external-load repetitions, not additional bodyweight load. */
export function tracksEstimatedStrength(exercise: Pick<WorkoutExercise, "tracking" | "weightMode" | "sets">): boolean {
  return resolveExerciseTracking(exercise) === "weight-reps" && resolveExerciseWeightMode(exercise) === "external";
}

function compareSessionRecency(first: WorkoutSession, second: WorkoutSession): number {
  return first.workoutDate.localeCompare(second.workoutDate) ||
    (first.finishedAt ?? first.startedAt) - (second.finishedAt ?? second.startedAt) ||
    first.id.localeCompare(second.id);
}

/** Only work already available when this workout started can inform its previous results. */
export function historyBeforeWorkout(
  history: readonly WorkoutSession[],
  workout: Pick<WorkoutSession, "workoutDate" | "startedAt"> & Partial<Pick<WorkoutSession, "id">>,
): WorkoutSession[] {
  return history.filter((session) => session.id !== workout.id &&
    session.workoutDate <= workout.workoutDate && session.startedAt <= workout.startedAt &&
    (session.finishedAt ?? session.startedAt) <= workout.startedAt);
}

/** Use the latest performed workout, independent of save/import order or template source. */
export function findPreviousWorkingSets(history: readonly WorkoutSession[], exerciseKey: string, tracking?: ExerciseTracking, weightMode?: ExerciseWeightMode): WorkoutSet[] {
  let latestSession: WorkoutSession | undefined;
  let latestSets: WorkoutSet[] = [];
  for (const session of history) {
    if (latestSession && compareSessionRecency(session, latestSession) <= 0) continue;
    const exercises = session.exercises.filter((item) => item.exerciseKey === exerciseKey &&
      (!tracking || resolveExerciseTracking(item, tracking) === tracking) &&
      (!weightMode || resolveExerciseWeightMode(item, weightMode) === weightMode));
    const workingSets = exercises.flatMap((exercise) => exercise.sets
      .filter((set) => !set.dropSetOf && isCompletedTrackedSet(set, exercise)));
    if (workingSets.length) {
      latestSession = session;
      latestSets = workingSets;
    }
  }
  return latestSets;
}

/** Keep completed working results in saved row order, including repeated exercise rows. */
export function findPreviousSet(history: readonly WorkoutSession[], exerciseKey: string, setIndex: number, tracking?: ExerciseTracking, weightMode?: ExerciseWeightMode): WorkoutSet | undefined {
  const workingSets = findPreviousWorkingSets(history, exerciseKey, tracking, weightMode);
  return workingSets[setIndex] ?? workingSets.at(-1);
}

/** Use the same completed-root ordering as Previous, then find that root's continuation. */
export function findPreviousDropSet(history: readonly WorkoutSession[], exerciseKey: string, workingSetIndex: number, dropIndex: number, tracking?: ExerciseTracking, weightMode?: ExerciseWeightMode): WorkoutSet | undefined {
  let latestSession: WorkoutSession | undefined;
  let latestDrop: WorkoutSet | undefined;
  for (const session of history) {
    if (latestSession && compareSessionRecency(session, latestSession) <= 0) continue;
    const exercises = session.exercises.filter((item) => item.exerciseKey === exerciseKey &&
      (!tracking || resolveExerciseTracking(item, tracking) === tracking) &&
      (!weightMode || resolveExerciseWeightMode(item, weightMode) === weightMode));
    const workingSets = exercises.flatMap((exercise) => exercise.sets
      .filter((set) => !set.dropSetOf && isCompletedTrackedSet(set, exercise))
      .map((set) => ({ set, exercise })));
    const match = workingSets[workingSetIndex];
    if (!match) continue;
    const { set: root, exercise } = match;
    const drop = exercise.sets.filter((set) => set.dropSetOf === root.id)[dropIndex];
    if (drop && isCompletedTrackedSet(drop, exercise)) {
      latestSession = session;
      latestDrop = drop;
    }
  }
  return latestDrop;
}

/** Resolve the displayed Previous values with the same cutoff and ordinals as template prefill. */
export function previousSetsForWorkout(history: readonly WorkoutSession[], workout: WorkoutSession): Map<string, WorkoutSet> {
  const previousHistory = historyBeforeWorkout(history, workout);
  const offsets = new Map<string, number>();
  const previous = new Map<string, WorkoutSet>();
  for (const exercise of workout.exercises) {
    const tracking = resolveExerciseTracking(exercise);
    const weightMode = resolveExerciseWeightMode(exercise);
    const identity = JSON.stringify([exercise.exerciseKey, tracking, weightMode]);
    const offset = offsets.get(identity) ?? 0;
    const roots = exercise.sets.filter((set) => !set.dropSetOf);
    offsets.set(identity, offset + roots.length);
    const previousWorkingSets = findPreviousWorkingSets(previousHistory, exercise.exerciseKey, tracking, weightMode);
    for (const [index, root] of roots.entries()) {
      const previousRoot = previousWorkingSets[offset + index] ?? previousWorkingSets.at(-1);
      if (previousRoot) previous.set(root.id, previousRoot);
      const drops = exercise.sets.filter((set) => set.dropSetOf === root.id);
      for (const [dropIndex, drop] of drops.entries()) {
        const previousDrop = findPreviousDropSet(previousHistory, exercise.exerciseKey, offset + index, dropIndex, tracking, weightMode);
        if (previousDrop) previous.set(drop.id, previousDrop);
      }
    }
  }
  return previous;
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
  const working = completed.filter((set) => !set.dropSetOf);
  const maximum = (values: number[]) => Math.max(0, ...values);
  const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);
  const weighted = tracking === "weight-reps";
  const repetitions = weighted || tracking === "reps";
  const timed = isTimedTracking(tracking);
  return {
    setCount: working.length,
    bestWeightKg: weighted ? weightMode === "assistance" && working.length ? Math.min(...working.map((set) => set.weightKg)) : maximum(working.map((set) => set.weightKg)) : 0,
    bestEstimatedKg: weighted && weightMode === "external" ? maximum(working.map((set) => set.weightKg > 0 && set.reps > 0 && set.reps <= 12
      ? set.reps === 1 ? set.weightKg : set.weightKg * (1 + set.reps / 30) : 0)) : 0,
    volumeKg: weighted && weightMode !== "assistance" ? total(completed.map((set) => set.weightKg * set.reps)) : 0,
    bestReps: repetitions ? maximum(working.map((set) => set.reps)) : 0,
    totalReps: repetitions ? total(completed.map((set) => set.reps)) : 0,
    bestDurationSeconds: timed ? maximum(working.map((set) => set.durationSeconds ?? 0)) : 0,
    totalDurationSeconds: timed ? total(completed.map((set) => set.durationSeconds ?? 0)) : 0,
    bestDistanceMeters: tracking === "distance-duration" ? maximum(working.map((set) => set.distanceMeters ?? 0)) : 0,
    totalDistanceMeters: tracking === "distance-duration" ? total(completed.map((set) => set.distanceMeters ?? 0)) : 0,
  };
}

export type ExerciseProgressRecord = ReturnType<typeof summarizeTrackedSets> & {
  session: WorkoutSession;
  sessionId: string;
  workoutDate: string;
  timestamp: number;
  trendValue: number;
};

/** Build a single measurement series, combining repeated exercise rows in each workout. */
export function buildExerciseProgress(
  history: readonly WorkoutSession[],
  exerciseKey: string,
  sessionIds?: ReadonlySet<string>,
): {
  tracking: ExerciseTracking;
  weightMode: ExerciseWeightMode;
  records: ExerciseProgressRecord[];
  allHistoryRecords: ExerciseProgressRecord[];
  newBest: boolean;
} {
  const orderedSessions = [...history].sort(compareSessionRecency);
  const selectedSessions = orderedSessions.filter((session) => !sessionIds || sessionIds.has(session.id));
  let selectedExercise: WorkoutExercise | undefined;
  for (const session of [...selectedSessions].reverse()) {
    selectedExercise = [...session.exercises].reverse().find((exercise) =>
      exercise.exerciseKey === exerciseKey &&
      exercise.sets.some((set) => !set.dropSetOf && isCompletedTrackedSet(set, exercise)),
    );
    if (selectedExercise) break;
  }
  const tracking = selectedExercise ? resolveExerciseTracking(selectedExercise) : "weight-reps";
  const weightMode = selectedExercise ? resolveExerciseWeightMode(selectedExercise) : "external";
  if (!selectedExercise) return { tracking, weightMode, records: [], allHistoryRecords: [], newBest: false };

  const allHistoryRecords: ExerciseProgressRecord[] = orderedSessions.flatMap((session) => {
    const matchingExercises = session.exercises.filter((exercise) =>
      exercise.exerciseKey === exerciseKey && resolveExerciseTracking(exercise) === tracking &&
      resolveExerciseWeightMode(exercise) === weightMode,
    );
    const metrics = summarizeTrackedSets(matchingExercises.flatMap((exercise) => exercise.sets), tracking, weightMode);
    if (!metrics.setCount) return [];
    const trendValue = tracking === "distance-duration" ? metrics.totalDistanceMeters
      : tracking === "duration" ? metrics.bestDurationSeconds
        : tracking === "reps" ? metrics.bestReps : metrics.bestWeightKg;
    return [{
      session,
      sessionId: session.id,
      workoutDate: session.workoutDate,
      timestamp: session.finishedAt ?? session.startedAt,
      ...metrics,
      trendValue,
    }];
  });
  const records = allHistoryRecords.filter((record) => !sessionIds || sessionIds.has(record.sessionId));
  const latest = records.at(-1);
  const latestIndex = latest ? allHistoryRecords.indexOf(latest) : -1;
  const prior = allHistoryRecords.slice(0, Math.max(0, latestIndex));
  const newBest = latest !== undefined && prior.length > 0 &&
    (tracking === "weight-reps" && weightMode === "assistance"
      ? latest.trendValue < Math.min(...prior.map((record) => record.trendValue))
      : latest.trendValue > Math.max(...prior.map((record) => record.trendValue)));
  return { tracking, weightMode, records, allHistoryRecords, newBest };
}
