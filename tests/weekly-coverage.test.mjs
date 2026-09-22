import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const { buildWeeklyCoverage } = await importTypeScriptModule(new URL("../app/weeklyCoverage.ts", import.meta.url));
const { BUILT_IN_EXERCISES } = await importTypeScriptModule(new URL("../app/exercises.ts", import.meta.url));
const categories = { squat: "Legs", curl: "Arms", row: "Back", bench: "Chest", run: "Cardio", plank: "Core", press: "Shoulders", clean: "Olympic", burpee: "Full body" };

function exercise(exerciseKey, sets = [{}], extras = {}) {
  return {
    id: exerciseKey,
    exerciseKey,
    name: exerciseKey,
    restSeconds: 90,
    sets: sets.map((set, index) => ({ id: `${exerciseKey}-${index}`, weightKg: 40, reps: 8, completed: true, ...set })),
    ...extras,
  };
}

function session(id, workoutDate, exercises = [exercise("squat")], extras = {}) {
  return { id, name: id, workoutDate, startedAt: 100, finishedAt: 200, exercises, ...extras };
}

function coverage(history = [], options = {}) {
  return buildWeeklyCoverage({ history, referenceDateKey: "2026-09-23", categoriesByExerciseKey: categories, ...options });
}

function goalCounts(result) {
  return Object.fromEntries(result.goals.map(({ category, sessionCount }) => [category, sessionCount]));
}

test("an empty week has seven Monday–Sunday dates and five incomplete goals", () => {
  const result = coverage();
  assert.equal(result.startDate, "2026-09-21");
  assert.equal(result.endDate, "2026-09-27");
  assert.deepEqual(result.days.map((day) => day.dateKey), ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27"]);
  assert.deepEqual(result.days.map((day) => day.isToday), [false, false, true, false, false, false, false]);
  assert.deepEqual(result.days.map((day) => day.isFuture), [false, false, false, true, true, true, true]);
  assert.deepEqual(goalCounts(result), { Legs: 0, Arms: 0, Back: 0, Chest: 0, Cardio: 0 });
  assert.equal(result.completedGoalCount, 0);
  assert.equal(result.completedSessions, 0);
});

test("real catalog exercises can cover all five goals and reset on the next Monday", () => {
  const primaryCategories = ["Legs", "Arms", "Back", "Chest", "Cardio"];
  const items = primaryCategories.map((category) => {
    const item = BUILT_IN_EXERCISES.find((candidate) => candidate.category === category);
    assert.ok(item);
    return exercise(item.exerciseKey, [{ durationSeconds: 600, distanceMeters: 1500 }], {
      tracking: item.tracking, weightMode: item.weightMode,
    });
  });
  const history = [session("full-week", "2026-09-23", items)];
  const options = { categoriesByExerciseKey: Object.fromEntries(BUILT_IN_EXERCISES.map((item) => [item.exerciseKey, item.category])) };
  assert.equal(coverage(history, options).completedGoalCount, 5);
  const nextWeek = coverage(history, { ...options, referenceDateKey: "2026-09-28" });
  assert.equal(nextWeek.completedGoalCount, 0);
  assert.equal(nextWeek.completedSessions, 0);
});

test("one session can cover multiple primary groups without counting each set or exercise twice", () => {
  const history = [session("upper", "2026-09-21", [
    exercise("bench", [{}, {}, {}]),
    { ...exercise("bench"), id: "bench-again" },
    exercise("row"),
    exercise("curl"),
  ]), session("legs", "2026-09-22"), session("second-legs", "2026-09-22")];
  const result = coverage(history);
  assert.deepEqual(goalCounts(result), { Legs: 2, Arms: 1, Back: 1, Chest: 1, Cardio: 0 });
  assert.equal(result.completedGoalCount, 4);
  assert.equal(result.completedSessions, 3);
  assert.deepEqual(result.days[0].categories, ["Arms", "Back", "Chest"]);
  assert.deepEqual(result.days[1].sessionIds, ["legs", "second-legs"]);
});

test("unfinished exercises and invalid measurements cannot satisfy a weekly group", () => {
  const result = coverage([session("partial", "2026-09-23", [
    exercise("squat", [{ completed: false }]),
    exercise("curl", [{ reps: 0 }]),
    exercise("row", [{ reps: Number.NaN }]),
    exercise("bench", [{ reps: 1 }]),
    exercise("run", [{ reps: 0, durationSeconds: 600, distanceMeters: 0 }], { tracking: "distance-duration" }),
  ]), session("empty", "2026-09-23", [])]);
  assert.deepEqual(goalCounts(result), { Legs: 0, Arms: 0, Back: 0, Chest: 1, Cardio: 0 });
  assert.equal(result.completedSessions, 1);
});

test("drops cannot cover a skipped root exercise or add another completed session", () => {
  const result = coverage([session("drops", "2026-09-21", [
    exercise("squat", [{ completed: false }, { dropSetOf: "squat-0" }]),
    exercise("bench", [{}, { dropSetOf: "bench-0", weightKg: 30 }]),
  ]), session("orphan", "2026-09-22", [exercise("curl", [{ dropSetOf: "missing-root" }])])]);
  assert.deepEqual(goalCounts(result), { Legs: 0, Arms: 0, Back: 0, Chest: 1, Cardio: 0 });
  assert.equal(result.completedSessions, 1);
  assert.deepEqual(result.days[1].sessionIds, []);
});

test("reps, timed cardio and duration work use existing tracking semantics", () => {
  const result = coverage([session("mixed", "2026-09-22", [
    exercise("bench", [{ weightKg: 0, reps: 12 }], { tracking: "reps" }),
    exercise("row", [{ weightKg: 30 }], { weightMode: "assistance" }),
    exercise("run", [{ reps: 0, weightKg: 0, durationSeconds: 600, distanceMeters: 1500 }], { tracking: "distance-duration" }),
  ]), session("timed", "2026-09-23", [exercise("run", [{ reps: 0, durationSeconds: 300 }], { tracking: "duration" })])]);
  assert.deepEqual(goalCounts(result), { Legs: 0, Arms: 0, Back: 1, Chest: 1, Cardio: 2 });
  assert.equal(result.completedSessions, 2);
});

test("saved legacy workouts count without finishedAt but active, future and out-of-week workouts do not", () => {
  const legacy = session("legacy", "2026-09-21");
  delete legacy.finishedAt;
  const result = coverage([
    legacy,
    session("active", "2026-09-23", [exercise("curl")]),
    session("tomorrow", "2026-09-24", [exercise("bench")]),
    session("last-week", "2026-09-20", [exercise("row")]),
    session("next-week", "2026-09-28", [exercise("run")]),
    session("bad-date", "2026-09-22T12:00:00Z", [exercise("curl")]),
  ], { activeWorkoutId: "active" });
  assert.deepEqual(goalCounts(result), { Legs: 1, Arms: 0, Back: 0, Chest: 0, Cardio: 0 });
  assert.equal(result.completedSessions, 1);
  assert.ok(result.days.filter((day) => day.isFuture).every((day) => day.sessionIds.length === 0));
});

test("custom and unknown keys never inherit a category from names or object prototypes", () => {
  const result = coverage([session("custom", "2026-09-21", [
    { ...exercise("my-bench"), name: "Bench press" },
    exercise("bench"),
    exercise("constructor"),
    exercise("__proto__"),
  ]), session("known", "2026-09-22", [exercise("squat")])], { customExerciseKeys: ["bench"] });
  assert.deepEqual(goalCounts(result), { Legs: 1, Arms: 0, Back: 0, Chest: 0, Cardio: 0 });
  assert.equal(result.unclassifiedSessionCount, 1);
  assert.equal(result.completedSessions, 2);
  assert.deepEqual(result.days[0].categories, []);
});

test("other primary categories do not imply secondary muscle coverage", () => {
  const result = coverage([session("other", "2026-09-21", [exercise("press"), exercise("plank"), exercise("clean"), exercise("burpee")])]);
  assert.equal(result.completedGoalCount, 0);
  assert.equal(result.completedSessions, 1);
  assert.equal(result.unclassifiedSessionCount, 0);
});

test("duplicate saved IDs count once and a removed workout no longer fills a goal", () => {
  const legs = session("legs", "2026-09-21");
  const chest = session("chest", "2026-09-22", [exercise("bench")]);
  const initial = coverage([legs, structuredClone(legs), chest]);
  assert.equal(initial.completedSessions, 2);
  assert.equal(initial.goals[0].sessionCount, 1);
  const afterDelete = coverage([chest]);
  assert.equal(afterDelete.goals[0].completed, false);
  assert.deepEqual(afterDelete.days[0].sessionIds, []);
});

test("week boundaries and UTC date arithmetic survive leap days, year changes and DST", () => {
  for (const [referenceDateKey, startDate, endDate] of [
    ["2027-01-03", "2026-12-28", "2027-01-03"],
    ["2027-01-04", "2027-01-04", "2027-01-10"],
    ["2028-02-29", "2028-02-28", "2028-03-05"],
    ["2026-03-08", "2026-03-02", "2026-03-08"],
    ["2026-11-01", "2026-10-26", "2026-11-01"],
  ]) {
    const result = coverage([], { referenceDateKey });
    assert.equal(result.startDate, startDate);
    assert.equal(result.endDate, endDate);
    assert.equal(new Set(result.days.map((day) => day.dateKey)).size, 7);
    assert.equal(result.days.at(-1).dateKey, endDate);
  }
});

test("history order cannot change the result and input data remains untouched", () => {
  const history = [session("z", "2026-09-21"), session("a", "2026-09-21", [exercise("bench"), exercise("curl")])];
  const original = structuredClone(history);
  assert.deepEqual(coverage(history), coverage([...history].reverse()));
  assert.deepEqual(history, original);
});

test("invalid reference dates fail explicitly rather than producing a broken calendar", () => {
  for (const referenceDateKey of ["", "2026-02-30", "2026-13-01", "2026-9-22", "2026-09-22T00:00:00Z"]) {
    assert.throws(() => coverage([], { referenceDateKey }), RangeError);
  }
});
