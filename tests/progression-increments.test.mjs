import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const { progressionIncrementKind, progressionIncrementKg } = await importTypeScriptModule(new URL("../app/progressionIncrements.ts", import.meta.url));
const { applyNextWorkoutProgression } = await importTypeScriptModule(new URL("../app/workoutProgression.ts", import.meta.url));

const kind = (exerciseKey, name = exerciseKey) => progressionIncrementKind({ exerciseKey, name });

test("equipment families choose the smallest practical step", () => {
  for (const key of ["bench-press", "back-squat", "deadlift", "barbell-row", "overhead-press-barbell", "standing-calf-raise-barbell"]) {
    assert.equal(kind(key), "barbell", key);
  }
  for (const key of ["dumbbell-bench-press", "incline-dumbbell-press", "goblet-squat", "romanian-deadlift-dumbbell"]) {
    assert.equal(kind(key), "dumbbell", key);
  }
  for (const key of ["lat-pulldown", "seated-cable-row", "cable-fly", "pec-deck", "leg-press", "triceps-pushdown", "lateral-raise-cable", "leg-extension-machine", "chest-press-machine"]) {
    assert.equal(kind(key), "machine", key);
  }
  for (const key of ["lateral-raise", "biceps-curl", "hammer-curl", "rear-delt-fly", "overhead-triceps-extension", "skullcrusher-dumbbell"]) {
    assert.equal(kind(key), "isolation", key);
  }
});

test("custom exercises are classified from their names", () => {
  assert.equal(kind("custom-1", "Spider curl"), "isolation");
  assert.equal(kind("custom-2", "Cable Y raise"), "machine");
  assert.equal(kind("custom-3", "Landmine press"), "barbell");
});

test("increments convert to kilograms for both units", () => {
  assert.equal(progressionIncrementKg({ exerciseKey: "bench-press", name: "Bench press" }, "kg"), 2.5);
  assert.equal(progressionIncrementKg({ exerciseKey: "lateral-raise", name: "Lateral raise" }, "kg"), 1);
  assert.equal(progressionIncrementKg({ exerciseKey: "dumbbell-bench-press", name: "Dumbbell bench press" }, "kg"), 2);
  assert.equal(progressionIncrementKg({ exerciseKey: "lateral-raise", name: "Lateral raise" }, "lb"), 1.134);
});

function lateralRaiseFixture(weightKg) {
  const exercise = (id, sets) => ({ id, exerciseKey: "lateral-raise", name: "Lateral raise", tracking: "weight-reps", weightMode: "external", restSeconds: 60, sets });
  const sets = (prefix, completed) => [1, 2, 3].map((index) => ({ id: `${prefix}-${index}`, weightKg, reps: 15, completed }));
  const session = (id, day) => ({ id, name: id, workoutDate: `2026-10-${day}`, startedAt: day * 100, finishedAt: day * 100 + 50, exercises: [exercise(`${id}-ex`, sets(id, true))] });
  return {
    routine: { id: "upper", name: "Upper", exercises: [{ id: "t-1", exerciseKey: "lateral-raise", name: "Lateral raise", tracking: "weight-reps", weightMode: "external", targetSets: 3, targetWeightKg: weightKg, targetReps: 12, progressionRepTarget: 15, restSeconds: 60 }] },
    workout: { id: "new", name: "Upper", sourceRoutineId: "upper", workoutDate: "2026-10-28", startedAt: 2800, exercises: [exercise("new-ex", sets("new", false).map((set) => ({ ...set, reps: 12 })))] },
    history: [session("a", 20), session("b", 24)],
  };
}

test("light isolation work now progresses by its own small step", () => {
  const input = lateralRaiseFixture(8);
  const result = applyNextWorkoutProgression(input.routine, input.workout, input.history,
    (exercise) => progressionIncrementKg(exercise, "kg"), 100_000);
  assert.deepEqual(result.workout.exercises[0].sets.map((set) => set.weightKg), [9, 9, 9]);
  assert.equal(result.increases[0].incrementKg, 1);
  // The flat 2.5 kg step is still refused at this load because it is over 20%.
  const flat = applyNextWorkoutProgression(input.routine, input.workout, input.history, 2.5, 100_000);
  assert.deepEqual(flat.increases, []);
});

test("a step above 20% of the working load is still refused", () => {
  const input = lateralRaiseFixture(4);
  const result = applyNextWorkoutProgression(input.routine, input.workout, input.history,
    (exercise) => progressionIncrementKg(exercise, "kg"), 100_000);
  assert.deepEqual(result.increases, []);
});
