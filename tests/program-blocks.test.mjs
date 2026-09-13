import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const projectRoot = new URL("../", import.meta.url);

async function importProgramBlocksModule() {
  return importTypeScriptModule(new URL("app/programBlocks.ts", projectRoot));
}

const programBlocks = await importProgramBlocksModule();

const routine = {
  id: "routine-test",
  name: "Test routine",
  exercises: [{
    id: "exercise-test",
    exerciseKey: "test-squat",
    name: "Test squat",
    targetSets: 3,
    targetWeightKg: 80,
    targetReps: 6,
    restSeconds: 120,
  }],
};

test("a program block is an independent routine snapshot with neutral weeks", () => {
  let identity = 0;
  const block = programBlocks.copyRoutineToProgramBlock(routine, 3, 1_000, (prefix) => `${prefix}-${identity += 1}`);

  assert.equal(block.sourceRoutineId, routine.id);
  assert.equal(block.sourceRoutineName, routine.name);
  assert.equal(block.createdAt, 1_000);
  assert.deepEqual(block.weeks.map((week) => week.loadPercent), [100, 100, 100]);
  assert.notEqual(block.exercises[0], routine.exercises[0]);

  block.exercises[0].targetWeightKg = 90;
  assert.equal(routine.exercises[0].targetWeightKg, 80, "editing the copy must not mutate its routine source");
});

test("week edits stay inside the copied block", () => {
  let identity = 0;
  const block = programBlocks.copyRoutineToProgramBlock(routine, 2, 1_000, (prefix) => `${prefix}-${identity += 1}`);
  const updated = programBlocks.updateProgramBlockWeek(block, block.weeks[1].id, 90);

  assert.deepEqual(block.weeks.map((week) => week.loadPercent), [100, 100]);
  assert.deepEqual(updated.weeks.map((week) => week.loadPercent), [100, 90]);
  assert.equal(updated.exercises, block.exercises, "a week adjustment must not rewrite the exercise snapshot");
});

test("load previews are arithmetic only", () => {
  assert.equal(programBlocks.programBlockTargetWeight(80, { id: "week-test", loadPercent: 90 }), 72);
  assert.equal(programBlocks.programBlockTargetWeight(82.5, { id: "week-test", loadPercent: 105 }), 86.625);
});

test("program load percentages preserve timed and assistance targets while scaling external load", () => {
  const week = { id: "week", loadPercent: 110 };
  const target = { id: "exercise", exerciseKey: "running", name: "Running", targetSets: 1, targetWeightKg: 40, targetReps: 0, targetDurationSeconds: 600, targetDistanceMeters: 1500, restSeconds: 0, tracking: "distance-duration", weightMode: "external" };
  assert.deepEqual(programBlocks.programBlockExerciseTarget(target, week), target);
  const assistance = { ...target, exerciseKey: "assisted-chin-up", tracking: "weight-reps", weightMode: "assistance", targetReps: 8 };
  assert.deepEqual(programBlocks.programBlockExerciseTarget(assistance, week), assistance);
  const strength = { ...target, exerciseKey: "bench-press", tracking: "weight-reps", weightMode: "external", targetReps: 8 };
  assert.equal(programBlocks.programBlockExerciseTarget(strength, week).targetWeightKg, 44);
  assert.equal(programBlocks.programBlockExerciseTarget({ ...target, tracking: "reps" }, week).targetWeightKg, 40);
  assert.equal(target.targetWeightKg, 40, "program projection must not mutate the routine");
});
