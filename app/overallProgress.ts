import type { WorkoutSession } from "./storage";

export type OverallWorkoutProgress = {
  sessionId: string;
  name: string;
  workoutDate: string;
  timestamp: number;
  completedSets: number;
  volumeKg: number;
};

export type OverallProgress = {
  completedSessions: number;
  completedSets: number;
  exerciseCount: number;
  totalVolumeKg: number;
  firstWorkoutDate: string | null;
  latestWorkoutDate: string | null;
  workouts: OverallWorkoutProgress[];
};

export type ProgressPeriod = "day" | "week" | "month" | "all";

export type ProgressDateRange = {
  startDate: string;
  endDate: string;
};

export type ExerciseVolumeProgress = {
  exerciseKey: string;
  name: string;
  completedSets: number;
  volumeKg: number;
  bestWeightKg: number;
  previousCompletedSets: number;
  previousVolumeKg: number;
};

export type PeriodProgress = {
  period: ProgressPeriod;
  currentRange: ProgressDateRange | null;
  previousRange: ProgressDateRange | null;
  current: OverallProgress;
  previous: OverallProgress | null;
  exercises: ExerciseVolumeProgress[];
};

type ExerciseVolumeAggregate = Omit<ExerciseVolumeProgress, "previousCompletedSets" | "previousVolumeKg"> & {
  latestTimestamp: number;
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

function previousMonthStart(referenceDateKey: string): string {
  const reference = dateKeyAtNoonUtc(referenceDateKey);
  return dateKeyFromUtc(new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1, 12)));
}

function daysInMonth(dateKey: string): number {
  const date = dateKeyAtNoonUtc(dateKey);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12)).getUTCDate();
}

export function progressPeriodRanges(
  referenceDateKey: string,
  period: ProgressPeriod,
): { currentRange: ProgressDateRange | null; previousRange: ProgressDateRange | null } {
  if (period === "all") return { currentRange: null, previousRange: null };
  if (period === "day") {
    const previousDate = addDays(referenceDateKey, -1);
    return {
      currentRange: { startDate: referenceDateKey, endDate: referenceDateKey },
      previousRange: { startDate: previousDate, endDate: previousDate },
    };
  }
  if (period === "week") {
    const reference = dateKeyAtNoonUtc(referenceDateKey);
    const daysSinceMonday = (reference.getUTCDay() + 6) % 7;
    const currentStart = addDays(referenceDateKey, -daysSinceMonday);
    return {
      currentRange: { startDate: currentStart, endDate: referenceDateKey },
      previousRange: { startDate: addDays(currentStart, -7), endDate: addDays(referenceDateKey, -7) },
    };
  }

  const reference = dateKeyAtNoonUtc(referenceDateKey);
  const currentStart = dateKeyFromUtc(new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1, 12)));
  const comparisonStart = previousMonthStart(referenceDateKey);
  const elapsedDays = Math.min(reference.getUTCDate(), daysInMonth(comparisonStart));
  return {
    currentRange: { startDate: currentStart, endDate: referenceDateKey },
    previousRange: { startDate: comparisonStart, endDate: addDays(comparisonStart, elapsedDays - 1) },
  };
}

function historyWithinRange(history: WorkoutSession[], range: ProgressDateRange | null): WorkoutSession[] {
  if (!range) return history;
  return history.filter((session) => session.workoutDate >= range.startDate && session.workoutDate <= range.endDate);
}

function exerciseVolumes(history: WorkoutSession[]): ExerciseVolumeAggregate[] {
  const exercises = new Map<string, ExerciseVolumeAggregate>();
  for (const session of history) {
    const timestamp = session.finishedAt ?? session.startedAt;
    for (const exercise of session.exercises) {
      const sets = exercise.sets.filter((set) => set.completed && set.reps > 0);
      if (!sets.length) continue;
      const existing = exercises.get(exercise.exerciseKey);
      const next: ExerciseVolumeAggregate = existing ?? {
        exerciseKey: exercise.exerciseKey,
        name: exercise.name,
        completedSets: 0,
        volumeKg: 0,
        bestWeightKg: 0,
        latestTimestamp: -Infinity,
      };
      next.completedSets += sets.length;
      next.volumeKg += sets.reduce((total, set) => total + set.weightKg * set.reps, 0);
      next.bestWeightKg = Math.max(next.bestWeightKg, ...sets.map((set) => set.weightKg));
      if (timestamp >= next.latestTimestamp) {
        next.name = exercise.name;
        next.latestTimestamp = timestamp;
      }
      exercises.set(exercise.exerciseKey, next);
    }
  }
  return [...exercises.values()].sort((first, second) =>
    second.volumeKg - first.volumeKg ||
    second.completedSets - first.completedSets ||
    first.name.localeCompare(second.name),
  );
}

export function buildOverallProgress(history: WorkoutSession[]): OverallProgress {
  const exerciseKeys = new Set<string>();
  const workouts = history.flatMap((session) => {
    let completedSets = 0;
    let volumeKg = 0;

    for (const exercise of session.exercises) {
      const qualifyingSets = exercise.sets.filter((set) => set.completed && set.reps > 0);
      if (!qualifyingSets.length) continue;
      exerciseKeys.add(exercise.exerciseKey);
      completedSets += qualifyingSets.length;
      volumeKg += qualifyingSets.reduce((total, set) => total + set.weightKg * set.reps, 0);
    }

    if (!completedSets) return [];
    return [{
      sessionId: session.id,
      name: session.name,
      workoutDate: session.workoutDate,
      timestamp: session.finishedAt ?? session.startedAt,
      completedSets,
      volumeKg,
    }];
  }).sort((first, second) =>
    first.timestamp - second.timestamp ||
    first.workoutDate.localeCompare(second.workoutDate) ||
    first.sessionId.localeCompare(second.sessionId),
  );

  return {
    completedSessions: workouts.length,
    completedSets: workouts.reduce((total, workout) => total + workout.completedSets, 0),
    exerciseCount: exerciseKeys.size,
    totalVolumeKg: workouts.reduce((total, workout) => total + workout.volumeKg, 0),
    firstWorkoutDate: workouts[0]?.workoutDate ?? null,
    latestWorkoutDate: workouts.at(-1)?.workoutDate ?? null,
    workouts,
  };
}

export function buildPeriodProgress(
  history: WorkoutSession[],
  period: ProgressPeriod,
  referenceDateKey: string,
): PeriodProgress {
  const { currentRange, previousRange } = progressPeriodRanges(referenceDateKey, period);
  const currentHistory = historyWithinRange(history, currentRange);
  const previousHistory = previousRange ? historyWithinRange(history, previousRange) : [];
  const previousExercises = new Map(exerciseVolumes(previousHistory).map((exercise) => [exercise.exerciseKey, exercise]));

  return {
    period,
    currentRange,
    previousRange,
    current: buildOverallProgress(currentHistory),
    previous: previousRange ? buildOverallProgress(previousHistory) : null,
    exercises: exerciseVolumes(currentHistory).map((exercise) => {
      const previous = previousExercises.get(exercise.exerciseKey);
      return {
        exerciseKey: exercise.exerciseKey,
        name: exercise.name,
        completedSets: exercise.completedSets,
        volumeKg: exercise.volumeKg,
        bestWeightKg: exercise.bestWeightKg,
        previousCompletedSets: previous?.completedSets ?? 0,
        previousVolumeKg: previous?.volumeKg ?? 0,
      };
    }),
  };
}
