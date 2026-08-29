import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function importSessionRescueModule() {
  const source = await readFile(new URL("app/sessionRescue.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "sessionRescue.ts",
  });
  return import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`);
}

const rescue = await importSessionRescueModule();
const startedAt = Date.UTC(2026, 7, 28, 8, 0, 0);

function workout() {
  return {
    id: "workout-session-rescue",
    name: "Push",
    workoutDate: "2026-08-28",
    startedAt,
    restEndsAt: startedAt + 4_000_000,
    exercises: [{
      id: "exercise-session-rescue",
      exerciseKey: "bench-press",
      name: "Bench press",
      restSeconds: 90,
      sets: [
        {
          id: "set-complete",
          weightKg: 60,
          reps: 8,
          completed: true,
          completedAt: startedAt + 30 * 60 * 1000,
        },
        {
          id: "set-incomplete",
          weightKg: 60,
          reps: 8,
          completed: false,
          completedAt: startedAt + 5 * 60 * 60 * 1000,
        },
      ],
    }],
  };
}

test("session rescue uses a six-hour inactivity boundary", () => {
  const active = workout();
  const latest = rescue.latestWorkoutActivityAt(active);

  assert.equal(rescue.shouldOfferSessionRescue(null, latest + rescue.SESSION_RESCUE_INACTIVITY_MS), false);
  assert.equal(rescue.shouldOfferSessionRescue(active, latest + rescue.SESSION_RESCUE_INACTIVITY_MS - 1), false);
  assert.equal(rescue.shouldOfferSessionRescue(active, latest + rescue.SESSION_RESCUE_INACTIVITY_MS), true);
  assert.equal(rescue.shouldOfferSessionRescue(active, latest - 1), false, "future clock values must read as recent");
});

test("only completed-set timestamps extend the latest trustworthy activity", () => {
  const active = workout();

  assert.equal(rescue.latestWorkoutActivityAt(active), startedAt + 30 * 60 * 1000);
  active.exercises[0].sets[1].completed = true;
  assert.equal(rescue.latestWorkoutActivityAt(active), startedAt + 5 * 60 * 60 * 1000);
});

test("pausing anchors the timer at the last logged set without mutating workout data", () => {
  const active = workout();
  const before = structuredClone(active);
  const paused = rescue.pauseWorkoutTimer(active, startedAt + 24 * 60 * 60 * 1000);

  assert.deepEqual(active, before);
  assert.equal(paused.timerPausedAt, startedAt + 30 * 60 * 1000);
  assert.equal(paused.restEndsAt, undefined);
  assert.deepEqual(paused.exercises, before.exercises);
  assert.equal(rescue.workoutElapsedSeconds(paused, startedAt + 48 * 60 * 60 * 1000), 30 * 60);
  assert.equal(rescue.shouldOfferSessionRescue(paused, startedAt + 48 * 60 * 60 * 1000), false);
});

test("resuming excludes the paused gap without rewriting recorded timestamps", () => {
  const active = workout();
  const paused = rescue.pauseWorkoutTimer(active, startedAt + 24 * 60 * 60 * 1000);
  const resumedAt = startedAt + 26 * 60 * 60 * 1000;
  const resumed = rescue.resumeWorkoutTimer(paused, resumedAt);

  assert.equal(resumed.timerPausedAt, undefined);
  assert.equal(resumed.timerPausedDurationMs, resumedAt - paused.timerPausedAt);
  assert.equal(resumed.timerResumedAt, resumedAt);
  assert.equal(resumed.startedAt, active.startedAt);
  assert.equal(resumed.exercises[0].sets[0].completedAt, active.exercises[0].sets[0].completedAt);
  assert.equal(rescue.workoutElapsedSeconds(resumed, resumedAt), 30 * 60);
});

test("a second pause cannot double-count an earlier paused gap", () => {
  const firstPause = rescue.pauseWorkoutTimer(workout(), startedAt + 24 * 60 * 60 * 1000);
  const firstResumeAt = startedAt + 26 * 60 * 60 * 1000;
  const resumed = rescue.resumeWorkoutTimer(firstPause, firstResumeAt);
  const secondPause = rescue.pauseWorkoutTimer(resumed, firstResumeAt + 2 * 60 * 60 * 1000);

  assert.equal(secondPause.timerPausedAt, firstResumeAt, "the explicit resume is the latest trustworthy activity");
  assert.equal(rescue.workoutElapsedSeconds(secondPause, firstResumeAt + 4 * 60 * 60 * 1000), 30 * 60);
  assert.equal(rescue.shouldOfferSessionRescue(resumed, firstResumeAt + rescue.SESSION_RESCUE_INACTIVITY_MS - 1), false);
  assert.equal(rescue.shouldOfferSessionRescue(resumed, firstResumeAt + rescue.SESSION_RESCUE_INACTIVITY_MS), true);
});

test("finishing a paused workout preserves its frozen duration", () => {
  const paused = rescue.pauseWorkoutTimer(workout(), startedAt + 24 * 60 * 60 * 1000);
  const finished = rescue.finishWorkoutTimer(paused, startedAt + 48 * 60 * 60 * 1000);

  assert.equal(finished.finishedAt, paused.timerPausedAt);
  assert.equal(finished.timerPausedAt, undefined);
  assert.equal(finished.timerResumedAt, undefined);
  assert.equal(finished.restEndsAt, undefined);
  assert.equal(rescue.workoutElapsedSeconds(finished, finished.finishedAt), 30 * 60);
});

test("closing a stale workout can save it at its last trustworthy activity", () => {
  const active = workout();
  const finished = rescue.finishWorkoutTimer(active, startedAt + 24 * 60 * 60 * 1000, true);

  assert.equal(finished.finishedAt, startedAt + 30 * 60 * 1000);
  assert.equal(finished.id, active.id);
  assert.deepEqual(finished.exercises, active.exercises);
});
