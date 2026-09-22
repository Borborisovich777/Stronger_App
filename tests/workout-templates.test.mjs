import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const root = new URL("../", import.meta.url);
const templates = await importTypeScriptModule(new URL("app/workoutTemplates.ts", root));
const storage = await importTypeScriptModule(new URL("app/storage.ts", root));
let nextId = 0;
const id = (prefix) => `${prefix}-${++nextId}`;
const find = (key) => templates.WORKOUT_TEMPLATES.find((template) => template.id === key);

test("the compact design preview remains valid independently of the starter catalog", async () => {
  const preview = await importTypeScriptModule(new URL("app/preview-data.ts", root));
  const data = preview.createPreviewData();
  assert.ok(storage.isStrongerData(data));
  assert.equal(data.activeWorkout.exercises[0].exerciseKey, "deadlift");
  assert.equal(data.history.length, 1);
});

// Exercise identity, tracking, and copy boundaries are more consequential than card markup.
test("all fourteen templates and every alternative produce valid, unloaded independent routines", () => {
  assert.equal(templates.WORKOUT_TEMPLATES.length, 14);
  for (const category of templates.TEMPLATE_CATEGORIES) {
    assert.equal(templates.WORKOUT_TEMPLATES.filter((item) => item.category === category).length, 2);
  }
  for (const template of templates.WORKOUT_TEMPLATES) {
    assert.equal(new Set(template.slots.map((slot) => slot.id)).size, template.slots.length);
    for (const slot of template.slots) {
      for (const exerciseKey of [slot.exerciseKey, ...(slot.alternatives ?? [])]) {
        const routine = templates.createRoutineFromTemplate(template, { [slot.id]: { exerciseKey, included: true } }, id);
        const data = { ...storage.createDefaultData(), routines: [routine] };
        assert.ok(storage.normalizeStrongerData(data), `${template.id}: ${exerciseKey}`);
        assert.ok(routine.exercises.some((exercise) => exercise.exerciseKey === exerciseKey));
        assert.ok(routine.exercises.every((exercise) => exercise.targetWeightKg === 0));
        assert.equal(new Set(routine.exercises.map((exercise) => exercise.exerciseKey)).size, routine.exercises.length);
      }
    }
  }
});

test("equipment selection changes identity and assistance semantics without copying another lift's load", () => {
  const chest = templates.createRoutineFromTemplate(find("chest-barbell"), { "bench-press": { exerciseKey: "dumbbell-bench-press" } }, id);
  assert.equal(chest.exercises[0].exerciseKey, "dumbbell-bench-press");
  assert.equal(chest.exercises[0].name, "Dumbbell bench press");
  const back = templates.createRoutineFromTemplate(find("back-free-weights"), { "pull-up": { exerciseKey: "pull-up-assisted" } }, id);
  assert.equal(back.exercises[0].weightMode, "assistance");
  assert.equal(back.exercises[0].tracking, "weight-reps");
  assert.equal(back.exercises[0].targetWeightKg, 0);
  assert.throws(() => templates.createRoutineFromTemplate(find("chest-barbell"), { "bench-press": { exerciseKey: "back-squat" } }, id));
});

test("optional movements are opt-in; per-side holds use duration rather than fake repetitions", () => {
  const template = find("full-body-dumbbells");
  const ordinary = templates.createRoutineFromTemplate(template, {}, id);
  assert.ok(!ordinary.exercises.some((exercise) => exercise.exerciseKey === "hammer-curl"));
  const withOptional = templates.createRoutineFromTemplate(template, { "hammer-curl": { included: true } }, id);
  assert.equal(withOptional.exercises.length, ordinary.exercises.length + 1);
  const hold = ordinary.exercises.find((exercise) => exercise.exerciseKey === "side-plank");
  assert.equal(hold.tracking, "duration");
  assert.equal(hold.targetDurationSeconds, 20);
  assert.equal(hold.targetReps, 0);
  assert.match(hold.notes, /both sides/);
});

test("editing a copied template cannot change the catalog or other copies", () => {
  const before = structuredClone(templates.WORKOUT_TEMPLATES);
  const a = templates.createRoutineFromTemplate(find("back-rows"), {}, id);
  const b = templates.createRoutineFromTemplate(find("back-rows"), {}, id);
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.exercises[0].id, b.exercises[0].id);
  a.exercises[0].targetWeightKg = 25;
  a.exercises[0].name = "Edited copy";
  assert.equal(b.exercises[0].targetWeightKg, 0);
  assert.deepEqual(templates.WORKOUT_TEMPLATES, before);
});

test("new and previously saved prepared rep ranges wait for their upper goal before progressing", async () => {
  const { workoutFromTemplate } = await importTypeScriptModule(new URL("app/workoutFromTemplate.ts", root));
  const { applyNextWorkoutProgression } = await importTypeScriptModule(new URL("app/workoutProgression.ts", root));
  const routine = templates.createRoutineFromTemplate(find("back-rows"), {}, id);
  const history = [18, 20].map((day) => ({
    id: `prior-${day}`, name: "Another template", workoutDate: `2026-09-${day}`,
    startedAt: day * 100, finishedAt: day * 100 + 50,
    exercises: [{
      id: `lat-${day}`, exerciseKey: "lat-pulldown", name: "Lat pulldown",
      tracking: "weight-reps", weightMode: "external", restSeconds: 120,
      sets: [1, 2, 3].map((set) => ({ id: `set-${day}-${set}`, weightKg: 40, reps: 8, completed: true })),
    }],
  }));
  const legacyRoutine = structuredClone(routine);
  legacyRoutine.exercises.forEach((exercise) => { delete exercise.progressionRepTarget; });
  for (const plan of [routine, legacyRoutine]) {
    const before = structuredClone(plan);
    const start = () => workoutFromTemplate(plan, history, "2026-09-22", 2200, id);
    history.forEach((session) => session.exercises[0].sets.forEach((set) => { set.reps = 8; }));
    const lowerGoal = applyNextWorkoutProgression(plan, start(), history, 2.5, storage.MAX_WEIGHT_KG);
    assert.deepEqual(lowerGoal.increases, []);
    assert.deepEqual(lowerGoal.workout.exercises[0].sets.map(({ weightKg, reps }) => [weightKg, reps]), [[40, 8], [40, 8], [40, 8]]);
    history.forEach((session) => session.exercises[0].sets.forEach((set) => { set.reps = 12; }));
    const upperGoal = applyNextWorkoutProgression(plan, start(), history, 2.5, storage.MAX_WEIGHT_KG);
    assert.equal(upperGoal.increases.length, 1);
    assert.deepEqual(upperGoal.workout.exercises[0].sets.map(({ weightKg, reps }) => [weightKg, reps]), [[42.5, 8], [42.5, 8], [42.5, 8]]);
    assert.deepEqual(plan, before, "resolving the old range must not rewrite the saved template");
  }
});

test("training notes survive backup normalization; malformed notes are rejected", () => {
  const data = { ...storage.createDefaultData(), routines: [templates.createRoutineFromTemplate(find("legs-hinge"), {}, id)] };
  assert.deepEqual(storage.normalizeStrongerData(JSON.parse(JSON.stringify(data))), data);
  const invalid = structuredClone(data);
  invalid.routines[0].notes = 12;
  assert.equal(storage.normalizeStrongerData(invalid), null);
  invalid.routines[0].notes = "Valid";
  invalid.routines[0].exercises[0].notes = { unexpected: true };
  assert.equal(storage.normalizeStrongerData(invalid), null);
});
