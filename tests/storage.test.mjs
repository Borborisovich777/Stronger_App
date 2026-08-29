import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);
let storageModuleImport = 0;

async function importStorageModule() {
  const source = await readFile(new URL("app/storage.ts", projectRoot), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "storage.ts",
  });
  const encoded = Buffer.from(transpiled.outputText).toString("base64");
  storageModuleImport += 1;
  return import(`data:text/javascript;base64,${encoded}#${storageModuleImport}`);
}

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, projectRoot), "utf8"));
}

function createFakeIndexedDb({ storedValue, holdWrite = false, failReads = false, failWrites = false, failWriteOnAttempt = null, throwOnTransaction = false }) {
  let currentTransaction;
  let writtenValue;
  let currentStoredValue = storedValue;
  let shouldFailReads = failReads;
  let shouldFailWrites = failWrites;
  let shouldHoldWrites = holdWrite;
  let writeAttempts = 0;
  let closeCount = 0;
  const database = {
    objectStoreNames: { contains: () => true },
    close: () => { closeCount += 1; },
    transaction: (_storeName, mode) => {
      if (throwOnTransaction) throw new Error("Transaction setup failed");
      const shouldHoldTransaction = shouldHoldWrites && mode === "readwrite";
      let pendingRequests = 0;
      let completionScheduled = false;
      const transaction = {
        error: null,
        abort: () => queueMicrotask(() => transaction.onabort?.()),
        objectStore: () => ({
          get: () => {
            pendingRequests += 1;
            const request = { result: undefined, error: null };
            queueMicrotask(() => {
              if (shouldFailReads) {
                request.error = new Error("Read failed");
                request.onerror?.();
                return;
              }
              request.result = currentStoredValue;
              request.onsuccess?.();
              pendingRequests -= 1;
              if (!shouldHoldTransaction && pendingRequests === 0 && !completionScheduled) {
                completionScheduled = true;
                queueMicrotask(() => {
                  if (pendingRequests === 0) transaction.oncomplete?.();
                  else completionScheduled = false;
                });
              }
            });
            return request;
          },
          put: (value, key) => {
            pendingRequests += 1;
            const request = { result: key, error: null };
            queueMicrotask(() => {
              writeAttempts += 1;
              if (shouldFailWrites || writeAttempts === failWriteOnAttempt) {
                request.error = new Error("Write failed");
                request.onerror?.();
                return;
              }
              writtenValue = value;
              currentStoredValue = value;
              request.onsuccess?.();
              pendingRequests -= 1;
              if (!shouldHoldTransaction && pendingRequests === 0 && !completionScheduled) {
                completionScheduled = true;
                queueMicrotask(() => {
                  if (pendingRequests === 0) transaction.oncomplete?.();
                  else completionScheduled = false;
                });
              }
            });
            return request;
          },
        }),
      };
      currentTransaction = transaction;
      return transaction;
    },
  };
  const indexedDb = {
    open: () => {
      const request = { result: database, error: null };
      queueMicrotask(() => request.onsuccess?.());
      return request;
    },
  };
  return {
    indexedDb,
    closeCount: () => closeCount,
    complete: () => currentTransaction?.oncomplete?.(),
    setFailReads: (value) => { shouldFailReads = value; },
    setFailWrites: (value) => { shouldFailWrites = value; },
    setHoldWrites: (value) => { shouldHoldWrites = value; },
    setStoredValue: (value) => { currentStoredValue = value; },
    storedValue: () => currentStoredValue,
    writtenValue: () => writtenValue,
  };
}

function createMemoryLocalStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
    value: (key) => values.get(key) ?? null,
  };
}

function addStorageMetadata(data, { savedAt, basedOnSavedAt, primaryBaseSavedAt }) {
  return {
    ...structuredClone(data),
    _strongerStorage: {
      formatVersion: 1,
      savedAt,
      basedOnSavedAt,
      primaryBaseSavedAt,
    },
  };
}

function installBrowserStorage(indexedDb, localStorage, { withLocks = true } = {}) {
  const previousWindow = globalThis.window;
  const previousIndexedDb = globalThis.indexedDB;
  const previousNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  if (indexedDb === undefined) delete globalThis.indexedDB;
  else globalThis.indexedDB = indexedDb;
  globalThis.window = indexedDb === undefined ? { localStorage } : { indexedDB: indexedDb, localStorage };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: withLocks ? {
      locks: {
        request: async (_name, _options, callback) => callback(),
      },
    } : {},
  });
  return () => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousIndexedDb === undefined) delete globalThis.indexedDB;
    else globalThis.indexedDB = previousIndexedDb;
    if (previousNavigatorDescriptor) Object.defineProperty(globalThis, "navigator", previousNavigatorDescriptor);
    else delete globalThis.navigator;
  };
}

const storage = await importStorageModule();
const activeHistoryBackup = await readJson("tests/fixtures/format-v1-active-history.json");
const pausedActiveBackup = await readJson("tests/fixtures/format-v1-paused-active.json");
const effortBackup = await readJson("tests/fixtures/format-v1-effort.json");
const programBlockBackup = await readJson("tests/fixtures/format-v1-program-block.json");
const currentProgressBackup = await readJson("stronger-current-progress-templates.json");

test("default data is valid at the current schema version", () => {
  const data = storage.createDefaultData();

  assert.equal(data.formatVersion, storage.CURRENT_FORMAT_VERSION);
  assert.equal(data.settings.effortScale, "off");
  assert.equal(data.settings.nextSetPreview, false);
  assert.deepEqual(data.programBlocks, []);
  assert.equal(storage.isStrongerData(data), true);
  assert.deepEqual(storage.migrateStrongerData(data), data);
});

test("legacy version-1 backups without customExercises remain importable", () => {
  const before = JSON.stringify(currentProgressBackup);
  const data = storage.normalizeStrongerBackup(currentProgressBackup);

  assert.ok(data);
  assert.deepEqual(data, {
    ...structuredClone(currentProgressBackup.data),
    customExercises: [],
  });
  assert.equal(data.routines[0].exercises[0].exerciseKey, "barbell-bench-press");
  assert.equal(JSON.stringify(currentProgressBackup), before, "normalization must not mutate the selected backup");
});

test("an active workout, timestamps, unknown keys, and history order survive migration", () => {
  const data = storage.normalizeStrongerBackup(activeHistoryBackup);

  assert.ok(data);
  assert.equal(data.activeWorkout.id, "workout-fixture-active");
  assert.equal(data.activeWorkout.restEndsAt, 1787904990000);
  assert.equal(data.activeWorkout.exercises[0].exerciseKey, "fixture-cable-row");
  assert.equal(data.activeWorkout.exercises[0].sets[0].completedAt, 1787904900000);
  assert.equal(data.activeWorkout.exercises[0].sets[1].completed, false);
  assert.deepEqual(data.history.map((session) => session.id), [
    "workout-fixture-newer",
    "workout-fixture-older",
  ]);
  assert.deepEqual(storage.migrateStrongerData(data), data, "the current migration must be idempotent");
});

test("additive paused-timer fields survive backup normalization", () => {
  const data = storage.normalizeStrongerBackup(pausedActiveBackup);

  assert.ok(data?.activeWorkout);
  assert.equal(data.activeWorkout.timerPausedAt, 1787907600000);
  assert.equal(data.activeWorkout.timerPausedDurationMs, 600000);
  assert.equal(data.activeWorkout.timerResumedAt, 1787905000000);
  assert.equal(data.activeWorkout.exercises[0].sets[0].completedAt, 1787905800000);
  assert.equal(data.formatVersion, 1);
});

test("optional effort settings and per-set values survive version-1 normalization", () => {
  const data = storage.normalizeStrongerBackup(effortBackup);

  assert.ok(data);
  assert.equal(data.settings.effortScale, "rpe");
  assert.deepEqual(data.history[0].exercises[0].sets[0].effort, { scale: "rpe", value: 8.5 });
  assert.equal(storage.workoutVolumeKg(data.history[0]), 480);
  assert.equal(data.formatVersion, 1);
});

test("invalid effort scales and values reject the whole selected backup", () => {
  const invalidScale = structuredClone(effortBackup);
  invalidScale.data.history[0].exercises[0].sets[0].effort.scale = "automatic";
  assert.equal(storage.normalizeStrongerBackup(invalidScale), null);

  const invalidRpeStep = structuredClone(effortBackup);
  invalidRpeStep.data.history[0].exercises[0].sets[0].effort.value = 8.25;
  assert.equal(storage.normalizeStrongerBackup(invalidRpeStep), null);

  const invalidSetting = structuredClone(effortBackup);
  invalidSetting.data.settings.effortScale = "pain";
  assert.equal(storage.normalizeStrongerBackup(invalidSetting), null);
});

test("the optional next-set preview consent flag survives version-1 normalization", () => {
  const enabled = structuredClone(activeHistoryBackup);
  enabled.data.settings.nextSetPreview = true;
  const data = storage.normalizeStrongerBackup(enabled);

  assert.equal(data?.settings.nextSetPreview, true);

  const invalid = structuredClone(activeHistoryBackup);
  invalid.data.settings.nextSetPreview = "automatic";
  assert.equal(storage.normalizeStrongerBackup(invalid), null);
});

test("program blocks survive version-1 normalization as independent routine snapshots", () => {
  const data = storage.normalizeStrongerBackup(programBlockBackup);

  assert.ok(data?.programBlocks);
  assert.equal(data.programBlocks.length, 1);
  assert.equal(data.routines[0].exercises[0].targetWeightKg, 85);
  assert.equal(data.programBlocks[0].exercises[0].targetWeightKg, 80);
  assert.deepEqual(data.programBlocks[0].weeks.map((week) => week.loadPercent), [100, 90]);
  assert.equal(data.activeWorkout, null);
  assert.deepEqual(data.history, []);
  assert.equal(data.formatVersion, 1);
});

test("invalid program block bounds reject the whole selected backup", () => {
  const invalidLoad = structuredClone(programBlockBackup);
  invalidLoad.data.programBlocks[0].weeks[1].loadPercent = 49;
  assert.equal(storage.normalizeStrongerBackup(invalidLoad), null);

  const invalidStep = structuredClone(programBlockBackup);
  invalidStep.data.programBlocks[0].weeks[1].loadPercent = 92;
  assert.equal(storage.normalizeStrongerBackup(invalidStep), null);

  const excessiveLoad = structuredClone(programBlockBackup);
  excessiveLoad.data.programBlocks[0].weeks[1].loadPercent = 121;
  assert.equal(storage.normalizeStrongerBackup(excessiveLoad), null);

  const tooShort = structuredClone(programBlockBackup);
  tooShort.data.programBlocks[0].weeks = [tooShort.data.programBlocks[0].weeks[0]];
  assert.equal(storage.normalizeStrongerBackup(tooShort), null);

  const duplicateWeek = structuredClone(programBlockBackup);
  duplicateWeek.data.programBlocks[0].weeks[1].id = duplicateWeek.data.programBlocks[0].weeks[0].id;
  assert.equal(storage.normalizeStrongerBackup(duplicateWeek), null);

  const tooManyBlocks = structuredClone(programBlockBackup);
  tooManyBlocks.data.programBlocks = Array.from({ length: storage.MAX_PROGRAM_BLOCKS + 1 }, (_, index) => ({
    ...structuredClone(programBlockBackup.data.programBlocks[0]),
    id: `program-block-${index}`,
  }));
  assert.equal(storage.normalizeStrongerBackup(tooManyBlocks), null);
});

test("additive version-1 fields survive normalization", () => {
  const additive = structuredClone(activeHistoryBackup.data);
  additive.futureMetadata = { source: "fixture", revision: 7 };

  const normalized = storage.normalizeStrongerData(additive);

  assert.ok(normalized);
  assert.deepEqual(normalized.futureMetadata, additive.futureMetadata);
});

test("wrapped and raw snapshots normalize to the same data", () => {
  const wrapped = storage.normalizeStrongerBackup(activeHistoryBackup);
  const raw = storage.normalizeStrongerBackup(activeHistoryBackup.data);
  const marked = storage.normalizeStrongerBackup({
    ...activeHistoryBackup,
    kind: storage.BACKUP_KIND,
    backupVersion: storage.BACKUP_FORMAT_VERSION,
  });

  assert.ok(wrapped);
  assert.deepEqual(raw, wrapped);
  assert.deepEqual(marked, wrapped);
});

test("backup envelope versions must agree with the contained data", () => {
  assert.equal(storage.normalizeStrongerBackup({ ...activeHistoryBackup, formatVersion: 2 }), null);
  assert.equal(storage.normalizeStrongerBackup({
    ...activeHistoryBackup,
    kind: storage.BACKUP_KIND,
    backupVersion: 2,
  }), null);
  assert.equal(storage.normalizeStrongerBackup({
    ...activeHistoryBackup,
    kind: "another-app",
    backupVersion: storage.BACKUP_FORMAT_VERSION,
  }), null);
  assert.equal(storage.normalizeStrongerBackup({
    ...activeHistoryBackup.data,
    kind: "another-app",
    backupVersion: storage.BACKUP_FORMAT_VERSION,
  }), null, "raw compatibility must not bypass explicit identity markers");
});

test("corrupt or unsupported snapshots are rejected as a whole", () => {
  const invalidSnapshots = [];
  const unsupportedVersion = structuredClone(activeHistoryBackup.data);
  unsupportedVersion.formatVersion = 2;
  invalidSnapshots.push(unsupportedVersion);

  const impossibleDate = structuredClone(activeHistoryBackup.data);
  impossibleDate.activeWorkout.workoutDate = "2026-02-31";
  invalidSnapshots.push(impossibleDate);

  const invalidOptionalTimestamp = structuredClone(activeHistoryBackup.data);
  invalidOptionalTimestamp.history[0].finishedAt = "later";
  invalidSnapshots.push(invalidOptionalTimestamp);

  const negativeWeight = structuredClone(activeHistoryBackup.data);
  negativeWeight.activeWorkout.exercises[0].sets[0].weightKg = -1;
  invalidSnapshots.push(negativeWeight);

  const nonFiniteReps = structuredClone(activeHistoryBackup.data);
  nonFiniteReps.activeWorkout.exercises[0].sets[0].reps = Number.NaN;
  invalidSnapshots.push(nonFiniteReps);

  const invalidSettings = structuredClone(activeHistoryBackup.data);
  invalidSettings.settings.weeklyDays = 8;
  invalidSnapshots.push(invalidSettings);

  const invalidCustomExercises = structuredClone(activeHistoryBackup.data);
  invalidCustomExercises.customExercises = [{ exerciseKey: "", name: "Invalid" }];
  invalidSnapshots.push(invalidCustomExercises);

  const fractionalTargetSets = structuredClone(activeHistoryBackup.data);
  fractionalTargetSets.routines[0].exercises[0].targetSets = 1.5;
  invalidSnapshots.push(fractionalTargetSets);

  const excessiveTargetSets = structuredClone(activeHistoryBackup.data);
  excessiveTargetSets.routines[0].exercises[0].targetSets = 1e308;
  invalidSnapshots.push(excessiveTargetSets);

  const zeroTargetSets = structuredClone(activeHistoryBackup.data);
  zeroTargetSets.routines[0].exercises[0].targetSets = 0;
  invalidSnapshots.push(zeroTargetSets);

  const aboveUiTargetSets = structuredClone(activeHistoryBackup.data);
  aboveUiTargetSets.routines[0].exercises[0].targetSets = 21;
  invalidSnapshots.push(aboveUiTargetSets);

  const excessiveWorkoutSets = structuredClone(activeHistoryBackup.data);
  const baseExercise = excessiveWorkoutSets.activeWorkout.exercises[0];
  excessiveWorkoutSets.activeWorkout.exercises = Array.from({ length: 6 }, (_, exerciseIndex) => ({
    ...structuredClone(baseExercise),
    id: `aggregate-exercise-${exerciseIndex}`,
    sets: Array.from({ length: 100 }, (_, setIndex) => ({
      ...structuredClone(baseExercise.sets[0]),
      id: `aggregate-set-${exerciseIndex}-${setIndex}`,
    })),
  }));
  invalidSnapshots.push(excessiveWorkoutSets);

  const excessiveRoutineSets = structuredClone(activeHistoryBackup.data);
  const baseRoutineExercise = excessiveRoutineSets.routines[0].exercises[0];
  excessiveRoutineSets.routines[0].exercises = Array.from({ length: 26 }, (_, index) => ({
    ...structuredClone(baseRoutineExercise),
    id: `aggregate-routine-exercise-${index}`,
    targetSets: 20,
  }));
  invalidSnapshots.push(excessiveRoutineSets);

  const duplicateWorkoutId = structuredClone(activeHistoryBackup.data);
  duplicateWorkoutId.history[0].id = duplicateWorkoutId.activeWorkout.id;
  invalidSnapshots.push(duplicateWorkoutId);

  const duplicateRoutineId = structuredClone(activeHistoryBackup.data);
  duplicateRoutineId.routines.push(structuredClone(duplicateRoutineId.routines[0]));
  invalidSnapshots.push(duplicateRoutineId);

  for (const snapshot of invalidSnapshots) {
    assert.equal(storage.normalizeStrongerBackup({ formatVersion: 1, data: snapshot }), null);
  }
});

test("previously writable oversized version-1 data loads into read-only recovery without being rewritten", async () => {
  const oversized = structuredClone(activeHistoryBackup.data);
  const baseSet = oversized.activeWorkout.exercises[0].sets[0];
  oversized.activeWorkout.exercises[0].sets = Array.from({ length: 101 }, (_, index) => ({
    ...structuredClone(baseSet),
    id: `legacy-large-set-${index}`,
  }));
  assert.equal(storage.normalizeStrongerBackup(oversized), null, "new imports must enforce screen limits");

  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: oversized });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage());
  try {
    const loaded = await isolatedStorage.loadData();
    assert.equal(loaded.activeWorkout.exercises[0].sets.length, 101);
    assert.equal(isolatedStorage.isWithinSafeResourceLimits(loaded), false);
    assert.deepEqual(fake.storedValue(), oversized, "loading recovery data must not rewrite the legacy record");
  } finally {
    restoreGlobals();
  }
});

test("malformed fallback storage blocks startup instead of returning starter data", async () => {
  const isolatedStorage = await importStorageModule();
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem: () => "{not-valid-json",
    },
  };

  try {
    await assert.rejects(
      isolatedStorage.loadData(),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("an unreadable storage backend never falls through to starter data", async () => {
  const isolatedStorage = await importStorageModule();
  const restoreGlobals = installBrowserStorage(undefined, {
    getItem: () => { throw new Error("Storage unavailable"); },
  });

  try {
    await assert.rejects(
      isolatedStorage.loadData(),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
  } finally {
    restoreGlobals();
  }
});

test("a valid legacy primary remains available when only emergency storage is unreadable", async () => {
  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: activeHistoryBackup.data });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, {
    getItem: () => { throw new Error("Emergency storage unavailable"); },
  });

  try {
    const loaded = await isolatedStorage.loadData();
    assert.equal(loaded.activeWorkout?.id, "workout-fixture-active");
    assert.deepEqual(fake.storedValue(), activeHistoryBackup.data);
  } finally {
    restoreGlobals();
  }
});

test("a previously unreadable older sibling fallback cannot be overwritten on the first save", async () => {
  const isolatedStorage = await importStorageModule();
  const base = isolatedStorage.createDefaultData();
  const primaryData = structuredClone(base);
  primaryData.settings.weeklyDays = 4;
  const fallbackData = structuredClone(base);
  fallbackData.settings.weeklyDays = 2;
  const primaryStored = addStorageMetadata(primaryData, {
    savedAt: 300,
    basedOnSavedAt: 200,
    primaryBaseSavedAt: 200,
  });
  const fallbackStored = addStorageMetadata(fallbackData, {
    savedAt: 200,
    basedOnSavedAt: 100,
    primaryBaseSavedAt: 100,
  });
  const memoryStorage = createMemoryLocalStorage({
    "stronger-data-fallback": JSON.stringify(fallbackStored),
  });
  let fallbackReadable = false;
  const localStorage = {
    getItem: (key) => {
      if (!fallbackReadable) throw new Error("Emergency storage temporarily unavailable");
      return memoryStorage.getItem(key);
    },
    removeItem: (key) => memoryStorage.removeItem(key),
    setItem: (key, value) => memoryStorage.setItem(key, value),
  };
  const fake = createFakeIndexedDb({ storedValue: primaryStored });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, localStorage);

  try {
    const loaded = await isolatedStorage.loadData();
    assert.equal(loaded.settings.weeklyDays, 4);
    fallbackReadable = true;
    const edit = structuredClone(loaded);
    edit.settings.goal = "fitness";
    await assert.rejects(
      isolatedStorage.saveData(edit),
      (error) => error?.name === "StrongerDataConflictError",
    );
    assert.deepEqual(fake.storedValue(), primaryStored, "the primary branch must remain untouched");
    assert.equal(
      memoryStorage.value("stronger-data-fallback"),
      JSON.stringify(fallbackStored),
      "the hidden sibling branch must remain exportable",
    );
  } finally {
    restoreGlobals();
  }
});

test("a previously unreadable same-payload fallback can be reconciled before saving", async () => {
  const isolatedStorage = await importStorageModule();
  const fallbackData = isolatedStorage.createDefaultData();
  const primaryData = structuredClone(fallbackData);
  primaryData.settings.weeklyDays = 4;
  const fallbackStored = addStorageMetadata(fallbackData, {
    savedAt: 200,
    basedOnSavedAt: 100,
    primaryBaseSavedAt: 100,
  });
  const primaryStored = addStorageMetadata(primaryData, {
    savedAt: 300,
    basedOnSavedAt: 200,
    primaryBaseSavedAt: 200,
  });
  const memoryStorage = createMemoryLocalStorage({
    "stronger-data-fallback": JSON.stringify(fallbackStored),
  });
  let fallbackReadable = false;
  const localStorage = {
    getItem: (key) => {
      if (!fallbackReadable) throw new Error("Emergency storage temporarily unavailable");
      return memoryStorage.getItem(key);
    },
    removeItem: (key) => memoryStorage.removeItem(key),
    setItem: (key, value) => memoryStorage.setItem(key, value),
  };
  const fake = createFakeIndexedDb({ storedValue: primaryStored });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, localStorage);

  try {
    const loaded = await isolatedStorage.loadData();
    fallbackReadable = true;
    const edit = structuredClone(loaded);
    edit.settings.goal = "fitness";
    await isolatedStorage.saveData(edit);
    assert.equal(isolatedStorage.normalizeStrongerData(fake.storedValue())?.settings.goal, "fitness");
    assert.equal(
      isolatedStorage.normalizeStrongerData(
        JSON.parse(memoryStorage.value("stronger-data-fallback")),
      )?.settings.goal,
      "fitness",
    );
  } finally {
    restoreGlobals();
  }
});

test("an invalid primary record is never hidden by starter or fallback data", async () => {
  const isolatedStorage = await importStorageModule();
  const corruptPrimary = { formatVersion: 1, routines: [] };
  const fake = createFakeIndexedDb({ storedValue: corruptPrimary });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage({
    "stronger-data-fallback": JSON.stringify(activeHistoryBackup.data),
  }));

  try {
    await assert.rejects(
      isolatedStorage.loadData(),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
    assert.deepEqual(fake.storedValue(), corruptPrimary, "a corrupt primary record must remain untouched for recovery");
  } finally {
    restoreGlobals();
  }
});

test("divergent legacy copies with equal revisions require recovery", async () => {
  const isolatedStorage = await importStorageModule();
  const primary = isolatedStorage.createDefaultData();
  const fake = createFakeIndexedDb({ storedValue: primary });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage({
    "stronger-data-fallback": JSON.stringify(activeHistoryBackup.data),
  }));

  try {
    await assert.rejects(
      isolatedStorage.loadData(),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
    assert.deepEqual(fake.storedValue(), primary);
  } finally {
    restoreGlobals();
  }
});

test("a matching parent timestamp without a matching fingerprint cannot prove ancestry", async () => {
  const isolatedStorage = await importStorageModule();
  const base = isolatedStorage.createDefaultData();
  const primaryData = structuredClone(base);
  primaryData.settings.goal = "muscle";
  const fallbackData = structuredClone(base);
  fallbackData.settings.goal = "fitness";
  const primaryStored = addStorageMetadata(primaryData, {
    savedAt: 300,
    basedOnSavedAt: 200,
    primaryBaseSavedAt: 200,
  });
  const fallbackStored = addStorageMetadata(fallbackData, {
    savedAt: 200,
    basedOnSavedAt: 100,
    primaryBaseSavedAt: 100,
  });
  const fake = createFakeIndexedDb({ storedValue: primaryStored });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage({
    "stronger-data-fallback": JSON.stringify(fallbackStored),
  }));

  try {
    await assert.rejects(
      isolatedStorage.loadData(),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
    assert.deepEqual(fake.storedValue(), primaryStored);
  } finally {
    restoreGlobals();
  }
});

test("a valid emergency copy preserves the active workout", async () => {
  const isolatedStorage = await importStorageModule();
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem: () => JSON.stringify(activeHistoryBackup.data),
    },
  };

  try {
    const data = await isolatedStorage.loadData();
    assert.equal(data.activeWorkout?.id, "workout-fixture-active");
    assert.equal(data.activeWorkout?.exercises[0].sets[1].completed, false);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("a failed primary read never promotes a possibly stale fallback", async () => {
  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: isolatedStorage.createDefaultData(), failReads: true });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage({
    "stronger-data-fallback": JSON.stringify(activeHistoryBackup.data),
  }));

  try {
    await assert.rejects(
      isolatedStorage.loadData(),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
  } finally {
    restoreGlobals();
  }
});

test("a newer fallback wins after an IndexedDB write failure and is promoted safely", async () => {
  const isolatedStorage = await importStorageModule();
  const oldData = isolatedStorage.createDefaultData();
  const newData = isolatedStorage.normalizeStrongerBackup(activeHistoryBackup);
  assert.ok(newData);
  const fake = createFakeIndexedDb({ storedValue: oldData, failWrites: true });
  const localStorage = createMemoryLocalStorage();
  const restoreGlobals = installBrowserStorage(fake.indexedDb, localStorage);

  try {
    await isolatedStorage.loadData();
    await isolatedStorage.saveData(newData);
    assert.ok(localStorage.value("stronger-data-fallback"));

    fake.setFailWrites(false);
    const loaded = await isolatedStorage.loadData();
    assert.equal(loaded.activeWorkout?.id, "workout-fixture-active");
    assert.equal(isolatedStorage.normalizeStrongerData(fake.storedValue())?.activeWorkout?.id, "workout-fixture-active");
  } finally {
    restoreGlobals();
  }
});

test("consecutive saves stay ordered in the emergency copy while primary writes are unavailable", async () => {
  const isolatedStorage = await importStorageModule();
  const initial = isolatedStorage.createDefaultData();
  const fake = createFakeIndexedDb({ storedValue: initial, failWrites: true });
  const localStorage = createMemoryLocalStorage();
  const restoreGlobals = installBrowserStorage(fake.indexedDb, localStorage);

  try {
    await isolatedStorage.loadData();
    const firstEdit = structuredClone(initial);
    firstEdit.settings.goal = "muscle";
    await isolatedStorage.saveData(firstEdit);

    const secondEdit = structuredClone(firstEdit);
    secondEdit.settings.goal = "fitness";
    await isolatedStorage.saveData(secondEdit);

    const fallback = JSON.parse(localStorage.value("stronger-data-fallback"));
    assert.equal(isolatedStorage.normalizeStrongerData(fallback)?.settings.goal, "fitness");
    assert.equal(isolatedStorage.normalizeStrongerData(fake.storedValue())?.settings.goal, "strength");

    const reloadedStorage = await importStorageModule();
    const reloaded = await reloadedStorage.loadData();
    assert.equal(reloaded.settings.goal, "fitness", "the full emergency chain must survive reload");

    fake.setFailWrites(false);
    const thirdEdit = structuredClone(reloaded);
    thirdEdit.settings.goal = "muscle";
    await reloadedStorage.saveData(thirdEdit);
    const latestFallback = JSON.parse(localStorage.value("stronger-data-fallback"));
    assert.equal(reloadedStorage.normalizeStrongerData(latestFallback)?.settings.goal, "muscle");
  } finally {
    restoreGlobals();
  }
});

test("a rapid queued save rebases its emergency lineage after the preceding primary commit", async () => {
  const isolatedStorage = await importStorageModule();
  const initial = isolatedStorage.createDefaultData();
  const fake = createFakeIndexedDb({ storedValue: initial, holdWrite: true, failWriteOnAttempt: 2 });
  const localStorage = createMemoryLocalStorage();
  const restoreGlobals = installBrowserStorage(fake.indexedDb, localStorage);

  try {
    await isolatedStorage.loadData();
    const firstEdit = structuredClone(initial);
    firstEdit.settings.goal = "muscle";
    const firstSave = isolatedStorage.saveData(firstEdit);
    await new Promise((resolve) => setImmediate(resolve));

    const secondEdit = structuredClone(firstEdit);
    secondEdit.settings.goal = "fitness";
    const secondSave = isolatedStorage.saveData(secondEdit);

    fake.complete();
    await firstSave;
    await secondSave;

    fake.setHoldWrites(false);
    const reloadedStorage = await importStorageModule();
    const reloaded = await reloadedStorage.loadData();
    assert.equal(reloaded.settings.goal, "fitness");
  } finally {
    restoreGlobals();
  }
});

test("a failed write can seed an absent emergency copy after the primary has a revision", async () => {
  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: isolatedStorage.createDefaultData() });
  const localStorage = createMemoryLocalStorage();
  const restoreGlobals = installBrowserStorage(fake.indexedDb, localStorage);

  try {
    await isolatedStorage.loadData();
    const firstEdit = isolatedStorage.createDefaultData();
    firstEdit.settings.goal = "muscle";
    await isolatedStorage.saveData(firstEdit);
    localStorage.removeItem("stronger-data-fallback");
    assert.equal(localStorage.value("stronger-data-fallback"), null, "the test starts the failure with no emergency copy");

    fake.setFailWrites(true);
    const emergencyEdit = structuredClone(firstEdit);
    emergencyEdit.settings.goal = "fitness";
    await isolatedStorage.saveData(emergencyEdit);

    const fallback = JSON.parse(localStorage.value("stronger-data-fallback"));
    assert.equal(isolatedStorage.normalizeStrongerData(fallback)?.settings.goal, "fitness");
  } finally {
    restoreGlobals();
  }
});

test("a valid revised primary remains usable when emergency storage cannot be read", async () => {
  const writerStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: writerStorage.createDefaultData() });
  const firstRestore = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage());
  try {
    await writerStorage.loadData();
    const revised = writerStorage.createDefaultData();
    revised.settings.goal = "fitness";
    await writerStorage.saveData(revised);
  } finally {
    firstRestore();
  }

  const readerStorage = await importStorageModule();
  const secondRestore = installBrowserStorage(fake.indexedDb, {
    getItem: () => { throw new Error("Emergency storage unavailable"); },
  });
  try {
    const loaded = await readerStorage.loadData();
    assert.equal(loaded.settings.goal, "fitness");
  } finally {
    secondRestore();
  }
});

test("emergency writes refuse to race when a cross-tab lock is unavailable", async () => {
  const isolatedStorage = await importStorageModule();
  const restoreGlobals = installBrowserStorage(undefined, createMemoryLocalStorage(), { withLocks: false });
  try {
    await isolatedStorage.loadData();
    const edit = isolatedStorage.createDefaultData();
    edit.settings.goal = "fitness";
    await assert.rejects(
      isolatedStorage.saveData(edit),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
  } finally {
    restoreGlobals();
  }
});

test("a rollback writer cannot change payload data while reusing the same revision", async () => {
  const initialStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: initialStorage.createDefaultData() });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage());

  try {
    await initialStorage.loadData();
    const firstRevision = initialStorage.createDefaultData();
    firstRevision.settings.goal = "muscle";
    await initialStorage.saveData(firstRevision);

    const currentTabStorage = await importStorageModule();
    const current = await currentTabStorage.loadData();
    const rollbackWrite = structuredClone(fake.storedValue());
    rollbackWrite.settings.goal = "fitness";
    fake.setStoredValue(rollbackWrite);

    current.settings.goal = "strength";
    await assert.rejects(
      currentTabStorage.saveData(current),
      (error) => error?.name === "StrongerDataConflictError",
    );
    assert.equal(currentTabStorage.normalizeStrongerData(fake.storedValue())?.settings.goal, "fitness");
  } finally {
    restoreGlobals();
  }
});

test("saveData resolves only after the IndexedDB transaction commits", async () => {
  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: undefined, holdWrite: true });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage());
  let settled = false;

  try {
    const data = isolatedStorage.createDefaultData();
    await isolatedStorage.loadData();
    const saving = isolatedStorage.saveData(data).then(() => {
      settled = true;
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(settled, false);
    assert.deepEqual(isolatedStorage.normalizeStrongerData(fake.writtenValue()), data);

    fake.complete();
    await saving;
    assert.equal(settled, true);
  } finally {
    restoreGlobals();
  }
});

test("invalid in-memory data rejects asynchronously instead of escaping an autosave catch", async () => {
  const isolatedStorage = await importStorageModule();
  const restoreGlobals = installBrowserStorage(undefined, createMemoryLocalStorage());
  const invalid = isolatedStorage.createDefaultData();
  invalid.routines[0].exercises[0].targetSets = 0;

  try {
    const saving = isolatedStorage.saveData(invalid);
    assert.ok(saving instanceof Promise);
    await assert.rejects(saving, /Refusing to save invalid Stronger data/);
  } finally {
    restoreGlobals();
  }
});

test("replaceData is queued after pending saves and remains the final committed snapshot", async () => {
  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: isolatedStorage.createDefaultData(), holdWrite: true });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage());
  const edited = isolatedStorage.createDefaultData();
  edited.settings.goal = "fitness";
  const replacement = isolatedStorage.normalizeStrongerBackup(activeHistoryBackup);
  assert.ok(replacement);

  try {
    await isolatedStorage.loadData();
    const pendingSave = isolatedStorage.saveData(edited);
    await new Promise((resolve) => setImmediate(resolve));
    const replacing = isolatedStorage.replaceData(replacement);

    fake.complete();
    await pendingSave;
    await new Promise((resolve) => setImmediate(resolve));
    fake.complete();
    await replacing;

    const committed = isolatedStorage.normalizeStrongerData(fake.storedValue());
    assert.equal(committed?.activeWorkout?.id, "workout-fixture-active");
    assert.equal(committed?.settings.goal, "muscle");
  } finally {
    restoreGlobals();
  }
});

test("a stale tab cannot overwrite a restore committed by another tab", async () => {
  const staleTabStorage = await importStorageModule();
  const restoringTabStorage = await importStorageModule();
  const primary = staleTabStorage.createDefaultData();
  const fake = createFakeIndexedDb({ storedValue: primary });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage());

  try {
    await staleTabStorage.loadData();
    await restoringTabStorage.loadData();
    const replacement = restoringTabStorage.normalizeStrongerBackup(activeHistoryBackup);
    assert.ok(replacement);
    await restoringTabStorage.replaceData(replacement);

    const staleEdit = staleTabStorage.createDefaultData();
    staleEdit.settings.goal = "fitness";
    await assert.rejects(
      staleTabStorage.saveData(staleEdit),
      (error) => error?.name === "StrongerDataConflictError",
    );

    const committed = restoringTabStorage.normalizeStrongerData(fake.storedValue());
    assert.equal(committed?.activeWorkout?.id, "workout-fixture-active");
    assert.equal(committed?.settings.goal, "muscle");
  } finally {
    restoreGlobals();
  }
});

test("sibling primary and emergency branches require recovery regardless of timestamp order", async () => {
  const baseStorage = await importStorageModule();
  const base = baseStorage.createDefaultData();

  const fallbackWriter = await importStorageModule();
  const fallbackFake = createFakeIndexedDb({ storedValue: base, failWrites: true });
  const fallbackLocalStorage = createMemoryLocalStorage();
  let restoreGlobals = installBrowserStorage(fallbackFake.indexedDb, fallbackLocalStorage);
  try {
    await fallbackWriter.loadData();
    const fallbackEdit = structuredClone(base);
    fallbackEdit.settings.goal = "fitness";
    await fallbackWriter.saveData(fallbackEdit);
  } finally {
    restoreGlobals();
  }
  const siblingFallback = fallbackLocalStorage.value("stronger-data-fallback");
  assert.ok(siblingFallback);

  const primaryWriter = await importStorageModule();
  const primaryFake = createFakeIndexedDb({ storedValue: base });
  restoreGlobals = installBrowserStorage(primaryFake.indexedDb, createMemoryLocalStorage());
  try {
    await primaryWriter.loadData();
    const primaryEdit = structuredClone(base);
    primaryEdit.settings.goal = "muscle";
    await primaryWriter.saveData(primaryEdit);
  } finally {
    restoreGlobals();
  }

  const readerStorage = await importStorageModule();
  const combinedFake = createFakeIndexedDb({ storedValue: primaryFake.storedValue() });
  restoreGlobals = installBrowserStorage(combinedFake.indexedDb, createMemoryLocalStorage({
    "stronger-data-fallback": siblingFallback,
  }));
  try {
    await assert.rejects(
      readerStorage.loadData(),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
  } finally {
    restoreGlobals();
  }
});

test("a verified recovery can replace an unreadable primary and fallback", async () => {
  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: { formatVersion: 1, routines: [] } });
  const localStorage = createMemoryLocalStorage({ "stronger-data-fallback": "{broken" });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, localStorage);
  const replacement = isolatedStorage.normalizeStrongerBackup(activeHistoryBackup);
  assert.ok(replacement);

  try {
    await isolatedStorage.replaceData(replacement, { allowRecoveryOverwrite: true });
    assert.equal(isolatedStorage.normalizeStrongerData(fake.storedValue())?.activeWorkout?.id, "workout-fixture-active");
    assert.equal(
      isolatedStorage.normalizeStrongerData(JSON.parse(localStorage.value("stronger-data-fallback")))?.activeWorkout?.id,
      "workout-fixture-active",
    );
  } finally {
    restoreGlobals();
  }
});

test("replaceData never reports fallback-only recovery as a committed restore", async () => {
  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: isolatedStorage.createDefaultData(), failWrites: true });
  const localStorage = createMemoryLocalStorage();
  const restoreGlobals = installBrowserStorage(fake.indexedDb, localStorage);
  const replacement = isolatedStorage.normalizeStrongerBackup(activeHistoryBackup);
  assert.ok(replacement);

  try {
    await isolatedStorage.loadData();
    await assert.rejects(isolatedStorage.replaceData(replacement));
    assert.equal(localStorage.value("stronger-data-fallback"), null);
  } finally {
    restoreGlobals();
  }
});

test("synchronous transaction setup failures close the database", async () => {
  const isolatedStorage = await importStorageModule();
  const fake = createFakeIndexedDb({ storedValue: isolatedStorage.createDefaultData(), throwOnTransaction: true });
  const restoreGlobals = installBrowserStorage(fake.indexedDb, createMemoryLocalStorage());

  try {
    await assert.rejects(
      isolatedStorage.loadData(),
      (error) => error?.name === "StrongerDataRecoveryError",
    );
    assert.equal(fake.closeCount(), 1);
  } finally {
    restoreGlobals();
  }
});

test("kg remains canonical across display-unit round trips", () => {
  for (const kilograms of [0, 2.5, 42.5, 100, 181.437]) {
    const pounds = storage.toDisplayWeight(kilograms, "lb");
    const roundTrip = storage.toKilograms(pounds, "lb");
    assert.ok(Math.abs(roundTrip - kilograms) <= 0.003, `${kilograms} kg changed to ${roundTrip} kg`);
  }
  assert.equal(storage.toKilograms(-10, "kg"), 0);
  assert.equal(storage.toDisplayWeight(Number.NaN, "lb"), 0);
});

test("only completed sets contribute to workout volume", () => {
  const data = storage.normalizeStrongerBackup(activeHistoryBackup);
  assert.ok(data?.activeWorkout);

  assert.deepEqual(storage.completedSets(data.activeWorkout).map((set) => set.id), ["set-fixture-complete"]);
  assert.equal(storage.workoutVolumeKg(data.activeWorkout), 425);
});

test("estimated one-rep max keeps its documented boundaries", () => {
  assert.equal(storage.estimatedOneRepMax(100, 1), 100);
  assert.equal(storage.estimatedOneRepMax(100, 0), 0);
  assert.equal(storage.estimatedOneRepMax(100, 13), 0);
  assert.equal(storage.estimatedOneRepMax(0, 5), 0);
  assert.equal(storage.estimatedOneRepMax(90, 10), 120);
});
