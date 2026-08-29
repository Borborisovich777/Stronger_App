import type { Routine, WorkoutSession } from "./storage";

export type WeeklyPersonalRecord = {
  exerciseKey: string;
  name: string;
  currentWeightKg: number;
  previousWeightKg: number;
  workoutDate: string;
};

export type WeeklyReview = {
  startDate: string;
  endDate: string;
  completedSessions: number;
  targetSessions: number;
  progressPercent: number;
  personalRecords: WeeklyPersonalRecord[];
  nextRoutine: Routine | null;
};

function dateKeyAtNoonUtc(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function dateKeyFromUtc(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, days: number): string {
  const date = dateKeyAtNoonUtc(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKeyFromUtc(date);
}

export function weekRange(referenceDateKey: string): { startDate: string; endDate: string } {
  const reference = dateKeyAtNoonUtc(referenceDateKey);
  const daysSinceMonday = (reference.getUTCDay() + 6) % 7;
  const startDate = addDays(referenceDateKey, -daysSinceMonday);
  return { startDate, endDate: addDays(startDate, 6) };
}

function completedExerciseSets(session: WorkoutSession) {
  return session.exercises.flatMap((exercise) => exercise.sets
    .filter((set) => set.completed && set.reps > 0)
    .map((set) => ({ exercise, set })));
}

function hasCompletedSet(session: WorkoutSession): boolean {
  return session.exercises.some((exercise) => exercise.sets.some((set) => set.completed));
}

function nextRoutineInRotation(history: WorkoutSession[], routines: Routine[]): Routine | null {
  if (!routines.length) return null;
  const routineIds = new Set(routines.map((routine) => routine.id));
  const latestRoutineSession = history
    .filter((session) => session.sourceRoutineId && routineIds.has(session.sourceRoutineId) && hasCompletedSet(session))
    .sort((first, second) =>
      (second.finishedAt ?? second.startedAt) - (first.finishedAt ?? first.startedAt) ||
      second.workoutDate.localeCompare(first.workoutDate),
    )[0];
  if (!latestRoutineSession?.sourceRoutineId) return routines[0];
  const currentIndex = routines.findIndex((routine) => routine.id === latestRoutineSession.sourceRoutineId);
  return routines[(currentIndex + 1) % routines.length];
}

function weeklyPersonalRecords(
  history: WorkoutSession[],
  startDate: string,
  endDate: string,
): WeeklyPersonalRecord[] {
  const previousBest = new Map<string, number>();
  const weeklyBest = new Map<string, WeeklyPersonalRecord>();

  for (const session of history.filter((item) => item.workoutDate < startDate)) {
    for (const { exercise, set } of completedExerciseSets(session)) {
      previousBest.set(exercise.exerciseKey, Math.max(previousBest.get(exercise.exerciseKey) ?? -Infinity, set.weightKg));
    }
  }

  for (const session of history.filter((item) => item.workoutDate >= startDate && item.workoutDate <= endDate)) {
    for (const { exercise, set } of completedExerciseSets(session)) {
      const current = weeklyBest.get(exercise.exerciseKey);
      if (!current || set.weightKg > current.currentWeightKg ||
        (set.weightKg === current.currentWeightKg && session.workoutDate > current.workoutDate)) {
        weeklyBest.set(exercise.exerciseKey, {
          exerciseKey: exercise.exerciseKey,
          name: exercise.name,
          currentWeightKg: set.weightKg,
          previousWeightKg: previousBest.get(exercise.exerciseKey) ?? -Infinity,
          workoutDate: session.workoutDate,
        });
      }
    }
  }

  return [...weeklyBest.values()]
    .filter((record) => Number.isFinite(record.previousWeightKg) && record.currentWeightKg > record.previousWeightKg)
    .sort((first, second) => second.workoutDate.localeCompare(first.workoutDate) || first.name.localeCompare(second.name));
}

export function buildWeeklyReview(
  history: WorkoutSession[],
  routines: Routine[],
  targetSessions: number,
  referenceDateKey: string,
): WeeklyReview {
  const { startDate, endDate } = weekRange(referenceDateKey);
  const safeTargetSessions = Number.isInteger(targetSessions) && targetSessions >= 1 && targetSessions <= 7
    ? targetSessions
    : 1;
  const completedSessions = history.filter((session) =>
    session.workoutDate >= startDate && session.workoutDate <= endDate && hasCompletedSet(session),
  ).length;
  return {
    startDate,
    endDate,
    completedSessions,
    targetSessions: safeTargetSessions,
    progressPercent: Math.min(100, completedSessions / safeTargetSessions * 100),
    personalRecords: weeklyPersonalRecords(history, startDate, endDate),
    nextRoutine: nextRoutineInRotation(history, routines),
  };
}
