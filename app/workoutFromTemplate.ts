import { BUILT_IN_EXERCISES } from "./exercises";
import { findPreviousSet, findPreviousWorkingSets, historyBeforeWorkout, previousSetsForWorkout, resolveExerciseTracking, resolveExerciseWeightMode } from "./exercise-tracking";
import type { Routine, WorkoutSession } from "./storage";

/** Weighted templates use recent loads and planned reps; other tracking retains previous results. */
export function workoutFromTemplate(
  template: Routine,
  history: readonly WorkoutSession[],
  workoutDate: string,
  startedAt: number,
  createId: (prefix: string) => string,
): WorkoutSession {
  const previousHistory = historyBeforeWorkout(history, { workoutDate, startedAt });
  const previousSetOffsets = new Map<string, number>();
  return {
    id: createId("workout"),
    name: template.name,
    workoutDate,
    startedAt,
    sourceRoutineId: template.id,
    notes: template.notes,
    exercises: template.exercises.map((exercise) => {
      const catalog = BUILT_IN_EXERCISES.find((item) => item.exerciseKey === exercise.exerciseKey);
      const tracking = resolveExerciseTracking(exercise, catalog?.tracking);
      const weightMode = resolveExerciseWeightMode(exercise, catalog?.weightMode);
      const weighted = tracking === "weight-reps";
      const identity = JSON.stringify([exercise.exerciseKey, tracking, weightMode]);
      const previousSetOffset = previousSetOffsets.get(identity) ?? 0;
      previousSetOffsets.set(identity, previousSetOffset + exercise.targetSets);
      const previousSets = weighted ? findPreviousWorkingSets(previousHistory, exercise.exerciseKey, tracking, weightMode) : [];
      return {
        id: createId("session-exercise"),
        exerciseKey: exercise.exerciseKey,
        name: exercise.name,
        tracking,
        weightMode,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
        sets: Array.from({ length: exercise.targetSets }, (_, index) => {
          const previous = weighted
            ? previousSets[previousSetOffset + index] ?? previousSets.at(-1)
            : findPreviousSet(history, exercise.exerciseKey, index, tracking, weightMode);
          return {
            id: createId("set"),
            weightKg: previous?.weightKg ?? exercise.targetWeightKg,
            reps: weighted ? exercise.targetReps : previous?.reps ?? exercise.targetReps,
            durationSeconds: previous?.durationSeconds ?? exercise.targetDurationSeconds,
            distanceMeters: previous?.distanceMeters ?? exercise.targetDistanceMeters,
            completed: false,
          };
        }),
      };
    }),
  };
}

/**
 * Fill an exercise that was just added to a workout with what its Previous
 * column shows, set by set, so the inputs start at last session's results
 * instead of empty. Sets with no previous result are left as they are.
 */
export function prefillExerciseFromPrevious(history: readonly WorkoutSession[], workout: WorkoutSession, exerciseId: string): WorkoutSession {
  const previous = previousSetsForWorkout(history, workout);
  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => exercise.id !== exerciseId ? exercise : {
      ...exercise,
      sets: exercise.sets.map((set) => {
        const prior = previous.get(set.id);
        return prior && !set.completed ? {
          ...set,
          weightKg: prior.weightKg,
          reps: prior.reps,
          durationSeconds: prior.durationSeconds,
          distanceMeters: prior.distanceMeters,
        } : set;
      }),
    }),
  };
}
