import { BUILT_IN_EXERCISES } from "./exercises";
import { findPreviousWorkingSets, historyBeforeWorkout, resolveExerciseTracking, resolveExerciseWeightMode } from "./exercise-tracking";
import type { Routine, WorkoutSession } from "./storage";

/** Start the saved plan with the latest comparable loads; historical reps never lower its targets. */
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
      const identity = JSON.stringify([exercise.exerciseKey, tracking, weightMode]);
      const previousSetOffset = previousSetOffsets.get(identity) ?? 0;
      previousSetOffsets.set(identity, previousSetOffset + exercise.targetSets);
      const previousSets = findPreviousWorkingSets(previousHistory, exercise.exerciseKey, tracking, weightMode);
      return {
        id: createId("session-exercise"),
        exerciseKey: exercise.exerciseKey,
        name: exercise.name,
        tracking,
        weightMode,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
        sets: Array.from({ length: exercise.targetSets }, (_, index) => {
          const previous = previousSets[previousSetOffset + index] ?? previousSets.at(-1);
          return {
            id: createId("set"),
            weightKg: previous?.weightKg ?? exercise.targetWeightKg,
            reps: exercise.targetReps,
            durationSeconds: previous?.durationSeconds ?? exercise.targetDurationSeconds,
            distanceMeters: previous?.distanceMeters ?? exercise.targetDistanceMeters,
            completed: false,
          };
        }),
      };
    }),
  };
}
