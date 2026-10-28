import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const { progressionIncrementKind, progressionIncrementKg } = await importTypeScriptModule(new URL("../app/progressionIncrements.ts", import.meta.url));
const { applyNextWorkoutProgression, earnedJumpRepTarget } = await importTypeScriptModule(new URL("../app/workoutProgression.ts", import.meta.url));

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
  assert.equal(progressionIncrementKg({ exerciseKey: "lateral-raise", name: "Lateral raise" }, "kg"), 2.5);
  assert.equal(progressionIncrementKg({ exerciseKey: "dumbbell-bench-press", name: "Dumbbell bench press" }, "kg"), 2.5);
  assert.equal(progressionIncrementKg({ exerciseKey: "lateral-raise", name: "Lateral raise" }, "lb"), 1.134);
  assert.equal(progressionIncrementKg({ exerciseKey: "dumbbell-bench-press", name: "Dumbbell bench press" }, "lb"), 2.268);
  assert.equal(progressionIncrementKg({ exerciseKey: "lat-pulldown", name: "Lat pulldown" }, "kg"), 3.75);
  assert.equal(progressionIncrementKg({ exerciseKey: "bench-press-smith-machine", name: "Bench press (Smith machine)" }, "kg"), 2.5);
});

function lateralRaiseFixture(weightKg, loggedReps = 15) {
  const exercise = (id, sets) => ({ id, exerciseKey: "lateral-raise", name: "Lateral raise", tracking: "weight-reps", weightMode: "external", restSeconds: 60, sets });
  const sets = (prefix, completed, reps) => [1, 2, 3].map((index) => ({ id: `${prefix}-${index}`, weightKg, reps, completed }));
  const session = (id, day) => ({ id, name: id, workoutDate: `2026-10-${day}`, startedAt: day * 100, finishedAt: day * 100 + 50, exercises: [exercise(`${id}-ex`, sets(id, true, loggedReps))] });
  return {
    routine: { id: "upper", name: "Upper", exercises: [{ id: "t-1", exerciseKey: "lateral-raise", name: "Lateral raise", tracking: "weight-reps", weightMode: "external", targetSets: 3, targetWeightKg: weightKg, targetReps: 12, progressionRepTarget: 15, restSeconds: 60 }] },
    workout: { id: "new", name: "Upper", sourceRoutineId: "upper", workoutDate: "2026-10-28", startedAt: 2800, exercises: [exercise("new-ex", sets("new", false, 12))] },
    history: [session("a", 20), session("b", 24)],
  };
}

const byExercise = (exercise) => progressionIncrementKg(exercise, "kg");

test("earned-jump rep targets add about 20% more reps, at least two", () => {
  assert.equal(earnedJumpRepTarget(15), 18);
  assert.equal(earnedJumpRepTarget(12), 15);
  assert.equal(earnedJumpRepTarget(8), 10);
});

test("a step within 20% only needs the top of the range", () => {
  const input = lateralRaiseFixture(12.5);
  const result = applyNextWorkoutProgression(input.routine, input.workout, input.history, byExercise, 100_000);
  assert.deepEqual(result.workout.exercises[0].sets.map((set) => set.weightKg), [15, 15, 15]);
  assert.deepEqual(result.workout.exercises[0].sets.map((set) => set.reps), [12, 12, 12]);
});

test("a bigger dumbbell jump waits until every set beats the range by the extra reps", () => {
  const atTop = lateralRaiseFixture(7.5, 15);
  assert.deepEqual(applyNextWorkoutProgression(atTop.routine, atTop.workout, atTop.history, byExercise, 100_000).increases, []);
  const earned = lateralRaiseFixture(7.5, 18);
  const result = applyNextWorkoutProgression(earned.routine, earned.workout, earned.history, byExercise, 100_000);
  assert.deepEqual(result.workout.exercises[0].sets.map((set) => set.weightKg), [10, 10, 10]);
  assert.equal(result.increases[0].incrementKg, 2.5);
});

test("a machine moves by the 3.75 kg add-on weight", () => {
  const input = lateralRaiseFixture(30);
  for (const exercise of [...input.routine.exercises, input.workout.exercises[0], ...input.history.map((session) => session.exercises[0])]) {
    exercise.exerciseKey = "lat-pulldown";
    exercise.name = "Lat pulldown";
  }
  const result = applyNextWorkoutProgression(input.routine, input.workout, input.history, byExercise, 100_000);
  assert.deepEqual(result.workout.exercises[0].sets.map((set) => set.weightKg), [33.75, 33.75, 33.75]);
});

test("a step above 50% of the working load is never applied", () => {
  const input = lateralRaiseFixture(4, 30);
  assert.deepEqual(applyNextWorkoutProgression(input.routine, input.workout, input.history, byExercise, 100_000).increases, []);
});
