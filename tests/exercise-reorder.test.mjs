import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importExerciseReorderModule() {
  const source = await readFile(new URL("app/exerciseReorder.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "exerciseReorder.ts",
  });
  return import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
}

const exerciseReorder = await importExerciseReorderModule();

function item(id) {
  return { id, name: `Exercise ${id}` };
}

test("moves an exercise after a target without mutating the original list", () => {
  const original = [item("a"), item("b"), item("c")];
  const snapshot = structuredClone(original);
  const result = exerciseReorder.reorderItemsById(original, "a", "b", "after");

  assert.deepEqual(result.map(({ id }) => id), ["b", "a", "c"]);
  assert.deepEqual(original, snapshot);
  assert.notEqual(result, original);
  assert.equal(result[1], original[0], "reordering should preserve each exercise object");
});

test("moves an exercise before a target in the opposite direction", () => {
  const original = [item("a"), item("b"), item("c")];
  const result = exerciseReorder.reorderItemsById(original, "c", "a", "before");

  assert.deepEqual(result.map(({ id }) => id), ["c", "a", "b"]);
});

test("adjusts insertion indexes correctly across non-adjacent targets", () => {
  const original = [item("a"), item("b"), item("c"), item("d")];

  assert.deepEqual(
    exerciseReorder.reorderItemsById(original, "a", "c", "before").map(({ id }) => id),
    ["b", "a", "c", "d"],
  );
  assert.deepEqual(
    exerciseReorder.reorderItemsById(original, "d", "b", "after").map(({ id }) => id),
    ["a", "b", "d", "c"],
  );
  assert.deepEqual(
    exerciseReorder.reorderItemsById(original, "a", "d", "after").map(({ id }) => id),
    ["b", "c", "d", "a"],
  );
});

test("supports a two-exercise boundary move", () => {
  const original = [item("a"), item("b")];
  const result = exerciseReorder.reorderItemsById(original, "b", "a", "before");

  assert.deepEqual(result.map(({ id }) => id), ["b", "a"]);
  assert.deepEqual(original.map(({ id }) => id), ["a", "b"]);
});

test("returns the original array when the requested placement is already satisfied", () => {
  const original = [item("a"), item("b"), item("c")];

  assert.equal(exerciseReorder.reorderItemsById(original, "a", "b", "before"), original);
  assert.equal(exerciseReorder.reorderItemsById(original, "b", "a", "after"), original);
});

test("returns the original array for same-item and unknown-id requests", () => {
  const original = [item("a"), item("b"), item("c")];

  assert.equal(exerciseReorder.reorderItemsById(original, "a", "a", "before"), original);
  assert.equal(exerciseReorder.reorderItemsById(original, "missing", "a", "before"), original);
  assert.equal(exerciseReorder.reorderItemsById(original, "a", "missing", "after"), original);
});

test("long-press timing and movement tolerance keep normal taps and tiny movement inert", () => {
  assert.equal(exerciseReorder.EXERCISE_LONG_PRESS_MS, 450);
  assert.equal(exerciseReorder.EXERCISE_LONG_PRESS_MOVE_TOLERANCE_PX, 10);
  assert.equal(exerciseReorder.movedBeyondLongPressTolerance(0, 0, 6, 8), false);
  assert.equal(exerciseReorder.movedBeyondLongPressTolerance(0, 0, 6, 8.1), true);
  assert.equal(exerciseReorder.movedBeyondLongPressTolerance(50, 50, 51, 51), false);
});
