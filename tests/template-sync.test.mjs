import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const { workoutDiffersFromTemplate, templateFromWorkout, replaceExerciseEverywhere, exerciseUseCounts } =
  await importTypeScriptModule(new URL("../app/templateSync.ts", import.meta.url));

function row(id, exerciseKey, name, extra = {}) {
  return { id, exerciseKey, name, tracking: "weight-reps", weightMode: "external", targetSets: 3, targetWeightKg: 40, targetReps: 8, progressionRepTarget: 12, restSeconds: 120, ...extra };
}
function done(id, exerciseKey, name, sets = 3, weightKg = 40, reps = 10) {
  return { id, exerciseKey, name, tracking: "weight-reps", weightMode: "external", restSeconds: 120,
    sets: Array.from({ length: sets }, (_, index) => ({ id: `${id}-${index}`, weightKg, reps, completed: true })) };
}
const routine = { id: "upper-b", name: "Upper B", exercises: [
  row("r1", "bench-press", "Bench press"),
  row("r2", "lateral-raise-dumbbell", "Lateral Raise (Dumbbell)", { targetReps: 12, progressionRepTarget: 15, targetWeightKg: 7.5 }),
  row("r3", "lat-pulldown", "Lat pulldown"),
] };
function workout(exercises) {
  return { id: "w", name: "Upper B", workoutDate: "2026-11-01", startedAt: 1, finishedAt: 2, sourceRoutineId: "upper-b", exercises };
}
let counter = 0;
const createId = (prefix) => `${prefix}-${++counter}`;

test("an unchanged workout does not offer a template update", () => {
  const same = workout([done("a", "bench-press", "Bench press"), done("b", "lateral-raise-dumbbell", "Lateral Raise (Dumbbell)"), done("c", "lat-pulldown", "Lat pulldown")]);
  assert.equal(workoutDiffersFromTemplate(same, routine), false);
});

test("a swapped exercise, set count or order change offers an update", () => {
  assert.equal(workoutDiffersFromTemplate(workout([done("a", "bench-press", "Bench press"), done("b", "lateral-raise", "Lateral raise"), done("c", "lat-pulldown", "Lat pulldown")]), routine), true);
  assert.equal(workoutDiffersFromTemplate(workout([done("a", "bench-press", "Bench press", 4), done("b", "lateral-raise-dumbbell", "Lateral Raise (Dumbbell)"), done("c", "lat-pulldown", "Lat pulldown")]), routine), true);
  assert.equal(workoutDiffersFromTemplate(workout([done("c", "lat-pulldown", "Lat pulldown"), done("a", "bench-press", "Bench press"), done("b", "lateral-raise-dumbbell", "Lateral Raise (Dumbbell)")]), routine), true);
});

test("the template follows the workout and keeps plans for kept and swapped slots", () => {
  const session = workout([
    done("a", "bench-press", "Bench press", 4),
    done("b", "lateral-raise", "Lateral raise", 3, 7.5, 14),
    done("c", "lat-pulldown", "Lat pulldown"),
    done("d", "face-pull", "Face pull", 2, 20, 15),
  ]);
  const result = templateFromWorkout(routine, session, createId);
  assert.deepEqual(result.exercises.map((exercise) => exercise.exerciseKey), ["bench-press", "lateral-raise", "lat-pulldown", "face-pull"]);
  assert.equal(result.exercises[0].id, "r1");
  assert.equal(result.exercises[0].targetSets, 4);
  assert.equal(result.exercises[0].targetWeightKg, 40);
  assert.equal(result.exercises[1].targetReps, 12);
  assert.equal(result.exercises[1].progressionRepTarget, 15);
  assert.equal(result.exercises[1].targetWeightKg, 7.5);
  assert.equal(result.exercises[2].id, "r3");
  assert.equal(result.exercises[3].targetReps, 15);
  assert.equal(result.exercises[3].progressionRepTarget, undefined);
  assert.equal(result.name, "Upper B");
  assert.equal(routine.exercises.length, 3);
});

test("exercises with no sets left are dropped from the template", () => {
  const session = workout([done("a", "bench-press", "Bench press"), { ...done("b", "lat-pulldown", "Lat pulldown"), sets: [] }]);
  assert.deepEqual(templateFromWorkout(routine, session, createId).exercises.map((exercise) => exercise.exerciseKey), ["bench-press"]);
});

test("replacing a duplicate everywhere moves templates and, optionally, history", () => {
  const data = {
    formatVersion: 1, customExercises: [], routines: [routine], programBlocks: [], activeWorkout: null,
    history: [workout([done("h", "lateral-raise-dumbbell", "Lateral Raise (Dumbbell)")])],
    settings: { unit: "kg", defaultRestSeconds: 90, goal: "muscle", weeklyDays: 4 },
  };
  assert.deepEqual(exerciseUseCounts(data, "lateral-raise-dumbbell"), { templates: 1, workouts: 1 });
  const target = { exerciseKey: "lateral-raise", name: "Lateral raise", tracking: "weight-reps", weightMode: "external" };
  const templatesOnly = replaceExerciseEverywhere(data, "lateral-raise-dumbbell", target, false);
  assert.equal(templatesOnly.routines[0].exercises[1].exerciseKey, "lateral-raise");
  assert.equal(templatesOnly.routines[0].exercises[1].targetWeightKg, 7.5);
  assert.equal(templatesOnly.history, data.history);
  const withHistory = replaceExerciseEverywhere(data, "lateral-raise-dumbbell", target, true);
  assert.equal(withHistory.history[0].exercises[0].exerciseKey, "lateral-raise");
  assert.deepEqual(withHistory.history[0].exercises[0].sets, data.history[0].exercises[0].sets);
  assert.equal(data.history[0].exercises[0].exerciseKey, "lateral-raise-dumbbell");
});
