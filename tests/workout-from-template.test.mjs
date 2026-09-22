import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const { workoutFromTemplate } = await importTypeScriptModule(new URL("../app/workoutFromTemplate.ts", import.meta.url));
const { findLatestPreviousSet, previousSetsForWorkout } = await importTypeScriptModule(new URL("../app/exercise-tracking.ts", import.meta.url));
const set = (values = {}) => ({ id: "set-1", weightKg: 60, reps: 8, completed: true, ...values });
const exercise = (values = {}) => ({ id: "exercise-1", exerciseKey: "bench-press", name: "Bench press", tracking: "weight-reps", weightMode: "external", restSeconds: 90, sets: [set()], ...values });
const session = (values = {}) => ({ id: "session-1", name: "Other workout", workoutDate: "2026-09-20", startedAt: 100, finishedAt: 200, exercises: [exercise()], ...values });
const target = (values = {}) => ({ id: "target-1", exerciseKey: "bench-press", name: "Bench press", tracking: "weight-reps", weightMode: "external", targetSets: 3, targetWeightKg: 20, targetReps: 8, restSeconds: 120, ...values });
const template = (exercises = [target()]) => ({ id: "new-template", name: "Push", notes: "Saved plan", exercises });
function start(plan, history) {
  let nextId = 0;
  return workoutFromTemplate(plan, history, "2026-09-22", 12345, (prefix) => `${prefix}-${++nextId}`);
}
function freeze(value) {
  Object.freeze(value);
  for (const child of Object.values(value)) if (child && typeof child === "object") freeze(child);
  return value;
}

test("a new template uses per-set weights from other workouts, keeping its planned reps and extra-set count", () => {
  const history = [session({ sourceRoutineId: "unrelated-template", exercises: [exercise({ sets: [
    set({ id: "first", weightKg: 70, reps: 8 }),
    set({ id: "last", weightKg: 65, reps: 1 }),
  ] })] })];
  const workout = start(template(), history);
  assert.deepEqual(workout.exercises[0].sets.map(({ weightKg, reps, completed }) => ({ weightKg, reps, completed })), [
    { weightKg: 70, reps: 8, completed: false },
    { weightKg: 65, reps: 8, completed: false },
    { weightKg: 65, reps: 8, completed: false },
  ]);
  assert.equal(workout.sourceRoutineId, "new-template");
  assert.equal(workout.workoutDate, "2026-09-22");
  assert.equal(workout.startedAt, 12345);
});

test("an exercise newly added to a template uses its own history without changing exercise order or notes", () => {
  const plan = template([
    target({ notes: "Pause on chest" }),
    target({ id: "target-2", exerciseKey: "barbell-row", name: "Barbell row", targetSets: 2, targetWeightKg: 0, targetReps: 10, notes: "No sway", restSeconds: 60 }),
  ]);
  const history = [session({ exercises: [exercise({ exerciseKey: "barbell-row", sets: [set({ weightKg: 47.5 })] })] })];
  const workout = start(plan, history);
  assert.deepEqual(workout.exercises.map(({ exerciseKey, notes, restSeconds }) => ({ exerciseKey, notes, restSeconds })), [
    { exerciseKey: "bench-press", notes: "Pause on chest", restSeconds: 120 },
    { exerciseKey: "barbell-row", notes: "No sway", restSeconds: 60 },
  ]);
  assert.equal(workout.notes, "Saved plan");
  assert.deepEqual(workout.exercises[0].sets.map((set) => set.weightKg), [20, 20, 20]);
  assert.deepEqual(workout.exercises[1].sets.map((set) => [set.weightKg, set.reps]), [[47.5, 10], [47.5, 10]]);
});

test("workout dates determine previous weights after a backdated save or unordered import", () => {
  const backdated = session({ id: "backdated", workoutDate: "2026-09-10", finishedAt: 99999, exercises: [exercise({ sets: [set({ weightKg: 100 })] })] });
  const olderSameDay = session({ id: "older-time", finishedAt: 400, exercises: [exercise({ sets: [set({ weightKg: 70 })] })] });
  const recent = session({ id: "newest", finishedAt: 500, exercises: [exercise({ sets: [set({ weightKg: 75 })] })] });
  for (const history of [[backdated, olderSameDay, recent], [recent, backdated, olderSameDay]]) {
    assert.deepEqual(start(template(), history).exercises[0].sets.map((set) => set.weightKg), [75, 75, 75]);
    assert.equal(findLatestPreviousSet(history, "bench-press", 0, "weight-reps", "external").weightKg, 75);
  }
});

test("matching requires the same exercise key, tracking type and load meaning", () => {
  const plan = template([target({ exerciseKey: "chin-up", weightMode: "added", targetWeightKg: 5 })]);
  const history = [session({ exercises: [
    exercise({ exerciseKey: "chin-up", weightMode: "assistance", sets: [set({ weightKg: 60 })] }),
    exercise({ exerciseKey: "chin-up", weightMode: "external", sets: [set({ weightKg: 80 })] }),
    exercise({ exerciseKey: "chin-up", tracking: "reps", weightMode: "added", sets: [set({ weightKg: 90 })] }),
    exercise({ exerciseKey: "custom-chin-up", name: "Chin-up", weightMode: "added", sets: [set({ weightKg: 100 })] }),
  ] })];
  assert.deepEqual(start(plan, history).exercises[0].sets.map((set) => set.weightKg), [5, 5, 5]);
  history.push(session({ id: "matching", workoutDate: "2026-09-01", exercises: [exercise({ exerciseKey: "chin-up", weightMode: "added", sets: [set({ weightKg: 10 })] })] }));
  assert.deepEqual(start(plan, history).exercises[0].sets.map((set) => set.weightKg), [10, 10, 10]);
});

test("unchecked, zero-rep and drop sets do not replace the latest completed working weights", () => {
  const history = [session({ workoutDate: "2026-09-21", exercises: [exercise({ sets: [
    set({ weightKg: 100, completed: false }),
    set({ weightKg: 90, reps: 0 }),
    set({ weightKg: 25, dropSetOf: "missing-root" }),
  ] })] }), session({ id: "older", exercises: [exercise({ sets: [
    set({ id: "root", weightKg: 60, reps: 8 }),
    set({ id: "drop", weightKg: 30, reps: 12, dropSetOf: "root" }),
    set({ id: "unchecked", weightKg: 80, completed: false }),
    set({ id: "final", weightKg: 55, reps: 6 }),
  ] })] })];
  assert.deepEqual(start(template(), history).exercises[0].sets.map((set) => set.weightKg), [60, 55, 55]);
});

test("repeated exercise rows contribute all completed weights in saved order, including zero load", () => {
  const history = [session({ exercises: [
    exercise({ id: "first-row", sets: [set({ weightKg: 20 })] }),
    exercise({ id: "second-row", sets: [set({ weightKg: 0 })] }),
  ] })];
  assert.deepEqual(start(template(), history).exercises[0].sets.map((set) => set.weightKg), [20, 0, 0]);
});

test("duplicate template rows continue previous-set indexing without mixing another load mode", () => {
  const plan = template([
    target({ targetSets: 2 }),
    target({ id: "assisted", targetSets: 1, weightMode: "assistance" }),
    target({ id: "later-bench", targetSets: 2 }),
  ]);
  const history = [session({ exercises: [
    exercise({ id: "first-row", sets: [set({ weightKg: 60 }), set({ weightKg: 55 })] }),
    exercise({ id: "assisted-row", weightMode: "assistance", sets: [set({ weightKg: 40 })] }),
    exercise({ id: "second-row", sets: [set({ weightKg: 50 })] }),
  ] })];
  const workout = start(plan, history);
  assert.deepEqual(workout.exercises.map((exercise) => exercise.sets.map((set) => set.weightKg)), [[60, 55], [40], [50, 50]]);
  const previous = previousSetsForWorkout(history, workout);
  assert.deepEqual(workout.exercises.map((exercise) => exercise.sets.map((set) => previous.get(set.id)?.weightKg)), [[60, 55], [40], [50, 50]], "the rendered Previous values must use the same cross-row ordinals as prefill");
});

test("a template start cannot prefill from future-dated or not-yet-finished workouts", () => {
  const available = session({ id: "available", exercises: [exercise({ sets: [set({ weightKg: 65 })] })] });
  for (const unavailable of [
    session({ id: "future-date", workoutDate: "2026-09-23", exercises: [exercise({ sets: [set({ weightKg: 100 })] })] }),
    session({ id: "future-start", workoutDate: "2026-09-22", startedAt: 20000, finishedAt: undefined, exercises: [exercise({ sets: [set({ weightKg: 100 })] })] }),
    session({ id: "future-finish", workoutDate: "2026-09-22", startedAt: 10000, finishedAt: 20000, exercises: [exercise({ sets: [set({ weightKg: 100 })] })] }),
  ]) {
    const history = [unavailable, available];
    const workout = start(template(), history);
    assert.deepEqual(workout.exercises[0].sets.map((set) => set.weightKg), [65, 65, 65]);
    const previous = previousSetsForWorkout(history, workout);
    assert.deepEqual(workout.exercises[0].sets.map((set) => previous.get(set.id)?.weightKg), [65, 65, 65], "the rendered Previous values must exclude the same future history as prefill");
    const noPrevious = start(template(), [unavailable]);
    assert.deepEqual(noPrevious.exercises[0].sets.map((set) => set.weightKg), [20, 20, 20]);
    assert.equal(previousSetsForWorkout([unavailable], noPrevious).size, 0);
  }
  assert.deepEqual(start(template(), [{ ...available, finishedAt: undefined }]).exercises[0].sets.map((set) => set.weightKg), [65, 65, 65], "legacy history without a finish timestamp remains usable");
});

test("Previous drop values follow cumulative working-root ordinals across repeated exercise rows", () => {
  const plan = template([target({ targetSets: 1 }), target({ id: "later-bench", targetSets: 1 })]);
  const history = [session({ exercises: [
    exercise({ id: "first-row", sets: [set({ id: "first-root", weightKg: 60 }), set({ id: "first-drop", dropSetOf: "first-root", weightKg: 40 })] }),
    exercise({ id: "second-row", sets: [set({ id: "second-root", weightKg: 55 }), set({ id: "second-drop", dropSetOf: "second-root", weightKg: 30 })] }),
  ] })];
  const workout = start(plan, history);
  workout.exercises.forEach((exercise, index) => exercise.sets.push(set({ id: `current-drop-${index}`, dropSetOf: exercise.sets[0].id, weightKg: 0, reps: 0, completed: false })));
  const before = JSON.stringify({ workout, history });
  const previous = previousSetsForWorkout(history, workout);
  assert.deepEqual(workout.exercises.map((exercise) => exercise.sets.map((set) => previous.get(set.id)?.weightKg)), [[60, 40], [55, 30]]);
  assert.equal(JSON.stringify({ workout, history }), before, "display lookup must not change active values or saved history");
});

test("Previous never compares a history session against itself or uses edited active values as prior evidence", () => {
  const history = [session()];
  const workout = start(template(), history);
  workout.exercises[0].sets[0].weightKg = 100;
  const savedCopy = structuredClone(workout);
  savedCopy.exercises[0].sets.forEach((set) => { set.completed = true; set.weightKg = 120; });
  const previous = previousSetsForWorkout([savedCopy, ...history], workout);
  assert.deepEqual(workout.exercises[0].sets.map((set) => previous.get(set.id)?.weightKg), [60, 60, 60]);
  assert.equal(workout.exercises[0].sets[0].weightKg, 100);
});

test("non-weight tracking retains prior reps, time and distance with saved targets as fallback", () => {
  const plan = template([
    target({ exerciseKey: "plank", tracking: "duration", targetReps: 0, targetWeightKg: 0, targetDurationSeconds: 30, targetSets: 1 }),
    target({ exerciseKey: "running", tracking: "distance-duration", targetReps: 0, targetWeightKg: 0, targetDurationSeconds: 600, targetDistanceMeters: 1000, targetSets: 1 }),
    target({ exerciseKey: "push-up", tracking: "reps", targetWeightKg: 0, targetReps: 12, targetSets: 1 }),
  ]);
  const history = [session({ exercises: [
    exercise({ exerciseKey: "plank", tracking: "duration", sets: [set({ weightKg: 0, reps: 0, durationSeconds: 45 })] }),
    exercise({ exerciseKey: "running", tracking: "distance-duration", sets: [set({ weightKg: 0, reps: 0, durationSeconds: 750, distanceMeters: 1500 })] }),
    exercise({ exerciseKey: "push-up", tracking: "reps", sets: [set({ weightKg: 0, reps: 5 })] }),
  ] })];
  const workout = start(plan, history);
  assert.equal(workout.exercises[0].sets[0].durationSeconds, 45);
  assert.equal(workout.exercises[1].sets[0].durationSeconds, 750);
  assert.equal(workout.exercises[1].sets[0].distanceMeters, 1500);
  assert.equal(workout.exercises[2].sets[0].reps, 5);
  const fresh = start(plan, []);
  assert.equal(fresh.exercises[0].sets[0].durationSeconds, 30);
  assert.equal(fresh.exercises[1].sets[0].distanceMeters, 1000);
  assert.equal(fresh.exercises[2].sets[0].reps, 12);
});

test("non-weight template rows keep history array order and restart prior-set indexes for each row", () => {
  for (const tracking of ["reps", "duration", "distance-duration"]) {
    const plan = template([target({ tracking, targetSets: 2 }), target({ id: "second-row", tracking, targetSets: 1 })]);
    const olderFirst = session({ id: "saved-first", workoutDate: "2026-09-10", exercises: [exercise({ tracking, sets: [
      set({ id: "first", reps: 12, durationSeconds: 45, distanceMeters: 1500 }),
      set({ id: "second", reps: 10, durationSeconds: 30, distanceMeters: 1000 }),
    ] })] });
    const latest = session({ id: "chronologically-latest", exercises: [exercise({ tracking, sets: [set({ reps: 20, durationSeconds: 90, distanceMeters: 3000 })] })] });
    const futureFirst = { ...olderFirst, id: "future-first", workoutDate: "2026-09-23", startedAt: 20000, finishedAt: 20100 };
    for (const first of [olderFirst, futureFirst]) {
      const history = [first, latest];
      const before = structuredClone({ history, plan });
      const workout = start(plan, history);
      const measurements = (set) => [set.reps, set.durationSeconds, set.distanceMeters];
      assert.deepEqual(workout.exercises.map((row) => row.sets.map(measurements)), [
        [[12, 45, 1500], [10, 30, 1000]], [[12, 45, 1500]],
      ], `${tracking} must preserve existing prefill ordering and per-row indexes`);
      const previous = previousSetsForWorkout(history, workout);
      assert.deepEqual(workout.exercises.map((row) => row.sets.map((set) => measurements(previous.get(set.id)))), [
        [[12, 45, 1500], [10, 30, 1000]], [[12, 45, 1500]],
      ], `${tracking} Previous must still match its unchanged prefill behavior`);
      assert.deepEqual({ history, plan }, before);
    }
  }
});

test("starting a template creates independent unchecked sets without carrying history effort or completion metadata", () => {
  const plan = freeze(template());
  const history = freeze([session({ exercises: [exercise({ sets: [set({ effort: { scale: "rpe", value: 9 }, completedAt: 1000 })] })] })]);
  const before = JSON.stringify({ plan, history });
  const workout = start(plan, history);
  const ids = [workout.id, ...workout.exercises.flatMap((exercise) => [exercise.id, ...exercise.sets.map((set) => set.id)])];
  assert.equal(new Set(ids).size, ids.length);
  for (const set of workout.exercises[0].sets) {
    assert.equal(set.completed, false);
    assert.equal(set.completedAt, undefined);
    assert.equal(set.effort, undefined);
    assert.equal(set.dropSetOf, undefined);
  }
  workout.exercises[0].sets[0].weightKg = 999;
  assert.equal(JSON.stringify({ plan, history }), before);
});

test("weighted template Previous drop results follow workout dates rather than import ordering", () => {
  const withDrop = (date, weightKg) => session({ id: date, workoutDate: date, exercises: [exercise({ sets: [
    set({ id: "root", weightKg: 60 }), set({ id: "drop", dropSetOf: "root", weightKg }),
  ] })] });
  const history = [withDrop("2026-09-01", 25), withDrop("2026-09-20", 35)];
  const workout = start(template(), history);
  workout.exercises[0].sets.push(set({ id: "current-drop", dropSetOf: workout.exercises[0].sets[0].id, completed: false }));
  assert.equal(previousSetsForWorkout(history, workout).get("current-drop").weightKg, 35);
});
