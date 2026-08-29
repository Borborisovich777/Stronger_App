import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importPlateCalculatorModule() {
  const source = await readFile(new URL("app/plateCalculator.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "plateCalculator.ts",
  });
  return import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
}

const calculator = await importPlateCalculatorModule();

test("finds an exact kg load from bounded plate pairs", () => {
  const result = calculator.calculatePlateLoad(100, 20, [{ plateWeight: 20, availablePairs: 2 }]);

  assert.equal(result.actualTotal, 100);
  assert.equal(result.loadedPerSide, 40);
  assert.equal(result.shortfall, 0);
  assert.equal(result.exact, true);
  assert.deepEqual(result.platesPerSide, [{ plateWeight: 20, platesPerSide: 2 }]);
});

test("returns the closest load without exceeding the target", () => {
  const result = calculator.calculatePlateLoad(100, 20, [
    { plateWeight: 25, availablePairs: 1 },
    { plateWeight: 10, availablePairs: 1 },
  ]);

  assert.equal(result.actualTotal, 90);
  assert.equal(result.shortfall, 10);
  assert.equal(result.exact, false);
  assert.ok(result.actualTotal <= result.targetTotal);
});

test("never invents more plate pairs than the inventory provides", () => {
  const result = calculator.calculatePlateLoad(120, 20, [
    { plateWeight: 25, availablePairs: 1 },
    { plateWeight: 20, availablePairs: 1 },
  ]);

  assert.equal(result.actualTotal, 110);
  assert.deepEqual(result.platesPerSide, [
    { plateWeight: 25, platesPerSide: 1 },
    { plateWeight: 20, platesPerSide: 1 },
  ]);
});

test("warns when the target is below the entered bar", () => {
  const result = calculator.calculatePlateLoad(15, 20, [{ plateWeight: 5, availablePairs: 10 }]);

  assert.equal(result.targetBelowBar, true);
  assert.equal(result.actualTotal, 20);
  assert.equal(result.loadedPerSide, 0);
  assert.deepEqual(result.platesPerSide, []);
});

test("uses the same arithmetic for pound inventories", () => {
  const result = calculator.calculatePlateLoad(225, 45, [{ plateWeight: 45, availablePairs: 2 }]);

  assert.equal(result.actualTotal, 225);
  assert.equal(result.exact, true);
});

test("is input-order independent and does not mutate inventory", () => {
  const inventory = [
    { plateWeight: 5, availablePairs: 2 },
    { plateWeight: 20, availablePairs: 1 },
    { plateWeight: 10, availablePairs: 1 },
  ];
  const before = structuredClone(inventory);
  const forward = calculator.calculatePlateLoad(90, 20, inventory);
  const reverse = calculator.calculatePlateLoad(90, 20, [...inventory].reverse());

  assert.deepEqual(forward, reverse);
  assert.deepEqual(inventory, before);
});

test("prefers fewer plates when combinations reach the same load", () => {
  const result = calculator.calculatePlateLoad(60, 20, [
    { plateWeight: 10, availablePairs: 2 },
    { plateWeight: 20, availablePairs: 1 },
  ]);

  assert.deepEqual(result.platesPerSide, [{ plateWeight: 20, platesPerSide: 1 }]);
});

test("clamps unsafe counts and values to documented bounds", () => {
  const result = calculator.calculatePlateLoad(Infinity, -10, [
    { plateWeight: 1, availablePairs: 999 },
    { plateWeight: Number.NaN, availablePairs: 4 },
  ]);

  assert.equal(result.targetTotal, 0);
  assert.equal(result.barWeight, 0);
  assert.equal(result.actualTotal, 0);
  assert.deepEqual(result.platesPerSide, []);

  const bounded = calculator.calculatePlateLoad(100, 0, [{ plateWeight: 1, availablePairs: 999 }]);
  assert.equal(bounded.loadedPerSide, calculator.MAX_PLATE_PAIRS_PER_SIZE);
});

test("provides fixed zero-count inventories without sharing mutable arrays", () => {
  const first = calculator.createEmptyPlateInventory("kg");
  const second = calculator.createEmptyPlateInventory("kg");

  assert.deepEqual(first.map((item) => item.plateWeight), [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25]);
  assert.ok(first.every((item) => item.availablePairs === 0));
  assert.notEqual(first, second);
  assert.deepEqual(calculator.plateSizesForUnit("lb"), [55, 45, 35, 25, 10, 5, 2.5, 1.25]);
});
