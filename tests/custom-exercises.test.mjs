import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const { customExerciseUsage, renameCustomExercise, deleteCustomExercise } = await importTypeScriptModule(new URL("../app/customExercises.ts", import.meta.url));

const key = "custom-exercise-1";
function planned(id, exerciseKey = key, name = "Landmine press") {
  return { id, exerciseKey, name, tracking: "weight-reps", weightMode: "external", targetSets: 3, targetWeightKg: 30, targetReps: 8, restSeconds: 90 };
}
function logged(id, exerciseKey = key, name = "Landmine press") {
  return { id, exerciseKey, name, tracking: "weight-reps", weightMode: "external", restSeconds: 90, sets: [{ id: `${id}-s`, weightKg: 30, reps: 8, completed: true }] };
}
function fixture(activeWorkout = null) {
  return {
    formatVersion: 1,
    customExercises: [{ exerciseKey: key, name: "Landmine press" }, { exerciseKey: "custom-exercise-2", name: "Spider curl" }],
    routines: [
      { id: "upper", name: "Upper A", exercises: [planned("u1", "bench-press", "Bench press"), planned("u2")] },
      { id: "lower", name: "Lower A", exercises: [planned("l1", "back-squat", "Back squat")] },
    ],
    programBlocks: [{ id: "block", name: "Upper block", createdAt: 1, sourceRoutineId: "upper", sourceRoutineName: "Upper A", exercises: [planned("b1")], weeks: [] }],
    activeWorkout,
    history: [{ id: "h1", name: "Upper A", workoutDate: "2026-10-20", startedAt: 1, finishedAt: 2, exercises: [logged("h1e")] }],
    settings: { unit: "kg", defaultRestSeconds: 90, goal: "muscle", weeklyDays: 4 },
  };
}

test("usage lists templates, program copies, the active workout and history", () => {
  assert.deepEqual(customExerciseUsage(fixture(), key), { routineNames: ["Upper A"], programBlockNames: ["Upper block"], inActiveWorkout: false, historySessions: 1 });
});

test("renaming updates the library, templates, program copies and active workout but not history", () => {
  const data = fixture({ id: "a", name: "Upper A", workoutDate: "2026-10-28", startedAt: 5, exercises: [logged("a1")] });
  const result = renameCustomExercise(data, key, "Landmine shoulder press");
  assert.equal(result.customExercises[0].name, "Landmine shoulder press");
  assert.equal(result.routines[0].exercises[1].name, "Landmine shoulder press");
  assert.equal(result.routines[0].exercises[0].name, "Bench press");
  assert.equal(result.routines[1], data.routines[1]);
  assert.equal(result.programBlocks[0].exercises[0].name, "Landmine shoulder press");
  assert.equal(result.activeWorkout.exercises[0].name, "Landmine shoulder press");
  assert.equal(result.history, data.history);
  assert.equal(data.routines[0].exercises[1].name, "Landmine press");
});

test("built-in exercises and empty names are never renamed", () => {
  const data = fixture();
  assert.equal(renameCustomExercise(data, "bench-press", "Flat press"), data);
  assert.equal(renameCustomExercise(data, key, ""), data);
});

test("deleting removes the exercise from the library and plans and keeps history", () => {
  const data = fixture();
  const result = deleteCustomExercise(data, key);
  assert.deepEqual(result.customExercises.map((exercise) => exercise.exerciseKey), ["custom-exercise-2"]);
  assert.deepEqual(result.routines[0].exercises.map((exercise) => exercise.id), ["u1"]);
  assert.deepEqual(result.programBlocks[0].exercises, []);
  assert.equal(result.history, data.history);
});

test("deleting is refused while the exercise is in the workout in progress", () => {
  const data = fixture({ id: "a", name: "Upper A", workoutDate: "2026-10-28", startedAt: 5, exercises: [logged("a1")] });
  assert.equal(deleteCustomExercise(data, key), data);
});

const { parseRestAlertPreferences, DEFAULT_REST_ALERTS } = await importTypeScriptModule(new URL("../app/restAlert.ts", import.meta.url));

test("rest alert preferences fall back field by field", () => {
  assert.deepEqual(parseRestAlertPreferences(null), DEFAULT_REST_ALERTS);
  assert.deepEqual(parseRestAlertPreferences("not json"), DEFAULT_REST_ALERTS);
  assert.deepEqual(parseRestAlertPreferences('{"sound":false,"keepAwake":true,"vibrate":"yes"}'),
    { sound: false, vibrate: true, notify: false, keepAwake: true });
});
