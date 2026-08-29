import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importExerciseModule() {
  const source = await readFile(new URL("app/exercises.ts", projectRoot), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "exercises.ts",
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

const exercises = await importExerciseModule();

test("horizontal press alternatives use different equipment without duplicating setups", () => {
  const alternatives = exercises.equipmentAlternativesFor("bench-press");

  assert.deepEqual(
    alternatives.map((exercise) => [exercise.exerciseKey, exercise.equipment]),
    [
      ["dumbbell-bench-press", "Dumbbells"],
      ["chest-press-machine", "Machine"],
      ["push-up", "Bodyweight"],
    ],
  );
  assert.ok(alternatives.every((exercise) => exercise.movementLabel === "Horizontal press"));
});

test("alternative lists exclude the selected setup and keep one option per equipment type", () => {
  const alternatives = exercises.equipmentAlternativesFor("goblet-squat");
  const equipment = alternatives.map((exercise) => exercise.equipment);

  assert.deepEqual(alternatives.map((exercise) => exercise.exerciseKey), ["back-squat", "leg-press"]);
  assert.equal(equipment.includes("Dumbbells"), false);
  assert.equal(new Set(equipment).size, equipment.length);
});

test("only curated built-in movements receive equipment alternatives", () => {
  assert.deepEqual(exercises.equipmentAlternativesFor("deadlift"), []);
  assert.deepEqual(exercises.equipmentAlternativesFor("shoulder-press"), []);
  assert.deepEqual(exercises.equipmentAlternativesFor("assisted-pull-up"), []);
  assert.deepEqual(exercises.equipmentAlternativesFor("custom-exercise-1"), []);
  assert.equal(exercises.equipmentForExercise("deadlift"), null);
  assert.equal(exercises.equipmentForExercise("shoulder-press"), null);
});

test("deriving alternatives does not mutate or invent catalog exercises", () => {
  const before = structuredClone(exercises.BUILT_IN_EXERCISES);
  const alternatives = exercises.equipmentAlternativesFor("barbell-row");
  const catalogKeys = new Set(exercises.BUILT_IN_EXERCISES.map((exercise) => exercise.exerciseKey));

  assert.ok(alternatives.length > 0);
  assert.ok(alternatives.every((exercise) => catalogKeys.has(exercise.exerciseKey)));
  assert.deepEqual(exercises.BUILT_IN_EXERCISES, before);
});
