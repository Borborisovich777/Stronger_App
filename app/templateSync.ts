import type { ExerciseTracking, ExerciseWeightMode } from "./exercise-tracking";
import type { Routine, RoutineExercise, StrongerData, WorkoutExercise, WorkoutSession } from "./storage";

function workingSets(exercise: WorkoutExercise) {
  return exercise.sets.filter((set) => !set.dropSetOf);
}

function plannedShape(exercises: { exerciseKey: string }[], setCounts: number[]): string {
  return JSON.stringify(exercises.map((exercise, index) => [exercise.exerciseKey, setCounts[index]]));
}

/** True when the workout's exercises, their order or their working-set counts differ from its template. */
export function workoutDiffersFromTemplate(workout: WorkoutSession, routine: Routine): boolean {
  const done = workout.exercises.filter((exercise) => workingSets(exercise).length > 0);
  return plannedShape(done, done.map((exercise) => workingSets(exercise).length)) !==
    plannedShape(routine.exercises, routine.exercises.map((exercise) => exercise.targetSets));
}

/**
 * Rebuild a template's exercise list from a workout that started from it.
 * Rows that are still in the workout keep their planned weight, rep goal and
 * range. An exercise that replaced another in the same position inherits that
 * row's rep goal; anything else is planned from what was logged.
 */
export function templateFromWorkout(routine: Routine, workout: WorkoutSession, createId: (prefix: string) => string): Routine {
  const exercises = workout.exercises.filter((exercise) => workingSets(exercise).length > 0);
  const used = new Set<number>();
  const matches = exercises.map((exercise) => {
    const index = routine.exercises.findIndex((row, rowIndex) => !used.has(rowIndex) && row.exerciseKey === exercise.exerciseKey);
    if (index >= 0) used.add(index);
    return index;
  });
  const planned = exercises.map((exercise, position): RoutineExercise => {
    const sets = workingSets(exercise);
    const matched = matches[position] >= 0 ? routine.exercises[matches[position]] : undefined;
    if (matched) {
      return { ...matched, name: exercise.name, targetSets: sets.length, restSeconds: exercise.restSeconds, notes: exercise.notes ?? matched.notes };
    }
    const slot = routine.exercises[position];
    const inheritsSlot = slot !== undefined && !used.has(position);
    if (inheritsSlot) used.add(position);
    const first = sets[0];
    return {
      id: createId("routine-exercise"),
      exerciseKey: exercise.exerciseKey,
      name: exercise.name,
      tracking: exercise.tracking,
      weightMode: exercise.weightMode,
      targetSets: sets.length,
      targetWeightKg: first.weightKg,
      targetReps: inheritsSlot ? slot.targetReps : Math.max(1, first.reps),
      ...(inheritsSlot && slot.progressionRepTarget !== undefined ? { progressionRepTarget: slot.progressionRepTarget } : {}),
      ...(first.durationSeconds !== undefined ? { targetDurationSeconds: first.durationSeconds } : {}),
      ...(first.distanceMeters !== undefined ? { targetDistanceMeters: first.distanceMeters } : {}),
      restSeconds: exercise.restSeconds,
      ...(exercise.notes ? { notes: exercise.notes } : {}),
    };
  });
  return { ...routine, exercises: planned };
}

export type ExerciseIdentity = {
  exerciseKey: string;
  name: string;
  tracking?: ExerciseTracking;
  weightMode?: ExerciseWeightMode;
};

/**
 * Point every use of one exercise at another: templates, program copies, the
 * workout in progress and, when asked, finished history. Logged sets are kept
 * unchanged; only the exercise they belong to changes.
 */
export function replaceExerciseEverywhere(data: StrongerData, fromKey: string, to: ExerciseIdentity, includeHistory: boolean): StrongerData {
  if (fromKey === to.exerciseKey) return data;
  const swap = <T extends { exerciseKey: string; name: string; tracking?: ExerciseTracking; weightMode?: ExerciseWeightMode }>(exercise: T): T =>
    exercise.exerciseKey === fromKey
      ? { ...exercise, exerciseKey: to.exerciseKey, name: to.name, tracking: to.tracking ?? exercise.tracking, weightMode: to.weightMode ?? exercise.weightMode }
      : exercise;
  const uses = (exercises: { exerciseKey: string }[]) => exercises.some((exercise) => exercise.exerciseKey === fromKey);
  return {
    ...data,
    routines: data.routines.map((routine) => uses(routine.exercises) ? { ...routine, exercises: routine.exercises.map(swap) } : routine),
    programBlocks: data.programBlocks?.map((block) => uses(block.exercises) ? { ...block, exercises: block.exercises.map(swap) } : block),
    activeWorkout: data.activeWorkout && uses(data.activeWorkout.exercises)
      ? { ...data.activeWorkout, exercises: data.activeWorkout.exercises.map(swap) } : data.activeWorkout,
    history: includeHistory
      ? data.history.map((session) => uses(session.exercises) ? { ...session, exercises: session.exercises.map(swap) } : session)
      : data.history,
  };
}

/** How many templates (and program copies) and past workouts use an exercise. */
export function exerciseUseCounts(data: StrongerData, exerciseKey: string): { templates: number; workouts: number } {
  const uses = (exercises: { exerciseKey: string }[]) => exercises.some((exercise) => exercise.exerciseKey === exerciseKey);
  return {
    templates: data.routines.filter((routine) => uses(routine.exercises)).length +
      (data.programBlocks ?? []).filter((block) => uses(block.exercises)).length,
    workouts: data.history.filter((session) => uses(session.exercises)).length,
  };
}
