import type { WorkoutExercise, WorkoutSession, WorkoutSet } from "./storage";

export const DEFAULT_DROP_PERCENT = 20;

export function isDropSegment(set: WorkoutSet): boolean {
  return set.dropSetOf !== undefined;
}

export function workingSets(exercise: WorkoutExercise): WorkoutSet[] {
  return exercise.sets.filter((set) => !isDropSegment(set));
}

export function completedWorkingSets(session: WorkoutSession): WorkoutSet[] {
  return session.exercises.flatMap((exercise) => workingSets(exercise)
    .filter((set) => set.completed && set.reps > 0));
}

export function completedDropSegments(session: WorkoutSession): WorkoutSet[] {
  return session.exercises.flatMap((exercise) => exercise.sets
    .filter((set) => set.completed && set.reps > 0 && isDropSegment(set)));
}

export function completedSetSegments(session: WorkoutSession): WorkoutSet[] {
  return session.exercises.flatMap((exercise) => exercise.sets.filter((set) => set.completed && set.reps > 0));
}

export function dropSegmentsFor(exercise: WorkoutExercise, rootSetId: string): WorkoutSet[] {
  return exercise.sets.filter((set) => set.dropSetOf === rootSetId);
}

export function rootSetId(set: WorkoutSet): string {
  return set.dropSetOf ?? set.id;
}

export function workingSetNumber(exercise: WorkoutExercise, set: WorkoutSet): number {
  const rootId = rootSetId(set);
  return workingSets(exercise).findIndex((candidate) => candidate.id === rootId) + 1;
}

export function dropNumber(exercise: WorkoutExercise, set: WorkoutSet): number {
  if (!set.dropSetOf) return 0;
  return dropSegmentsFor(exercise, set.dropSetOf).findIndex((candidate) => candidate.id === set.id) + 1;
}

export function precedingSegment(exercise: WorkoutExercise, set: WorkoutSet): WorkoutSet | undefined {
  const index = exercise.sets.findIndex((candidate) => candidate.id === set.id);
  if (index <= 0) return undefined;
  const previous = exercise.sets[index - 1];
  return rootSetId(previous) === rootSetId(set) ? previous : undefined;
}

export function isFinalSetSegment(exercise: WorkoutExercise, set: WorkoutSet): boolean {
  const index = exercise.sets.findIndex((candidate) => candidate.id === set.id);
  const next = exercise.sets[index + 1];
  return !next || rootSetId(next) !== rootSetId(set);
}

export function suggestedDropWeightKg(weightKg: number): number {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return 0;
  return Math.round(weightKg * (1 - DEFAULT_DROP_PERCENT / 100) * 1_000) / 1_000;
}

export function insertDropSegment(
  exercise: WorkoutExercise,
  sourceSetId: string,
  newSetId: string,
): WorkoutExercise {
  const source = exercise.sets.find((set) => set.id === sourceSetId);
  if (!source) return exercise;
  const groupId = rootSetId(source);
  let insertAfter = exercise.sets.findIndex((set) => set.id === source.id);
  while (insertAfter + 1 < exercise.sets.length && exercise.sets[insertAfter + 1].dropSetOf === groupId) {
    insertAfter += 1;
  }
  const previous = exercise.sets[insertAfter];
  const nextSet: WorkoutSet = {
    id: newSetId,
    weightKg: suggestedDropWeightKg(previous.weightKg),
    reps: 0,
    completed: false,
    dropSetOf: groupId,
  };
  const sets = [...exercise.sets];
  sets.splice(insertAfter + 1, 0, nextSet);
  return { ...exercise, sets };
}

export function removeSetWithContinuations(exercise: WorkoutExercise, setId: string): WorkoutExercise {
  const target = exercise.sets.find((set) => set.id === setId);
  if (!target) return exercise;
  const sets = target.dropSetOf
    ? exercise.sets.filter((set) => set.id !== setId)
    : exercise.sets.filter((set) => set.id !== setId && set.dropSetOf !== setId);
  return { ...exercise, sets };
}
