import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importReportMetricsModule() {
  const source = await readFile(new URL("app/reportMetrics.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "reportMetrics.ts",
  });
  return import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
}

const reports = await importReportMetricsModule();

function workoutSet(id, weightKg, reps, options = {}) {
  return {
    id,
    weightKg,
    reps,
    completed: options.completed ?? true,
    ...(options.dropSetOf ? { dropSetOf: options.dropSetOf } : {}),
    ...(options.effort ? { effort: options.effort } : {}),
  };
}

function exercise(id, exerciseKey, name, sets) {
  return { id, exerciseKey, name, restSeconds: 90, sets };
}

function session({
  id,
  date,
  startedAt,
  rawDurationSeconds = 1_800,
  pausedSeconds = 0,
  includeFinishedAt = true,
  finishedAt,
  exercises,
}) {
  return {
    id,
    name: id,
    workoutDate: date,
    startedAt,
    ...(includeFinishedAt
      ? { finishedAt: finishedAt ?? startedAt + rawDurationSeconds * 1_000 }
      : {}),
    ...(pausedSeconds ? { timerPausedDurationMs: pausedSeconds * 1_000 } : {}),
    exercises,
  };
}

const categories = {
  "bench-press": "Chest",
  "push-up": "Chest",
  "back-squat": "Legs",
  deadlift: "Back",
};

test("live and completed ranges preserve matched and full calendar semantics", () => {
  assert.deepEqual(reports.liveReportRanges("2026-09-03", "week"), {
    currentRange: { startDate: "2026-08-31", endDate: "2026-09-03" },
    comparisonRange: { startDate: "2026-08-24", endDate: "2026-08-27" },
  });
  assert.deepEqual(reports.liveReportRanges("2026-09-07", "week"), {
    currentRange: { startDate: "2026-09-07", endDate: "2026-09-07" },
    comparisonRange: { startDate: "2026-08-31", endDate: "2026-08-31" },
  });
  assert.deepEqual(reports.liveReportRanges("2027-03-31", "month"), {
    currentRange: { startDate: "2027-03-01", endDate: "2027-03-31" },
    comparisonRange: { startDate: "2027-02-01", endDate: "2027-02-28" },
  });
  assert.deepEqual(reports.completedReportRanges("2027-01-02", "week"), {
    currentRange: { startDate: "2026-12-28", endDate: "2027-01-03" },
    comparisonRange: { startDate: "2026-12-21", endDate: "2026-12-27" },
  });
  assert.deepEqual(reports.completedReportRanges("2028-02-10", "month"), {
    currentRange: { startDate: "2028-02-01", endDate: "2028-02-29" },
    comparisonRange: { startDate: "2028-01-01", endDate: "2028-01-31" },
  });
});

test("derives one complete live-week contract without mutating source data", () => {
  const push = session({
    id: "current-push",
    date: "2026-09-01",
    startedAt: 1_000_000,
    rawDurationSeconds: 3_600,
    pausedSeconds: 600,
    exercises: [
      exercise("push-bench", "bench-press", "Bench press", [
        workoutSet("bench-root", 85, 5, { effort: { scale: "rpe", value: 8 } }),
        workoutSet("bench-drop", 60, 4, {
          dropSetOf: "bench-root",
          effort: { scale: "rpe", value: 10 },
        }),
        workoutSet("bench-incomplete", 100, 1, { completed: false }),
      ]),
      exercise("push-bodyweight", "push-up", "Push-up", [workoutSet("push-up-root", 0, 10)]),
      exercise("push-custom", "custom-carry", "Carry", [
        workoutSet("carry-root", 20, 10, { effort: { scale: "rir", value: 2 } }),
      ]),
    ],
  });
  const legs = session({
    id: "current-legs",
    date: "2026-09-03",
    startedAt: 8_000_000,
    exercises: [exercise("legs-squat", "back-squat", "Back squat", [
      workoutSet("squat-root", 100, 5, { effort: { scale: "rpe", value: 9 } }),
      workoutSet("squat-zero", 200, 0),
    ])],
  });
  const previous = [
    session({
      id: "previous-push",
      date: "2026-08-25",
      startedAt: 20_000_000,
      rawDurationSeconds: 3_600,
      exercises: [exercise("previous-bench", "bench-press", "Bench press", [workoutSet("previous-bench-root", 80, 5)])],
    }),
    session({
      id: "previous-legs",
      date: "2026-08-27",
      startedAt: 30_000_000,
      exercises: [exercise("previous-squat", "back-squat", "Back squat", [workoutSet("previous-squat-root", 100, 5)])],
    }),
  ];
  const activeWorkout = session({
    id: "active",
    date: "2026-09-03",
    startedAt: 40_000_000,
    includeFinishedAt: false,
    exercises: [exercise("active-bench", "bench-press", "Bench press", [workoutSet("active-root", 90, 5)])],
  });
  const history = [legs, ...previous, push];
  const before = structuredClone({ history, activeWorkout });
  const ranges = reports.liveReportRanges("2026-09-03", "week");
  const result = reports.deriveReportMetrics({
    history,
    range: ranges.currentRange,
    comparisonRange: ranges.comparisonRange,
    activeWorkout,
    categoriesByExerciseKey: categories,
    customExerciseKeys: ["custom-carry"],
  });

  assert.deepEqual(result.current.totals, {
    sessions: 2,
    daysTrained: 2,
    workingSets: 4,
    drops: 1,
    workingReps: 30,
    dropReps: 4,
    totalReps: 34,
    externalLoadVolumeKg: 1_365,
    durationSeconds: 4_800,
    measuredDurationSessions: 2,
    unmeasuredDurationSessions: 0,
    averageSessionDurationSeconds: 2_400,
  });
  assert.deepEqual(result.comparison.totals, {
    sessions: 2,
    daysTrained: 2,
    workingSets: 2,
    drops: 0,
    workingReps: 10,
    dropReps: 0,
    totalReps: 10,
    externalLoadVolumeKg: 900,
    durationSeconds: 5_400,
    measuredDurationSessions: 2,
    unmeasuredDurationSessions: 0,
    averageSessionDurationSeconds: 2_700,
  });
  assert.deepEqual(result.current.effort, {
    recordedWorkingSets: 3,
    unrecordedWorkingSets: 1,
    rpe: { recordedWorkingSets: 2, median: 8.5 },
    rir: { recordedWorkingSets: 1, median: 2 },
  });
  assert.deepEqual(
    result.current.categories.map(({ category, workingSets, daysTrained }) => ({ category, workingSets, daysTrained })),
    [
      { category: "Chest", workingSets: 2, daysTrained: 1 },
      { category: "Legs", workingSets: 1, daysTrained: 1 },
      { category: "Unclassified", workingSets: 1, daysTrained: 1 },
    ],
  );
  assert.equal(result.current.dataQuality.activeWorkoutExcluded, true);
  assert.equal(result.current.dataQuality.activeWorkoutHasReportableWork, true);
  assert.equal(result.current.dataQuality.incompleteWorkingSetRows, 1);
  assert.equal(result.current.dataQuality.zeroRepWorkingSetRows, 1);
  assert.equal(result.current.dataQuality.zeroExternalLoadWorkingSets, 1);
  assert.equal(result.current.dataQuality.unclassifiedWorkingSets, 1);
  assert.equal(result.current.dataQuality.missingEffortWorkingSets, 1);
  assert.equal(result.current.dataQuality.mixedEffortScales, true);
  assert.deepEqual({ history, activeWorkout }, before);
});

test("drop continuations add dose but cannot change working-set records", () => {
  const history = [session({
    id: "drop-workout",
    date: "2026-09-03",
    startedAt: 100,
    exercises: [exercise("curl", "custom-curl", "Curl", [
      workoutSet("root-a", 20, 8),
      workoutSet("drop-a", 16, 6, { dropSetOf: "root-a" }),
      workoutSet("drop-b", 12, 5, { dropSetOf: "root-a" }),
      workoutSet("root-b", 20, 10),
    ])],
  })];
  const result = reports.deriveReportMetrics({ history, range: null });
  const curl = result.current.exercises[0];

  assert.equal(result.current.totals.workingSets, 2);
  assert.equal(result.current.totals.drops, 2);
  assert.equal(result.current.totals.totalReps, 29);
  assert.equal(result.current.totals.externalLoadVolumeKg, 516);
  assert.equal(curl.bestWeightKg, 20);
  assert.equal(curl.bestEstimatedOneRepMaxKg, 20 * (1 + 10 / 30));
  assert.deepEqual(curl.bestRepsAtWeight, [{ weightKg: 20, reps: 10 }]);
});

test("bodyweight drop continuations count reps and drops without inventing external volume", () => {
  const history = [session({
    id: "bodyweight-drop-workout",
    date: "2026-09-03",
    startedAt: 100,
    exercises: [exercise("push-up", "push-up", "Push-up", [
      workoutSet("push-up-root", 0, 12),
      workoutSet("push-up-drop", 0, 5, { dropSetOf: "push-up-root" }),
    ])],
  })];
  const result = reports.deriveReportMetrics({ history, range: null });

  assert.equal(result.current.totals.workingSets, 1);
  assert.equal(result.current.totals.drops, 1);
  assert.equal(result.current.totals.workingReps, 12);
  assert.equal(result.current.totals.dropReps, 5);
  assert.equal(result.current.totals.totalReps, 17);
  assert.equal(result.current.totals.externalLoadVolumeKg, 0);
  assert.equal(result.current.dataQuality.zeroExternalLoadDrops, 1);
  assert.equal(result.current.dataQuality.invalidDropSegments, 0);
});

test("progress highlights use all earlier working sets and retain source evidence", () => {
  const history = [
    session({
      id: "older-bench-best",
      date: "2026-08-10",
      startedAt: 100,
      exercises: [exercise("older-bench", "bench-press", "Bench press", [
        workoutSet("older-bench-90", 90, 3),
        workoutSet("older-bench-85", 85, 3),
      ])],
    }),
    session({
      id: "older-squat",
      date: "2026-08-20",
      startedAt: 200,
      exercises: [exercise("older-squat-exercise", "back-squat", "Back squat", [
        workoutSet("older-squat-100", 100, 5),
      ])],
    }),
    session({
      id: "older-triceps",
      date: "2026-08-21",
      startedAt: 300,
      exercises: [exercise("older-triceps-exercise", "triceps", "Triceps", [
        workoutSet("older-triceps-20", 20, 5),
      ])],
    }),
    session({
      id: "current",
      date: "2026-09-02",
      startedAt: 400,
      exercises: [
        exercise("current-bench", "bench-press", "Bench press", [workoutSet("current-bench-85", 85, 5)]),
        exercise("current-squat", "back-squat", "Back squat", [workoutSet("current-squat-105", 105, 5)]),
        exercise("current-curl", "curl", "Curl", [workoutSet("first-curl", 12, 10)]),
        exercise("current-triceps", "triceps", "Triceps", [
          workoutSet("current-triceps-root", 20, 5),
          workoutSet("current-triceps-drop", 19, 12, { dropSetOf: "current-triceps-root" }),
        ]),
        exercise("current-high-rep", "high-rep", "High rep", [workoutSet("current-high-rep-set", 30, 13)]),
      ],
    }),
  ];
  const result = reports.deriveReportMetrics({
    history,
    range: { startDate: "2026-08-31", endDate: "2026-09-03" },
  });

  assert.equal(result.highlights.some((item) => item.kind === "weight-pr" && item.exerciseKey === "bench-press"), false);
  assert.equal(result.highlights.some((item) => item.exerciseKey === "curl"), false, "first results establish a baseline");
  assert.equal(result.highlights.some((item) => item.exerciseKey === "triceps"), false, "drops cannot create highlights");
  assert.equal(result.highlights.some((item) => item.exerciseKey === "high-rep"), false, "13-rep sets have no e1RM");

  const benchRep = result.highlights.find((item) =>
    item.kind === "rep-at-weight-pr" && item.exerciseKey === "bench-press");
  assert.deepEqual(benchRep, {
    kind: "rep-at-weight-pr",
    exerciseKey: "bench-press",
    name: "Bench press",
    sessionId: "current",
    setId: "current-bench-85",
    workoutDate: "2026-09-02",
    weightKg: 85,
    reps: 5,
    currentValue: 5,
    previousValue: 3,
    delta: 2,
  });
  assert.ok(result.highlights.some((item) =>
    item.kind === "estimated-1rm-improvement" && item.exerciseKey === "bench-press"));
  assert.ok(result.highlights.some((item) =>
    item.kind === "weight-pr" && item.exerciseKey === "back-squat" &&
    item.sessionId === "current" && item.setId === "current-squat-105"));
});

test("unusable rows and a structurally invalid drop are excluded and explained", () => {
  const history = [session({
    id: "excluded",
    date: "2026-09-03",
    startedAt: 100,
    exercises: [exercise("row", "custom-row", "Row", [
      workoutSet("zero-root", 50, 0),
      workoutSet("invalid-drop", 40, 5, { dropSetOf: "zero-root" }),
      workoutSet("incomplete-root", 70, 5, { completed: false }),
      workoutSet("incomplete-drop", 50, 5, { completed: false, dropSetOf: "incomplete-root" }),
    ])],
  })];
  const result = reports.deriveReportMetrics({ history, range: null });

  assert.equal(result.current.totals.sessions, 0);
  assert.equal(result.current.totals.totalReps, 0);
  assert.equal(result.current.dataQuality.zeroRepWorkingSetRows, 1);
  assert.equal(result.current.dataQuality.incompleteWorkingSetRows, 1);
  assert.equal(result.current.dataQuality.incompleteDropRows, 1);
  assert.equal(result.current.dataQuality.invalidDropSegments, 1);
  assert.equal(result.current.dataQuality.excludedDropRows, 2);
  assert.equal(result.current.emptyReason, "no-completed-work");
});

test("an invalid drop poisons the continuation chain until the next working set", () => {
  const history = [session({
    id: "bad-chain",
    date: "2026-09-03",
    startedAt: 100,
    exercises: [exercise("bad-chain-exercise", "curl", "Curl", [
      workoutSet("root", 20, 8),
      workoutSet("invalid-heavier", 25, 5, { dropSetOf: "root" }),
      workoutSet("invalid-tail", 15, 5, { dropSetOf: "root" }),
    ])],
  })];
  const result = reports.deriveReportMetrics({ history, range: null });

  assert.equal(result.current.totals.workingSets, 1);
  assert.equal(result.current.totals.drops, 0);
  assert.equal(result.current.totals.externalLoadVolumeKg, 160);
  assert.equal(result.current.dataQuality.invalidDropSegments, 2);
  assert.equal(result.current.dataQuality.excludedDropRows, 2);
});

test("session exercise metrics merge duplicate keys and exclude invalid poisoned drops", () => {
  const history = [session({
    id: "session-exercise-breakdown",
    date: "2026-09-03",
    startedAt: 100,
    exercises: [
      exercise("curl-first", "curl", "Cable curl", [
        workoutSet("curl-root-a", 20, 8),
        workoutSet("curl-drop-a", 15, 6, { dropSetOf: "curl-root-a" }),
        workoutSet("curl-invalid", 18, 5, { dropSetOf: "curl-root-a" }),
        workoutSet("curl-poisoned-tail", 10, 5, { dropSetOf: "curl-root-a" }),
        workoutSet("curl-root-b", 25, 4),
        workoutSet("curl-drop-b", 20, 3, { dropSetOf: "curl-root-b" }),
      ]),
      exercise("bench", "bench-press", "Bench press", [
        workoutSet("bench-root", 100, 1),
      ]),
      exercise("curl-second", "curl", "Cable curl", [
        workoutSet("curl-root-c", 22, 10),
        workoutSet("curl-drop-c", 16, 5, { dropSetOf: "curl-root-c" }),
      ]),
    ],
  })];
  const result = reports.deriveReportMetrics({
    history,
    range: null,
    categoriesByExerciseKey: { ...categories, curl: "Arms" },
  });
  const reportSession = result.current.sessions[0];
  const sessionCurl = reportSession.exercises.find((item) => item.exerciseKey === "curl");
  const periodCurl = result.current.exercises.find((item) => item.exerciseKey === "curl");

  assert.deepEqual(reportSession.exercises.map((item) => item.exerciseKey), ["bench-press", "curl"]);
  assert.deepEqual(sessionCurl, {
    exerciseKey: "curl",
    name: "Cable curl",
    category: "Arms",
    workingSets: 3,
    drops: 3,
    workingReps: 22,
    dropReps: 14,
    totalReps: 36,
    externalLoadVolumeKg: 710,
    bestWeightKg: 25,
    bestEstimatedOneRepMaxKg: 22 * (1 + 10 / 30),
  });
  assert.equal(periodCurl.workingSets, sessionCurl.workingSets);
  assert.equal(periodCurl.drops, sessionCurl.drops);
  assert.equal(periodCurl.totalReps, sessionCurl.totalReps);
  assert.equal(periodCurl.externalLoadVolumeKg, sessionCurl.externalLoadVolumeKg);
  assert.equal(result.current.dataQuality.invalidDropSegments, 2);
  assert.equal(result.current.dataQuality.excludedDropRows, 2);
});

test("duration coverage never fabricates time for missing or corrupt finishes", () => {
  const history = [
    session({
      id: "known",
      date: "2026-09-01",
      startedAt: 1_000,
      rawDurationSeconds: 3_600,
      pausedSeconds: 600,
      exercises: [exercise("known-ex", "deadlift", "Deadlift", [workoutSet("known-set", 100, 5)])],
    }),
    session({
      id: "missing",
      date: "2026-09-02",
      startedAt: 2_000,
      includeFinishedAt: false,
      exercises: [exercise("missing-ex", "deadlift", "Deadlift", [workoutSet("missing-set", 100, 5)])],
    }),
    session({
      id: "invalid",
      date: "2026-09-03",
      startedAt: 10_000,
      finishedAt: 9_000,
      exercises: [exercise("invalid-ex", "deadlift", "Deadlift", [workoutSet("invalid-set", 100, 5)])],
    }),
  ];
  const result = reports.deriveReportMetrics({ history, range: null, categoriesByExerciseKey: categories });

  assert.equal(result.current.totals.durationSeconds, 3_000);
  assert.equal(result.current.totals.averageSessionDurationSeconds, 3_000);
  assert.equal(result.current.dataQuality.missingDurationSessions, 1);
  assert.deepEqual(result.current.dataQuality.missingDurationSessionIds, ["missing"]);
  assert.equal(result.current.dataQuality.invalidDurationSessions, 1);
  assert.deepEqual(result.current.dataQuality.invalidDurationSessionIds, ["invalid"]);
});

test("rolling duration medians exclude unknown workout durations but keep real empty windows", () => {
  const baseline = reports.rollingReportBaseline("2026-09-03", "week", 3, "matched-elapsed-days");
  const history = [
    session({
      id: "adoption",
      date: "2026-08-10",
      startedAt: 1_000,
      rawDurationSeconds: 1_800,
      exercises: [exercise("adoption-exercise", "deadlift", "Deadlift", [workoutSet("adoption-set", 100, 5)])],
    }),
    session({
      id: "unknown-duration",
      date: "2026-08-17",
      startedAt: 2_000,
      includeFinishedAt: false,
      exercises: [exercise("unknown-exercise", "deadlift", "Deadlift", [workoutSet("unknown-set", 100, 5)])],
    }),
  ];
  const result = reports.deriveReportMetrics({
    history,
    range: { startDate: "2026-08-31", endDate: "2026-09-03" },
    baseline,
  });

  assert.deepEqual(result.rollingBaseline.periods.map((period) => period.totals.durationSeconds), [1_800, 0, 0]);
  assert.equal(result.rollingBaseline.periods[1].totals.unmeasuredDurationSessions, 1);
  assert.equal(result.rollingBaseline.median.durationSeconds, 900, "unknown duration is omitted; the empty week remains zero");
});

test("stable exercise keys, saved local dates, and category limits remain explicit", () => {
  const history = [
    session({
      id: "newer-name",
      date: "2026-09-01",
      startedAt: Date.parse("2026-08-31T20:30:00Z"),
      exercises: [
        exercise("bench-new", "bench-press", "Paused bench", [workoutSet("bench-new-set", 80, 6)]),
        exercise("custom-a", "same-name-a", "Press", [workoutSet("custom-a-set", 20, 10)]),
      ],
    }),
    session({
      id: "older-name",
      date: "2026-08-31",
      startedAt: Date.parse("2026-09-01T01:00:00Z"),
      exercises: [
        exercise("bench-old", "bench-press", "Bench press", [workoutSet("bench-old-set", 75, 5)]),
        exercise("custom-b", "same-name-b", "Press", [workoutSet("custom-b-set", 25, 8)]),
      ],
    }),
  ];
  const result = reports.deriveReportMetrics({
    history,
    range: { startDate: "2026-09-01", endDate: "2026-09-01" },
    categoriesByExerciseKey: categories,
  });

  assert.deepEqual(result.current.sessions.map((item) => item.sessionId), ["newer-name"]);
  assert.equal(result.current.exercises.find((item) => item.exerciseKey === "bench-press").name, "Paused bench");
  assert.equal(result.current.exercises.find((item) => item.exerciseKey === "bench-press").category, "Chest");
  assert.equal(result.current.exercises.find((item) => item.exerciseKey === "same-name-a").category, "Unclassified");
  assert.equal(result.current.exercises.length, 2);
});

test("custom keys override colliding built-in category keys", () => {
  const history = [session({
    id: "collision",
    date: "2026-09-01",
    startedAt: 100,
    exercises: [exercise("collision-exercise", "bench-press", "My custom press", [workoutSet("collision-set", 30, 10)])],
  })];
  const result = reports.deriveReportMetrics({
    history,
    range: null,
    categoriesByExerciseKey: categories,
    customExerciseKeys: ["bench-press"],
  });

  assert.equal(result.current.exercises[0].category, "Unclassified");
  assert.deepEqual(result.current.dataQuality.exerciseKeyCollisions, ["bench-press"]);
});

test("object-prototype exercise keys stay unclassified", () => {
  const history = [session({
    id: "prototype-keys",
    date: "2026-09-01",
    startedAt: 100,
    exercises: [
      exercise("constructor-exercise", "constructor", "Constructor", [workoutSet("constructor-set", 10, 5)]),
      exercise("to-string-exercise", "toString", "To string", [workoutSet("to-string-set", 10, 5)]),
      exercise("proto-exercise", "__proto__", "Proto", [workoutSet("proto-set", 10, 5)]),
    ],
  })];
  const result = reports.deriveReportMetrics({ history, range: null, categoriesByExerciseKey: categories });

  assert.ok(result.current.exercises.every((item) => item.category === "Unclassified"));
  assert.deepEqual(result.current.dataQuality.unclassifiedExerciseKeys, ["__proto__", "constructor", "toString"]);
});

test("rolling baselines use medians, retain real gaps, and omit pre-adoption windows", () => {
  const baselineRanges = reports.rollingReportRanges("2026-09-03", "week", 4, "matched-elapsed-days");
  assert.deepEqual(baselineRanges, [
    { startDate: "2026-08-03", endDate: "2026-08-06" },
    { startDate: "2026-08-10", endDate: "2026-08-13" },
    { startDate: "2026-08-17", endDate: "2026-08-20" },
    { startDate: "2026-08-24", endDate: "2026-08-27" },
  ]);
  const history = [
    session({ id: "adoption", date: "2026-08-10", startedAt: 100, exercises: [exercise("a", "deadlift", "Deadlift", [workoutSet("a-set", 10, 10)])] }),
    session({ id: "third", date: "2026-08-17", startedAt: 200, exercises: [exercise("b", "deadlift", "Deadlift", [workoutSet("b-set", 30, 10)])] }),
    session({ id: "fourth", date: "2026-08-24", startedAt: 300, exercises: [exercise("c", "deadlift", "Deadlift", [workoutSet("c-set", 1_000, 10)])] }),
  ];
  const result = reports.deriveReportMetrics({
    history,
    range: { startDate: "2026-08-31", endDate: "2026-09-03" },
    baseline: { ranges: baselineRanges, alignment: "matched-elapsed-days" },
  });

  assert.equal(result.rollingBaseline.requestedWindows, 4);
  assert.equal(result.rollingBaseline.availableWindows, 3);
  assert.equal(result.rollingBaseline.sparse, true);
  assert.deepEqual(result.rollingBaseline.periods.map((period) => period.totals.externalLoadVolumeKg), [100, 300, 10_000]);
  assert.equal(result.rollingBaseline.median.externalLoadVolumeKg, 300);

  const withGap = reports.deriveReportMetrics({
    history: [history[0], history[2]],
    range: { startDate: "2026-08-31", endDate: "2026-09-03" },
    baseline: { ranges: baselineRanges.slice(1), alignment: "matched-elapsed-days" },
  });
  assert.deepEqual(withGap.rollingBaseline.periods.map((period) => period.totals.externalLoadVolumeKg), [100, 0, 10_000]);
  assert.equal(withGap.rollingBaseline.median.externalLoadVolumeKg, 100);

  const beforeAdoption = reports.deriveReportMetrics({
    history: [],
    range: { startDate: "2026-08-31", endDate: "2026-09-03" },
    baseline: { ranges: baselineRanges, alignment: "matched-elapsed-days" },
  });
  assert.equal(beforeAdoption.rollingBaseline.availableWindows, 0);
  assert.equal(beforeAdoption.rollingBaseline.sparse, true);
  assert.equal(beforeAdoption.rollingBaseline.median, null);
});

test("history order cannot change report facts or the latest exercise name", () => {
  const history = [
    session({
      id: "earlier",
      date: "2026-09-01",
      startedAt: 500,
      exercises: [exercise("earlier-exercise", "bench-press", "Old bench name", [workoutSet("earlier-set", 80, 5)])],
    }),
    session({
      id: "later",
      date: "2026-09-02",
      startedAt: 100,
      exercises: [exercise("later-exercise", "bench-press", "New bench name", [workoutSet("later-set", 82.5, 5)])],
    }),
  ];
  const forward = reports.deriveReportMetrics({ history, range: null, categoriesByExerciseKey: categories });
  const reversed = reports.deriveReportMetrics({ history: [...history].reverse(), range: null, categoriesByExerciseKey: categories });

  assert.deepEqual(reversed, forward);
  assert.equal(forward.current.exercises[0].name, "New bench name");
});

test("sparse-history flags distinguish one report session and one-session exercises", () => {
  const first = session({
    id: "first-session",
    date: "2026-09-01",
    startedAt: 100,
    exercises: [
      exercise("first-deadlift", "deadlift", "Deadlift", [workoutSet("first-deadlift-set", 100, 5)]),
      exercise("first-curl", "curl", "Curl", [workoutSet("first-curl-set", 12, 10)]),
    ],
  });
  const second = session({
    id: "second-session",
    date: "2026-09-03",
    startedAt: 200,
    exercises: [exercise("second-deadlift", "deadlift", "Deadlift", [workoutSet("second-deadlift-set", 105, 5)])],
  });

  const singleSession = reports.deriveReportMetrics({
    history: [first],
    range: { startDate: "2026-09-01", endDate: "2026-09-01" },
  });
  assert.equal(singleSession.current.dataQuality.sparseSessionHistory, true);
  assert.ok(singleSession.current.exercises.every((item) => item.sessionCount === 1));

  const mixedCoverage = reports.deriveReportMetrics({
    history: [second, first],
    range: { startDate: "2026-09-01", endDate: "2026-09-03" },
  });
  assert.equal(mixedCoverage.current.dataQuality.sparseSessionHistory, false);
  assert.equal(mixedCoverage.current.exercises.find((item) => item.exerciseKey === "deadlift").sessionCount, 2);
  assert.equal(mixedCoverage.current.exercises.find((item) => item.exerciseKey === "curl").sessionCount, 1);
});

test("a truly empty report has one explicit no-saved-sessions reason", () => {
  const result = reports.deriveReportMetrics({
    history: [],
    range: { startDate: "2026-09-01", endDate: "2026-09-03" },
    activeWorkout: null,
  });

  assert.equal(result.current.savedSessionsInRange, 0);
  assert.equal(result.current.totals.sessions, 0);
  assert.equal(result.current.emptyReason, "no-saved-sessions");
  assert.equal(result.current.dataQuality.activeWorkoutInRange, false);
  assert.equal(result.current.dataQuality.activeWorkoutExcluded, false);
});

test("active work is excluded with one useful empty reason", () => {
  const activeWorkout = session({
    id: "active-only",
    date: "2026-09-03",
    startedAt: 100,
    includeFinishedAt: false,
    exercises: [exercise("active-exercise", "deadlift", "Deadlift", [workoutSet("active-set", 120, 3)])],
  });
  const result = reports.deriveReportMetrics({
    history: [],
    range: { startDate: "2026-09-01", endDate: "2026-09-03" },
    activeWorkout,
  });

  assert.equal(result.current.totals.sessions, 0);
  assert.equal(result.current.emptyReason, "active-workout-excluded");
  assert.equal(result.current.dataQuality.activeWorkoutInRange, true);
  assert.equal(result.current.dataQuality.activeWorkoutHasReportableWork, true);
});

test("active-workout disclosure distinguishes location from omitted reportable work", () => {
  const emptyActive = session({
    id: "empty-active",
    date: "2026-09-03",
    startedAt: 100,
    includeFinishedAt: false,
    exercises: [exercise("empty-active-exercise", "deadlift", "Deadlift", [
      workoutSet("empty-active-set", 120, 0, { completed: false }),
    ])],
  });
  const emptyResult = reports.deriveReportMetrics({
    history: [],
    range: { startDate: "2026-09-01", endDate: "2026-09-03" },
    activeWorkout: emptyActive,
  });
  assert.equal(emptyResult.current.dataQuality.activeWorkoutInRange, true);
  assert.equal(emptyResult.current.dataQuality.activeWorkoutHasReportableWork, false);
  assert.equal(emptyResult.current.dataQuality.activeWorkoutExcluded, false);
  assert.equal(emptyResult.current.emptyReason, "no-saved-sessions");

  const outsideResult = reports.deriveReportMetrics({
    history: [],
    range: { startDate: "2026-09-01", endDate: "2026-09-02" },
    activeWorkout: { ...emptyActive, workoutDate: "2026-09-03", exercises: [
      exercise("outside-exercise", "deadlift", "Deadlift", [workoutSet("outside-set", 120, 3)]),
    ] },
  });
  assert.equal(outsideResult.current.dataQuality.activeWorkoutInRange, false);
  assert.equal(outsideResult.current.dataQuality.activeWorkoutExcluded, false);

  const allTimeResult = reports.deriveReportMetrics({
    history: [],
    range: null,
    activeWorkout: { ...emptyActive, exercises: [
      exercise("all-time-exercise", "deadlift", "Deadlift", [workoutSet("all-time-set", 120, 3)]),
    ] },
  });
  assert.equal(allTimeResult.current.dataQuality.activeWorkoutExcluded, true);
});

test("recorded decimal, unilateral, and large loads stay canonical and traceable", () => {
  const history = [session({
    id: "canonical-loads",
    date: "2026-09-03",
    startedAt: 100,
    exercises: [exercise("loads", "custom-load", "Load", [
      workoutSet("decimal", 12.5, 8),
      workoutSet("unilateral", 20, 10),
      workoutSet("large", 100_000, 100_000),
    ])],
  })];
  const result = reports.deriveReportMetrics({ history, range: null });

  assert.equal(result.current.totals.externalLoadVolumeKg, 10_000_000_300);
  assert.equal(result.current.totals.totalReps, 100_018);
  assert.deepEqual(result.current.sessions[0].exerciseKeys, ["custom-load"]);
  assert.equal(result.current.exercises[0].bestEstimatedOneRepMaxKg, 20 * (1 + 10 / 30));
  assert.equal(result.current.dataQuality.unsafeExternalLoadVolume, false);
});

test("aggregate volume overflow stays included and identifies every contributing session", () => {
  const maximumSets = Array.from({ length: 5 }, (_, exerciseIndex) => exercise(
    `maximum-exercise-${exerciseIndex}`,
    "maximum-load",
    "Maximum load",
    Array.from({ length: 100 }, (_, setIndex) => workoutSet(
      `maximum-set-${exerciseIndex}-${setIndex}`,
      100_000,
      100_000,
    )),
  ));
  const sessionVolumeKg = 500 * 100_000 * 100_000;
  const sessionCount = Math.floor(Number.MAX_SAFE_INTEGER / sessionVolumeKg) + 1;
  const history = Array.from({ length: sessionCount }, (_, index) => session({
    id: `overflow-${String(index).padStart(4, "0")}`,
    date: "2026-09-03",
    startedAt: index,
    exercises: maximumSets,
  }));

  const result = reports.deriveReportMetrics({ history, range: null });

  assert.equal(result.current.totals.externalLoadVolumeKg, sessionVolumeKg * sessionCount);
  assert.ok(result.current.sessions.every((item) => Math.abs(item.externalLoadVolumeKg) <= Number.MAX_SAFE_INTEGER));
  assert.equal(result.current.dataQuality.unsafeExternalLoadVolume, true);
  assert.equal(result.current.dataQuality.unsafeVolumeSessionIds.length, sessionCount);
  assert.equal(result.current.dataQuality.unsafeVolumeSessionIds[0], "overflow-0000");
  assert.equal(result.current.dataQuality.unsafeVolumeSessionIds.at(-1), "overflow-1801");
});
