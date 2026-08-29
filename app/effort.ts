import type { EffortScale, SetEffort, WorkoutSet } from "./storage";

const RPE_VALUES = Array.from({ length: 9 }, (_, index) => 6 + index * 0.5);
const RIR_VALUES = Array.from({ length: 11 }, (_, index) => index);

export function effortValues(scale: EffortScale): number[] {
  return scale === "rpe" ? [...RPE_VALUES] : [...RIR_VALUES];
}

export function effortScaleLabel(scale: EffortScale): string {
  return scale.toUpperCase();
}

export function effortHint(scale: EffortScale): string {
  return scale === "rpe"
    ? "RPE means Rate of Perceived Exertion. RPE 10 means maximal effort; RPE 8 means you had about 2 good-form reps left."
    : "RIR means Reps in Reserve: how many good-form reps you could still do. RIR 0 means no reps left; RIR 2 means about 2 reps left.";
}

export function effortOptionLabel(scale: EffortScale, value: number): string {
  if (scale === "rpe") return String(value);
  return `${value} ${value === 1 ? "rep" : "reps"} left`;
}

export function formatSetEffort(effort: SetEffort): string {
  return `${effortScaleLabel(effort.scale)} ${effort.value}`;
}

export function toggleSetCompletion(set: WorkoutSet, completedAt: number): WorkoutSet {
  if (!set.completed) return { ...set, completed: true, completedAt };
  const incompleteSet = { ...set, completed: false };
  delete incompleteSet.completedAt;
  delete incompleteSet.effort;
  return incompleteSet;
}
