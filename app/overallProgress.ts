import type { WorkoutSession } from "./storage";
import {
  deriveReportMetrics,
  liveReportRanges,
  rollingReportBaseline,
  type ReportMetrics,
  type ReportMetricsInput,
} from "./reportMetrics";

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
  previousBestWeightKg: number | null;
};

export type PeriodProgress = {
  period: ProgressPeriod;
  currentRange: ProgressDateRange | null;
  previousRange: ProgressDateRange | null;
  current: OverallProgress;
  previous: OverallProgress | null;
  exercises: ExerciseVolumeProgress[];
  report: ReportMetrics;
};

type PeriodProgressContext = Pick<
  ReportMetricsInput,
  "activeWorkout" | "categoriesByExerciseKey" | "customExerciseKeys"
>;

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
    const ranges = liveReportRanges(referenceDateKey, "week");
    return {
      currentRange: ranges.currentRange,
      previousRange: ranges.comparisonRange,
    };
  }
  const ranges = liveReportRanges(referenceDateKey, "month");
  return {
    currentRange: ranges.currentRange,
    previousRange: ranges.comparisonRange,
  };
}

function overallProgressFromReport(
  report: ReturnType<typeof deriveReportMetrics>["current"],
): OverallProgress {
  return {
    completedSessions: report.totals.sessions,
    completedSets: report.totals.workingSets,
    exerciseCount: report.exercises.length,
    totalVolumeKg: report.totals.externalLoadVolumeKg,
    firstWorkoutDate: report.sessions[0]?.workoutDate ?? null,
    latestWorkoutDate: report.sessions.at(-1)?.workoutDate ?? null,
    workouts: report.sessions.map((session) => ({
      sessionId: session.sessionId,
      name: session.name,
      workoutDate: session.workoutDate,
      timestamp: session.timestamp,
      completedSets: session.workingSets,
      volumeKg: session.externalLoadVolumeKg,
    })),
  };
}

export function buildOverallProgress(history: WorkoutSession[]): OverallProgress {
  return overallProgressFromReport(deriveReportMetrics({
    history,
    range: null,
    activeWorkout: null,
    categoriesByExerciseKey: {},
    customExerciseKeys: [],
  }).current);
}

export function buildPeriodProgress(
  history: WorkoutSession[],
  period: ProgressPeriod,
  referenceDateKey: string,
  context?: PeriodProgressContext,
): PeriodProgress {
  const { currentRange, previousRange } = progressPeriodRanges(referenceDateKey, period);
  const report = deriveReportMetrics({
    history,
    range: currentRange,
    comparisonRange: previousRange,
    baseline: period === "week"
      ? rollingReportBaseline(referenceDateKey, "week", 4, "matched-elapsed-days")
      : period === "month"
        ? rollingReportBaseline(referenceDateKey, "month", 3, "matched-elapsed-days")
        : undefined,
    activeWorkout: context?.activeWorkout ?? null,
    categoriesByExerciseKey: context?.categoriesByExerciseKey ?? {},
    customExerciseKeys: context?.customExerciseKeys ?? [],
  });
  const previousExercises = new Map(
    (report.comparison?.exercises ?? []).map((exercise) => [exercise.exerciseKey, exercise]),
  );

  return {
    period,
    currentRange,
    previousRange,
    report,
    current: overallProgressFromReport(report.current),
    previous: report.comparison ? overallProgressFromReport(report.comparison) : null,
    exercises: report.current.exercises
      .map((exercise) => {
      const previous = previousExercises.get(exercise.exerciseKey);
      return {
        exerciseKey: exercise.exerciseKey,
        name: exercise.name,
        completedSets: exercise.workingSets,
        volumeKg: exercise.externalLoadVolumeKg,
        bestWeightKg: exercise.bestWeightKg ?? 0,
        previousCompletedSets: previous?.workingSets ?? 0,
        previousVolumeKg: previous?.externalLoadVolumeKg ?? 0,
        previousBestWeightKg: previous?.bestWeightKg ?? null,
      };
    })
      .sort((first, second) =>
        second.volumeKg - first.volumeKg ||
        second.completedSets - first.completedSets ||
        first.name.localeCompare(second.name),
      ),
  };
}
