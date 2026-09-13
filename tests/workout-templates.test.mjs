import assert from "node:assert/strict";
import test from "node:test";
import { importTypeScriptModule } from "./helpers/import-typescript.mjs";

const root = new URL("../", import.meta.url);
const templates = await importTypeScriptModule(new URL("app/workoutTemplates.ts", root));
const storage = await importTypeScriptModule(new URL("app/storage.ts", root));
let nextId = 0;
const id = (prefix) => `${prefix}-${++nextId}`;
const find = (key) => templates.WORKOUT_TEMPLATES.find((template) => template.id === key);

test("starter templates have deterministic unique identities and never share mutable data", () => {
  const a = storage.createDefaultData();
  const b = storage.createDefaultData();
  assert.deepEqual(a, b);
  assert.deepEqual(a.routines.map((routine) => routine.name), templates.WORKOUT_TEMPLATES.map((template) => template.name));
  const ids = a.routines.flatMap((routine) => [routine.id, ...routine.exercises.map((exercise) => exercise.id)]);
  assert.equal(new Set(ids).size, ids.length);
  a.routines[0].exercises[0].targetWeightKg = 25;
  a.routines[1].name = "My edited template";
  assert.deepEqual(storage.createDefaultData(), b);
});

test("the compact design preview remains valid independently of the starter catalog", async () => {
  const preview = await importTypeScriptModule(new URL("app/preview-data.ts", root));
  const data = preview.createPreviewData();
  assert.ok(storage.isStrongerData(data));
  assert.equal(data.activeWorkout.exercises[0].exerciseKey, "deadlift");
  assert.equal(data.history.length, 1);
});

test("adding prepared templates preserves existing routines, active workouts, history and settings", async () => {
  const preview = await importTypeScriptModule(new URL("app/preview-data.ts", root));
  const data = preview.createPreviewData();
  data.routines = [data.routines[0]];
  data.settings.unit = "lb";
  const before = structuredClone(data);
  const updated = templates.addPreparedTemplates(data, storage.MAX_ROUTINES);
  assert.equal(updated.routines.length, 15);
  assert.deepEqual({ ...updated, routines: data.routines }, before);
  assert.strictEqual(updated.routines[0], data.routines[0]);
  assert.strictEqual(updated.history, data.history);
  assert.strictEqual(updated.activeWorkout, data.activeWorkout);
  assert.deepEqual(data, before);
  assert.ok(storage.isStrongerData(updated));
  assert.strictEqual(templates.addPreparedTemplates(updated, storage.MAX_ROUTINES), updated);
});

test("adding prepared templates skips renamed defaults and copies already saved from Browse", () => {
  const data = storage.createDefaultData();
  const renamed = data.routines[0];
  renamed.name = "My customized chest day";
  renamed.exercises[0].targetWeightKg = 42;
  const copied = templates.createRoutineFromTemplate(find("back-rows"), {}, id);
  copied.name = ` ${copied.name.toUpperCase()} `;
  data.routines = [renamed, copied];
  const updated = templates.addPreparedTemplates(data, storage.MAX_ROUTINES);
  assert.equal(updated.routines.length, 14);
  assert.strictEqual(updated.routines[0], renamed);
  assert.strictEqual(updated.routines[1], copied);
  assert.equal(updated.routines[0].exercises[0].targetWeightKg, 42);
  assert.equal(templates.missingPreparedTemplates(updated.routines).length, 0);
  assert.equal(new Set(updated.routines.map((routine) => routine.id)).size, 14);
});

test("adding prepared templates respects the storage limit without partially changing data", () => {
  const data = { ...storage.createDefaultData(), routines: [] };
  const before = structuredClone(data);
  assert.throws(() => templates.addPreparedTemplates(data, 13), /not enough room/);
  assert.deepEqual(data, before);
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
