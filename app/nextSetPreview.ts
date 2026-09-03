import type { SetEffort, WorkoutExercise, WorkoutSession, WorkoutSet } from "./storage";

export type NextSetEvidence = {
  weightKg: number;
  reps: number;
  effort?: SetEffort;
};

export type NextSetPreview = {
  nextSetId: string;
  nextSetNumber: number;
  plannedWeightKg: number;
  plannedReps: number;
  suggestedWeightKg: number;
  todayEvidence: NextSetEvidence;
  historyEvidence: NextSetEvidence & {
    sessionId: string;
    sessionName: string;
    workoutDate: string;
  };
};

function effortIsNotNearLimit(effort: SetEffort | undefined): boolean {
  if (!effort) return true;
  return effort.scale === "rpe" ? effort.value <= 8.5 : effort.value >= 2;
}

function meetsPlan(set: WorkoutSet, plannedWeightKg: number, plannedReps: number): boolean {
  return set.completed && set.weightKg >= plannedWeightKg && set.reps >= plannedReps &&
    effortIsNotNearLimit(set.effort);
}

function evidenceFromSet(set: WorkoutSet): NextSetEvidence {
  return {
    weightKg: set.weightKg,
    reps: set.reps,
    ...(set.effort ? { effort: { ...set.effort } } : {}),
  };
}

function latestComparableSession(
  history: readonly WorkoutSession[],
  exerciseKey: string,
): { session: WorkoutSession; exercise: WorkoutExercise } | null {
  let latest: { session: WorkoutSession; exercise: WorkoutExercise; timestamp: number } | null = null;
  for (const session of history) {
    const exercise = session.exercises.find((candidate) => candidate.exerciseKey === exerciseKey);
    if (!exercise?.sets.some((set) => set.completed && !set.dropSetOf)) continue;
    const timestamp = session.finishedAt ?? session.startedAt;
    if (!latest || timestamp > latest.timestamp) latest = { session, exercise, timestamp };
  }
  return latest ? { session: latest.session, exercise: latest.exercise } : null;
}

export function buildNextSetPreview(
  exercise: WorkoutExercise,
  history: readonly WorkoutSession[],
  incrementKg: number,
  maximumWeightKg: number,
  requireCurrentEffort = false,
): NextSetPreview | null {
  if (!Number.isFinite(incrementKg) || incrementKg <= 0 ||
    !Number.isFinite(maximumWeightKg) || maximumWeightKg <= 0) return null;

  const workingSets = exercise.sets.filter((set) => !set.dropSetOf);
  const nextSetIndex = workingSets.findIndex((set) => !set.completed);
  if (nextSetIndex <= 0) return null;
  const nextSet = workingSets[nextSetIndex];
  if (!Number.isFinite(nextSet.weightKg) || nextSet.weightKg <= 0 ||
    !Number.isInteger(nextSet.reps) || nextSet.reps <= 0) return null;

  const precedingSet = [...workingSets.slice(0, nextSetIndex)].reverse()
    .find((set) => set.completed);
  if (!precedingSet || (requireCurrentEffort && !precedingSet.effort) ||
    !meetsPlan(precedingSet, nextSet.weightKg, nextSet.reps)) return null;

  const comparable = latestComparableSession(history, exercise.exerciseKey);
  if (!comparable) return null;
  const qualifyingHistorySet = comparable.exercise.sets
    .filter((set) => !set.dropSetOf)
    .filter((set) => meetsPlan(set, nextSet.weightKg, nextSet.reps))
    .sort((first, second) => first.weightKg - second.weightKg || second.reps - first.reps)[0];
  if (!qualifyingHistorySet) return null;

  const suggestedWeightKg = Math.round((nextSet.weightKg + incrementKg) * 1_000_000) / 1_000_000;
  if (suggestedWeightKg > maximumWeightKg) return null;

  return {
    nextSetId: nextSet.id,
    nextSetNumber: nextSetIndex + 1,
    plannedWeightKg: nextSet.weightKg,
    plannedReps: nextSet.reps,
    suggestedWeightKg,
    todayEvidence: evidenceFromSet(precedingSet),
    historyEvidence: {
      ...evidenceFromSet(qualifyingHistorySet),
      sessionId: comparable.session.id,
      sessionName: comparable.session.name,
      workoutDate: comparable.session.workoutDate,
    },
  };
}
