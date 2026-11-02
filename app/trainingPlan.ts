import { isCompletedTrackedSet } from "./exercise-tracking";
import type { Routine, WorkoutSession } from "./storage";

/**
 * Day-by-day "what do I train today" for an upper/lower split with fixed slot
 * days. The rules (Tore's skipped-day rules, Nov 2026):
 * 1. A slot day trains its type; A/B alternate within each type.
 * 2. Never double up or skip; a missed session waits for its type.
 * 3. Make-up: a type whose slot day passed with no training at all may be made
 *    up on the next trainable day, if it has gone longer than the planned type.
 *    Fri ("makeup") is the only non-slot make-up day.
 * 4. Never the same type on back-to-back days.
 * 5. No lower on a sport day, or on the day before one unless it is a lower
 *    slot (then train with 2-3 reps in reserve).
 * 6. 8+ days since a type was trained: start at ~90% of last weights.
 */

export type PlanType = "lower" | "upper";
export type PlanDayRole = PlanType | "makeup" | "sport" | "rest";

export type TrainingPlan = {
  /** Template ids in A, B, ... order. */
  lower: string[];
  upper: string[];
  /** Role per weekday, index 0 = Sunday. */
  days: PlanDayRole[];
};

export const PLAN_DAY_ROLES: PlanDayRole[] = ["lower", "upper", "makeup", "sport", "rest"];
/** Sun upper, Mon lower, Tue volleyball, Wed upper, Thu volleyball, Fri make-up, Sat lower. */
export const DEFAULT_PLAN_DAYS: PlanDayRole[] = ["upper", "lower", "sport", "upper", "sport", "makeup", "lower"];
const MISSED_SLOT_LOOKBACK_DAYS = 14;
const LONG_BREAK_DAYS = 8;

export type PlanSession = { date: string; type: PlanType; routineId: string };

export type DaySuggestion = {
  date: string;
  kind: "train" | "rest" | "done";
  type?: PlanType;
  routineId?: string;
  reason: string;
  notes: string[];
};

function dateAtNoonUtc(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function addDays(dateKey: string, days: number): string {
  const date = dateAtNoonUtc(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weekday(dateKey: string): number {
  return dateAtNoonUtc(dateKey).getUTCDay();
}

function daysBetween(from: string, to: string): number {
  return Math.round((dateAtNoonUtc(to).getTime() - dateAtNoonUtc(from).getTime()) / 86_400_000);
}

export function validTrainingPlan(value: unknown): value is TrainingPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<TrainingPlan>;
  const ids = (list: unknown) => Array.isArray(list) && list.length <= 10 &&
    list.every((id) => typeof id === "string" && id.trim().length > 0);
  return ids(plan.lower) && ids(plan.upper) && Array.isArray(plan.days) && plan.days.length === 7 &&
    plan.days.every((role) => PLAN_DAY_ROLES.includes(role));
}

/** Drop templates that no longer exist; a plan needs at least one template of each type. */
export function usablePlan(plan: TrainingPlan | undefined, routines: readonly Routine[]): TrainingPlan | null {
  if (!plan) return null;
  const exists = new Set(routines.map((routine) => routine.id));
  const lower = plan.lower.filter((id) => exists.has(id));
  const upper = plan.upper.filter((id) => exists.has(id));
  return lower.length && upper.length ? { ...plan, lower, upper } : null;
}

/** Finished workouts started from a plan template, oldest first. */
export function planSessions(history: readonly WorkoutSession[], plan: TrainingPlan): PlanSession[] {
  return history.flatMap((session) => {
    const routineId = session.sourceRoutineId;
    if (!routineId) return [];
    const type: PlanType | null = plan.lower.includes(routineId) ? "lower" : plan.upper.includes(routineId) ? "upper" : null;
    const trained = session.exercises.some((exercise) => exercise.sets.some((set) => !set.dropSetOf && isCompletedTrackedSet(set, exercise)));
    return type && trained ? [{ date: session.workoutDate, type, routineId }] : [];
  }).sort((first, second) => first.date.localeCompare(second.date));
}

function nextRoutineOfType(plan: TrainingPlan, type: PlanType, sessions: readonly PlanSession[]): string {
  const list = plan[type];
  const last = sessions.filter((session) => session.type === type).at(-1);
  const index = last ? list.indexOf(last.routineId) : -1;
  return list[(index + 1) % list.length];
}

/** Suggest one day from the sessions done before it (and on it, for "done"). */
export function suggestDay(plan: TrainingPlan, sessions: readonly PlanSession[], date: string): DaySuggestion {
  const today = sessions.filter((session) => session.date === date);
  if (today.length) {
    const last = today.at(-1)!;
    return { date, kind: "done", type: last.type, routineId: last.routineId, reason: "Done", notes: [] };
  }
  const before = sessions.filter((session) => session.date < date);
  const role = plan.days[weekday(date)];
  const nextRole = plan.days[weekday(addDays(date, 1))];
  if (role === "sport") return { date, kind: "rest", reason: "Volleyball", notes: [] };
  if (role === "rest") return { date, kind: "rest", reason: "Rest day", notes: [] };

  const lastDate = (type: PlanType) => before.filter((session) => session.type === type).at(-1)?.date;
  const daysSince = (type: PlanType) => {
    const last = lastDate(type);
    return last ? daysBetween(last, date) : Number.POSITIVE_INFINITY;
  };
  const yesterday = addDays(date, -1);
  const doneYesterday = (type: PlanType) => before.some((session) => session.date === yesterday && session.type === type);
  const blockedBySport = (type: PlanType) => type === "lower" && nextRole === "sport" && role !== "lower";
  const allowed = (type: PlanType) => !doneYesterday(type) && !blockedBySport(type);
  const trainedOn = new Set(before.map((session) => session.date));
  const missedSlot = (type: PlanType) => {
    const last = lastDate(type);
    for (let offset = 1; offset <= MISSED_SLOT_LOOKBACK_DAYS; offset += 1) {
      const day = addDays(date, -offset);
      if (last && day <= last) return false;
      if (plan.days[weekday(day)] === type && !trainedOn.has(day)) return true;
    }
    return false;
  };

  const train = (type: PlanType, reason: string): DaySuggestion => {
    const notes: string[] = [];
    if (type === "lower" && nextRole === "sport") notes.push("Volleyball tomorrow: stop every set 2-3 reps before failure.");
    if (daysSince(type) >= LONG_BREAK_DAYS && daysSince(type) !== Number.POSITIVE_INFINITY) {
      notes.push(`${daysSince(type)} days since your last ${type} session: start at about 90% of your last weights.`);
    }
    return { date, kind: "train", type, routineId: nextRoutineOfType(plan, type, before), reason, notes };
  };
  const label = (type: PlanType) => type === "lower" ? "Lower" : "Upper";

  if (role === "lower" || role === "upper") {
    const other: PlanType = role === "lower" ? "upper" : "lower";
    if (missedSlot(other) && allowed(other) && daysSince(other) > daysSince(role)) {
      return train(other, `Make-up: ${label(other).toLowerCase()} missed its day and is furthest behind`);
    }
    if (allowed(role)) return train(role, `${label(role)} day`);
    if (allowed(other)) {
      return train(other, doneYesterday(role)
        ? `${label(role)} was done yesterday, so ${label(other).toLowerCase()} instead`
        : `No legs before volleyball, so ${label(other).toLowerCase()} instead`);
    }
    return { date, kind: "rest", reason: "Both types were ruled out today", notes: [] };
  }

  // A make-up day only trains a type whose slot was missed.
  const owed = (["lower", "upper"] as const).filter((type) => missedSlot(type) && allowed(type))
    .sort((first, second) => daysSince(second) - daysSince(first));
  return owed.length
    ? train(owed[0], `Make-up: ${owed[0]} missed its day`)
    : { date, kind: "rest", reason: "Rest, nothing to make up", notes: [] };
}

/** Today plus the following days, assuming each suggested session is done on its day. */
export function planDays(plan: TrainingPlan, history: readonly WorkoutSession[], todayKey: string, count = 7): DaySuggestion[] {
  const sessions = planSessions(history, plan).filter((session) => session.date <= todayKey);
  const days: DaySuggestion[] = [];
  for (let offset = 0; offset < count; offset += 1) {
    const date = addDays(todayKey, offset);
    const suggestion = suggestDay(plan, sessions, date);
    days.push(suggestion);
    if (suggestion.kind === "train" && suggestion.type && suggestion.routineId) {
      sessions.push({ date, type: suggestion.type, routineId: suggestion.routineId });
    }
  }
  return days;
}

/** A starting plan: templates named "Lower ..." and "Upper ..." in name order, and the default week. */
export function guessTrainingPlan(routines: readonly Routine[]): TrainingPlan {
  const named = (word: RegExp) => routines.filter((routine) => word.test(routine.name))
    .sort((first, second) => first.name.localeCompare(second.name)).slice(0, 2).map((routine) => routine.id);
  return { lower: named(/\blower\b/i), upper: named(/\bupper\b/i), days: [...DEFAULT_PLAN_DAYS] };
}
