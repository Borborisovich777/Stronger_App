import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const projectRoot = new URL("../", import.meta.url);

async function importWeeklyReviewModule() {
  return importTypeScriptModule(new URL("app/weeklyReview.ts", projectRoot));
}

const weeklyReview = await importWeeklyReviewModule();

function session({ id, workoutDate, timestamp, sourceRoutineId, exercises = [] }) {
  return {
    id,
    name: id,
    workoutDate,
    startedAt: timestamp,
    finishedAt: timestamp + 1_000,
    sourceRoutineId,
    exercises: exercises.map((exercise, exerciseIndex) => ({
      id: `${id}-exercise-${exerciseIndex}`,
      exerciseKey: exercise.key,
      name: exercise.name,
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

const routines = ["push", "pull", "legs"].map((name) => ({
  id: `routine-${name}`,
  name,
  exercises: [],
}));

test("weeks run Monday through Sunday across month and year boundaries", () => {
  assert.deepEqual(weeklyReview.weekRange("2026-08-29"), {
    startDate: "2026-08-24",
    endDate: "2026-08-30",
  });
  assert.deepEqual(weeklyReview.weekRange("2027-01-03"), {
    startDate: "2026-12-28",
    endDate: "2027-01-03",
  });
});

test("weekly progress counts only saved sessions with completed sets", () => {
  const history = [
    session({ id: "current-one", workoutDate: "2026-08-24", timestamp: 300, exercises: [{ key: "squat", name: "Squat", sets: [{ weight: 80 }] }] }),
    session({ id: "current-empty", workoutDate: "2026-08-25", timestamp: 400, exercises: [{ key: "squat", name: "Squat", sets: [{ weight: 90, completed: false }] }] }),
    session({ id: "current-two", workoutDate: "2026-08-30", timestamp: 500, exercises: [{ key: "row", name: "Row", sets: [{ weight: 50 }] }] }),
    session({ id: "previous", workoutDate: "2026-08-23", timestamp: 200, exercises: [{ key: "squat", name: "Squat", sets: [{ weight: 75 }] }] }),
  ];
  const review = weeklyReview.buildWeeklyReview(history, routines, 4, "2026-08-29");

  assert.equal(review.completedSessions, 2);
  assert.equal(review.targetSessions, 4);
  assert.equal(review.progressPercent, 50);
});

test("weekly PRs require a heavier completed weight than an earlier week", () => {
  const history = [
    session({
      id: "current",
      workoutDate: "2026-08-28",
      timestamp: 500,
      exercises: [
        { key: "squat", name: "Squat", sets: [{ weight: 85 }, { weight: 100, completed: false }, { weight: 120, reps: 0 }] },
        { key: "bench", name: "Bench", sets: [{ weight: 100 }] },
        { key: "curl", name: "Curl", sets: [{ weight: 10 }] },
      ],
    }),
    session({
      id: "previous",
      workoutDate: "2026-08-20",
      timestamp: 100,
      exercises: [
        { key: "squat", name: "Squat", sets: [{ weight: 80 }] },
        { key: "bench", name: "Bench", sets: [{ weight: 100 }] },
      ],
    }),
  ];
  const before = structuredClone(history);
  const review = weeklyReview.buildWeeklyReview(history, routines, 4, "2026-08-29");

  assert.deepEqual(review.personalRecords, [{
    exerciseKey: "squat",
    name: "Squat",
    currentWeightKg: 85,
    previousWeightKg: 80,
    workoutDate: "2026-08-28",
  }]);
  assert.deepEqual(history, before, "review derivation must not mutate workout history");
});

test("the next routine follows the latest completed routine in saved order", () => {
  const history = [
    session({ id: "blank-newest", workoutDate: "2026-08-29", timestamp: 900, exercises: [{ key: "walk", name: "Walk", sets: [{ weight: 0 }] }] }),
    session({ id: "pull-latest", workoutDate: "2026-08-28", timestamp: 800, sourceRoutineId: "routine-pull", exercises: [{ key: "row", name: "Row", sets: [{ weight: 50 }] }] }),
    session({ id: "push-older", workoutDate: "2026-08-26", timestamp: 700, sourceRoutineId: "routine-push", exercises: [{ key: "bench", name: "Bench", sets: [{ weight: 80 }] }] }),
  ];

  assert.equal(weeklyReview.buildWeeklyReview(history, routines, 4, "2026-08-29").nextRoutine.id, "routine-legs");
  assert.equal(weeklyReview.buildWeeklyReview([], routines, 4, "2026-08-29").nextRoutine.id, "routine-push");
  assert.equal(weeklyReview.buildWeeklyReview(history, [], 4, "2026-08-29").nextRoutine, null);
});

test("progress is capped and invalid external targets fall back safely", () => {
  const history = Array.from({ length: 3 }, (_, index) => session({
    id: `session-${index}`,
    workoutDate: `2026-08-2${4 + index}`,
    timestamp: index,
    exercises: [{ key: "squat", name: "Squat", sets: [{ weight: 80 }] }],
  }));

  const review = weeklyReview.buildWeeklyReview(history, routines, 0, "2026-08-29");
  assert.equal(review.targetSessions, 1);
  assert.equal(review.progressPercent, 100);
});

test("timed-only sessions count toward the week and routine rotation without assistance PRs", () => {
  const routines = [{ id: "cardio", name: "Cardio", exercises: [] }, { id: "strength", name: "Strength", exercises: [] }];
  const trackedSession = (id, workoutDate, timestamp, row) => ({
    id, name: id, workoutDate, startedAt: timestamp, finishedAt: timestamp + 1000, sourceRoutineId: "cardio",
    exercises: [{ id: `${id}-exercise`, name: "Activity", exerciseKey: "activity", restSeconds: 0, ...row }],
  });
  const history = [
    trackedSession("old-assist", "2026-08-20", 1, { tracking: "weight-reps", weightMode: "assistance", sets: [{ id: "old-set", weightKg: 20, reps: 8, completed: true }] }),
    trackedSession("new-assist", "2026-09-02", 2, { tracking: "weight-reps", weightMode: "assistance", sets: [{ id: "new-set", weightKg: 40, reps: 8, completed: true }] }),
    trackedSession("cardio", "2026-09-03", 3, { tracking: "distance-duration", sets: [{ id: "cardio-set", weightKg: 0, reps: 0, durationSeconds: 600, distanceMeters: 1500, completed: true }] }),
  ];
  const result = weeklyReview.buildWeeklyReview(history, routines, 3, "2026-09-03");
  assert.equal(result.completedSessions, 2);
  assert.equal(result.nextRoutine.id, "strength");
  assert.deepEqual(result.personalRecords, []);
});
