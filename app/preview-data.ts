import { createDefaultData, makeId } from "./storage";
import type { WorkoutSession } from "./storage";

/** Ephemeral data for the explicitly selected local design preview. */
export function createPreviewData() {
  const data = createDefaultData();
  const pull = data.routines.find((routine) => routine.id === "routine-pull")!;
  pull.exercises[0] = {
    ...pull.exercises[0],
    targetSets: 4,
    targetWeightKg: 60,
    targetReps: 5,
  };
  const now = Date.now();
  const sampleSetValues = [
    { weightKg: 60, reps: 5 },
    { weightKg: 100, reps: 3 },
    { weightKg: 120, reps: 1 },
    { weightKg: 130, reps: 5 },
  ];
  const sampleWorkout = (workoutDate: string): WorkoutSession => ({
    id: makeId("preview-workout"),
    name: pull.name,
    workoutDate,
    startedAt: now,
    sourceRoutineId: pull.id,
    exercises: pull.exercises.map((exercise, exerciseIndex) => ({
      id: makeId("preview-exercise"),
      exerciseKey: exercise.exerciseKey,
      name: exercise.name,
      restSeconds: exercise.restSeconds,
      sets: Array.from({ length: exercise.targetSets }, (_, setIndex) => ({
        id: makeId("preview-set"),
        weightKg: exercise.targetWeightKg,
        reps: exercise.targetReps,
        ...(exerciseIndex === 0 ? sampleSetValues[setIndex] : {}),
        completed: false,
      })),
    })),
  });
  const localDate = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  const date = localDate(new Date(now));
  const past = sampleWorkout(localDate(new Date(now - 86_400_000)));
  past.startedAt = now - 86_400_000;
  past.finishedAt = past.startedAt + 42 * 60_000;
  past.exercises = past.exercises.map((exercise, index) => ({
    ...exercise,
    sets: exercise.sets.map((set, setIndex) => ({
      ...set, completed: true,
      weightKg: index === 0 && setIndex === 3 ? 137 : index === 1 ? 50 : set.weightKg,
    })),
  }));
  data.history = [past];
  data.activeWorkout = sampleWorkout(date);
  data.activeWorkout.name = "Morning Workout";
  data.activeWorkout.startedAt = now - 12 * 60_000 - 23_000;
  data.activeWorkout.exercises[0].notes = "Watch back rounding";
  data.activeWorkout.exercises[0].sets = data.activeWorkout.exercises[0].sets.map((set, index) => ({ ...set, completed: index < 3 }));
  return data;
}
