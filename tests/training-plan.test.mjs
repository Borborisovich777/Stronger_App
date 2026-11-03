import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const trainingPlanModule = await importTypeScriptModule(new URL("../app/trainingPlan.ts", import.meta.url));
const { DEFAULT_PLAN_DAYS, planDays, planSessions, suggestDay, usablePlan, validTrainingPlan } = trainingPlanModule;

const plan = { lower: ["lower-a", "lower-b"], upper: ["upper-a", "upper-b"], days: DEFAULT_PLAN_DAYS };
const routines = ["lower-a", "lower-b", "upper-a", "upper-b"].map((id) => ({ id, name: id, exercises: [] }));

function session(workoutDate, sourceRoutineId, completed = true) {
  return {
    id: `${workoutDate}-${sourceRoutineId}`, name: sourceRoutineId, workoutDate, startedAt: 1, finishedAt: 2, sourceRoutineId,
    exercises: [{ id: "e", exerciseKey: "bench-press", name: "Bench press", restSeconds: 120,
      sets: [{ id: "s", weightKg: 60, reps: 6, completed }] }],
  };
}
const summary = (days) => days.map((day) => `${day.date} ${day.kind === "train" ? day.routineId : day.kind}`);

// Sat 24 Oct Lower A, Sun 25 Upper A, Mon 26 Lower B, Wed 28 Upper B, Sat 31 Oct missed.
const lastWeek = [session("2026-10-24", "lower-a"), session("2026-10-25", "upper-a"), session("2026-10-26", "lower-b"), session("2026-10-28", "upper-b")];

test("reproduces the worked example for the week of 31 Oct 2026", () => {
  const days = planDays(plan, lastWeek, "2026-11-01", 8);
  assert.deepEqual(summary(days), [
    "2026-11-01 lower-a", // Rule 3: Saturday's lower was missed and lower is furthest behind
    "2026-11-02 upper-a", // Rule 4: lower was done yesterday
    "2026-11-03 rest", // volleyball
    "2026-11-04 upper-b", // Rule 1
    "2026-11-05 rest", // volleyball
    "2026-11-06 rest", // nothing to make up
    "2026-11-07 lower-b", // Rule 1
    "2026-11-08 upper-a", // back on schedule
  ]);
  assert.match(days[0].reason, /Make-up/);
  assert.match(days[1].reason, /done yesterday/);
  assert.equal(days[5].reason, "Rest, nothing to make up");
});

test("a normal week follows the slot days and alternates A and B", () => {
  const days = planDays(plan, [session("2026-10-24", "lower-a"), session("2026-10-25", "upper-a")], "2026-10-26", 7);
  assert.deepEqual(summary(days), [
    "2026-10-26 lower-b", "2026-10-27 rest", "2026-10-28 upper-b", "2026-10-29 rest", "2026-10-30 rest",
    "2026-10-31 lower-a", "2026-11-01 upper-a",
  ]);
  assert.deepEqual(days[0].notes, ["Volleyball tomorrow: stop every set 2-3 reps before failure."]);
});

test("a missed Monday lower is not moved to Wednesday before volleyball, but Friday makes it up", () => {
  const history = [session("2026-10-24", "lower-a"), session("2026-10-25", "upper-a")];
  const days = planDays(plan, history, "2026-10-28", 3);
  assert.deepEqual(summary(days), ["2026-10-28 upper-b", "2026-10-29 rest", "2026-10-30 lower-b"]);
  assert.match(days[2].reason, /Make-up/);
});

test("a workout already logged today shows as done", () => {
  const sessions = planSessions([...lastWeek, session("2026-11-01", "lower-a")], plan);
  assert.deepEqual(suggestDay(plan, sessions, "2026-11-01"), { date: "2026-11-01", kind: "done", type: "lower", routineId: "lower-a", reason: "Done", notes: [] });
});

test("workouts with no completed sets and workouts from other templates are ignored", () => {
  const sessions = planSessions([session("2026-10-24", "lower-a", false), session("2026-10-25", "full-body")], plan);
  assert.deepEqual(sessions, []);
});

test("eight or more days off a type suggests about 90% of last weights", () => {
  const day = suggestDay(plan, planSessions([session("2026-10-17", "lower-a"), session("2026-10-25", "upper-a")], plan), "2026-10-26");
  assert.equal(day.routineId, "lower-b");
  assert.ok(day.notes.some((note) => /9 days since your last lower session: start at about 90%/.test(note)));
});

test("with no history the plan starts with each type's first template", () => {
  assert.deepEqual(summary(planDays(plan, [], "2026-10-31", 2)), ["2026-10-31 lower-a", "2026-11-01 upper-a"]);
});

test("plans are validated and lose templates that were deleted", () => {
  assert.equal(validTrainingPlan(plan), true);
  assert.equal(validTrainingPlan({ ...plan, days: plan.days.slice(1) }), false);
  assert.equal(validTrainingPlan({ ...plan, days: [...plan.days.slice(1), "gym"] }), false);
  assert.equal(validTrainingPlan({ ...plan, lower: [""] }), false);
  assert.deepEqual(usablePlan(plan, routines.filter((routine) => routine.id !== "lower-b"))?.lower, ["lower-a"]);
  assert.equal(usablePlan(plan, routines.filter((routine) => !routine.id.startsWith("upper"))), null);
  assert.equal(usablePlan(undefined, routines), null);
});

test("a new plan picks up templates named Lower and Upper in A, B order", () => {
  const { guessTrainingPlan } = trainingPlanModule;
  const named = [
    { id: "u-a", name: "Upper A — Heavy (Sun)", exercises: [] }, { id: "l-a", name: "Lower A — Squat (Sat)", exercises: [] },
    { id: "u-b", name: "Upper B — Volume (Wed)", exercises: [] }, { id: "l-b", name: "Lower B — Hinge (Mon)", exercises: [] },
    { id: "legs", name: "Legs — Current Progress", exercises: [] },
  ];
  assert.deepEqual(guessTrainingPlan(named), { lower: ["l-a", "l-b"], upper: ["u-a", "u-b"], days: DEFAULT_PLAN_DAYS });
});
