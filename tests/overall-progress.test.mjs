import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importOverallProgressModule() {
  const source = await readFile(new URL("app/overallProgress.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "overallProgress.ts",
  });
  return import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
}

const overallProgress = await importOverallProgressModule();

function session({ id, date, timestamp, exercises }) {
  return {
    id,
    name: id,
    workoutDate: date,
    startedAt: timestamp,
    finishedAt: timestamp + 500,
    exercises: exercises.map((exercise, exerciseIndex) => ({
      id: `${id}-exercise-${exerciseIndex}`,
      exerciseKey: exercise.key,
      name: exercise.name ?? exercise.key,
      restSeconds: 90,
      sets: exercise.sets.map((set, setIndex) => ({
        id: `${id}-set-${exerciseIndex}-${setIndex}`,
        weightKg: set.weight,
        reps: set.reps ?? 5,
        completed: set.completed ?? true,
      })),
    })),
  };
}

test("aggregates all completed workout progress without mixing exercise records", () => {
  const progress = overallProgress.buildOverallProgress([
    session({
      id: "push",
      date: "2026-08-28",
      timestamp: 200,
      exercises: [
        { key: "bench", sets: [{ weight: 80, reps: 5 }, { weight: 80, reps: 5 }] },
        { key: "press", sets: [{ weight: 40, reps: 8 }] },
      ],
    }),
    session({
      id: "legs",
      date: "2026-08-26",
      timestamp: 100,
      exercises: [{ key: "squat", sets: [{ weight: 100, reps: 5 }] }],
    }),
  ]);

  assert.equal(progress.completedSessions, 2);
  assert.equal(progress.completedSets, 4);
  assert.equal(progress.exerciseCount, 3);
  assert.equal(progress.totalVolumeKg, 1_620);
  assert.equal(progress.firstWorkoutDate, "2026-08-26");
  assert.equal(progress.latestWorkoutDate, "2026-08-28");
  assert.deepEqual(progress.workouts.map((workout) => workout.sessionId), ["legs", "push"]);
});

test("ignores incomplete sets, zero-rep sets, and sessions without usable work", () => {
  const progress = overallProgress.buildOverallProgress([
    session({
      id: "mixed",
      date: "2026-08-28",
      timestamp: 200,
      exercises: [{ key: "row", sets: [
        { weight: 50, reps: 8 },
        { weight: 60, reps: 8, completed: false },
        { weight: 70, reps: 0 },
      ] }],
    }),
    session({
      id: "empty",
      date: "2026-08-29",
      timestamp: 300,
      exercises: [{ key: "curl", sets: [{ weight: 10, completed: false }] }],
    }),
  ]);

  assert.equal(progress.completedSessions, 1);
  assert.equal(progress.completedSets, 1);
  assert.equal(progress.exerciseCount, 1);
  assert.equal(progress.totalVolumeKg, 400);
});

test("counts completed bodyweight work even when external-load volume is zero", () => {
  const progress = overallProgress.buildOverallProgress([
    session({
      id: "bodyweight",
      date: "2026-08-29",
      timestamp: 300,
      exercises: [{ key: "pull-up", sets: [{ weight: 0, reps: 6 }] }],
    }),
  ]);

  assert.equal(progress.completedSessions, 1);
  assert.equal(progress.completedSets, 1);
  assert.equal(progress.exerciseCount, 1);
  assert.equal(progress.totalVolumeKg, 0);
});

test("derivation is empty-safe and does not mutate history", () => {
  assert.deepEqual(overallProgress.buildOverallProgress([]), {
    completedSessions: 0,
    completedSets: 0,
    exerciseCount: 0,
    totalVolumeKg: 0,
    firstWorkoutDate: null,
    latestWorkoutDate: null,
    workouts: [],
  });

  const history = [session({
    id: "saved",
    date: "2026-08-29",
    timestamp: 300,
    exercises: [{ key: "deadlift", sets: [{ weight: 120, reps: 3 }] }],
  })];
  const before = structuredClone(history);
  overallProgress.buildOverallProgress(history);
  assert.deepEqual(history, before);
});

test("day, week, and month comparisons use matching elapsed calendar ranges", () => {
  assert.deepEqual(overallProgress.progressPeriodRanges("2026-08-29", "day"), {
    currentRange: { startDate: "2026-08-29", endDate: "2026-08-29" },
    previousRange: { startDate: "2026-08-28", endDate: "2026-08-28" },
  });
  assert.deepEqual(overallProgress.progressPeriodRanges("2026-08-29", "week"), {
    currentRange: { startDate: "2026-08-24", endDate: "2026-08-29" },
    previousRange: { startDate: "2026-08-17", endDate: "2026-08-22" },
  });
  assert.deepEqual(overallProgress.progressPeriodRanges("2026-08-29", "month"), {
    currentRange: { startDate: "2026-08-01", endDate: "2026-08-29" },
    previousRange: { startDate: "2026-07-01", endDate: "2026-07-29" },
  });
  assert.deepEqual(overallProgress.progressPeriodRanges("2026-08-29", "all"), {
    currentRange: null,
    previousRange: null,
  });
});

test("month comparison clamps safely when the previous month is shorter", () => {
  assert.deepEqual(overallProgress.progressPeriodRanges("2027-03-31", "month"), {
    currentRange: { startDate: "2027-03-01", endDate: "2027-03-31" },
    previousRange: { startDate: "2027-02-01", endDate: "2027-02-28" },
  });
  assert.deepEqual(overallProgress.progressPeriodRanges("2028-03-31", "month"), {
    currentRange: { startDate: "2028-03-01", endDate: "2028-03-31" },
    previousRange: { startDate: "2028-02-01", endDate: "2028-02-29" },
  });
});

test("period progress compares totals and per-exercise volume with the prior matching days", () => {
  const history = [
    session({ id: "current-bench", date: "2026-08-29", timestamp: 500, exercises: [{ key: "bench", name: "Bench press", sets: [{ weight: 100, reps: 5 }] }] }),
    session({ id: "current-row", date: "2026-08-24", timestamp: 400, exercises: [{ key: "row", name: "Barbell row", sets: [{ weight: 50, reps: 10 }] }] }),
    session({ id: "future", date: "2026-08-30", timestamp: 600, exercises: [{ key: "squat", sets: [{ weight: 120, reps: 5 }] }] }),
    session({ id: "previous-bench", date: "2026-08-22", timestamp: 300, exercises: [{ key: "bench", name: "Bench press", sets: [{ weight: 80, reps: 5 }] }] }),
    session({ id: "previous-row", date: "2026-08-17", timestamp: 200, exercises: [{ key: "row", name: "Barbell row", sets: [{ weight: 50, reps: 8 }] }] }),
    session({ id: "too-old", date: "2026-08-16", timestamp: 100, exercises: [{ key: "bench", sets: [{ weight: 70, reps: 5 }] }] }),
  ];
  const before = structuredClone(history);
  const progress = overallProgress.buildPeriodProgress(history, "week", "2026-08-29");

  assert.equal(progress.current.completedSessions, 2);
  assert.equal(progress.current.completedSets, 2);
  assert.equal(progress.current.totalVolumeKg, 1_000);
  assert.equal(progress.previous.completedSessions, 2);
  assert.equal(progress.previous.totalVolumeKg, 800);
  assert.deepEqual(progress.exercises, [
    {
      exerciseKey: "row",
      name: "Barbell row",
      completedSets: 1,
      volumeKg: 500,
      bestWeightKg: 50,
      previousCompletedSets: 1,
      previousVolumeKg: 400,
    },
    {
      exerciseKey: "bench",
      name: "Bench press",
      completedSets: 1,
      volumeKg: 500,
      bestWeightKg: 100,
      previousCompletedSets: 1,
      previousVolumeKg: 400,
    },
  ]);
  assert.deepEqual(history, before, "period derivation must not mutate workout history");
});

test("all-time progress has no artificial comparison period", () => {
  const history = [session({
    id: "saved",
    date: "2026-08-29",
    timestamp: 300,
    exercises: [{ key: "deadlift", name: "Deadlift", sets: [{ weight: 120, reps: 3 }] }],
  })];
  const progress = overallProgress.buildPeriodProgress(history, "all", "2026-08-29");

  assert.equal(progress.current.completedSessions, 1);
  assert.equal(progress.previous, null);
  assert.equal(progress.previousRange, null);
  assert.equal(progress.exercises[0].previousVolumeKg, 0);
});
