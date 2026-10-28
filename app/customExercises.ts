import type { StrongerData } from "./storage";

export type CustomExerciseUsage = {
  routineNames: string[];
  programBlockNames: string[];
  inActiveWorkout: boolean;
  historySessions: number;
};

/** Where a custom exercise is referenced, so rename and delete can explain their effect. */
export function customExerciseUsage(data: StrongerData, exerciseKey: string): CustomExerciseUsage {
  return {
    routineNames: data.routines.filter((routine) => routine.exercises.some((exercise) => exercise.exerciseKey === exerciseKey)).map((routine) => routine.name),
    programBlockNames: (data.programBlocks ?? []).filter((block) => block.exercises.some((exercise) => exercise.exerciseKey === exerciseKey)).map((block) => block.name),
    inActiveWorkout: data.activeWorkout?.exercises.some((exercise) => exercise.exerciseKey === exerciseKey) ?? false,
    historySessions: data.history.filter((session) => session.exercises.some((exercise) => exercise.exerciseKey === exerciseKey)).length,
  };
}

/**
 * Rename a custom exercise everywhere it is planned: the library, templates,
 * program copies and the workout in progress. Templates already link by
 * exerciseKey, so only their copied display name needs updating. Finished
 * history keeps the name it was logged with.
 */
export function renameCustomExercise(data: StrongerData, exerciseKey: string, name: string): StrongerData {
  if (!name || !data.customExercises.some((exercise) => exercise.exerciseKey === exerciseKey)) return data;
  const rename = <T extends { exerciseKey: string; name: string }>(exercise: T): T =>
    exercise.exerciseKey === exerciseKey ? { ...exercise, name } : exercise;
  return {
    ...data,
    customExercises: data.customExercises.map(rename),
    routines: data.routines.map((routine) => routine.exercises.some((exercise) => exercise.exerciseKey === exerciseKey)
      ? { ...routine, exercises: routine.exercises.map(rename) } : routine),
    programBlocks: data.programBlocks?.map((block) => block.exercises.some((exercise) => exercise.exerciseKey === exerciseKey)
      ? { ...block, exercises: block.exercises.map(rename) } : block),
    activeWorkout: data.activeWorkout && data.activeWorkout.exercises.some((exercise) => exercise.exerciseKey === exerciseKey)
      ? { ...data.activeWorkout, exercises: data.activeWorkout.exercises.map(rename) } : data.activeWorkout,
  };
}

/**
 * Remove a custom exercise from the library and from every template and
 * program copy that plans it. Refuses while the exercise is in the workout in
 * progress. Finished history is never changed.
 */
export function deleteCustomExercise(data: StrongerData, exerciseKey: string): StrongerData {
  if (!data.customExercises.some((exercise) => exercise.exerciseKey === exerciseKey) ||
    customExerciseUsage(data, exerciseKey).inActiveWorkout) return data;
  return {
    ...data,
    customExercises: data.customExercises.filter((exercise) => exercise.exerciseKey !== exerciseKey),
    routines: data.routines.map((routine) => routine.exercises.some((exercise) => exercise.exerciseKey === exerciseKey)
      ? { ...routine, exercises: routine.exercises.filter((exercise) => exercise.exerciseKey !== exerciseKey) } : routine),
    programBlocks: data.programBlocks?.map((block) => block.exercises.some((exercise) => exercise.exerciseKey === exerciseKey)
      ? { ...block, exercises: block.exercises.filter((exercise) => exercise.exerciseKey !== exerciseKey) } : block),
  };
}
