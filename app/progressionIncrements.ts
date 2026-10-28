import { BUILT_IN_EXERCISES, equipmentForExercise } from "./exercises";
import { toKilograms, type WeightUnit } from "./storage";

export type ProgressionIncrementKind = "barbell" | "dumbbell" | "machine" | "isolation";

/** Smallest practical load step per equipment family, in the user's display unit. */
const INCREMENT_STEPS: Record<ProgressionIncrementKind, Record<WeightUnit, number>> = {
  // A pair of 1.25 kg plates, or 2.5 lb plates.
  barbell: { kg: 2.5, lb: 5 },
  // Metric dumbbell racks commonly step by 2.5 kg; lb racks by 5 lb.
  dumbbell: { kg: 2.5, lb: 5 },
  // One pin on a typical stack.
  machine: { kg: 2.5, lb: 5 },
  // Raises, curls and extensions use the same 2.5 kg dumbbells or 1.25 kg plate pairs.
  // Jumps over 20% must be earned with extra reps (see workoutProgression).
  isolation: { kg: 2.5, lb: 2.5 },
};

const MACHINE_PATTERN = /\b(cable|machine|smith|pec-deck|leg-press|hack-squat|lat-pulldown|pulldown|plate-loaded|seated-row|face-pull|pushdown)\b/;
const ISOLATION_PATTERN = /\b(curl|raise|fly|extension|kickback|skull-?crusher|pullover|wrist)\b/;
const DUMBBELL_PATTERN = /\b(dumbbell|goblet|kettlebell|arnold)\b/;

function exerciseText(exerciseKey: string, name: string): string {
  const builtIn = BUILT_IN_EXERCISES.find((exercise) => exercise.exerciseKey === exerciseKey);
  return [exerciseKey, name, builtIn?.name ?? "", ...(builtIn?.aliases ?? [])]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

/** Classify an exercise by catalogue equipment first, then by its key, name and Strong aliases. */
export function progressionIncrementKind(exercise: { exerciseKey: string; name: string }): ProgressionIncrementKind {
  const equipment = equipmentForExercise(exercise.exerciseKey);
  if (equipment === "Cable" || equipment === "Machine") return "machine";
  const text = exerciseText(exercise.exerciseKey, exercise.name);
  if (MACHINE_PATTERN.test(text)) return "machine";
  // Calf raises load like compounds even though their names say "raise".
  if (ISOLATION_PATTERN.test(text) && !/\bcalf\b/.test(text)) return "isolation";
  if (equipment === "Dumbbells" || DUMBBELL_PATTERN.test(text)) return "dumbbell";
  return "barbell";
}

/** The next-workout load step for this exercise, converted to kilograms for storage. */
export function progressionIncrementKg(exercise: { exerciseKey: string; name: string }, unit: WeightUnit): number {
  return toKilograms(INCREMENT_STEPS[progressionIncrementKind(exercise)][unit], unit);
}
