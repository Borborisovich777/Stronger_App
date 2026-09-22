import {
  isCompletedTrackedSet,
  resolveExerciseTracking,
  resolveExerciseWeightMode,
} from "./exercise-tracking";
import type { Routine, RoutineExercise, SetEffort, WorkoutExercise, WorkoutSession, WorkoutSet } from "./storage";

export type WorkoutLoadIncrease = {
  exerciseId: string;
  exerciseKey: string;
  exerciseName: string;
  incrementKg: number;
  sets: { setId: string; previousWeightKg: number; nextWeightKg: number }[];
  evidenceSessionIds: [string, string];
};

export type WorkoutProgressionResult = {
  workout: WorkoutSession;
  increases: WorkoutLoadIncrease[];
};

const MAX_INCREMENT_KG = 2.5;
const MAX_RELATIVE_INCREASE = 0.1;
const WEIGHT_TOLERANCE_KG = 0.000001;

function exerciseIdentity(exercise: RoutineExercise | WorkoutExercise): string {
  return JSON.stringify([
    exercise.exerciseKey,
    resolveExerciseTracking(exercise),
    resolveExerciseWeightMode(exercise),
  ]);
}

function workingSets(exercise: WorkoutExercise): WorkoutSet[] {
  return exercise.sets.filter((set) => !set.dropSetOf);
}

function increasedWeight(weightKg: number, incrementKg: number): number {
  return Math.round((weightKg + incrementKg) * 1_000_000) / 1_000_000;
}

function compareSessionRecency(first: WorkoutSession, second: WorkoutSession): number {
  return second.workoutDate.localeCompare(first.workoutDate) ||
    (second.finishedAt ?? second.startedAt) - (first.finishedAt ?? first.startedAt) ||
    second.id.localeCompare(first.id);
}

function effortLeavesRoom(effort: SetEffort | undefined): boolean {
  if (!effort) return true;
  if (!Number.isFinite(effort.value)) return false;
  return effort.scale === "rpe"
    ? effort.value >= 1 && effort.value <= 8.5
    : effort.value >= 2 && effort.value <= 10;
}

function isFinishedWorkout(session: WorkoutSession): boolean {
  return typeof session.finishedAt === "number" && Number.isFinite(session.finishedAt) &&
    session.finishedAt >= session.startedAt;
}

type PlannedRow = { index: number; template: RoutineExercise; exercise: WorkoutExercise };

/**
 * Apply a small increase once, while constructing a new template workout.
 * The two latest attempts must both finish this exercise's planned workload at
 * the baseline loads. Repeated exercise rows form one ordered workload; changed
 * set counts, missed sets and newer incomplete attempts cannot be skipped.
 */
export function applyNextWorkoutProgression(
  routine: Routine,
  workout: WorkoutSession,
  history: readonly WorkoutSession[],
  incrementKg: number,
  maximumWeightKg: number,
): WorkoutProgressionResult {
  const unchanged = { workout, increases: [] };
  if (!Number.isFinite(incrementKg) || incrementKg <= 0 || incrementKg > MAX_INCREMENT_KG ||
    !Number.isFinite(maximumWeightKg) || maximumWeightKg <= 0 ||
    workout.finishedAt !== undefined || workout.sourceRoutineId !== routine.id ||
    workout.exercises.length !== routine.exercises.length ||
    workout.exercises.some((exercise) => exercise.sets.some((set) => set.completed || set.completedAt !== undefined))) {
    return unchanged;
  }

  const groups = new Map<string, PlannedRow[]>();
  for (const [index, template] of routine.exercises.entries()) {
    const exercise = workout.exercises[index];
    if (exerciseIdentity(template) !== exerciseIdentity(exercise)) return unchanged;
    const identity = exerciseIdentity(template);
    const rows = groups.get(identity) ?? [];
    rows.push({ index, template, exercise });
    groups.set(identity, rows);
  }

  const updatedExercises = [...workout.exercises];
  const increases: WorkoutLoadIncrease[] = [];
  for (const [identity, rows] of groups) {
    const representative = rows[0].exercise;
    if (resolveExerciseTracking(representative) !== "weight-reps" ||
      resolveExerciseWeightMode(representative) === "assistance") continue;

    const validPlan = rows.every(({ template, exercise }) =>
      Number.isInteger(template.targetSets) && template.targetSets > 0 &&
      Number.isInteger(template.targetReps) && template.targetReps > 1 &&
      (template.progressionRepTarget === undefined ||
        Number.isInteger(template.progressionRepTarget) && template.progressionRepTarget > 1) &&
      exercise.sets.length === template.targetSets &&
      exercise.sets.every((set) => !set.dropSetOf && set.reps === template.targetReps &&
        Number.isFinite(set.weightKg) && set.weightKg > 0 &&
        incrementKg <= set.weightKg * MAX_RELATIVE_INCREASE + WEIGHT_TOLERANCE_KG &&
        increasedWeight(set.weightKg, incrementKg) > set.weightKg &&
        increasedWeight(set.weightKg, incrementKg) <= maximumWeightKg));
    if (!validPlan) continue;

    const baseline = rows.flatMap(({ template, exercise }) => exercise.sets.map((set) => ({
      ...set,
      progressionReps: Math.max(template.targetReps, template.progressionRepTarget ?? template.targetReps),
    })));
    // A future-dated/imported session cannot be evidence for this workout.
    // Among prior attempts, select before checking completion so a recent miss blocks older successes.
    const attempts = history.filter((session) => session.id !== workout.id &&
      session.workoutDate <= workout.workoutDate && session.startedAt <= workout.startedAt &&
      (session.finishedAt === undefined || session.finishedAt <= workout.startedAt) &&
      session.exercises.some((exercise) => exerciseIdentity(exercise) === identity))
      .sort(compareSessionRecency).slice(0, 2);
    if (attempts.length !== 2 || attempts.some((session) => !isFinishedWorkout(session))) continue;

    const qualifies = attempts.every((session) => {
      const sets = session.exercises.filter((exercise) => exerciseIdentity(exercise) === identity)
        .flatMap((exercise) => workingSets(exercise).map((set) => ({ set, exercise })));
      return sets.length === baseline.length && sets.every(({ set, exercise }, index) => {
        const planned = baseline[index];
        return isCompletedTrackedSet(set, exercise) && Number.isInteger(set.reps) && set.reps > 1 &&
          set.reps >= planned.progressionReps && Number.isFinite(set.weightKg) &&
          Math.abs(set.weightKg - planned.weightKg) <= WEIGHT_TOLERANCE_KG && effortLeavesRoom(set.effort);
      });
    });
    if (!qualifies) continue;

    for (const { index, exercise } of rows) {
      const sets = exercise.sets.map((set) => ({
        ...set,
        weightKg: increasedWeight(set.weightKg, incrementKg),
      }));
      updatedExercises[index] = { ...exercise, sets };
      increases.push({
        exerciseId: exercise.id,
        exerciseKey: exercise.exerciseKey,
        exerciseName: exercise.name,
        incrementKg,
        sets: sets.map((set, setIndex) => ({
          setId: set.id,
          previousWeightKg: exercise.sets[setIndex].weightKg,
          nextWeightKg: set.weightKg,
        })),
        evidenceSessionIds: [attempts[0].id, attempts[1].id],
      });
    }
  }
  return increases.length ? { workout: { ...workout, exercises: updatedExercises }, increases } : unchanged;
}
