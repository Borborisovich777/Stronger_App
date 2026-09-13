import { resolveExerciseTracking, resolveExerciseWeightMode } from "./exercise-tracking";
import type { ProgramBlock, ProgramBlockWeek, Routine, RoutineExercise } from "./storage";

export function copyRoutineToProgramBlock(
  routine: Routine,
  weekCount: number,
  createdAt: number,
  createId: (prefix: string) => string,
): ProgramBlock {
  return {
    id: createId("program-block"),
    name: `${routine.name} block`,
    createdAt,
    sourceRoutineId: routine.id,
    sourceRoutineName: routine.name,
    exercises: routine.exercises.map((exercise) => ({ ...exercise })),
    weeks: Array.from({ length: weekCount }, () => ({
      id: createId("program-week"),
      loadPercent: 100,
    })),
  };
}

export function updateProgramBlockWeek(
  block: ProgramBlock,
  weekId: string,
  loadPercent: number,
): ProgramBlock {
  return {
    ...block,
    weeks: block.weeks.map((week) => week.id === weekId ? { ...week, loadPercent } : week),
  };
}

export function programBlockTargetWeight(weightKg: number, week: ProgramBlockWeek, exercise?: RoutineExercise): number {
  if (exercise && (resolveExerciseTracking(exercise) !== "weight-reps" || resolveExerciseWeightMode(exercise) === "assistance")) return weightKg;
  return weightKg * week.loadPercent / 100;
}

export function programBlockExerciseTarget(exercise: RoutineExercise, week: ProgramBlockWeek): RoutineExercise {
  return {
    ...exercise,
    targetWeightKg: programBlockTargetWeight(exercise.targetWeightKg, week, exercise),
  };
}
