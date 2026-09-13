import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/exercise-search.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { matchesExerciseSearch, mergeExerciseCatalog, findExistingExercise } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const goodMorning = { exerciseKey: "good-morning-barbell", name: "Good Morning (Barbell)", category: "Legs" };
const barbellRow = {
  exerciseKey: "barbell-row", name: "Barbell row", category: "Back",
  aliases: ["Bent Over Row (Barbell)", "Bent-over barbell row"],
};
const tBarRow = { exerciseKey: "t-bar-row", name: "T-Bar Row", category: "Back" };

test("finds movement names regardless of word order, punctuation, and equipment placement", () => {
  assert.ok(matchesExerciseSearch(goodMorning, "good morning barbell"));
  assert.ok(matchesExerciseSearch(goodMorning, "BARBELL good-morning"));
  assert.ok(matchesExerciseSearch(tBarRow, "t bar row"));
  assert.ok(matchesExerciseSearch(barbellRow, "bent over row"));
  assert.ok(matchesExerciseSearch(barbellRow, "bent-over barb"));
  assert.ok(matchesExerciseSearch(barbellRow, "row dumbbell", { equipment: "Dumbbell", muscles: ["Lats"] }));
  assert.ok(matchesExerciseSearch(barbellRow, "lats back", { muscles: ["Lats"] }));
  assert.ok(matchesExerciseSearch(barbellRow, "  "));
  assert.equal(matchesExerciseSearch(barbellRow, "bent over dumbbell", { equipment: "Barbell" }), false);
  assert.equal(matchesExerciseSearch(barbellRow, "t bar row", { muscles: ["Traps"] }), false);
});

test("keeps personal and saved identities when a new built-in has the same name", () => {
  const personal = { ...goodMorning, exerciseKey: "custom-exercise-1", category: "Custom" };
  const saved = { ...goodMorning, exerciseKey: "legacy-good-morning", category: "Saved" };
  const oldName = { ...barbellRow, name: "Old row display name", category: "Saved" };
  const groups = [[goodMorning, barbellRow], [personal], [saved, oldName, personal]];
  const snapshot = structuredClone(groups);
  const catalog = mergeExerciseCatalog(...groups);

  assert.deepEqual(catalog.map((exercise) => exercise.exerciseKey), [
    "good-morning-barbell", "barbell-row", "custom-exercise-1", "legacy-good-morning",
  ]);
  assert.equal(catalog.find((exercise) => exercise.exerciseKey === "custom-exercise-1").category, "Custom");
  assert.equal(catalog.find((exercise) => exercise.exerciseKey === "legacy-good-morning").category, "Saved");
  assert.deepEqual(catalog.find((exercise) => exercise.exerciseKey === "barbell-row").aliases, barbellRow.aliases);
  assert.deepEqual(groups, snapshot, "catalog construction must not change saved records");
});

test("selects an existing personal identity before a same-name built-in during custom creation", () => {
  const personal = { ...goodMorning, exerciseKey: "custom-exercise-1", category: "Custom" };
  const saved = { ...goodMorning, exerciseKey: "legacy-good-morning", category: "Saved" };

  assert.equal(findExistingExercise([goodMorning, saved, personal], "good morning barbell"), personal);
  assert.equal(findExistingExercise([goodMorning, saved], "Good Morning (Barbell)"), saved);
  assert.equal(findExistingExercise([barbellRow], "Bent-over barbell row"), barbellRow);
  assert.equal(findExistingExercise([barbellRow], "New movement"), undefined);
  assert.equal(findExistingExercise([barbellRow], "  "), undefined);
});
