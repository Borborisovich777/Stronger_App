import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importNextSetPreviewModule() {
  const source = await readFile(new URL("app/nextSetPreview.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "nextSetPreview.ts",
  });
  return import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
}

const nextSetPreview = await importNextSetPreviewModule();

function set(id, weightKg, reps, completed, effort) {
  return { id, weightKg, reps, completed, ...(effort ? { effort } : {}) };
}

function exercise(sets, exerciseKey = "bench-press") {
  return { id: "active-exercise", exerciseKey, name: "Bench press", restSeconds: 120, sets };
}

function session(id, timestamp, sets, exerciseKey = "bench-press") {
  return {
    id,
    name: `Session ${id}`,
    workoutDate: `2026-08-${String(timestamp).padStart(2, "0")}`,
    startedAt: timestamp,
    finishedAt: timestamp + 1,
    exercises: [exercise(sets, exerciseKey)],
  };
}

test("previews one small increment when today and the latest saved session meet the plan", () => {
  const active = exercise([
    set("today-1", 60, 8, true),
    set("today-2", 60, 8, false),
  ]);
  const history = [session("prior", 20, [set("prior-1", 60, 8, true)])];
  const result = nextSetPreview.buildNextSetPreview(active, history, 2.5, 100_000);

  assert.equal(result.nextSetId, "today-2");
  assert.equal(result.nextSetNumber, 2);
  assert.equal(result.suggestedWeightKg, 62.5);
  assert.deepEqual(result.todayEvidence, { weightKg: 60, reps: 8 });
  assert.equal(result.historyEvidence.sessionId, "prior");
});

test("does not preview before a preceding set is completed", () => {
  const active = exercise([set("today-1", 60, 8, false)]);
  const history = [session("prior", 20, [set("prior-1", 60, 8, true)])];

  assert.equal(nextSetPreview.buildNextSetPreview(active, history, 2.5, 100_000), null);
});

test("waits for today's effort when effort tracking is enabled", () => {
  const history = [session("prior", 20, [set("prior-1", 60, 8, true)])];
  const withoutEffort = exercise([
    set("today-1", 60, 8, true),
    set("today-2", 60, 8, false),
  ]);
  const withEffort = exercise([
    set("today-1", 60, 8, true, { scale: "rpe", value: 8 }),
    set("today-2", 60, 8, false),
  ]);

  assert.equal(nextSetPreview.buildNextSetPreview(withoutEffort, history, 2.5, 100_000, true), null);
  assert.equal(
    nextSetPreview.buildNextSetPreview(withEffort, history, 2.5, 100_000, true)?.suggestedWeightKg,
    62.5,
  );
});

test("the latest comparable session cannot be skipped in favor of an older success", () => {
  const active = exercise([set("today-1", 60, 8, true), set("today-2", 60, 8, false)]);
  const history = [
    session("older-success", 10, [set("older-1", 60, 8, true)]),
    session("latest-miss", 30, [set("latest-1", 60, 7, true)]),
  ];

  assert.equal(nextSetPreview.buildNextSetPreview(active, history, 2.5, 100_000), null);
});

test("recorded near-limit effort blocks a load-increase preview", () => {
  const safeHistory = [session("prior", 20, [set("prior-1", 60, 8, true)])];
  const highRpe = exercise([
    set("today-1", 60, 8, true, { scale: "rpe", value: 9 }),
    set("today-2", 60, 8, false),
  ]);
  const lowRirHistory = [session("prior", 20, [
    set("prior-1", 60, 8, true, { scale: "rir", value: 1 }),
  ])];

  assert.equal(nextSetPreview.buildNextSetPreview(highRpe, safeHistory, 2.5, 100_000), null);
  assert.equal(nextSetPreview.buildNextSetPreview(
    exercise([set("today-1", 60, 8, true), set("today-2", 60, 8, false)]),
    lowRirHistory,
    2.5,
    100_000,
  ), null);
});

test("RPE 8.5 and RIR 2 remain eligible boundaries", () => {
  const active = exercise([
    set("today-1", 60, 8, true, { scale: "rpe", value: 8.5 }),
    set("today-2", 60, 8, false),
  ]);
  const history = [session("prior", 20, [
    set("prior-1", 60, 8, true, { scale: "rir", value: 2 }),
  ])];

  assert.equal(nextSetPreview.buildNextSetPreview(active, history, 2.5, 100_000)?.suggestedWeightKg, 62.5);
});

test("uses only the same exercise and completed evidence", () => {
  const active = exercise([set("today-1", 60, 8, true), set("today-2", 60, 8, false)]);

  assert.equal(nextSetPreview.buildNextSetPreview(
    active,
    [session("other", 20, [set("other-1", 80, 10, true)], "squat")],
    2.5,
    100_000,
  ), null);
  assert.equal(nextSetPreview.buildNextSetPreview(
    active,
    [session("incomplete", 20, [set("prior-1", 60, 8, false)])],
    2.5,
    100_000,
  ), null);
});

test("selects the latest history evidence without mutating either input", () => {
  const active = exercise([set("today-1", 60, 8, true), set("today-2", 60, 8, false)]);
  const history = [
    session("older", 10, [set("older-1", 60, 8, true)]),
    session("latest", 30, [set("latest-1", 60, 9, true)]),
  ];
  const activeBefore = structuredClone(active);
  const historyBefore = structuredClone(history);
  const result = nextSetPreview.buildNextSetPreview(active, history, 2.5, 100_000);

  assert.equal(result.historyEvidence.sessionId, "latest");
  assert.deepEqual(active, activeBefore);
  assert.deepEqual(history, historyBefore);
});

test("supports a pound-sized increment and refuses to cross the maximum", () => {
  const active = exercise([set("today-1", 60, 8, true), set("today-2", 60, 8, false)]);
  const history = [session("prior", 20, [set("prior-1", 60, 8, true)])];
  const fivePoundsKg = 5 / 2.2046226218;

  assert.equal(
    nextSetPreview.buildNextSetPreview(active, history, fivePoundsKg, 100_000).suggestedWeightKg,
    Math.round((60 + fivePoundsKg) * 1_000_000) / 1_000_000,
  );
  assert.equal(nextSetPreview.buildNextSetPreview(active, history, 2.5, 61), null);
});

test("drop continuations do not shift working-set progression evidence", () => {
  const active = exercise([
    set("today-1", 60, 8, true),
    { ...set("today-drop", 45, 7, true), dropSetOf: "today-1" },
    set("today-2", 60, 8, false),
  ]);
  const history = [session("prior", 20, [
    set("prior-1", 60, 8, true),
    { ...set("prior-drop", 45, 6, true), dropSetOf: "prior-1" },
  ])];
  const result = nextSetPreview.buildNextSetPreview(active, history, 2.5, 100_000);

  assert.equal(result?.nextSetId, "today-2");
  assert.equal(result?.nextSetNumber, 2);
  assert.equal(result?.todayEvidence.weightKg, 60);
  assert.equal(result?.historyEvidence.weightKg, 60);
});
