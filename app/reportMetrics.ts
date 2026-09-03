import type { ExerciseCategory } from "./exercises";
import type { WorkoutExercise, WorkoutSession, WorkoutSet } from "./storage";

export type ReportCadence = "week" | "month";
export type ReportExerciseCategory = ExerciseCategory | "Unclassified";

export type ReportDateRange = {
  startDate: string;
  endDate: string;
};

export type ReportTotals = {
  sessions: number;
  daysTrained: number;
  workingSets: number;
  drops: number;
  workingReps: number;
  dropReps: number;
  totalReps: number;
  externalLoadVolumeKg: number;
  durationSeconds: number;
  measuredDurationSessions: number;
  unmeasuredDurationSessions: number;
  averageSessionDurationSeconds: number | null;
};

export type ReportBaselineTotals = Omit<ReportTotals, "durationSeconds"> & {
  durationSeconds: number | null;
};

export type ReportEffortScaleMetrics = {
  recordedWorkingSets: number;
  median: number | null;
};

export type ReportEffortMetrics = {
  recordedWorkingSets: number;
  unrecordedWorkingSets: number;
  rpe: ReportEffortScaleMetrics;
  rir: ReportEffortScaleMetrics;
};

export type ReportBestRepsAtWeight = {
  weightKg: number;
  reps: number;
};

export type ReportHighlightKind = "weight-pr" | "rep-at-weight-pr" | "estimated-1rm-improvement";

export type ReportHighlight = {
  kind: ReportHighlightKind;
  exerciseKey: string;
  name: string;
  sessionId: string;
  setId: string;
  workoutDate: string;
  weightKg: number;
  reps: number;
  currentValue: number;
  previousValue: number;
  delta: number;
};

export type ReportExerciseMetrics = {
  exerciseKey: string;
  name: string;
  category: ReportExerciseCategory;
  sessionCount: number;
  daysTrained: number;
  workingSets: number;
  drops: number;
  workingReps: number;
  dropReps: number;
  totalReps: number;
  externalLoadVolumeKg: number;
  bestWeightKg: number | null;
  bestEstimatedOneRepMaxKg: number | null;
  bestRepsAtWeight: ReportBestRepsAtWeight[];
};

export type ReportCategoryMetrics = {
  category: ReportExerciseCategory;
  daysTrained: number;
  workingSets: number;
  drops: number;
  workingReps: number;
  dropReps: number;
  totalReps: number;
  externalLoadVolumeKg: number;
};

export type ReportSessionExerciseMetrics = {
  exerciseKey: string;
  name: string;
  category: ReportExerciseCategory;
  workingSets: number;
  drops: number;
  workingReps: number;
  dropReps: number;
  totalReps: number;
  externalLoadVolumeKg: number;
  bestWeightKg: number | null;
  bestEstimatedOneRepMaxKg: number | null;
};

export type ReportSessionMetrics = {
  sessionId: string;
  name: string;
  workoutDate: string;
  timestamp: number;
  durationSeconds: number | null;
  durationStatus: "known" | "missing" | "invalid";
  workingSets: number;
  drops: number;
  workingReps: number;
  dropReps: number;
  totalReps: number;
  externalLoadVolumeKg: number;
  exerciseKeys: string[];
  exercises: ReportSessionExerciseMetrics[];
  categories: ReportExerciseCategory[];
  hasExcludedRows: boolean;
};

export type ReportDataQuality = {
  activeWorkoutExcluded: boolean;
  activeWorkoutInRange: boolean;
  activeWorkoutHasReportableWork: boolean;
  incompleteWorkingSetRows: number;
  zeroRepWorkingSetRows: number;
  incompleteDropRows: number;
  zeroRepDropRows: number;
  excludedWorkingSetRows: number;
  excludedDropRows: number;
  invalidDropSegments: number;
  partialSessions: number;
  missingDurationSessions: number;
  missingDurationSessionIds: string[];
  invalidDurationSessions: number;
  invalidDurationSessionIds: string[];
  missingEffortWorkingSets: number;
  zeroExternalLoadWorkingSets: number;
  zeroExternalLoadDrops: number;
  unclassifiedWorkingSets: number;
  unclassifiedExerciseKeys: string[];
  exerciseKeyCollisions: string[];
  mixedEffortScales: boolean;
  unsafeExternalLoadVolume: boolean;
  unsafeVolumeSessionIds: string[];
  sparseSessionHistory: boolean;
  modelNotes: {
    negativeLoadUnsupported: true;
    recordedLoadConvention: "as-entered";
    categoryModel: "primary-built-in-only";
  };
};

export type ReportPeriodMetrics = {
  range: ReportDateRange | null;
  savedSessionsInRange: number;
  emptyReason: null | "no-saved-sessions" | "no-completed-work" | "active-workout-excluded";
  totals: ReportTotals;
  sessions: ReportSessionMetrics[];
  exercises: ReportExerciseMetrics[];
  categories: ReportCategoryMetrics[];
  effort: ReportEffortMetrics;
  dataQuality: ReportDataQuality;
};

export type ReportRollingBaseline = {
  alignment: "full-period" | "matched-elapsed-days";
  requestedWindows: number;
  availableWindows: number;
  sparse: boolean;
  ranges: ReportDateRange[];
  periods: ReportPeriodMetrics[];
  median: ReportBaselineTotals | null;
};

export type ReportMetrics = {
  current: ReportPeriodMetrics;
  comparison: ReportPeriodMetrics | null;
  rollingBaseline: ReportRollingBaseline | null;
  highlights: ReportHighlight[];
};

export type ReportMetricsInput = {
  history: readonly WorkoutSession[];
  range: ReportDateRange | null;
  comparisonRange?: ReportDateRange | null;
  baseline?: {
    ranges: readonly ReportDateRange[];
    alignment: "full-period" | "matched-elapsed-days";
  };
  activeWorkout: WorkoutSession | null;
  categoriesByExerciseKey: Readonly<Record<string, ExerciseCategory>>;
  customExerciseKeys: readonly string[];
};

type MutableExerciseMetrics = Omit<ReportExerciseMetrics, "bestRepsAtWeight" | "daysTrained" | "sessionCount"> & {
  bestRepsByWeight: Map<number, number>;
  dates: Set<string>;
  sessionIds: Set<string>;
  latestTimestamp: number;
  latestWorkoutDate: string;
  latestSessionId: string;
};

type MutableCategoryMetrics = Omit<ReportCategoryMetrics, "daysTrained"> & {
  dates: Set<string>;
};

type WorkingSetEvidence = {
  exerciseKey: string;
  name: string;
  sessionId: string;
  setId: string;
  workoutDate: string;
  timestamp: number;
  weightKg: number;
  reps: number;
  estimatedOneRepMaxKg: number | null;
};

type SessionAccumulator = Omit<ReportSessionMetrics, "exerciseKeys" | "exercises" | "categories" | "hasExcludedRows"> & {
  exerciseKeys: Set<string>;
  exercises: Map<string, ReportSessionExerciseMetrics>;
  categories: Set<ReportExerciseCategory>;
  excludedRows: number;
};

type QualityAccumulator = {
  incompleteWorkingSetRows: number;
  zeroRepWorkingSetRows: number;
  incompleteDropRows: number;
  zeroRepDropRows: number;
  excludedWorkingSetRows: number;
  excludedDropRows: number;
  invalidDropSegments: number;
  partialSessions: number;
  missingDurationSessions: number;
  invalidDurationSessions: number;
  missingEffortWorkingSets: number;
  zeroExternalLoadWorkingSets: number;
  zeroExternalLoadDrops: number;
  unclassifiedWorkingSets: number;
  unclassifiedExerciseKeys: Set<string>;
  exerciseKeyCollisions: Set<string>;
  missingDurationSessionIds: Set<string>;
  invalidDurationSessionIds: Set<string>;
  unsafeVolumeSessionIds: Set<string>;
};

const CATEGORY_ORDER: ReportExerciseCategory[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Unclassified",
];

function dateAtNoonUtc(dateKey: string): Date {
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
  const date = dateAtNoonUtc(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKeyFromUtc(date);
}

function monthStart(dateKey: string, monthOffset = 0): string {
  const date = dateAtNoonUtc(dateKey);
  return dateKeyFromUtc(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthOffset, 1, 12)));
}

function monthEnd(dateKey: string, monthOffset = 0): string {
  const date = dateAtNoonUtc(dateKey);
  return dateKeyFromUtc(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthOffset + 1, 0, 12)));
}

function weekStart(dateKey: string): string {
  const date = dateAtNoonUtc(dateKey);
  return addDays(dateKey, -((date.getUTCDay() + 6) % 7));
}

function withinRange(dateKey: string, range: ReportDateRange | null): boolean {
  return range === null || (dateKey >= range.startDate && dateKey <= range.endDate);
}

function median(values: readonly number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function estimatedOneRepMax(weightKg: number, reps: number): number | null {
  if (weightKg <= 0 || reps <= 0 || reps > 12) return null;
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30);
}

function completedForReporting(set: WorkoutSet): boolean {
  return set.completed && set.reps > 0;
}

function laterEvidence(first: WorkingSetEvidence, second: WorkingSetEvidence): WorkingSetEvidence {
  if (second.workoutDate !== first.workoutDate) {
    return second.workoutDate > first.workoutDate ? second : first;
  }
  if (second.timestamp !== first.timestamp) return second.timestamp > first.timestamp ? second : first;
  if (second.sessionId !== first.sessionId) return second.sessionId > first.sessionId ? second : first;
  return second.setId > first.setId ? second : first;
}

function strongerEvidence(
  current: WorkingSetEvidence | undefined,
  candidate: WorkingSetEvidence,
  value: (evidence: WorkingSetEvidence) => number,
): WorkingSetEvidence {
  if (!current) return candidate;
  const currentValue = value(current);
  const candidateValue = value(candidate);
  if (candidateValue !== currentValue) return candidateValue > currentValue ? candidate : current;
  return laterEvidence(current, candidate);
}

function materiallyGreater(current: number, previous: number): boolean {
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(current), Math.abs(previous)) * 4;
  return current - previous > tolerance;
}

function buildReportHighlights(
  history: readonly WorkoutSession[],
  range: ReportDateRange | null,
): ReportHighlight[] {
  if (!range) return [];
  const previousWeight = new Map<string, number>();
  const previousEstimate = new Map<string, number>();
  const previousReps = new Map<string, Map<number, number>>();
  const bestWeight = new Map<string, WorkingSetEvidence>();
  const bestEstimate = new Map<string, WorkingSetEvidence>();
  const bestReps = new Map<string, Map<number, WorkingSetEvidence>>();
  for (const session of history) {
    const isPrevious = session.workoutDate < range.startDate;
    const isCurrent = withinRange(session.workoutDate, range);
    if (!isPrevious && !isCurrent) continue;
    const timestamp = session.finishedAt ?? session.startedAt;
    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        if (set.dropSetOf || !completedForReporting(set)) continue;
        const evidence: WorkingSetEvidence = {
          exerciseKey: exercise.exerciseKey,
          name: exercise.name,
          sessionId: session.id,
          setId: set.id,
          workoutDate: session.workoutDate,
          timestamp,
          weightKg: set.weightKg,
          reps: set.reps,
          estimatedOneRepMaxKg: estimatedOneRepMax(set.weightKg, set.reps),
        };
        if (isPrevious) {
          previousWeight.set(
            evidence.exerciseKey,
            Math.max(previousWeight.get(evidence.exerciseKey) ?? -Infinity, evidence.weightKg),
          );
          if (evidence.estimatedOneRepMaxKg !== null) {
            previousEstimate.set(
              evidence.exerciseKey,
              Math.max(previousEstimate.get(evidence.exerciseKey) ?? -Infinity, evidence.estimatedOneRepMaxKg),
            );
          }
          const previousAtWeight = previousReps.get(evidence.exerciseKey) ?? new Map<number, number>();
          previousAtWeight.set(
            evidence.weightKg,
            Math.max(previousAtWeight.get(evidence.weightKg) ?? 0, evidence.reps),
          );
          previousReps.set(evidence.exerciseKey, previousAtWeight);
          continue;
        }

        bestWeight.set(
          evidence.exerciseKey,
          strongerEvidence(bestWeight.get(evidence.exerciseKey), evidence, (item) => item.weightKg),
        );
        if (evidence.estimatedOneRepMaxKg !== null) {
          bestEstimate.set(
            evidence.exerciseKey,
            strongerEvidence(
              bestEstimate.get(evidence.exerciseKey),
              evidence,
              (item) => item.estimatedOneRepMaxKg ?? -Infinity,
            ),
          );
        }
        const currentAtWeight = bestReps.get(evidence.exerciseKey) ?? new Map<number, WorkingSetEvidence>();
        currentAtWeight.set(
          evidence.weightKg,
          strongerEvidence(currentAtWeight.get(evidence.weightKg), evidence, (item) => item.reps),
        );
        bestReps.set(evidence.exerciseKey, currentAtWeight);
      }
    }
  }

  const highlights: ReportHighlight[] = [];
  for (const [exerciseKey, evidence] of bestWeight) {
    const previousValue = previousWeight.get(exerciseKey);
    if (previousValue !== undefined && materiallyGreater(evidence.weightKg, previousValue)) {
      highlights.push({
        kind: "weight-pr",
        exerciseKey,
        name: evidence.name,
        sessionId: evidence.sessionId,
        setId: evidence.setId,
        workoutDate: evidence.workoutDate,
        weightKg: evidence.weightKg,
        reps: evidence.reps,
        currentValue: evidence.weightKg,
        previousValue,
        delta: evidence.weightKg - previousValue,
      });
    }
  }
  for (const [exerciseKey, repsAtWeight] of bestReps) {
    const previousAtWeight = previousReps.get(exerciseKey);
    if (!previousAtWeight) continue;
    for (const [weightKg, evidence] of repsAtWeight) {
      const previousValue = previousAtWeight.get(weightKg);
      if (previousValue === undefined || evidence.reps <= previousValue) continue;
      highlights.push({
        kind: "rep-at-weight-pr",
        exerciseKey,
        name: evidence.name,
        sessionId: evidence.sessionId,
        setId: evidence.setId,
        workoutDate: evidence.workoutDate,
        weightKg: evidence.weightKg,
        reps: evidence.reps,
        currentValue: evidence.reps,
        previousValue,
        delta: evidence.reps - previousValue,
      });
    }
  }
  for (const [exerciseKey, evidence] of bestEstimate) {
    const currentValue = evidence.estimatedOneRepMaxKg;
    const previousValue = previousEstimate.get(exerciseKey);
    if (currentValue === null || previousValue === undefined || !materiallyGreater(currentValue, previousValue)) continue;
    highlights.push({
      kind: "estimated-1rm-improvement",
      exerciseKey,
      name: evidence.name,
      sessionId: evidence.sessionId,
      setId: evidence.setId,
      workoutDate: evidence.workoutDate,
      weightKg: evidence.weightKg,
      reps: evidence.reps,
      currentValue,
      previousValue,
      delta: currentValue - previousValue,
    });
  }

  const kindOrder: ReportHighlightKind[] = ["weight-pr", "rep-at-weight-pr", "estimated-1rm-improvement"];
  return highlights.sort((first, second) =>
    kindOrder.indexOf(first.kind) - kindOrder.indexOf(second.kind) ||
    first.name.localeCompare(second.name) ||
    first.weightKg - second.weightKg ||
    first.setId.localeCompare(second.setId),
  );
}

function sessionDuration(session: WorkoutSession): Pick<ReportSessionMetrics, "durationSeconds" | "durationStatus"> {
  if (session.finishedAt === undefined) return { durationSeconds: null, durationStatus: "missing" };
  const pausedDurationMs = session.timerPausedDurationMs ?? 0;
  const rawDurationMs = session.finishedAt - session.startedAt;
  if (rawDurationMs < 0 || pausedDurationMs < 0 || pausedDurationMs > rawDurationMs) {
    return { durationSeconds: null, durationStatus: "invalid" };
  }
  return {
    durationSeconds: Math.floor((rawDurationMs - pausedDurationMs) / 1_000),
    durationStatus: "known",
  };
}

function categoryFor(
  exerciseKey: string,
  categoriesByExerciseKey: Readonly<Record<string, ExerciseCategory>>,
  customExerciseKeys: ReadonlySet<string>,
): ReportExerciseCategory {
  if (customExerciseKeys.has(exerciseKey)) return "Unclassified";
  return Object.hasOwn(categoriesByExerciseKey, exerciseKey)
    ? categoriesByExerciseKey[exerciseKey]
    : "Unclassified";
}

function createQualityAccumulator(): QualityAccumulator {
  return {
    incompleteWorkingSetRows: 0,
    zeroRepWorkingSetRows: 0,
    incompleteDropRows: 0,
    zeroRepDropRows: 0,
    excludedWorkingSetRows: 0,
    excludedDropRows: 0,
    invalidDropSegments: 0,
    partialSessions: 0,
    missingDurationSessions: 0,
    invalidDurationSessions: 0,
    missingEffortWorkingSets: 0,
    zeroExternalLoadWorkingSets: 0,
    zeroExternalLoadDrops: 0,
    unclassifiedWorkingSets: 0,
    unclassifiedExerciseKeys: new Set<string>(),
    exerciseKeyCollisions: new Set<string>(),
    missingDurationSessionIds: new Set<string>(),
    invalidDurationSessionIds: new Set<string>(),
    unsafeVolumeSessionIds: new Set<string>(),
  };
}

function createSessionAccumulator(session: WorkoutSession): SessionAccumulator {
  const duration = sessionDuration(session);
  return {
    sessionId: session.id,
    name: session.name,
    workoutDate: session.workoutDate,
    timestamp: session.finishedAt ?? session.startedAt,
    ...duration,
    workingSets: 0,
    drops: 0,
    workingReps: 0,
    dropReps: 0,
    totalReps: 0,
    externalLoadVolumeKg: 0,
    exerciseKeys: new Set<string>(),
    exercises: new Map<string, ReportSessionExerciseMetrics>(),
    categories: new Set<ReportExerciseCategory>(),
    excludedRows: 0,
  };
}

function sessionExerciseMetrics(
  existing: ReportSessionExerciseMetrics | undefined,
  exercise: WorkoutExercise,
  category: ReportExerciseCategory,
): ReportSessionExerciseMetrics {
  return existing ?? {
    exerciseKey: exercise.exerciseKey,
    name: exercise.name,
    category,
    workingSets: 0,
    drops: 0,
    workingReps: 0,
    dropReps: 0,
    totalReps: 0,
    externalLoadVolumeKg: 0,
    bestWeightKg: null,
    bestEstimatedOneRepMaxKg: null,
  };
}

function addWorkingSet(
  accumulator: SessionAccumulator,
  set: WorkoutSet,
): void {
  accumulator.workingSets += 1;
  accumulator.workingReps += set.reps;
  accumulator.totalReps += set.reps;
  accumulator.externalLoadVolumeKg += set.weightKg * set.reps;
}

function addDrop(
  accumulator: SessionAccumulator,
  set: WorkoutSet,
): void {
  accumulator.drops += 1;
  accumulator.dropReps += set.reps;
  accumulator.totalReps += set.reps;
  accumulator.externalLoadVolumeKg += set.weightKg * set.reps;
}

function addWorkingSetToSessionExercise(metrics: ReportSessionExerciseMetrics, set: WorkoutSet): void {
  metrics.workingSets += 1;
  metrics.workingReps += set.reps;
  metrics.totalReps += set.reps;
  metrics.externalLoadVolumeKg += set.weightKg * set.reps;
  metrics.bestWeightKg = Math.max(metrics.bestWeightKg ?? -Infinity, set.weightKg);
  const estimate = estimatedOneRepMax(set.weightKg, set.reps);
  if (estimate !== null) {
    metrics.bestEstimatedOneRepMaxKg = Math.max(metrics.bestEstimatedOneRepMaxKg ?? -Infinity, estimate);
  }
}

function addDropToSessionExercise(metrics: ReportSessionExerciseMetrics, set: WorkoutSet): void {
  metrics.drops += 1;
  metrics.dropReps += set.reps;
  metrics.totalReps += set.reps;
  metrics.externalLoadVolumeKg += set.weightKg * set.reps;
}

function structurallyValidDrop(
  set: WorkoutSet,
  activeRootId: string | undefined,
  roots: ReadonlyMap<string, WorkoutSet>,
  previous: WorkoutSet | undefined,
): boolean {
  if (!set.dropSetOf || activeRootId !== set.dropSetOf) return false;
  const root = roots.get(set.dropSetOf);
  if (!root || root.dropSetOf || !completedForReporting(root) || !previous || !completedForReporting(previous)) return false;
  if ((previous.dropSetOf ?? previous.id) !== set.dropSetOf) return false;
  return previous.weightKg === 0
    ? set.weightKg === 0
    : set.weightKg < previous.weightKg;
}

function exerciseMetrics(
  existing: MutableExerciseMetrics | undefined,
  exercise: WorkoutExercise,
  category: ReportExerciseCategory,
  session: WorkoutSession,
): MutableExerciseMetrics {
  if (existing) {
    const timestamp = session.finishedAt ?? session.startedAt;
    if (session.workoutDate > existing.latestWorkoutDate ||
      (session.workoutDate === existing.latestWorkoutDate && timestamp > existing.latestTimestamp) ||
      (session.workoutDate === existing.latestWorkoutDate && timestamp === existing.latestTimestamp &&
        session.id.localeCompare(existing.latestSessionId) > 0)) {
      existing.name = exercise.name;
      existing.latestTimestamp = timestamp;
      existing.latestWorkoutDate = session.workoutDate;
      existing.latestSessionId = session.id;
    }
    return existing;
  }
  return {
    exerciseKey: exercise.exerciseKey,
    name: exercise.name,
    category,
    workingSets: 0,
    drops: 0,
    workingReps: 0,
    dropReps: 0,
    totalReps: 0,
    externalLoadVolumeKg: 0,
    bestWeightKg: null,
    bestEstimatedOneRepMaxKg: null,
    bestRepsByWeight: new Map<number, number>(),
    dates: new Set<string>(),
    sessionIds: new Set<string>(),
    latestTimestamp: session.finishedAt ?? session.startedAt,
    latestWorkoutDate: session.workoutDate,
    latestSessionId: session.id,
  };
}

function categoryMetrics(
  existing: MutableCategoryMetrics | undefined,
  category: ReportExerciseCategory,
): MutableCategoryMetrics {
  return existing ?? {
    category,
    workingSets: 0,
    drops: 0,
    workingReps: 0,
    dropReps: 0,
    totalReps: 0,
    externalLoadVolumeKg: 0,
    dates: new Set<string>(),
  };
}

function addWorkingSetToExercise(metrics: MutableExerciseMetrics, set: WorkoutSet): void {
  metrics.workingSets += 1;
  metrics.workingReps += set.reps;
  metrics.totalReps += set.reps;
  metrics.externalLoadVolumeKg += set.weightKg * set.reps;
  metrics.bestWeightKg = Math.max(metrics.bestWeightKg ?? -Infinity, set.weightKg);
  const estimate = estimatedOneRepMax(set.weightKg, set.reps);
  if (estimate !== null) {
    metrics.bestEstimatedOneRepMaxKg = Math.max(metrics.bestEstimatedOneRepMaxKg ?? -Infinity, estimate);
  }
  metrics.bestRepsByWeight.set(set.weightKg, Math.max(metrics.bestRepsByWeight.get(set.weightKg) ?? 0, set.reps));
}

function addDropToExercise(metrics: MutableExerciseMetrics, set: WorkoutSet): void {
  metrics.drops += 1;
  metrics.dropReps += set.reps;
  metrics.totalReps += set.reps;
  metrics.externalLoadVolumeKg += set.weightKg * set.reps;
}

function addWorkingSetToCategory(metrics: MutableCategoryMetrics, set: WorkoutSet): void {
  metrics.workingSets += 1;
  metrics.workingReps += set.reps;
  metrics.totalReps += set.reps;
  metrics.externalLoadVolumeKg += set.weightKg * set.reps;
}

function addDropToCategory(metrics: MutableCategoryMetrics, set: WorkoutSet): void {
  metrics.drops += 1;
  metrics.dropReps += set.reps;
  metrics.totalReps += set.reps;
  metrics.externalLoadVolumeKg += set.weightKg * set.reps;
}

function aggregatePeriod(
  history: readonly WorkoutSession[],
  range: ReportDateRange | null,
  categoriesByExerciseKey: Readonly<Record<string, ExerciseCategory>>,
  customExerciseKeys: ReadonlySet<string>,
  activeWorkoutInRange: boolean,
  activeWorkoutHasReportableWork: boolean,
): ReportPeriodMetrics {
  const exercises = new Map<string, MutableExerciseMetrics>();
  const categories = new Map<ReportExerciseCategory, MutableCategoryMetrics>();
  const sessions: ReportSessionMetrics[] = [];
  const effortValues = { rpe: [] as number[], rir: [] as number[] };
  const quality = createQualityAccumulator();

  const savedSessionsInRange = history.filter((session) => withinRange(session.workoutDate, range)).length;

  history.forEach((session) => {
    if (!withinRange(session.workoutDate, range)) return;
    const sessionMetrics = createSessionAccumulator(session);

    for (const exercise of session.exercises) {
      const category = categoryFor(exercise.exerciseKey, categoriesByExerciseKey, customExerciseKeys);
      const roots = new Map<string, WorkoutSet>();
      let activeRootId: string | undefined;
      let previous: WorkoutSet | undefined;
      let dropChainValid = true;
      let mutableExercise = exercises.get(exercise.exerciseKey);
      let mutableCategory = categories.get(category);
      let mutableSessionExercise = sessionMetrics.exercises.get(exercise.exerciseKey);

      for (const set of exercise.sets) {
        if (!set.dropSetOf) {
          roots.set(set.id, set);
          activeRootId = set.id;
          dropChainValid = true;
          if (!completedForReporting(set)) {
            quality.excludedWorkingSetRows += 1;
            if (!set.completed) quality.incompleteWorkingSetRows += 1;
            else quality.zeroRepWorkingSetRows += 1;
            sessionMetrics.excludedRows += 1;
            previous = set;
            continue;
          }

          mutableExercise = exerciseMetrics(mutableExercise, exercise, category, session);
          mutableCategory = categoryMetrics(mutableCategory, category);
          mutableSessionExercise = sessionExerciseMetrics(mutableSessionExercise, exercise, category);
          addWorkingSet(sessionMetrics, set);
          addWorkingSetToSessionExercise(mutableSessionExercise, set);
          addWorkingSetToExercise(mutableExercise, set);
          addWorkingSetToCategory(mutableCategory, set);
          mutableExercise.dates.add(session.workoutDate);
          mutableExercise.sessionIds.add(session.id);
          mutableCategory.dates.add(session.workoutDate);
          sessionMetrics.exerciseKeys.add(exercise.exerciseKey);
          sessionMetrics.categories.add(category);

          if (set.effort) effortValues[set.effort.scale].push(set.effort.value);
          else quality.missingEffortWorkingSets += 1;
          if (set.weightKg === 0) quality.zeroExternalLoadWorkingSets += 1;
          if (category === "Unclassified") {
            quality.unclassifiedWorkingSets += 1;
            quality.unclassifiedExerciseKeys.add(exercise.exerciseKey);
            if (customExerciseKeys.has(exercise.exerciseKey) &&
              Object.hasOwn(categoriesByExerciseKey, exercise.exerciseKey)) {
              quality.exerciseKeyCollisions.add(exercise.exerciseKey);
            }
          }
          previous = set;
          continue;
        }

        if (!completedForReporting(set)) {
          quality.excludedDropRows += 1;
          if (!set.completed) quality.incompleteDropRows += 1;
          else quality.zeroRepDropRows += 1;
          sessionMetrics.excludedRows += 1;
          dropChainValid = false;
          previous = set;
          continue;
        }
        if (!dropChainValid || !structurallyValidDrop(set, activeRootId, roots, previous)) {
          quality.excludedDropRows += 1;
          quality.invalidDropSegments += 1;
          sessionMetrics.excludedRows += 1;
          dropChainValid = false;
          previous = set;
          continue;
        }

        mutableExercise = exerciseMetrics(mutableExercise, exercise, category, session);
        mutableCategory = categoryMetrics(mutableCategory, category);
        mutableSessionExercise = sessionExerciseMetrics(mutableSessionExercise, exercise, category);
        addDrop(sessionMetrics, set);
        addDropToSessionExercise(mutableSessionExercise, set);
        addDropToExercise(mutableExercise, set);
        addDropToCategory(mutableCategory, set);
        mutableExercise.dates.add(session.workoutDate);
        mutableExercise.sessionIds.add(session.id);
        mutableCategory.dates.add(session.workoutDate);
        sessionMetrics.exerciseKeys.add(exercise.exerciseKey);
        sessionMetrics.categories.add(category);
        if (set.weightKg === 0) quality.zeroExternalLoadDrops += 1;
        previous = set;
      }

      if (mutableExercise) exercises.set(exercise.exerciseKey, mutableExercise);
      if (mutableCategory) categories.set(category, mutableCategory);
      if (mutableSessionExercise) sessionMetrics.exercises.set(exercise.exerciseKey, mutableSessionExercise);
    }

    if (sessionMetrics.workingSets === 0) return;
    if (sessionMetrics.durationStatus === "missing") {
      quality.missingDurationSessions += 1;
      quality.missingDurationSessionIds.add(session.id);
    } else if (sessionMetrics.durationStatus === "invalid") {
      quality.invalidDurationSessions += 1;
      quality.invalidDurationSessionIds.add(session.id);
    }
    if (sessionMetrics.excludedRows > 0) quality.partialSessions += 1;
    if (!Number.isFinite(sessionMetrics.externalLoadVolumeKg) ||
      Math.abs(sessionMetrics.externalLoadVolumeKg) > Number.MAX_SAFE_INTEGER) {
      quality.unsafeVolumeSessionIds.add(session.id);
    }
    const reportSessionExercises = [...sessionMetrics.exercises.values()].sort((first, second) =>
      first.exerciseKey.localeCompare(second.exerciseKey) || first.name.localeCompare(second.name),
    );
    sessions.push({
      ...sessionMetrics,
      exerciseKeys: [...sessionMetrics.exerciseKeys],
      exercises: reportSessionExercises,
      categories: [...sessionMetrics.categories].sort(
        (first, second) => CATEGORY_ORDER.indexOf(first) - CATEGORY_ORDER.indexOf(second),
      ),
      hasExcludedRows: sessionMetrics.excludedRows > 0,
    });
  });

  sessions.sort((first, second) =>
    first.workoutDate.localeCompare(second.workoutDate) ||
    first.timestamp - second.timestamp ||
    first.sessionId.localeCompare(second.sessionId),
  );

  const reportExercises: ReportExerciseMetrics[] = [...exercises.values()]
    .filter((exercise) => exercise.workingSets > 0)
    .map((exercise) => ({
      exerciseKey: exercise.exerciseKey,
      name: exercise.name,
      category: exercise.category,
      sessionCount: exercise.sessionIds.size,
      daysTrained: exercise.dates.size,
      workingSets: exercise.workingSets,
      drops: exercise.drops,
      workingReps: exercise.workingReps,
      dropReps: exercise.dropReps,
      totalReps: exercise.totalReps,
      externalLoadVolumeKg: exercise.externalLoadVolumeKg,
      bestWeightKg: exercise.bestWeightKg,
      bestEstimatedOneRepMaxKg: exercise.bestEstimatedOneRepMaxKg,
      bestRepsAtWeight: [...exercise.bestRepsByWeight.entries()]
        .map(([weightKg, reps]) => ({ weightKg, reps }))
        .sort((first, second) => second.weightKg - first.weightKg),
    }))
    .sort((first, second) =>
      second.workingSets - first.workingSets ||
      second.externalLoadVolumeKg - first.externalLoadVolumeKg ||
      first.name.localeCompare(second.name) ||
      first.exerciseKey.localeCompare(second.exerciseKey),
    );

  const reportCategories: ReportCategoryMetrics[] = [...categories.values()]
    .filter((category) => category.workingSets > 0)
    .map((category) => ({
      category: category.category,
      daysTrained: category.dates.size,
      workingSets: category.workingSets,
      drops: category.drops,
      workingReps: category.workingReps,
      dropReps: category.dropReps,
      totalReps: category.totalReps,
      externalLoadVolumeKg: category.externalLoadVolumeKg,
    }))
    .sort((first, second) => CATEGORY_ORDER.indexOf(first.category) - CATEGORY_ORDER.indexOf(second.category));

  const recordedDurationSessions = sessions.filter((session) => session.durationSeconds !== null);
  const totalDurationSeconds = recordedDurationSessions.reduce(
    (total, session) => total + (session.durationSeconds ?? 0),
    0,
  );
  const totals: ReportTotals = {
    sessions: sessions.length,
    daysTrained: new Set(sessions.map((session) => session.workoutDate)).size,
    workingSets: sessions.reduce((total, session) => total + session.workingSets, 0),
    drops: sessions.reduce((total, session) => total + session.drops, 0),
    workingReps: sessions.reduce((total, session) => total + session.workingReps, 0),
    dropReps: sessions.reduce((total, session) => total + session.dropReps, 0),
    totalReps: sessions.reduce((total, session) => total + session.totalReps, 0),
    externalLoadVolumeKg: sessions.reduce((total, session) => total + session.externalLoadVolumeKg, 0),
    durationSeconds: totalDurationSeconds,
    measuredDurationSessions: recordedDurationSessions.length,
    unmeasuredDurationSessions: sessions.length - recordedDurationSessions.length,
    averageSessionDurationSeconds: recordedDurationSessions.length
      ? Math.round(totalDurationSeconds / recordedDurationSessions.length)
      : null,
  };
  const recordedEffortWorkingSets = effortValues.rpe.length + effortValues.rir.length;
  const unsafeExternalLoadVolume = !Number.isFinite(totals.externalLoadVolumeKg) ||
    Math.abs(totals.externalLoadVolumeKg) > Number.MAX_SAFE_INTEGER;
  if (unsafeExternalLoadVolume) {
    for (const session of sessions) {
      if (session.externalLoadVolumeKg !== 0) quality.unsafeVolumeSessionIds.add(session.sessionId);
    }
  }

  return {
    range: range ? { ...range } : null,
    savedSessionsInRange,
    emptyReason: sessions.length
      ? null
      : activeWorkoutHasReportableWork
        ? "active-workout-excluded"
        : savedSessionsInRange
          ? "no-completed-work"
          : "no-saved-sessions",
    totals,
    sessions,
    exercises: reportExercises,
    categories: reportCategories,
    effort: {
      recordedWorkingSets: recordedEffortWorkingSets,
      unrecordedWorkingSets: totals.workingSets - recordedEffortWorkingSets,
      rpe: { recordedWorkingSets: effortValues.rpe.length, median: median(effortValues.rpe) },
      rir: { recordedWorkingSets: effortValues.rir.length, median: median(effortValues.rir) },
    },
    dataQuality: {
      activeWorkoutExcluded: activeWorkoutHasReportableWork,
      activeWorkoutInRange,
      activeWorkoutHasReportableWork,
      incompleteWorkingSetRows: quality.incompleteWorkingSetRows,
      zeroRepWorkingSetRows: quality.zeroRepWorkingSetRows,
      incompleteDropRows: quality.incompleteDropRows,
      zeroRepDropRows: quality.zeroRepDropRows,
      excludedWorkingSetRows: quality.excludedWorkingSetRows,
      excludedDropRows: quality.excludedDropRows,
      invalidDropSegments: quality.invalidDropSegments,
      partialSessions: quality.partialSessions,
      missingDurationSessions: quality.missingDurationSessions,
      missingDurationSessionIds: [...quality.missingDurationSessionIds].sort(),
      invalidDurationSessions: quality.invalidDurationSessions,
      invalidDurationSessionIds: [...quality.invalidDurationSessionIds].sort(),
      missingEffortWorkingSets: quality.missingEffortWorkingSets,
      zeroExternalLoadWorkingSets: quality.zeroExternalLoadWorkingSets,
      zeroExternalLoadDrops: quality.zeroExternalLoadDrops,
      unclassifiedWorkingSets: quality.unclassifiedWorkingSets,
      unclassifiedExerciseKeys: [...quality.unclassifiedExerciseKeys].sort(),
      exerciseKeyCollisions: [...quality.exerciseKeyCollisions].sort(),
      mixedEffortScales: effortValues.rpe.length > 0 && effortValues.rir.length > 0,
      unsafeExternalLoadVolume,
      unsafeVolumeSessionIds: [...quality.unsafeVolumeSessionIds].sort(),
      sparseSessionHistory: sessions.length === 1,
      modelNotes: {
        negativeLoadUnsupported: true,
        recordedLoadConvention: "as-entered",
        categoryModel: "primary-built-in-only",
      },
    },
  };
}

function medianTotals(periods: readonly ReportPeriodMetrics[]): ReportBaselineTotals {
  const value = <Key extends keyof ReportTotals>(key: Key): number =>
    median(periods.map((period) => period.totals[key]).filter((item): item is number => item !== null)) ?? 0;
  const averageDurations = periods
    .map((period) => period.totals.averageSessionDurationSeconds)
    .filter((item): item is number => item !== null);
  const reliableDurationTotals = periods
    .filter((period) => period.totals.unmeasuredDurationSessions === 0)
    .map((period) => period.totals.durationSeconds);
  return {
    sessions: value("sessions"),
    daysTrained: value("daysTrained"),
    workingSets: value("workingSets"),
    drops: value("drops"),
    workingReps: value("workingReps"),
    dropReps: value("dropReps"),
    totalReps: value("totalReps"),
    externalLoadVolumeKg: value("externalLoadVolumeKg"),
    durationSeconds: median(reliableDurationTotals),
    measuredDurationSessions: value("measuredDurationSessions"),
    unmeasuredDurationSessions: value("unmeasuredDurationSessions"),
    averageSessionDurationSeconds: median(averageDurations),
  };
}

function activeWorkoutHasReportableWork(
  activeWorkout: WorkoutSession | null | undefined,
  range: ReportDateRange | null,
): boolean {
  if (!activeWorkout || !withinRange(activeWorkout.workoutDate, range)) return false;
  return activeWorkout.exercises.some((exercise) =>
    exercise.sets.some((set) => !set.dropSetOf && completedForReporting(set)),
  );
}

function firstReportableWorkoutDate(history: readonly WorkoutSession[]): string | null {
  const dates = history
    .filter((session) => session.exercises.some((exercise) =>
      exercise.sets.some((set) => !set.dropSetOf && completedForReporting(set)),
    ))
    .map((session) => session.workoutDate)
    .sort();
  return dates[0] ?? null;
}

export function liveReportRanges(
  referenceDateKey: string,
  cadence: ReportCadence,
): { currentRange: ReportDateRange; comparisonRange: ReportDateRange } {
  if (cadence === "week") {
    const startDate = weekStart(referenceDateKey);
    return {
      currentRange: { startDate, endDate: referenceDateKey },
      comparisonRange: { startDate: addDays(startDate, -7), endDate: addDays(referenceDateKey, -7) },
    };
  }

  const currentStart = monthStart(referenceDateKey);
  const previousStart = monthStart(referenceDateKey, -1);
  const elapsedDay = dateAtNoonUtc(referenceDateKey).getUTCDate();
  const previousEnd = monthEnd(referenceDateKey, -1);
  const previousMonthDays = dateAtNoonUtc(previousEnd).getUTCDate();
  return {
    currentRange: { startDate: currentStart, endDate: referenceDateKey },
    comparisonRange: {
      startDate: previousStart,
      endDate: addDays(previousStart, Math.min(elapsedDay, previousMonthDays) - 1),
    },
  };
}

export function completedReportRanges(
  dateInPeriod: string,
  cadence: ReportCadence,
): { currentRange: ReportDateRange; comparisonRange: ReportDateRange } {
  if (cadence === "week") {
    const startDate = weekStart(dateInPeriod);
    return {
      currentRange: { startDate, endDate: addDays(startDate, 6) },
      comparisonRange: { startDate: addDays(startDate, -7), endDate: addDays(startDate, -1) },
    };
  }
  return {
    currentRange: { startDate: monthStart(dateInPeriod), endDate: monthEnd(dateInPeriod) },
    comparisonRange: { startDate: monthStart(dateInPeriod, -1), endDate: monthEnd(dateInPeriod, -1) },
  };
}

export function rollingReportRanges(
  dateInCurrentPeriod: string,
  cadence: ReportCadence,
  count: number,
  alignment: "full-period" | "matched-elapsed-days" = "full-period",
): ReportDateRange[] {
  const safeCount = Number.isInteger(count) ? Math.max(0, count) : 0;
  if (cadence === "week") {
    const currentStart = weekStart(dateInCurrentPeriod);
    return Array.from({ length: safeCount }, (_, index) => {
      const offset = safeCount - index;
      const startDate = addDays(currentStart, -7 * offset);
      const elapsedDays = alignment === "matched-elapsed-days"
        ? Math.max(1, Math.round((dateAtNoonUtc(dateInCurrentPeriod).getTime() - dateAtNoonUtc(currentStart).getTime()) / 86_400_000) + 1)
        : 7;
      return { startDate, endDate: addDays(startDate, elapsedDays - 1) };
    });
  }
  return Array.from({ length: safeCount }, (_, index) => {
    const offset = -(safeCount - index);
    const startDate = monthStart(dateInCurrentPeriod, offset);
    const endDate = alignment === "matched-elapsed-days"
      ? addDays(
        startDate,
        Math.min(
          dateAtNoonUtc(dateInCurrentPeriod).getUTCDate(),
          dateAtNoonUtc(monthEnd(dateInCurrentPeriod, offset)).getUTCDate(),
        ) - 1,
      )
      : monthEnd(dateInCurrentPeriod, offset);
    return { startDate, endDate };
  });
}

export function rollingReportBaseline(
  dateInCurrentPeriod: string,
  cadence: ReportCadence,
  count: number,
  alignment: "full-period" | "matched-elapsed-days",
): NonNullable<ReportMetricsInput["baseline"]> {
  return {
    alignment,
    ranges: rollingReportRanges(dateInCurrentPeriod, cadence, count, alignment),
  };
}

export function deriveReportMetrics({
  history,
  range,
  comparisonRange = null,
  baseline,
  activeWorkout = null,
  categoriesByExerciseKey = {},
  customExerciseKeys = [],
}: ReportMetricsInput): ReportMetrics {
  const baselineRanges = baseline?.ranges ?? [];
  const customKeySet = new Set(customExerciseKeys);
  const activeWorkoutInRange = Boolean(activeWorkout && withinRange(activeWorkout.workoutDate, range));
  const activeHasReportableWork = activeWorkoutHasReportableWork(activeWorkout, range);
  const current = aggregatePeriod(
    history,
    range,
    categoriesByExerciseKey,
    customKeySet,
    activeWorkoutInRange,
    activeHasReportableWork,
  );
  const comparison = comparisonRange
    ? aggregatePeriod(history, comparisonRange, categoriesByExerciseKey, customKeySet, false, false)
    : null;
  const firstWorkoutDate = firstReportableWorkoutDate(history);
  const availableBaselineRanges = baselineRanges.filter((baselineRange) =>
    firstWorkoutDate !== null && baselineRange.startDate >= firstWorkoutDate,
  );
  const periods = availableBaselineRanges.map((baselineRange) =>
    aggregatePeriod(history, baselineRange, categoriesByExerciseKey, customKeySet, false, false),
  );
  return {
    current,
    comparison,
    rollingBaseline: baselineRanges.length
      ? {
        alignment: baseline?.alignment ?? "full-period",
        requestedWindows: baselineRanges.length,
        availableWindows: periods.length,
        sparse: periods.length < baselineRanges.length,
        ranges: availableBaselineRanges.map((item) => ({ ...item })),
        periods,
        median: periods.length ? medianTotals(periods) : null,
      }
      : null,
    highlights: buildReportHighlights(history, range),
  };
}
