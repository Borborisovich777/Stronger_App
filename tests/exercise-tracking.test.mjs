import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

async function loadModule(path) {
  return importTypeScriptModule(new URL(path, import.meta.url));
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
  oldData.routines = [{ id: "legacy-routine", name: "Strength", exercises: [{ id: "legacy-bench", exerciseKey: "bench-press", name: "Bench press", targetSets: 3, targetWeightKg: 80, targetReps: 8, restSeconds: 90 }] }];
  oldData.history = [session([exercise({ exerciseKey: "plank", name: "Plank", sets: [set({ weightKg: 10, reps: 30 })] })])];
  assert.deepEqual(storage.normalizeStrongerData(oldData), oldData);
  const original = structuredClone(oldData);
  const next = structuredClone(oldData);
  next.activeWorkout = { ...session([exercise({ tracking: "distance-duration", weightMode: "external", sets: [set({ durationSeconds: 600, distanceMeters: 1500 })] })]), id: "active-session" };
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

test("drop continuations preserve working-set lookup, records, and full volume", () => {
  const first = set({ id: "work-1", weightKg: 80, reps: 5 });
  const drop = set({ id: "drop-1", weightKg: 60, reps: 12, dropSetOf: first.id });
  const second = set({ id: "work-2", weightKg: 82.5, reps: 4 });
  const row = exercise({ exerciseKey: "bench-press", tracking: "weight-reps", sets: [first, drop, second] });
  const history = [session([row])];
  assert.equal(tracking.findPreviousSet(history, "bench-press", 1), second);
  assert.equal(tracking.findPreviousSet(history, "bench-press", 5), second);
  assert.equal(tracking.findPreviousDropSet(history, "bench-press", 0, 0), drop);
  assert.equal(tracking.findPreviousDropSet(history, "bench-press", 0, 0, "duration"), undefined);
  assert.equal(tracking.findPreviousDropSet(history, "bench-press", 0, 0, "weight-reps", "assistance"), undefined);
  const summary = tracking.summarizeTrackedSets(row.sets, "weight-reps");
  assert.equal(summary.setCount, 2);
  assert.equal(summary.bestReps, 5);
  assert.equal(summary.totalReps, 21);
  assert.equal(summary.volumeKg, 1450);
  assert.equal(storage.completedSets(history[0]).length, 2);
  assert.equal(storage.completedSetSegments(history[0]).length, 3);
  assert.equal(storage.workoutVolumeKg(history[0]), 1450);
});

test("timed measurements round-trip alongside rescue, effort, drop sets, notes, and program blocks", () => {
  const data = storage.createDefaultData();
  const strength = exercise({
    id: "strength", exerciseKey: "bench-press", tracking: "weight-reps", notes: "Use the lower pins",
    sets: [
      set({ id: "strength-root", weightKg: 60, reps: 8, effort: { scale: "rpe", value: 8.5 } }),
      set({ id: "strength-drop", weightKg: 40, reps: 6, dropSetOf: "strength-root", effort: { scale: "rir", value: 2 } }),
    ],
  });
  const cardio = exercise({ id: "cardio", tracking: "distance-duration", sets: [set({ id: "run-set", durationSeconds: 600, distanceMeters: 1500 })] });
  data.activeWorkout = {
    ...session([strength, cardio]), notes: "Short mixed session", timerPausedAt: 500,
    timerPausedDurationMs: 100, timerResumedAt: 200, longSessionCheckState: "confirmed",
  };
  const timedTarget = { id: "timed-target", exerciseKey: "running", name: "Running", tracking: "distance-duration", weightMode: "external", targetSets: 1, targetWeightKg: 0, targetReps: 0, targetDurationSeconds: 600, targetDistanceMeters: 1500, restSeconds: 0 };
  data.programBlocks = [{ id: "block", name: "Mixed block", createdAt: 1, sourceRoutineId: "routine-push", sourceRoutineName: "Push", exercises: [timedTarget], weeks: [{ id: "week-1", loadPercent: 100 }, { id: "week-2", loadPercent: 105 }] }];
  const exported = JSON.parse(JSON.stringify(data));
  assert.deepEqual(storage.normalizeStrongerBackup({ kind: storage.BACKUP_KIND, backupVersion: 1, formatVersion: 1, data: exported }), exported);
  assert.equal(storage.completedSets(data.activeWorkout).length, 2, "cardio counts as completed work");
  assert.equal(storage.workoutVolumeKg(data.activeWorkout), 720, "drop volume is retained and cardio adds no volume");
  const invalid = structuredClone(exported);
  invalid.programBlocks[0].exercises[0].targetDurationSeconds = -1;
  assert.equal(storage.normalizeStrongerData(invalid), null);
});

test("exercise progress combines repeated rows, preserves drops, and sorts backdated workouts", () => {
  const early = { ...session([
    exercise({ id: "run-1", exerciseKey: "running", tracking: "distance-duration", sets: [set({ id: "run-set-1", durationSeconds: 300, distanceMeters: 1000 })] }),
    exercise({ id: "run-2", exerciseKey: "running", tracking: "distance-duration", sets: [set({ id: "run-set-2", durationSeconds: 600, distanceMeters: 2000 })] }),
  ]), id: "early", workoutDate: "2026-09-01", startedAt: 300 };
  const late = { ...session([exercise({ exerciseKey: "running", tracking: "distance-duration", sets: [set({ durationSeconds: 600, distanceMeters: 2500 })] })]), id: "late", workoutDate: "2026-09-03", startedAt: 100 };
  const source = [early, late];
  const before = structuredClone(source);
  const progress = tracking.buildExerciseProgress(source, "running");
  assert.equal(progress.tracking, "distance-duration");
  assert.deepEqual(progress.records.map((record) => record.sessionId), ["early", "late"]);
  assert.equal(progress.records[0].totalDistanceMeters, 3000);
  assert.equal(progress.records[0].setCount, 2);
  assert.equal(progress.records[0].totalDurationSeconds, 900);
  assert.equal(progress.newBest, false);
  assert.deepEqual(source, before);

  const weightSession = { ...session([
    exercise({ id: "bench-1", exerciseKey: "bench", sets: [set({ id: "bench-root", weightKg: 80, reps: 5 }), set({ id: "bench-drop", weightKg: 60, reps: 12, dropSetOf: "bench-root" })] }),
    exercise({ id: "bench-2", exerciseKey: "bench", sets: [set({ id: "bench-second", weightKg: 90, reps: 3 })] }),
  ]), id: "weighted" };
  const weighted = tracking.buildExerciseProgress([weightSession], "bench").records[0];
  assert.equal(weighted.setCount, 2);
  assert.equal(weighted.bestWeightKg, 90);
  assert.equal(weighted.volumeKg, 1390);
  assert.equal(weighted.bestReps, 5);
});

test("progress selects its mode from completed work in the chosen period", () => {
  const record = (id, date, values, sets) => ({ ...session([exercise({ exerciseKey: "plank", ...values, sets })]), id, workoutDate: date });
  const history = [
    record("future-timed", "2026-10-01", { tracking: "duration" }, [set({ durationSeconds: 90 })]),
    record("incomplete-timed", "2026-09-04", { tracking: "duration" }, [set({ durationSeconds: 120, completed: false })]),
    record("legacy", "2026-09-03", {}, [set({ weightKg: 10, reps: 30 })]),
  ];
  const legacy = tracking.buildExerciseProgress(history, "plank", new Set(["legacy", "incomplete-timed"]));
  assert.equal(legacy.tracking, "weight-reps");
  assert.deepEqual(legacy.records.map((item) => item.sessionId), ["legacy"]);
  assert.equal(legacy.records[0].bestReps, 30);
  const timed = tracking.buildExerciseProgress(history, "plank", new Set(["future-timed"]));
  assert.equal(timed.tracking, "duration");
  assert.equal(timed.records[0].trendValue, 90);
  assert.equal(tracking.buildExerciseProgress(history, "plank", new Set(["incomplete-timed"])).records.length, 0);
});

test("period records use all earlier comparable history and lower assistance as improvement", () => {
  const record = (id, date, weight, mode = "external") => ({ ...session([exercise({ exerciseKey: "chin-up", tracking: "weight-reps", weightMode: mode, sets: [set({ weightKg: weight, reps: 8 })] })]), id, workoutDate: date });
  const history = [record("older", "2026-08-01", 60), record("first", "2026-09-01", 40), record("latest", "2026-09-03", 50)];
  const selected = new Set(["first", "latest"]);
  const progress = tracking.buildExerciseProgress(history, "chin-up", selected);
  assert.equal(progress.records.length, 2);
  assert.equal(progress.allHistoryRecords.length, 3);
  assert.equal(progress.newBest, false, "a period improvement must not become a false all-history record");
  const assistance = tracking.buildExerciseProgress([
    record("external", "2026-08-01", 5),
    record("older-assist", "2026-08-02", 30, "assistance"),
    record("new-assist", "2026-09-03", 20, "assistance"),
  ], "chin-up", new Set(["new-assist"]));
  assert.equal(assistance.weightMode, "assistance");
  assert.equal(assistance.newBest, true);
  assert.deepEqual(assistance.allHistoryRecords.map((item) => item.sessionId), ["older-assist", "new-assist"]);
});

test("previous lookup can find a matching mode after another row with the same key", () => {
  const timed = set({ id: "timed", durationSeconds: 45 });
  const addedRoot = set({ id: "added-root", weightKg: 20, reps: 8 });
  const addedDrop = set({ id: "added-drop", weightKg: 10, reps: 6, dropSetOf: "added-root" });
  const history = [session([
    exercise({ id: "legacy-plank", exerciseKey: "plank", sets: [set({ id: "legacy", reps: 30 })] }),
    exercise({ id: "timed-plank", exerciseKey: "plank", tracking: "duration", sets: [timed] }),
    exercise({ id: "legacy-chin", exerciseKey: "chin-up", sets: [set({ id: "legacy-chin-set", weightKg: 40, reps: 8 })] }),
    exercise({ id: "added-chin", exerciseKey: "chin-up", tracking: "weight-reps", weightMode: "added", sets: [addedRoot, addedDrop] }),
  ])];
  assert.equal(tracking.findPreviousSet(history, "plank", 0, "duration"), timed);
  assert.equal(tracking.findPreviousSet(history, "chin-up", 0, "weight-reps", "added"), addedRoot);
  assert.equal(tracking.findPreviousDropSet(history, "chin-up", 0, 0, "weight-reps", "added"), addedDrop);
  assert.equal(tracking.findPreviousDropSet(history, "chin-up", 0, 0, "weight-reps", "assistance"), undefined);
});

test("previous results use completed repeated rows in saved order with last-result fallback", () => {
  const first = set({ id: "first-result", weightKg: 60, reps: 5 });
  const drop = set({ id: "first-drop", weightKg: 40, reps: 12, dropSetOf: first.id });
  const second = set({ id: "second-result", weightKg: 55, reps: 6 });
  const row = (id, sets, values = {}) => exercise({ id, exerciseKey: "bench-press", tracking: "weight-reps", weightMode: "external", sets, ...values });
  const history = [
    session([
      row("unfinished", [set({ id: "not-performed", weightKg: 60, reps: 8, completed: false })]),
      row("first", [first, drop]),
      row("other-mode", [set({ id: "assistance", weightKg: 25, reps: 8 })], { weightMode: "assistance" }),
      row("second", [second]),
      row("invalid", [set({ id: "zero-reps", weightKg: 100, reps: 0 })]),
    ]),
    { ...session([row("old", [set({ id: "older-success", weightKg: 60, reps: 8 })])]), id: "older", workoutDate: "2026-09-12" },
  ];
  const before = structuredClone(history);
  assert.equal(tracking.findPreviousSet(history, "bench-press", 0, "weight-reps", "external"), first);
  assert.equal(tracking.findPreviousSet(history, "bench-press", 1, "weight-reps", "external"), second);
  assert.equal(tracking.findPreviousSet(history, "bench-press", 5, "weight-reps", "external"), second);
  assert.equal(tracking.findPreviousDropSet(history, "bench-press", 0, 0, "weight-reps", "external"), drop);
  assert.equal(tracking.findPreviousDropSet(history, "bench-press", 1, 0, "weight-reps", "external"), undefined);
  assert.deepEqual(history, before);
});
