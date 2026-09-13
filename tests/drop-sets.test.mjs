import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const projectRoot = new URL("../", import.meta.url);

async function importDropSetsModule() {
  return importTypeScriptModule(new URL("app/dropSets.ts", projectRoot));
}

const dropSets = await importDropSetsModule();

function set(id, weightKg, reps = 8, completed = false, dropSetOf) {
  return { id, weightKg, reps, completed, ...(dropSetOf ? { dropSetOf } : {}) };
}

function exercise(sets) {
  return { id: "exercise", exerciseKey: "bench", name: "Bench press", restSeconds: 120, sets };
}

test("a new drop continues the working set at 20% less load with blank reps", () => {
  const original = exercise([set("work-1", 100), set("work-2", 90)]);
  const result = dropSets.insertDropSegment(original, "work-1", "drop-1");

  assert.deepEqual(result.sets.map((item) => item.id), ["work-1", "drop-1", "work-2"]);
  assert.deepEqual(result.sets[1], {
    id: "drop-1",
    weightKg: 80,
    reps: 0,
    completed: false,
    dropSetOf: "work-1",
  });
  assert.deepEqual(original.sets.map((item) => item.id), ["work-1", "work-2"], "insertion must not mutate the exercise");
});

test("additional drops append to the group and reduce from the latest segment", () => {
  const withFirstDrop = exercise([
    set("work-1", 100),
    set("drop-1", 80, 6, false, "work-1"),
    set("work-2", 90),
  ]);
  const result = dropSets.insertDropSegment(withFirstDrop, "work-1", "drop-2");

  assert.deepEqual(result.sets.map((item) => item.id), ["work-1", "drop-1", "drop-2", "work-2"]);
  assert.equal(result.sets[2].weightKg, 64);
  assert.equal(result.sets[2].dropSetOf, "work-1");
  assert.equal(dropSets.dropNumber(result, result.sets[2]), 2);
  assert.equal(dropSets.workingSetNumber(result, result.sets[2]), 1);
});

test("zero and invalid loads stay zero instead of inventing external weight", () => {
  assert.equal(dropSets.suggestedDropWeightKg(0), 0);
  assert.equal(dropSets.suggestedDropWeightKg(Number.NaN), 0);
  assert.equal(dropSets.suggestedDropWeightKg(2.5), 2);
});

test("working-set and drop counts stay distinct while all segments remain available", () => {
  const workout = {
    id: "workout",
    name: "Push",
    workoutDate: "2026-09-03",
    startedAt: 1,
    exercises: [exercise([
      set("work-1", 100, 8, true),
      set("drop-1", 80, 6, true, "work-1"),
      set("work-2", 90, 8, false),
    ])],
  };

  assert.deepEqual(dropSets.completedWorkingSets(workout).map((item) => item.id), ["work-1"]);
  assert.deepEqual(dropSets.completedDropSegments(workout).map((item) => item.id), ["drop-1"]);
  assert.deepEqual(dropSets.completedSetSegments(workout).map((item) => item.id), ["work-1", "drop-1"]);
});

test("completed counters defensively exclude entries with no recorded reps", () => {
  const workout = {
    exercises: [exercise([
      set("work-1", 20, 0, true),
      set("drop-1", 16, 0, true, "work-1"),
      set("work-2", 20, 8, true),
      set("drop-2", 16, 5, true, "work-2"),
    ])],
  };

  assert.deepEqual(dropSets.completedWorkingSets(workout).map((item) => item.id), ["work-2"]);
  assert.deepEqual(dropSets.completedDropSegments(workout).map((item) => item.id), ["drop-2"]);
  assert.deepEqual(dropSets.completedSetSegments(workout).map((item) => item.id), ["work-2", "drop-2"]);
});

test("removing a working set cascades to its drops while removing one drop is narrow", () => {
  const original = exercise([
    set("work-1", 100),
    set("drop-1", 80, 6, false, "work-1"),
    set("drop-2", 64, 5, false, "work-1"),
    set("work-2", 90),
  ]);

  const afterMiddleDropRemoval = dropSets.removeSetWithContinuations(original, "drop-1");
  assert.deepEqual(afterMiddleDropRemoval.sets.map((item) => item.id), ["work-1", "drop-2", "work-2"]);
  assert.equal(dropSets.dropNumber(afterMiddleDropRemoval, afterMiddleDropRemoval.sets[1]), 1);
  assert.deepEqual(
    dropSets.removeSetWithContinuations(original, "work-1").sets.map((item) => item.id),
    ["work-2"],
  );
});

test("timed work counts as a completed working set but cannot create drop continuations", () => {
  const timed = { ...exercise([{ id: "run", weightKg: 0, reps: 0, durationSeconds: 600, distanceMeters: 1500, completed: true }]), tracking: "distance-duration" };
  const session = { id: "session", name: "Cardio", workoutDate: "2026-09-03", startedAt: 100, exercises: [timed] };
  assert.equal(dropSets.completedWorkingSets(session).length, 1);
  assert.equal(dropSets.completedSetSegments(session).length, 1);
  assert.equal(dropSets.completedDropSegments(session).length, 0);
  assert.equal(dropSets.insertDropSegment(timed, "run", "drop"), timed);
  const assistance = { ...exercise([set("assist", 30, 8, true)]), tracking: "weight-reps", weightMode: "assistance" };
  assert.equal(dropSets.insertDropSegment(assistance, "assist", "drop"), assistance);
  assert.equal(dropSets.workingSetNumber({ sets: timed.sets }, timed.sets[0]), 1);
});
