import { isCompletedTrackedSet } from "./exercise-tracking";
import type { ExerciseCategory } from "./exercises";
import type { WorkoutSession } from "./storage";
import { weekRange } from "./weeklyReview";

export const WEEKLY_COVERAGE_CATEGORIES = ["Legs", "Arms", "Back", "Chest", "Cardio"] as const;
export type WeeklyCoverageCategory = typeof WEEKLY_COVERAGE_CATEGORIES[number];

export type WeeklyCoverageDay = {
  dateKey: string;
  isToday: boolean;
  isFuture: boolean;
  sessionIds: string[];
  categories: WeeklyCoverageCategory[];
};

export type WeeklyCoverageGoal = {
  category: WeeklyCoverageCategory;
  sessionCount: number;
  completed: boolean;
};

export type WeeklyCoverage = {
  startDate: string;
  endDate: string;
  days: WeeklyCoverageDay[];
  goals: WeeklyCoverageGoal[];
  completedGoalCount: number;
  completedSessions: number;
  /** Sessions containing completed work whose primary category is unknown. */
  unclassifiedSessionCount: number;
};

export type WeeklyCoverageInput = {
  history: readonly WorkoutSession[];
  /** The user's local calendar date, rather than a UTC timestamp. */
  referenceDateKey: string;
  categoriesByExerciseKey: Readonly<Record<string, ExerciseCategory>>;
  customExerciseKeys?: readonly string[];
  activeWorkoutId?: string;
};

function validDateKey(dateKey: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === dateKey;
}

function addDays(dateKey: string, count: number): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

/**
 * Read-only weekly coverage, using the same valid working-set rule as reports.
 * History membership marks a saved workout: legacy records need not have a
 * finishedAt timestamp. Drops cannot complete an exercise on their own. The
 * current schema has no warm-up marker, so weights/names never imply one.
 */
export function buildWeeklyCoverage({
  history,
  referenceDateKey,
  categoriesByExerciseKey,
  customExerciseKeys = [],
  activeWorkoutId,
}: WeeklyCoverageInput): WeeklyCoverage {
  if (!validDateKey(referenceDateKey)) throw new RangeError("A valid local reference date is required.");

  const { startDate, endDate } = weekRange(referenceDateKey);
  const days: WeeklyCoverageDay[] = Array.from({ length: 7 }, (_, index) => {
    const dateKey = addDays(startDate, index);
    return { dateKey, isToday: dateKey === referenceDateKey, isFuture: dateKey > referenceDateKey, sessionIds: [], categories: [] };
  });
  const daysByDate = new Map(days.map((day) => [day.dateKey, day]));
  const customKeys = new Set(customExerciseKeys);
  const seenSessionIds = new Set<string>();
  const sessionCounts = new Map<WeeklyCoverageCategory, number>();
  let unclassifiedSessionCount = 0;
  let completedSessions = 0;

  for (const session of history) {
    if (session.id === activeWorkoutId || seenSessionIds.has(session.id)) continue;
    // Valid storage guarantees unique IDs; defensively keep the first saved copy.
    seenSessionIds.add(session.id);
    const day = daysByDate.get(session.workoutDate);
    if (!day || day.isFuture) continue;

    let hasCompletedWork = false;
    let hasUnclassifiedWork = false;
    const coveredCategories = new Set<WeeklyCoverageCategory>();
    for (const exercise of session.exercises) {
      if (!exercise.sets.some((set) => !set.dropSetOf && isCompletedTrackedSet(set, exercise))) continue;
      hasCompletedWork = true;
      const category = !customKeys.has(exercise.exerciseKey) && Object.hasOwn(categoriesByExerciseKey, exercise.exerciseKey)
        ? categoriesByExerciseKey[exercise.exerciseKey]
        : undefined;
      if (!category) {
        hasUnclassifiedWork = true;
      } else if (WEEKLY_COVERAGE_CATEGORIES.some((goal) => goal === category)) {
        coveredCategories.add(category as WeeklyCoverageCategory);
      }
    }
    if (!hasCompletedWork) continue;

    completedSessions += 1;
    if (hasUnclassifiedWork) unclassifiedSessionCount += 1;
    day.sessionIds.push(session.id);
    for (const category of coveredCategories) {
      sessionCounts.set(category, (sessionCounts.get(category) ?? 0) + 1);
      if (!day.categories.includes(category)) day.categories.push(category);
    }
  }

  // Keep presentation stable when History is sorted or imported in a new order.
  for (const day of days) {
    day.sessionIds.sort();
    day.categories = WEEKLY_COVERAGE_CATEGORIES.filter((category) => day.categories.includes(category));
  }
  const goals = WEEKLY_COVERAGE_CATEGORIES.map((category) => {
    const sessionCount = sessionCounts.get(category) ?? 0;
    return { category, sessionCount, completed: sessionCount >= 1 };
  });
  return {
    startDate,
    endDate,
    days,
    goals,
    completedGoalCount: goals.filter((goal) => goal.completed).length,
    completedSessions,
    unclassifiedSessionCount,
  };
}
