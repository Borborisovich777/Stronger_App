import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const { applyNextWorkoutProgression, resolveProgressionRepTarget, getWorkoutStartingWeightIncreases } = await importTypeScriptModule(new URL("../app/workoutProgression.ts", import.meta.url));

function makeSet(id, weightKg = 60, reps = 8, completed = true) {
  return { id, weightKg, reps, completed };
}

function makeExercise(id, sets, overrides = {}) {
  return { id, exerciseKey: "bench-press", name: "Bench press", tracking: "weight-reps", weightMode: "external", restSeconds: 120, sets, ...overrides };
}

function makeSession(id, day, sets = [makeSet(`${id}-1`), makeSet(`${id}-2`), makeSet(`${id}-3`)]) {
  return {
    id, name: `Workout ${id}`, workoutDate: `2026-09-${String(day).padStart(2, "0")}`,
    startedAt: day * 100, finishedAt: day * 100 + 50,
    exercises: [makeExercise(`${id}-exercise`, sets)],
  };
}

function fixture() {
  const routine = {
    id: "template", name: "Push", notes: "Keep the compact layout.",
    exercises: [{
      id: "template-bench", exerciseKey: "bench-press", name: "Bench press",
      tracking: "weight-reps", weightMode: "external", targetSets: 3,
      targetWeightKg: 40, targetReps: 8, restSeconds: 120, notes: "A stable workload.",
    }],
  };
  const workout = {
    id: "new", name: routine.name, sourceRoutineId: routine.id, workoutDate: "2026-09-22", startedAt: 2200,
    notes: routine.notes,
    exercises: [makeExercise("new-bench", [1, 2, 3].map((index) => makeSet(`new-${index}`, 60, 8, false)), { notes: "A stable workload." })],
  };
  return { routine, workout, history: [makeSession("older", 18), makeSession("latest", 20)] };
}

function progress(input, incrementKg = 2.5, maximumWeightKg = 100_000) {
  return applyNextWorkoutProgression(input.routine, input.workout, input.history, incrementKg, maximumWeightKg);
}

function assertUnchanged(input, incrementKg, maximumWeightKg) {
  const result = progress(input, incrementKg, maximumWeightKg);
  assert.deepEqual(result.workout, input.workout);
  assert.deepEqual(result.increases, []);
}

test("prepares every working set with a small increase after two complete comparable workouts", () => {
  const input = fixture();
  const result = progress(input);
  assert.deepEqual(result.workout.exercises[0].sets.map((set) => set.weightKg), [62.5, 62.5, 62.5]);
  assert.deepEqual(result.workout.exercises[0].sets.map((set) => set.reps), [8, 8, 8]);
  assert.equal(result.increases.length, 1);
  assert.deepEqual(result.increases[0], {
    exerciseId: "new-bench", exerciseKey: "bench-press", exerciseName: "Bench press", incrementKg: 2.5,
    sets: [1, 2, 3].map((index) => ({ setId: `new-${index}`, previousWeightKg: 60, nextWeightKg: 62.5 })),
    evidenceSessionIds: ["latest", "older"],
  });
});

test("one completed rep never triggers an increase, even when the template target is one rep", () => {
  for (const templateReps of [1, 8]) {
    const input = fixture();
    input.routine.exercises[0].targetReps = templateReps;
    input.workout.exercises[0].sets.forEach((set) => { set.reps = templateReps; });
    input.history.forEach((session) => session.exercises[0].sets.forEach((set) => { set.reps = 1; }));
    assertUnchanged(input);
  }
});

test("one historical workout or one successful set is insufficient evidence", () => {
  const oneWorkout = fixture();
  oneWorkout.history.pop();
  assertUnchanged(oneWorkout);
  const oneSet = fixture();
  oneSet.history.forEach((session) => { session.exercises[0].sets = session.exercises[0].sets.slice(0, 1); });
  assertUnchanged(oneSet);
});

test("latest missed, invalid, or unmarked working sets block older complete workouts", () => {
  for (const change of [
    { reps: 7 }, { reps: 0 }, { reps: 8.5 }, { reps: Number.NaN },
    { completed: false }, { weightKg: Number.NaN },
  ]) {
    const input = fixture();
    input.history.unshift(makeSession("oldest", 16));
    Object.assign(input.history.at(-1).exercises[0].sets[1], change);
    assertUnchanged(input);
  }
});

test("an unfinished newer attempt cannot be bypassed by two finished successes", () => {
  const input = fixture();
  const pending = makeSession("unfinished", 21);
  delete pending.finishedAt;
  input.history.push(pending);
  assertUnchanged(input);
});

test("a skipped unrelated exercise does not block a complete exercise workload", () => {
  const input = fixture();
  input.history[1].exercises.push(makeExercise("skipped-row", [makeSet("skipped", 40, 8, false)], { exerciseKey: "barbell-row" }));
  assert.equal(progress(input).increases.length, 1);
});

test("changing loads requires two successes at the newly carried-forward per-set loads", () => {
  const input = fixture();
  input.history[0].exercises[0].sets[2].weightKg = 57.5;
  assertUnchanged(input);
  input.history[0].exercises[0].sets[2].weightKg = 65;
  assertUnchanged(input);
});

test("different baseline loads are preserved by ordinal with one increment each", () => {
  const input = fixture();
  input.workout.exercises[0].sets.forEach((set, index) => { set.weightKg = 60 - index * 5; });
  input.history.forEach((session) => session.exercises[0].sets.forEach((set, index) => { set.weightKg = 60 - index * 5; }));
  assert.deepEqual(progress(input).workout.exercises[0].sets.map((set) => set.weightKg), [62.5, 57.5, 52.5]);
});

test("drops never supply the missing working-set evidence", () => {
  const input = fixture();
  input.history[1].exercises[0].sets[2].dropSetOf = "latest-2";
  assertUnchanged(input);
});

test("completed or incomplete drop continuations do not alter the working workload", () => {
  const input = fixture();
  input.history.forEach((session) => {
    session.exercises[0].sets.splice(1, 0, { ...makeSet(`${session.id}-drop`, 45, 5, false), dropSetOf: `${session.id}-1` });
  });
  assert.equal(progress(input).increases.length, 1);
});

test("an added or removed working set blocks automatic progression", () => {
  for (const count of [2, 4]) {
    const input = fixture();
    input.history[1].exercises[0].sets = Array.from({ length: count }, (_, index) => makeSet(`latest-${index}`));
    assertUnchanged(input);
  }
});

test("repeated exercise rows combine in saved order and cannot hide a later missed set", () => {
  const input = fixture();
  input.routine.exercises[0].targetSets = 2;
  input.routine.exercises.push({ ...input.routine.exercises[0], id: "template-bench-2", targetSets: 1 });
  input.workout.exercises[0].sets.pop();
  input.workout.exercises.push(makeExercise("new-bench-2", [makeSet("new-3", 60, 8, false)]));
  for (const session of input.history) {
    session.exercises.push(makeExercise(`${session.id}-bench-2`, [session.exercises[0].sets.pop()]));
  }
  assert.equal(progress(input).increases.length, 2);
  input.history[1].exercises[1].sets[0].reps = 7;
  assertUnchanged(input);
});

test("assistance, non-load tracking, and zero-added bodyweight never increase automatically", () => {
  for (const overrides of [
    { weightMode: "assistance" }, { tracking: "reps" }, { tracking: "duration" }, { tracking: "distance-duration" },
  ]) {
    const input = fixture();
    Object.assign(input.routine.exercises[0], overrides);
    Object.assign(input.workout.exercises[0], overrides);
    input.history.forEach((session) => Object.assign(session.exercises[0], overrides));
    assertUnchanged(input);
  }
  const input = fixture();
  input.routine.exercises[0].weightMode = "added";
  for (const session of [input.workout, ...input.history]) {
    session.exercises[0].weightMode = "added";
    session.exercises[0].sets.forEach((set) => { set.weightKg = 0; });
  }
  assertUnchanged(input);
});

test("external and added load modes remain separate, while positive added load can progress", () => {
  const input = fixture();
  input.routine.exercises[0].weightMode = "added";
  input.workout.exercises[0].weightMode = "added";
  assertUnchanged(input);
  input.history.forEach((session) => { session.exercises[0].weightMode = "added"; });
  assert.equal(progress(input).increases.length, 1);
});

test("a new exercise never borrows evidence from a different exercise", () => {
  const input = fixture();
  input.routine.exercises[0].exerciseKey = "dumbbell-bench-press";
  input.workout.exercises[0].exerciseKey = "dumbbell-bench-press";
  assertUnchanged(input);
});

test("explicit range maximum gates progression and does not change the planned rep target", () => {
  const input = fixture();
  input.routine.exercises[0].progressionRepTarget = 12;
  assertUnchanged(input);
  input.history.forEach((session) => session.exercises[0].sets.forEach((set) => { set.reps = 12; }));
  const result = progress(input);
  assert.equal(result.increases.length, 1);
  assert.deepEqual(result.workout.exercises[0].sets.map((set) => set.reps), [8, 8, 8]);
});

test("an outdated lower progression threshold never overrides a higher saved rep target", () => {
  const input = fixture();
  input.routine.exercises[0].progressionRepTarget = 6;
  input.history[1].exercises[0].sets[1].reps = 7;
  assertUnchanged(input);
});

test("legacy generated ranges retain their upper goal and explicit user goals take precedence", () => {
  const input = fixture();
  const template = input.routine.exercises[0];
  template.notes = "3 × 8–12 reps. Rest 120s. Keep the torso steady.";
  assert.equal(resolveProgressionRepTarget(template), 12);
  assertUnchanged(input);
  template.notes = "3 × 8–12 reps / side. Rest 120s. Complete both sides before marking a set done.";
  assert.equal(resolveProgressionRepTarget(template), 12);
  template.progressionRepTarget = 8;
  assert.equal(resolveProgressionRepTarget(template), 8);
  assert.equal(progress(input).increases.length, 1, "an explicit goal must override the older generated notes");
  template.progressionRepTarget = 6;
  assert.equal(resolveProgressionRepTarget(template), 8, "the goal can never be below the planned reps");
});

test("plain custom notes and malformed or incompatible generated ranges cannot invent rep goals", () => {
  const template = fixture().routine.exercises[0];
  for (const notes of [
    undefined, "Try 8–12 reps when ready.", "Goal: 3 × 8–12 reps. Rest 120s.",
    "3 x 8-12 reps. Rest 120s.", "3 × 8–12 reps.", "3 × 8–12 sec. Rest 120s.",
    "3 × 8–12 reps. Rest 120s.unsupported", "3 × 0–12 reps. Rest 120s.",
    "3 × 12–8 reps. Rest 120s.", "3 × 8–100001 reps. Rest 120s.",
    "3 × 8–12 reps. Rest 86401s.", "3 × 8–12 reps. Rest -1s.",
    "2 × 8–12 reps. Rest 120s.", "3 × 9–12 reps. Rest 120s.",
    "3 × 1–7 reps. Rest 120s.", "3 × 8.5–12 reps. Rest 120s.",
  ]) {
    assert.equal(resolveProgressionRepTarget({ ...template, notes }), 8, String(notes));
  }
  assert.equal(resolveProgressionRepTarget({ ...template, targetReps: 10, notes: "3 × 8–12 reps. Rest 120s." }), 12,
    "an edited rep target still inside its original range keeps the upper goal");
});

test("near-limit recorded effort blocks an increase, while boundaries leave room", () => {
  for (const effort of [{ scale: "rpe", value: 9 }, { scale: "rir", value: 1 }]) {
    const input = fixture();
    input.history[1].exercises[0].sets[1].effort = effort;
    assertUnchanged(input);
  }
  const input = fixture();
  input.history[0].exercises[0].sets[1].effort = { scale: "rpe", value: 8.5 };
  input.history[1].exercises[0].sets[1].effort = { scale: "rir", value: 2 };
  assert.equal(progress(input).increases.length, 1);
});

test("increments respect absolute, relative, finite-value, and maximum-weight bounds", () => {
  for (const increment of [0, -2.5, 5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assertUnchanged(fixture(), increment);
  }
  assertUnchanged(fixture(), 2.5, 62);
  assertUnchanged(fixture(), 2.5, Number.NaN);
  const light = fixture();
  for (const session of [light.workout, ...light.history]) {
    session.exercises[0].sets.forEach((set) => { set.weightKg = 10; });
  }
  assertUnchanged(light);
  assert.equal(progress(light, 1).increases.length, 1);
  const poundIncrement = 5 / 2.2046226218;
  assert.equal(progress(fixture(), poundIncrement).workout.exercises[0].sets[0].weightKg,
    Math.round((60 + poundIncrement) * 1_000_000) / 1_000_000);
});

test("recency uses the workout date before save time or history-array order", () => {
  const input = fixture();
  const latestMiss = makeSession("latest-miss", 21);
  latestMiss.exercises[0].sets[2].reps = 7;
  input.history[0].finishedAt = 2199;
  input.history[1].finishedAt = 2198;
  input.history = [input.history[1], latestMiss, input.history[0]];
  assertUnchanged(input);
});

test("future dates or sessions that finish after the new workout starts cannot provide progression evidence", () => {
  for (const change of [
    { workoutDate: "2026-09-23" },
    { finishedAt: 2300 },
    { startedAt: 2300, finishedAt: 2350 },
  ]) {
    const input = fixture();
    Object.assign(input.history[1], change);
    assertUnchanged(input);
  }
});

test("future imported workouts are excluded before selecting the two latest prior attempts", () => {
  const input = fixture();
  const future = makeSession("future", 23);
  future.exercises[0].sets[0].reps = 1;
  input.history.push(future);
  const result = progress(input);
  assert.equal(result.increases.length, 1);
  assert.deepEqual(result.increases[0].evidenceSessionIds, ["latest", "older"]);

  input.history[1].exercises[0].sets[0].reps = 7;
  future.exercises[0].sets[0].reps = 8;
  assertUnchanged(input);
});

test("a started workload, mismatched template, or duplicate invocation cannot receive another increase", () => {
  const started = fixture();
  started.workout.exercises[0].sets[0].completed = true;
  assertUnchanged(started);
  const wrongTemplate = fixture();
  wrongTemplate.workout.sourceRoutineId = "different-template";
  assertUnchanged(wrongTemplate);
  const input = fixture();
  input.workout = progress(input).workout;
  assertUnchanged(input);
});

test("starting-weight explanations survive a reload and remain bound to the active workout", () => {
  const input = fixture();
  const result = progress(input);
  const reloaded = JSON.parse(JSON.stringify(result.workout));
  const expected = { ...result.increases[0] };
  delete expected.evidenceSessionIds;
  assert.deepEqual(getWorkoutStartingWeightIncreases(reloaded), [expected]);
  assert.deepEqual(reloaded.startingWeightAdjustments, expected.sets);
  assert.deepEqual(getWorkoutStartingWeightIncreases(fixture().workout), [], "a different imported workout cannot inherit another workout's explanation");
  reloaded.exercises[0].sets[0].weightKg = 70;
  assert.deepEqual(getWorkoutStartingWeightIncreases(reloaded), [expected], "metadata records what happened at the start, preserving the original values for conditional undo");
  const before = structuredClone(reloaded);
  getWorkoutStartingWeightIncreases(reloaded);
  assert.deepEqual(reloaded, before);
  reloaded.startingWeightAdjustments = undefined;
  assert.deepEqual(getWorkoutStartingWeightIncreases(reloaded), [], "clearing metadata after undo also clears the explanation");
});

test("orphaned and foreign set references cannot create starting-weight explanations", () => {
  const input = fixture();
  const workout = progress(input).workout;
  workout.startingWeightAdjustments.forEach((adjustment) => { adjustment.setId = `foreign-${adjustment.setId}`; });
  assert.deepEqual(getWorkoutStartingWeightIncreases(workout), []);
  const withRemovedRow = progress(fixture()).workout;
  withRemovedRow.exercises = [];
  assert.deepEqual(getWorkoutStartingWeightIncreases(withRemovedRow), []);
  const finished = progress(fixture()).workout;
  finished.finishedAt = 2300;
  assert.deepEqual(getWorkoutStartingWeightIncreases(finished), []);
  for (const changedMeaning of [{ tracking: "duration" }, { weightMode: "assistance" }]) {
    const changed = progress(fixture()).workout;
    Object.assign(changed.exercises[0], changedMeaning);
    assert.deepEqual(getWorkoutStartingWeightIncreases(changed), []);
  }
});

test("persisted adjustment metadata prevents reapplying progression even after manual load changes", () => {
  const input = fixture();
  input.workout = JSON.parse(JSON.stringify(progress(input).workout));
  input.workout.exercises[0].sets.forEach((set) => { set.weightKg = 60; });
  assertUnchanged(input);
  input.workout.exercises[0].sets[0].completed = true;
  assertUnchanged(input);
});

test("the operation preserves order, IDs, notes, and inputs without mutation", () => {
  const input = fixture();
  const before = structuredClone(input);
  const result = progress(input);
  assert.deepEqual(input, before);
  assert.deepEqual(result.workout, {
    ...before.workout,
    startingWeightAdjustments: result.increases.flatMap((increase) => increase.sets),
    exercises: before.workout.exercises.map((exercise) => ({
      ...exercise, sets: exercise.sets.map((set) => ({ ...set, weightKg: 62.5 })),
    })),
  });
  assert.equal(result.workout.exercises[0].sets.some((set) => set.completed), false);
});
