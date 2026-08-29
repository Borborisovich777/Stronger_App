import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importEffortModule() {
  const source = await readFile(new URL("app/effort.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "effort.ts",
  });
  return import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
}

const effort = await importEffortModule();

test("RPE choices are bounded working-set values in half steps", () => {
  assert.deepEqual(effort.effortValues("rpe"), [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]);
  assert.match(effort.effortHint("rpe"), /Rate of Perceived Exertion/);
  assert.match(effort.effortHint("rpe"), /maximal effort/);
  assert.match(effort.effortHint("rpe"), /2 good-form reps left/);
});

test("RIR choices state the remaining-rep meaning", () => {
  assert.deepEqual(effort.effortValues("rir"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(effort.effortOptionLabel("rir", 1), "1 rep left");
  assert.equal(effort.effortOptionLabel("rir", 2), "2 reps left");
  assert.match(effort.effortHint("rir"), /Reps in Reserve/);
  assert.match(effort.effortHint("rir"), /RIR 0/);
});

test("stored effort retains its original scale when formatted", () => {
  assert.equal(effort.formatSetEffort({ scale: "rpe", value: 8.5 }), "RPE 8.5");
  assert.equal(effort.formatSetEffort({ scale: "rir", value: 2 }), "RIR 2");
});

test("marking a performed set incomplete removes completion-only context", () => {
  const completed = {
    id: "set-effort",
    weightKg: 80,
    reps: 6,
    completed: true,
    completedAt: 1_000,
    effort: { scale: "rpe", value: 8.5 },
  };
  const incomplete = effort.toggleSetCompletion(completed, 2_000);

  assert.deepEqual(incomplete, {
    id: "set-effort",
    weightKg: 80,
    reps: 6,
    completed: false,
  });
  assert.deepEqual(completed.effort, { scale: "rpe", value: 8.5 }, "the helper must not mutate its input");

  const repeated = effort.toggleSetCompletion(incomplete, 3_000);
  assert.equal(repeated.completed, true);
  assert.equal(repeated.completedAt, 3_000);
  assert.equal(repeated.effort, undefined);
});
