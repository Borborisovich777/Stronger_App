import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importHistoryCsvModule() {
  const source = await readFile(new URL("app/historyCsv.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "historyCsv.ts",
  });
  return import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
}

const historyCsv = await importHistoryCsvModule();

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 1; index < csv.length; index += 1) {
    const character = csv[index];
    if (quoted && character === '"' && csv[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && character === "\r" && csv[index + 1] === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      index += 1;
    } else {
      cell += character;
    }
  }
  return rows;
}

function session({ id, name, date, startedAt, finishedAt, exercises = [] }) {
  return { id, name, workoutDate: date, startedAt, finishedAt, exercises };
}

test("exports stable human-readable rows for complete and incomplete saved sets", () => {
  const history = [session({
    id: "workout-1",
    name: "Push, heavy",
    date: "2026-08-29",
    startedAt: Date.parse("2026-08-29T08:00:00.000Z"),
    finishedAt: Date.parse("2026-08-29T08:02:00.000Z"),
    exercises: [{
      id: "exercise-1",
      exerciseKey: "bench-press",
      name: "Bench \"wide\"\npress",
      restSeconds: 90,
      sets: [
        { id: "set-1", weightKg: 80.5, reps: 6, completed: true, completedAt: Date.parse("2026-08-29T08:01:00.000Z"), effort: { scale: "rpe", value: 8.5 } },
        { id: "set-2", weightKg: 82.5, reps: 5, completed: false },
      ],
    }],
  })];

  const rows = parseCsv(historyCsv.buildHistoryCsv(history));
  assert.equal(rows.length, 3);
  assert.equal(rows[0].length, 22);
  assert.deepEqual(rows[0].slice(0, 12), [
    "workout_date", "workout_name", "duration_seconds", "exercise_name", "exercise_key",
    "exercise_order", "set_order", "completed", "weight_kg", "reps", "effort_scale", "effort_value",
  ]);
  assert.deepEqual(rows[1].slice(0, 12), [
    "2026-08-29", "Push, heavy", "120", "Bench \"wide\"\npress", "bench-press",
    "1", "1", "yes", "80.5", "6", "RPE", "8.5",
  ]);
  assert.equal(rows[1][14], "2026-08-29T08:01:00.000Z");
  assert.deepEqual(rows[2].slice(6, 15), ["2", "no", "82.5", "5", "", "", "2026-08-29T08:00:00.000Z", "2026-08-29T08:02:00.000Z", ""]);
});

test("keeps empty saved workouts visible and preserves history order", () => {
  const history = [
    session({ id: "first", name: "First", date: "2026-08-28", startedAt: 100, finishedAt: 200 }),
    session({ id: "second", name: "Second", date: "2026-08-29", startedAt: 300, finishedAt: 400 }),
  ];
  const before = structuredClone(history);
  const rows = parseCsv(historyCsv.buildHistoryCsv(history));

  assert.equal(rows.length, 3);
  assert.equal(rows[1][1], "First");
  assert.equal(rows[1][15], "first");
  assert.equal(rows[2][1], "Second");
  assert.deepEqual(history, before, "CSV derivation must not mutate history");
});

test("neutralizes spreadsheet formulas in user-controlled text", () => {
  const rows = parseCsv(historyCsv.buildHistoryCsv([
    session({ id: "formula", name: " =2+2", date: "2026-08-29", startedAt: 100, finishedAt: 200 }),
  ]));

  assert.equal(rows[1][1], "' =2+2");
});

test("empty history produces a UTF-8 header-only file", () => {
  const csv = historyCsv.buildHistoryCsv([]);
  const rows = parseCsv(csv);

  assert.equal(csv.charCodeAt(0), 0xFEFF);
  assert.equal(rows.length, 1);
  assert.equal(rows[0][0], "workout_date");
});

test("exports drop continuations with their parent and within-set order", () => {
  const rows = parseCsv(historyCsv.buildHistoryCsv([session({
    id: "drop-workout",
    name: "Drop day",
    date: "2026-09-03",
    startedAt: 100,
    finishedAt: 200,
    exercises: [{
      id: "exercise-1",
      exerciseKey: "curl",
      name: "Curl",
      restSeconds: 90,
      sets: [
        { id: "root", weightKg: 20, reps: 8, completed: true },
        {
          id: "drop-1",
          weightKg: 16,
          reps: 6,
          completed: true,
          completedAt: 150,
          effort: { scale: "rir", value: 2 },
          dropSetOf: "root",
        },
        { id: "drop-2", weightKg: 12.8, reps: 5, completed: true, dropSetOf: "root" },
      ],
    }],
  })]));

  assert.deepEqual(rows[0].slice(19), ["set_type", "drop_set_of", "drop_order"]);
  assert.deepEqual(rows[1].slice(19), ["working", "", ""]);
  assert.deepEqual(rows[2].slice(19), ["drop", "root", "1"]);
  assert.deepEqual(rows[2].slice(10, 12), ["RIR", "2"]);
  assert.equal(rows[2][14], "1970-01-01T00:00:00.150Z");
  assert.deepEqual(rows[3].slice(19), ["drop", "root", "2"]);
});
