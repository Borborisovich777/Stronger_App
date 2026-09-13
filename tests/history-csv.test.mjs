import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const projectRoot = new URL("../", import.meta.url);

async function importHistoryCsvModule() {
  return importTypeScriptModule(new URL("app/historyCsv.ts", projectRoot));
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
  assert.equal(rows[0].length, 26);
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

  assert.deepEqual(rows[0].slice(19, 22), ["set_type", "drop_set_of", "drop_order"]);
  assert.deepEqual(rows[1].slice(19, 22), ["working", "", ""]);
  assert.deepEqual(rows[2].slice(19, 22), ["drop", "root", "1"]);
  assert.deepEqual(rows[2].slice(10, 12), ["RIR", "2"]);
  assert.equal(rows[2][14], "1970-01-01T00:00:00.150Z");
  assert.deepEqual(rows[3].slice(19, 22), ["drop", "root", "2"]);
});

test("exports timed measurements and weight modes without losing existing effort/drop columns", () => {
  const history = [session({ id: "mixed", name: "Mixed", date: "2026-09-03", startedAt: 1000, finishedAt: 601000, exercises: [
    { id: "run", exerciseKey: "running", name: "Running", tracking: "distance-duration", restSeconds: 0, sets: [{ id: "run-set", weightKg: 0, reps: 0, durationSeconds: 600, distanceMeters: 1500, completed: true }] },
    { id: "assist", exerciseKey: "assisted-chin-up", name: "Assisted chin up", tracking: "weight-reps", weightMode: "assistance", restSeconds: 60, sets: [{ id: "assist-set", weightKg: 30, reps: 8, completed: true, effort: { scale: "rir", value: 2 } }] },
    { id: "legacy", exerciseKey: "plank", name: "Plank", restSeconds: 60, sets: [{ id: "legacy-set", weightKg: 0, reps: 30, completed: true }] },
  ] })];
  const rows = parseCsv(historyCsv.buildHistoryCsv(history));
  assert.deepEqual(rows[0].slice(22), ["tracking", "weight_mode", "set_duration_seconds", "distance_meters"]);
  assert.deepEqual(rows[1].slice(22), ["distance-duration", "external", "600", "1500"]);
  assert.deepEqual(rows[2].slice(22), ["weight-reps", "assistance", "", ""]);
  assert.deepEqual(rows[2].slice(8, 12), ["30", "8", "RIR", "2"]);
  assert.deepEqual(rows[3].slice(22), ["weight-reps", "external", "", ""]);
  const empty = parseCsv(historyCsv.buildHistoryCsv([session({ id: "empty", name: "Empty", date: "2026-09-03", startedAt: 1000, exercises: [] })]));
  assert.equal(empty[1].length, empty[0].length);
});
