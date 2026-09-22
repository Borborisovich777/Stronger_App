import { createDefaultData, makeId } from "./storage";
import type { Routine, WorkoutSession } from "./storage";

/** Ephemeral data for the explicitly selected local design preview. */
export function createPreviewData() {
  const data = createDefaultData();
  const pull: Routine = {
    id: "routine-preview-pull",
    name: "Pull",
    exercises: [
      { id: "preview-deadlift", exerciseKey: "deadlift", name: "Deadlift", targetSets: 4, targetWeightKg: 60, targetReps: 5, restSeconds: 150 },
      { id: "preview-row", exerciseKey: "barbell-row", name: "Barbell row", targetSets: 3, targetWeightKg: 45, targetReps: 8, restSeconds: 90 },
      { id: "preview-lat", exerciseKey: "lat-pulldown", name: "Lat pulldown", targetSets: 3, targetWeightKg: 40, targetReps: 10, restSeconds: 90 },
      { id: "preview-rear", exerciseKey: "rear-delt-fly", name: "Rear delt fly", targetSets: 3, targetWeightKg: 8, targetReps: 12, restSeconds: 60 },
      { id: "preview-curl", exerciseKey: "biceps-curl", name: "Biceps curl", targetSets: 3, targetWeightKg: 10, targetReps: 10, restSeconds: 60 },
    ],
  };
  data.routines.unshift(pull);
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

/** An existing saved routine and history, isolated from real browser storage. */
export function createExistingUserPreviewData() {
  const data = createPreviewData();
  data.routines = data.routines.filter((routine) => routine.id === "routine-preview-pull");
  data.activeWorkout = null;
  return data;
}

/** Two completed sessions: full rep goals for two lifts, a recent one-rep miss for the row. */
export function createProgressionPreviewData() {
  const data = createExistingUserPreviewData();
  const routine = data.routines[0];
  routine.exercises = routine.exercises.slice(0, 3).map((exercise, index) => ({
    ...exercise, targetSets: 3, targetWeightKg: 0, targetReps: 8,
    progressionRepTarget: index === 0 ? 12 : 8,
  }));
  const source = data.history[0];
  data.history = [1, 2].map((daysAgo) => {
    const startedAt = Date.now() - daysAgo * 86_400_000;
    const date = new Date(startedAt);
    return {
      ...source, id: `progression-history-${daysAgo}`, sourceRoutineId: "another-template",
      workoutDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      startedAt, finishedAt: startedAt + 30 * 60_000,
      exercises: source.exercises.slice(0, 3).map((exercise, index) => ({
        ...exercise, id: `progression-${daysAgo}-${index}`,
        sets: exercise.sets.slice(0, 3).map((set, setIndex) => ({
          ...set, id: `progression-${daysAgo}-${index}-${setIndex}`, weightKg: [60, 50, 40][index],
          reps: index === 0 ? 12 : index === 1 && daysAgo === 1 && setIndex === 0 ? 1 : 8,
          completed: true,
        })),
      })),
    };
  });
  data.settings.workoutProgression = true;
  data.settings.nextSetPreview = true;
  return data;
}

/** Current-week examples for the calendar, never loaded from or written to saved data. */
export function createWeeklyCalendarPreviewData() {
  const data = createDefaultData();
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() + 6) % 7);
  const localDate = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  const workout = (id: string, name: string, date: Date, items: { key: string; name: string; weight: number; completed: boolean }[]): WorkoutSession => ({
    id, name, workoutDate: localDate(date),
    startedAt: date.getTime() - 45 * 60_000,
    finishedAt: date.getTime(),
    exercises: items.map((item, index) => ({
      id: `${id}-exercise-${index}`, exerciseKey: item.key, name: item.name, restSeconds: 90,
      sets: Array.from({ length: 3 }, (_, setIndex) => ({
        id: `${id}-${index}-${setIndex}`, weightKg: item.weight, reps: 8, completed: item.completed,
      })),
    })),
  });
  data.history = [
    workout("calendar-legs", "Legs", today, [
      { key: "back-squat", name: "Back squat", weight: 60, completed: true },
      { key: "bench-press", name: "Bench press", weight: 40, completed: false },
    ]),
    workout("calendar-pull", "Pull", monday, [
      { key: "barbell-row", name: "Barbell row", weight: 40, completed: true },
      { key: "biceps-curl", name: "Biceps curl", weight: 10, completed: true },
    ]),
  ];
  return data;
}
