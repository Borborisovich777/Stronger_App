import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadModule(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const tracking = await loadModule("../app/exercise-tracking.ts");
const storage = await loadModule("../app/storage.ts");
const set = (values = {}) => ({ id: "set-1", weightKg: 0, reps: 0, completed: true, ...values });
const session = (exercises) => ({ id: "session-1", name: "Training", workoutDate: "2026-09-13", startedAt: 1, exercises });
const exercise = (values = {}) => ({ id: "exercise-1", exerciseKey: "running", name: "Running", restSeconds: 0, sets: [], ...values });

test("validates each exercise using its actual measurement type", () => {
  assert.equal(tracking.setCompletionError(set({ reps: 5 }), "weight-reps"), null, "zero load is valid");
  assert.equal(tracking.setCompletionError(set({ reps: 12 }), "reps"), null);
  assert.ok(tracking.setCompletionError(set({ reps: 0 }), "reps"));
  assert.equal(tracking.setCompletionError(set({ durationSeconds: 30 }), "duration"), null);
  assert.ok(tracking.setCompletionError(set({ reps: 30 }), "duration"), "legacy reps are not seconds");
  assert.equal(tracking.setCompletionError(set({ durationSeconds: 600, distanceMeters: 1500 }), "distance-duration"), null);
  assert.ok(tracking.setCompletionError(set({ durationSeconds: 600 }), "distance-duration"));
  assert.ok(tracking.setCompletionError(set({ distanceMeters: 1500 }), "distance-duration"));
  assert.ok(tracking.setCompletionError(set({ durationSeconds: Infinity }), "duration"));
  assert.deepEqual(tracking.defaultSetMeasurements("duration"), { weightKg: 0, reps: 0, durationSeconds: 30 });
  assert.equal(tracking.formatSetDuration(3665), "61:05");
  assert.equal(tracking.formatDistanceKm(1250), "1.25");
});

test("preserves the meaning of legacy sets and targets when catalog metadata changes", () => {
  assert.equal(tracking.resolveExerciseTracking({ sets: [set({ reps: 30 })] }, "duration"), "weight-reps");
  assert.equal(tracking.resolveExerciseTracking({ targetReps: 8 }, "duration"), "weight-reps");
  assert.equal(tracking.resolveExerciseTracking({ tracking: "reps", sets: [set({ reps: 8 })] }, "weight-reps"), "reps");
  assert.equal(tracking.resolveExerciseTracking({}, "distance-duration"), "distance-duration");
  assert.equal(tracking.resolveExerciseTracking({ sets: [set({ durationSeconds: 30 })] }), "duration");
  assert.equal(tracking.resolveExerciseWeightMode({ sets: [set()] }, "assistance"), "external");
  assert.equal(tracking.resolveExerciseWeightMode({ weightMode: "assistance", sets: [set()] }), "assistance");
});

test("calculates duration, distance, and repetitions without producing strength records", () => {
  const cardio = tracking.summarizeTrackedSets([
    set({ weightKg: 70, reps: 8, durationSeconds: 600, distanceMeters: 1500 }),
    set({ durationSeconds: 300, distanceMeters: 800 }),
    set({ completed: false, durationSeconds: 9000, distanceMeters: 50000 }),
    set({ durationSeconds: 10 }),
  ], "distance-duration");
  assert.equal(cardio.setCount, 2);
  assert.equal(cardio.totalDistanceMeters, 2300);
  assert.equal(cardio.totalDurationSeconds, 900);
  assert.equal(cardio.bestDurationSeconds, 600);
  assert.equal(cardio.volumeKg, 0);
  assert.equal(cardio.bestEstimatedKg, 0);
  const holds = tracking.summarizeTrackedSets([set({ durationSeconds: 30 }), set({ durationSeconds: 45 })], "duration");
  assert.equal(holds.bestDurationSeconds, 45);
  assert.equal(holds.totalDurationSeconds, 75);
  const reps = tracking.summarizeTrackedSets([set({ reps: 10 }), set({ reps: 15 })], "reps");
  assert.equal(reps.totalReps, 25);
  assert.equal(reps.bestReps, 15);
  assert.equal(reps.bestEstimatedKg, 0);
});

test("distinguishes assistance and added load from external strength records", () => {
  const sets = [set({ weightKg: 30, reps: 8 }), set({ weightKg: 20, reps: 8 })];
  const assistance = tracking.summarizeTrackedSets(sets, "weight-reps", "assistance");
  assert.equal(assistance.bestWeightKg, 20, "lower assistance is the useful record");
  assert.equal(assistance.volumeKg, 0);
  assert.equal(assistance.bestEstimatedKg, 0);
  const added = tracking.summarizeTrackedSets(sets, "weight-reps", "added");
  assert.equal(added.bestWeightKg, 30);
  assert.equal(added.bestEstimatedKg, 0, "added load alone is not a bodyweight 1RM");
  const strength = tracking.summarizeTrackedSets(sets, "weight-reps");
  assert.equal(strength.volumeKg, 400);
  assert.equal(strength.bestEstimatedKg, 38);
  assert.equal(storage.workoutVolumeKg(session([exercise({ tracking: "weight-reps", weightMode: "assistance", sets })])), 0);
});

test("previous set lookup cannot borrow data from another same-name exercise or tracking type", () => {
  const personalSet = set({ weightKg: 80, reps: 8 });
  const builtInSet = set({ weightKg: 25, reps: 8 });
  const history = [session([
    exercise({ exerciseKey: "custom-row", name: "Barbell row", sets: [personalSet] }),
    exercise({ exerciseKey: "barbell-row", name: "Barbell row", sets: [builtInSet] }),
  ])];
  assert.equal(tracking.findPreviousSet(history, "barbell-row", 0), builtInSet);
  assert.equal(tracking.findPreviousSet(history, "custom-row", 0), personalSet);
  assert.equal(tracking.findPreviousSet(history, "new-row", 0), undefined);
  assert.equal(tracking.findPreviousSet(history, "barbell-row", 0, "duration"), undefined);
  assert.equal(tracking.findPreviousSet(history, "barbell-row", 0, "weight-reps", "assistance"), undefined);
});

test("round-trips old and new backup data without migration or dropped measurements", () => {
  const oldData = storage.createDefaultData();
  oldData.history = [session([exercise({ exerciseKey: "plank", name: "Plank", sets: [set({ weightKg: 10, reps: 30 })] })])];
  assert.deepEqual(storage.normalizeStrongerData(oldData), oldData);
  const original = structuredClone(oldData);
  const next = structuredClone(oldData);
  next.activeWorkout = session([exercise({ tracking: "distance-duration", weightMode: "external", sets: [set({ durationSeconds: 600, distanceMeters: 1500 })] })]);
  next.routines[0].exercises.push({ id: "run-target", exerciseKey: "running", name: "Running", tracking: "distance-duration", weightMode: "external", targetSets: 1, targetWeightKg: 0, targetReps: 0, targetDurationSeconds: 600, targetDistanceMeters: 1500, restSeconds: 0 });
  const exported = JSON.parse(JSON.stringify(next));
  assert.ok(storage.isStrongerData(exported));
  assert.deepEqual(storage.normalizeStrongerData(exported), exported);
  assert.deepEqual(oldData, original, "normalization must not mutate existing records");
  for (const [field, invalid] of [["durationSeconds", -1], ["distanceMeters", Infinity], ["durationSeconds", "30"]]) {
    const malformed = structuredClone(next);
    malformed.activeWorkout.exercises[0].sets[0][field] = invalid;
    assert.equal(storage.normalizeStrongerData(malformed), null);
  }
  const badRoutine = structuredClone(next);
  badRoutine.routines[0].exercises.at(-1).targetDistanceMeters = -1;
  assert.equal(storage.normalizeStrongerData(badRoutine), null);
  const badType = structuredClone(next);
  badType.activeWorkout.exercises[0].tracking = "calories";
  assert.equal(storage.normalizeStrongerData(badType), null);
});
