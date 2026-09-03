export const CURRENT_FORMAT_VERSION = 1 as const;
export const BACKUP_KIND = "stronger-backup" as const;
export const BACKUP_FORMAT_VERSION = 1 as const;

export type WeightUnit = "kg" | "lb";
export type TrainingGoal = "strength" | "muscle" | "fitness";
export type EffortScale = "rpe" | "rir";

export type SetEffort = {
  scale: EffortScale;
  value: number;
};

export type WorkoutSet = {
  id: string;
  weightKg: number;
  reps: number;
  completed: boolean;
  completedAt?: number;
  effort?: SetEffort;
  /** The working-set id when this row continues that set after a load reduction. */
  dropSetOf?: string;
};

export type WorkoutExercise = {
  id: string;
  exerciseKey: string;
  name: string;
  restSeconds: number;
  sets: WorkoutSet[];
};

export type RoutineExercise = {
  id: string;
  exerciseKey: string;
  name: string;
  targetSets: number;
  targetWeightKg: number;
  targetReps: number;
  restSeconds: number;
};

export type Routine = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
};

export type ProgramBlockWeek = {
  id: string;
  loadPercent: number;
};

export type ProgramBlock = {
  id: string;
  name: string;
  createdAt: number;
  sourceRoutineId: string;
  sourceRoutineName: string;
  exercises: RoutineExercise[];
  weeks: ProgramBlockWeek[];
};

export type WorkoutSession = {
  id: string;
  name: string;
  workoutDate: string;
  startedAt: number;
  finishedAt?: number;
  sourceRoutineId?: string;
  restEndsAt?: number;
  timerPausedAt?: number;
  timerPausedDurationMs?: number;
  timerResumedAt?: number;
  longSessionCheckState?: "pending" | "confirmed";
  exercises: WorkoutExercise[];
};

export type StrongerSettings = {
  unit: WeightUnit;
  defaultRestSeconds: number;
  goal: TrainingGoal;
  weeklyDays: number;
  effortScale?: EffortScale | "off";
  nextSetPreview?: boolean;
};

export type CustomExercise = {
  exerciseKey: string;
  name: string;
};

export type StrongerData = {
  formatVersion: typeof CURRENT_FORMAT_VERSION;
  routines: Routine[];
  programBlocks?: ProgramBlock[];
  activeWorkout: WorkoutSession | null;
  history: WorkoutSession[];
  customExercises: CustomExercise[];
  settings: StrongerSettings;
};

const DB_NAME = "stronger-gym-tracker";
const STORE_NAME = "app-state";
const DATA_KEY = "stronger-data";
const FALLBACK_KEY = "stronger-data-fallback";
const FALLBACK_WRITE_LOCK = "stronger-data-fallback-write";
const STORAGE_METADATA_KEY = "_strongerStorage";
const STORAGE_METADATA_VERSION = 1;

export const MAX_ROUTINES = 200;
export const MAX_PROGRAM_BLOCKS = 50;
export const MIN_PROGRAM_BLOCK_WEEKS = 2;
export const MAX_PROGRAM_BLOCK_WEEKS = 12;
export const MIN_PROGRAM_BLOCK_LOAD_PERCENT = 50;
export const MAX_PROGRAM_BLOCK_LOAD_PERCENT = 120;
export const MAX_CUSTOM_EXERCISES = 1_000;
export const MAX_HISTORY_SESSIONS = 10_000;
export const MAX_EXERCISES_PER_ITEM = 100;
export const MAX_SETS_PER_EXERCISE = 100;
export const MAX_TOTAL_SETS_PER_ITEM = 500;
const MIN_TARGET_SETS = 1;
const MAX_TARGET_SETS = 20;
export const MAX_WEIGHT_KG = 100_000;
const MAX_REPS = 100_000;
const MAX_REST_SECONDS = 86_400;
const MAX_TIMESTAMP = 8_640_000_000_000_000;

let writeQueue: Promise<void> = Promise.resolve();
let lastSavedAt = 0;
let queuedExpectedSavedAt = 0;
let queuedExpectedFingerprint: string | null = null;
let confirmedPrimarySavedAt = 0;
let confirmedPrimaryFingerprint: string | null = null;
let primaryWriteUnavailable = false;

type StoredSnapshot = {
  data: StrongerData;
  savedAt: number;
  basedOnSavedAt: number | null;
  basedOnFingerprint: string | null;
  primaryBaseSavedAt: number | null;
  primaryBaseFingerprint: string | null;
  fingerprint: string;
  storedValue: Record<string, unknown>;
};

type SnapshotLineage = Pick<StoredSnapshot,
  "savedAt" |
  "basedOnSavedAt" |
  "basedOnFingerprint" |
  "primaryBaseSavedAt" |
  "primaryBaseFingerprint" |
  "fingerprint"
>;
type PendingSnapshot = SnapshotLineage & Pick<StoredSnapshot, "storedValue">;

let queuedExpectedLineage: SnapshotLineage | null = null;

function dataFingerprint(data: StrongerData): string {
  const serialized = JSON.stringify(data);
  const mask = 0xffff_ffff_ffff_ffffn;
  const prime = 0x0000_0100_0000_01b3n;
  let first = 0xcbf2_9ce4_8422_2325n;
  let second = 0x8422_2325_cbf2_9ce4n;
  for (let index = 0; index < serialized.length; index += 1) {
    const code = serialized.charCodeAt(index);
    for (const byte of [code & 0xff, code >>> 8]) {
      const value = BigInt(byte);
      first = ((first ^ value) * prime) & mask;
      second = ((second * prime) ^ value) & mask;
    }
  }
  return `${first.toString(16).padStart(16, "0")}${second.toString(16).padStart(16, "0")}`;
}

export class StrongerDataRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StrongerDataRecoveryError";
  }
}

export class StrongerDataConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StrongerDataConflictError";
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function hasIndexedDatabase(): boolean {
  return typeof indexedDB !== "undefined";
}

function hasFallbackWriteLock(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.locks?.request === "function";
}

async function withFallbackWriteLock<T>(action: () => T | Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !navigator.locks?.request) {
    throw new StrongerDataRecoveryError(
      "This browser cannot safely coordinate emergency workout storage across tabs.",
    );
  }
  return navigator.locks.request(FALLBACK_WRITE_LOCK, { mode: "exclusive" }, async () => action());
}

function transact<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const rejectAndClose = (error: unknown) => {
          database.close();
          reject(error);
        };
        let transaction: IDBTransaction;
        let request: IDBRequest<T>;
        try {
          transaction = database.transaction(STORE_NAME, mode);
          request = action(transaction.objectStore(STORE_NAME));
        } catch (error) {
          rejectAndClose(error);
          return;
        }
        request.onerror = () => rejectAndClose(request.error ?? new Error("The storage request failed."));
        transaction.oncomplete = () => {
          database.close();
          resolve(request.result);
        };
        transaction.onerror = () => rejectAndClose(transaction.error ?? new Error("The storage transaction failed."));
        transaction.onabort = () => rejectAndClose(transaction.error ?? new Error("The storage transaction was aborted."));
      }),
  );
}

function putIfCurrentRevisionMatches(
  storedValue: Record<string, unknown>,
  expectedSavedAt: number,
  expectedFingerprint: string | null,
): Promise<IDBValidKey> {
  return openDatabase().then(
    (database) =>
      new Promise<IDBValidKey>((resolve, reject) => {
        let transaction: IDBTransaction;
        let store: IDBObjectStore;
        let putResult: IDBValidKey | undefined;
        let abortReason: unknown;
        const rejectAndClose = (error: unknown) => {
          database.close();
          reject(error);
        };
        try {
          transaction = database.transaction(STORE_NAME, "readwrite");
          store = transaction.objectStore(STORE_NAME);
          const readRequest = store.get(DATA_KEY);
          readRequest.onerror = () => rejectAndClose(readRequest.error ?? new Error("The storage revision could not be read."));
          readRequest.onsuccess = () => {
            const current = readRequest.result === undefined ? null : decodeStoredSnapshot(readRequest.result);
            if (readRequest.result !== undefined && !current) {
              abortReason = new StrongerDataRecoveryError("Stored workout data changed into an unsupported format.");
              transaction.abort();
              return;
            }
            if ((current?.savedAt ?? 0) !== expectedSavedAt ||
              (current?.fingerprint ?? null) !== expectedFingerprint) {
              abortReason = new StrongerDataConflictError("Workout data changed in another tab. Reload before saving again.");
              transaction.abort();
              return;
            }
            try {
              const putRequest = store.put(storedValue, DATA_KEY);
              putRequest.onsuccess = () => {
                putResult = putRequest.result;
              };
              putRequest.onerror = () => rejectAndClose(putRequest.error ?? new Error("The storage write failed."));
            } catch (error) {
              abortReason = error;
              transaction.abort();
            }
          };
        } catch (error) {
          rejectAndClose(error);
          return;
        }
        transaction.oncomplete = () => {
          database.close();
          resolve(putResult ?? DATA_KEY);
        };
        transaction.onerror = () => rejectAndClose(transaction.error ?? abortReason ?? new Error("The storage transaction failed."));
        transaction.onabort = () => rejectAndClose(abortReason ?? transaction.error ?? new Error("The storage transaction was aborted."));
      }),
  );
}

export function makeId(prefix = "item"): string {
  const value = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function routineExercise(
  id: string,
  exerciseKey: string,
  name: string,
  sets: number,
  weightKg: number,
  reps: number,
  restSeconds: number,
): RoutineExercise {
  return { id, exerciseKey, name, targetSets: sets, targetWeightKg: weightKg, targetReps: reps, restSeconds };
}

export function createDefaultData(): StrongerData {
  return {
    formatVersion: CURRENT_FORMAT_VERSION,
    activeWorkout: null,
    settings: {
      unit: "kg",
      defaultRestSeconds: 90,
      goal: "strength",
      weeklyDays: 4,
      effortScale: "off",
      nextSetPreview: false,
    },
    history: [],
    customExercises: [],
    programBlocks: [],
    routines: [
      {
        id: "routine-push",
        name: "Push",
        exercises: [
          routineExercise("push-bench", "bench-press", "Bench press", 3, 60, 8, 120),
          routineExercise("push-incline", "incline-dumbbell-press", "Incline dumbbell press", 3, 18, 10, 90),
          routineExercise("push-shoulder", "shoulder-press", "Shoulder press", 3, 25, 8, 90),
          routineExercise("push-lateral", "lateral-raise", "Lateral raise", 3, 7.5, 12, 60),
          routineExercise("push-triceps", "triceps-pushdown", "Triceps pushdown", 3, 20, 12, 60),
        ],
      },
      {
        id: "routine-pull",
        name: "Pull",
        exercises: [
          routineExercise("pull-deadlift", "deadlift", "Deadlift", 3, 80, 5, 150),
          routineExercise("pull-row", "barbell-row", "Barbell row", 3, 45, 8, 90),
          routineExercise("pull-lat", "lat-pulldown", "Lat pulldown", 3, 40, 10, 90),
          routineExercise("pull-rear", "rear-delt-fly", "Rear delt fly", 3, 8, 12, 60),
          routineExercise("pull-curl", "biceps-curl", "Biceps curl", 3, 10, 10, 60),
        ],
      },
      {
        id: "routine-legs",
        name: "Legs",
        exercises: [
          routineExercise("legs-squat", "back-squat", "Back squat", 3, 70, 8, 150),
          routineExercise("legs-rdl", "romanian-deadlift", "Romanian deadlift", 3, 55, 8, 120),
          routineExercise("legs-press", "leg-press", "Leg press", 3, 100, 10, 90),
          routineExercise("legs-curl", "leg-curl", "Leg curl", 3, 30, 12, 60),
          routineExercise("legs-calf", "standing-calf-raise", "Standing calf raise", 3, 40, 12, 60),
        ],
      },
    ],
  };
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function numberInRange(value: unknown, maximum: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= maximum;
}

function integerInRange(value: unknown, maximum: number): value is number {
  return numberInRange(value, maximum) && Number.isInteger(value);
}

function optionalIntegerInRange(value: unknown, maximum: number): boolean {
  return value === undefined || integerInRange(value, maximum);
}

function uniqueStrings(values: string[]): boolean {
  return new Set(values).size === values.length;
}

function validDateKey(dateKey: unknown): boolean {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validSetEffort(effort: unknown): effort is SetEffort {
  if (!effort || typeof effort !== "object") return false;
  const item = effort as Partial<SetEffort>;
  if (item.scale === "rpe") {
    return typeof item.value === "number" && Number.isFinite(item.value) &&
      item.value >= 6 && item.value <= 10 && Number.isInteger(item.value * 2);
  }
  return item.scale === "rir" && integerInRange(item.value, 10);
}

function validSet(set: unknown, enforceResourceLimits = true): set is WorkoutSet {
  if (!set || typeof set !== "object") return false;
  const item = set as Partial<WorkoutSet>;
  return nonEmptyString(item.id) &&
    numberInRange(item.weightKg, enforceResourceLimits ? MAX_WEIGHT_KG : Number.MAX_VALUE) &&
    integerInRange(item.reps, MAX_REPS) &&
    typeof item.completed === "boolean" &&
    optionalIntegerInRange(item.completedAt, MAX_TIMESTAMP) &&
    (item.effort === undefined || validSetEffort(item.effort)) &&
    (item.dropSetOf === undefined || nonEmptyString(item.dropSetOf));
}

export function isValidDropWeightTransition(previousWeightKg: number, dropWeightKg: number): boolean {
  if (!Number.isFinite(previousWeightKg) || !Number.isFinite(dropWeightKg) ||
    previousWeightKg < 0 || dropWeightKg < 0) return false;
  return previousWeightKg === 0
    ? dropWeightKg === 0
    : dropWeightKg < previousWeightKg;
}

function validWorkoutExercise(exercise: unknown, enforceResourceLimits = true): exercise is WorkoutExercise {
  if (!exercise || typeof exercise !== "object") return false;
  const item = exercise as Partial<WorkoutExercise>;
  if (!(nonEmptyString(item.id) &&
    nonEmptyString(item.exerciseKey) &&
    typeof item.name === "string" &&
    integerInRange(item.restSeconds, MAX_REST_SECONDS) &&
    Array.isArray(item.sets) &&
    (!enforceResourceLimits || item.sets.length <= MAX_SETS_PER_EXERCISE) &&
    item.sets.every((set) => validSet(set, enforceResourceLimits)) &&
    uniqueStrings(item.sets.map((set) => set.id)))) return false;

  const roots = new Map<string, WorkoutSet>();
  let activeRootId: string | undefined;
  let previous: WorkoutSet | undefined;
  for (const set of item.sets) {
    if (!set.dropSetOf) {
      roots.set(set.id, set);
      activeRootId = set.id;
    } else {
      const root = roots.get(set.dropSetOf);
      if (!root || root.dropSetOf || activeRootId !== set.dropSetOf) return false;
      if (set.completed && !previous?.completed) return false;
      if (set.completed && set.reps > 0 && (root.reps <= 0 || !previous || previous.reps <= 0)) return false;
      if (set.completed && previous && !isValidDropWeightTransition(previous.weightKg, set.weightKg)) return false;
    }
    previous = set;
  }
  return true;
}

function validSession(session: unknown, enforceResourceLimits = true): session is WorkoutSession {
  if (!session || typeof session !== "object") return false;
  const item = session as Partial<WorkoutSession>;
  if (!nonEmptyString(item.id) || typeof item.name !== "string" || !validDateKey(item.workoutDate) ||
    !integerInRange(item.startedAt, MAX_TIMESTAMP) || !optionalIntegerInRange(item.finishedAt, MAX_TIMESTAMP) ||
    (item.sourceRoutineId !== undefined && !nonEmptyString(item.sourceRoutineId)) ||
    !optionalIntegerInRange(item.restEndsAt, MAX_TIMESTAMP) ||
    !optionalIntegerInRange(item.timerPausedAt, MAX_TIMESTAMP) ||
    !optionalIntegerInRange(item.timerPausedDurationMs, MAX_TIMESTAMP) ||
    !optionalIntegerInRange(item.timerResumedAt, MAX_TIMESTAMP) ||
    (item.longSessionCheckState !== undefined && item.longSessionCheckState !== "pending" &&
      item.longSessionCheckState !== "confirmed") || !Array.isArray(item.exercises) ||
    (enforceResourceLimits && item.exercises.length > MAX_EXERCISES_PER_ITEM) ||
    !item.exercises.every((exercise) => validWorkoutExercise(exercise, enforceResourceLimits))) return false;
  return (!enforceResourceLimits ||
      item.exercises.reduce((total, exercise) => total + exercise.sets.length, 0) <= MAX_TOTAL_SETS_PER_ITEM) &&
    uniqueStrings(item.exercises.map((exercise) => exercise.id)) &&
    uniqueStrings(item.exercises.flatMap((exercise) => exercise.sets.map((set) => set.id)));
}

function validRoutine(routine: unknown, enforceResourceLimits = true): routine is Routine {
  if (!routine || typeof routine !== "object") return false;
  const item = routine as Partial<Routine>;
  if (!nonEmptyString(item.id) || typeof item.name !== "string" || !Array.isArray(item.exercises) ||
    (enforceResourceLimits && item.exercises.length > MAX_EXERCISES_PER_ITEM)) return false;
  const exercisesValid = item.exercises.every((exercise) => {
    if (!exercise || typeof exercise !== "object") return false;
    const routineItem = exercise as Partial<RoutineExercise>;
    return nonEmptyString(routineItem.id) &&
      nonEmptyString(routineItem.exerciseKey) &&
      typeof routineItem.name === "string" &&
      integerInRange(routineItem.targetSets, MAX_TARGET_SETS) &&
      routineItem.targetSets >= MIN_TARGET_SETS &&
      numberInRange(routineItem.targetWeightKg, enforceResourceLimits ? MAX_WEIGHT_KG : Number.MAX_VALUE) &&
      integerInRange(routineItem.targetReps, MAX_REPS) &&
      integerInRange(routineItem.restSeconds, MAX_REST_SECONDS);
  });
  return exercisesValid &&
    (!enforceResourceLimits ||
      item.exercises.reduce((total, exercise) => total + exercise.targetSets, 0) <= MAX_TOTAL_SETS_PER_ITEM) &&
    uniqueStrings(item.exercises.map((exercise) => exercise.id));
}

function validProgramBlock(block: unknown, enforceResourceLimits = true): block is ProgramBlock {
  if (!block || typeof block !== "object") return false;
  const item = block as Partial<ProgramBlock>;
  if (!nonEmptyString(item.id) || typeof item.name !== "string" ||
    !integerInRange(item.createdAt, MAX_TIMESTAMP) || !nonEmptyString(item.sourceRoutineId) ||
    typeof item.sourceRoutineName !== "string" || !Array.isArray(item.exercises) ||
    !Array.isArray(item.weeks) || item.weeks.length < MIN_PROGRAM_BLOCK_WEEKS ||
    item.weeks.length > MAX_PROGRAM_BLOCK_WEEKS) return false;
  if (!validRoutine({ id: item.id, name: item.name, exercises: item.exercises }, enforceResourceLimits)) return false;
  return item.weeks.every((week) => Boolean(week) && typeof week === "object" &&
      nonEmptyString(week.id) && integerInRange(week.loadPercent, MAX_PROGRAM_BLOCK_LOAD_PERCENT) &&
      week.loadPercent >= MIN_PROGRAM_BLOCK_LOAD_PERCENT && week.loadPercent % 5 === 0) &&
    uniqueStrings(item.weeks.map((week) => week.id));
}

function hasValidStrongerDataShape(value: unknown, enforceResourceLimits = true): boolean {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StrongerData>;
  const settings = candidate.settings as Partial<StrongerSettings> | undefined;
  if (candidate.formatVersion !== CURRENT_FORMAT_VERSION ||
    !Array.isArray(candidate.routines) || (enforceResourceLimits && candidate.routines.length > MAX_ROUTINES) ||
    !candidate.routines.every((routine) => validRoutine(routine, enforceResourceLimits)) ||
    (candidate.programBlocks !== undefined && (!Array.isArray(candidate.programBlocks) ||
      (enforceResourceLimits && candidate.programBlocks.length > MAX_PROGRAM_BLOCKS) ||
      !candidate.programBlocks.every((block) => validProgramBlock(block, enforceResourceLimits)))) ||
    !Array.isArray(candidate.history) || (enforceResourceLimits && candidate.history.length > MAX_HISTORY_SESSIONS) ||
    !candidate.history.every((session) => validSession(session, enforceResourceLimits)) ||
    (candidate.activeWorkout !== null && !validSession(candidate.activeWorkout, enforceResourceLimits)) || !settings ||
    (settings.unit !== "kg" && settings.unit !== "lb") ||
    !integerInRange(settings.defaultRestSeconds, MAX_REST_SECONDS) ||
    (settings.goal !== "strength" && settings.goal !== "muscle" && settings.goal !== "fitness") ||
    !integerInRange(settings.weeklyDays, 7) || settings.weeklyDays < 1 ||
    (settings.effortScale !== undefined && settings.effortScale !== "off" &&
      settings.effortScale !== "rpe" && settings.effortScale !== "rir") ||
    (settings.nextSetPreview !== undefined && typeof settings.nextSetPreview !== "boolean")) return false;
  const sessions = candidate.activeWorkout ? [candidate.activeWorkout, ...candidate.history] : candidate.history;
  return uniqueStrings(candidate.routines.map((routine) => routine.id)) &&
    uniqueStrings((candidate.programBlocks ?? []).map((block) => block.id)) &&
    uniqueStrings(sessions.map((session) => session.id));
}

function isCustomExercise(value: unknown): value is CustomExercise {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CustomExercise>;
  return (
    typeof candidate.exerciseKey === "string" &&
    candidate.exerciseKey.trim().length > 0 &&
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0
  );
}

export function isStrongerData(value: unknown): value is StrongerData {
  if (!hasValidStrongerDataShape(value)) return false;
  const candidate = value as Partial<StrongerData>;
  return Array.isArray(candidate.customExercises) &&
    candidate.customExercises.length <= MAX_CUSTOM_EXERCISES &&
    candidate.customExercises.every(isCustomExercise) &&
    uniqueStrings(candidate.customExercises.map((exercise) => exercise.exerciseKey));
}

function normalizeVersionOne(value: unknown, enforceResourceLimits = true): StrongerData | null {
  if (!hasValidStrongerDataShape(value, enforceResourceLimits)) return null;
  const candidate = value as Omit<StrongerData, "customExercises"> & { customExercises?: unknown };
  if (candidate.customExercises !== undefined && !Array.isArray(candidate.customExercises)) return null;
  if (Array.isArray(candidate.customExercises) &&
    ((enforceResourceLimits && candidate.customExercises.length > MAX_CUSTOM_EXERCISES) ||
      !candidate.customExercises.every(isCustomExercise) ||
      !uniqueStrings(candidate.customExercises.map((exercise) => exercise.exerciseKey)))) return null;
  const normalizedCandidate = { ...candidate } as Record<string, unknown>;
  delete normalizedCandidate[STORAGE_METADATA_KEY];
  return {
    ...normalizedCandidate,
    customExercises: candidate.customExercises
      ? candidate.customExercises.map((exercise) => ({ ...exercise }))
      : [],
  } as StrongerData;
}

export function migrateStrongerData(value: unknown): StrongerData | null {
  if (!value || typeof value !== "object") return null;
  switch ((value as { formatVersion?: unknown }).formatVersion) {
    case 1:
      return normalizeVersionOne(value);
    default:
      return null;
  }
}

function migrateStoredStrongerData(value: unknown): StrongerData | null {
  if (!value || typeof value !== "object") return null;
  switch ((value as { formatVersion?: unknown }).formatVersion) {
    case 1:
      return normalizeVersionOne(value, false);
    default:
      return null;
  }
}

export function isWithinSafeResourceLimits(data: StrongerData): boolean {
  return migrateStrongerData(data) !== null;
}

export function normalizeStrongerData(value: unknown): StrongerData | null {
  return migrateStrongerData(value);
}

export function normalizeStrongerBackup(value: unknown): StrongerData | null {
  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const hasIdentityFields = "kind" in candidate || "backupVersion" in candidate;
    if (hasIdentityFields &&
      (candidate.kind !== BACKUP_KIND || candidate.backupVersion !== BACKUP_FORMAT_VERSION)) return null;
  }
  const rawData = migrateStrongerData(value);
  if (rawData) return rawData;
  if (!value || typeof value !== "object" || !("data" in value)) return null;
  const envelope = value as Record<string, unknown> & { data: unknown };
  const data = migrateStrongerData(envelope.data);
  if (!data || envelope.formatVersion !== data.formatVersion) return null;
  const hasNewEnvelopeFields = "kind" in envelope || "backupVersion" in envelope;
  if (hasNewEnvelopeFields &&
    (envelope.kind !== BACKUP_KIND || envelope.backupVersion !== BACKUP_FORMAT_VERSION)) return null;
  return data;
}

function decodeStoredSnapshot(value: unknown): StoredSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const storedValue = value as Record<string, unknown>;
  const metadata = storedValue[STORAGE_METADATA_KEY];
  let savedAt = 0;
  let basedOnSavedAt: number | null = null;
  let basedOnFingerprint: string | null = null;
  let primaryBaseSavedAt: number | null = null;
  let primaryBaseFingerprint: string | null = null;
  if (metadata !== undefined) {
    if (!metadata || typeof metadata !== "object") return null;
    const storageMetadata = metadata as {
      formatVersion?: unknown;
      savedAt?: unknown;
      basedOnSavedAt?: unknown;
      basedOnFingerprint?: unknown;
      primaryBaseSavedAt?: unknown;
      primaryBaseFingerprint?: unknown;
    };
    const validStoredFingerprint = (fingerprint: unknown) =>
      fingerprint === undefined || fingerprint === null ||
      (typeof fingerprint === "string" && /^[0-9a-f]{32}$/.test(fingerprint));
    if (storageMetadata.formatVersion !== STORAGE_METADATA_VERSION ||
      !integerInRange(storageMetadata.savedAt, MAX_TIMESTAMP) ||
      (storageMetadata.basedOnSavedAt !== undefined &&
        !integerInRange(storageMetadata.basedOnSavedAt, MAX_TIMESTAMP)) ||
      !validStoredFingerprint(storageMetadata.basedOnFingerprint) ||
      (storageMetadata.primaryBaseSavedAt !== undefined &&
        !integerInRange(storageMetadata.primaryBaseSavedAt, MAX_TIMESTAMP)) ||
      !validStoredFingerprint(storageMetadata.primaryBaseFingerprint)) return null;
    savedAt = storageMetadata.savedAt;
    basedOnSavedAt = typeof storageMetadata.basedOnSavedAt === "number" ? storageMetadata.basedOnSavedAt : null;
    basedOnFingerprint = typeof storageMetadata.basedOnFingerprint === "string"
      ? storageMetadata.basedOnFingerprint
      : null;
    primaryBaseSavedAt = typeof storageMetadata.primaryBaseSavedAt === "number"
      ? storageMetadata.primaryBaseSavedAt
      : basedOnSavedAt;
    primaryBaseFingerprint = typeof storageMetadata.primaryBaseFingerprint === "string"
      ? storageMetadata.primaryBaseFingerprint
      : basedOnFingerprint;
    if ((basedOnSavedAt !== null && basedOnSavedAt > savedAt) ||
      (primaryBaseSavedAt !== null && primaryBaseSavedAt > savedAt)) return null;
  }
  const rawData = { ...storedValue };
  delete rawData[STORAGE_METADATA_KEY];
  const data = migrateStoredStrongerData(rawData);
  return data ? {
    data,
    savedAt,
    basedOnSavedAt,
    basedOnFingerprint,
    primaryBaseSavedAt,
    primaryBaseFingerprint,
    fingerprint: dataFingerprint(data),
    storedValue,
  } : null;
}

function createStoredSnapshot(
  data: StrongerData,
  basedOnSavedAt: number,
  basedOnFingerprint: string | null,
  primaryBaseSavedAt: number,
  primaryBaseFingerprint: string | null,
): Pick<StoredSnapshot,
  "savedAt" |
  "basedOnSavedAt" |
  "basedOnFingerprint" |
  "primaryBaseSavedAt" |
  "primaryBaseFingerprint" |
  "fingerprint" |
  "storedValue"
> {
  const normalized = migrateStrongerData(data);
  if (!normalized) throw new Error("Refusing to save invalid Stronger data.");
  lastSavedAt = Math.max(Date.now(), lastSavedAt + 1);
  const storedValue = {
    ...structuredClone(normalized),
    [STORAGE_METADATA_KEY]: {
      formatVersion: STORAGE_METADATA_VERSION,
      savedAt: lastSavedAt,
      basedOnSavedAt,
      basedOnFingerprint,
      primaryBaseSavedAt,
      primaryBaseFingerprint,
    },
  };
  return {
    savedAt: lastSavedAt,
    basedOnSavedAt,
    basedOnFingerprint,
    primaryBaseSavedAt,
    primaryBaseFingerprint,
    fingerprint: dataFingerprint(normalized),
    storedValue,
  };
}

function readFallbackSnapshot(): StoredSnapshot | null {
  const fallbackText = window.localStorage.getItem(FALLBACK_KEY);
  if (fallbackText === null) return null;
  let fallbackValue: unknown;
  try {
    fallbackValue = JSON.parse(fallbackText);
  } catch {
    throw new StrongerDataRecoveryError("The emergency workout-data copy is not valid JSON.");
  }
  const fallback = decodeStoredSnapshot(fallbackValue);
  if (!fallback) {
    throw new StrongerDataRecoveryError("The emergency workout-data copy is not a supported Stronger format.");
  }
  return fallback;
}

function snapshotDescendsFrom(descendant: SnapshotLineage, ancestor: StoredSnapshot): boolean {
  return (descendant.basedOnSavedAt === ancestor.savedAt &&
      descendant.basedOnFingerprint === ancestor.fingerprint) ||
    (descendant.primaryBaseSavedAt === ancestor.savedAt &&
      descendant.primaryBaseFingerprint === ancestor.fingerprint);
}

function assertFallbackCompatible(
  fallback: StoredSnapshot | null,
  expectedLineage: SnapshotLineage | null,
): void {
  if (!fallback || fallback.fingerprint === expectedLineage?.fingerprint) return;
  if (expectedLineage && snapshotDescendsFrom(expectedLineage, fallback)) return;
  throw new StrongerDataConflictError("Workout data changed in another tab. Reload before saving again.");
}

function rebaseEmergencySnapshot(
  snapshot: Pick<StoredSnapshot, "primaryBaseSavedAt" | "primaryBaseFingerprint" | "storedValue">,
  primaryBaseSavedAt: number,
  primaryBaseFingerprint: string | null,
): void {
  const metadata = snapshot.storedValue[STORAGE_METADATA_KEY] as {
    primaryBaseSavedAt: number;
    primaryBaseFingerprint: string | null;
  };
  metadata.primaryBaseSavedAt = primaryBaseSavedAt;
  metadata.primaryBaseFingerprint = primaryBaseFingerprint;
  snapshot.primaryBaseSavedAt = primaryBaseSavedAt;
  snapshot.primaryBaseFingerprint = primaryBaseFingerprint;
}

function mirrorPrimaryToFallback(storedValue: Record<string, unknown>): void {
  try {
    window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(storedValue));
  } catch {
    try {
      window.localStorage.removeItem(FALLBACK_KEY);
    } catch {
      // The confirmed primary remains intact; a later load will pause if it cannot read the stale fallback safely.
    }
  }
}

export async function loadData(): Promise<StrongerData> {
  if (typeof window === "undefined") return createDefaultData();
  const hasIndexedDb = hasIndexedDatabase();
  let primaryValue: unknown;
  let primaryReadFailed = false;
  if (hasIndexedDb) {
    try {
      primaryValue = await transact<unknown>("readonly", (store) => store.get(DATA_KEY));
    } catch {
      primaryReadFailed = true;
    }
  }

  let fallbackText: string | null = null;
  let fallbackReadFailed = false;
  try {
    fallbackText = window.localStorage.getItem(FALLBACK_KEY);
  } catch {
    fallbackReadFailed = true;
  }

  if (primaryReadFailed) {
    throw new StrongerDataRecoveryError("Workout storage could not be read safely.");
  }

  const primary = primaryValue === undefined ? null : decodeStoredSnapshot(primaryValue);
  if (primaryValue !== undefined && !primary) {
    throw new StrongerDataRecoveryError("Stored workout data is not a supported Stronger format.");
  }

  let fallbackValue: unknown;
  let fallbackUnavailable = fallbackReadFailed;
  if (!fallbackUnavailable && fallbackText !== null) {
    try {
      fallbackValue = JSON.parse(fallbackText);
    } catch {
      fallbackUnavailable = true;
    }
  }
  const fallback = fallbackUnavailable || fallbackText === null ? null : decodeStoredSnapshot(fallbackValue);
  if (!fallbackUnavailable && fallbackText !== null && !fallback) {
    fallbackUnavailable = true;
  }
  if (fallbackUnavailable) {
    if (primary) {
      lastSavedAt = Math.max(lastSavedAt, primary.savedAt);
      queuedExpectedSavedAt = primary.savedAt;
      queuedExpectedFingerprint = primary.fingerprint;
      queuedExpectedLineage = primary;
      confirmedPrimarySavedAt = primary.savedAt;
      confirmedPrimaryFingerprint = primary.fingerprint;
      primaryWriteUnavailable = false;
      return primary.data;
    }
    throw new StrongerDataRecoveryError("The emergency workout-data copy is not a supported Stronger format.");
  }

  lastSavedAt = Math.max(lastSavedAt, primary?.savedAt ?? 0, fallback?.savedAt ?? 0);
  let selected = primary;
  if (fallback && !primary) {
    selected = fallback;
  } else if (fallback && primary && fallback.fingerprint !== primary.fingerprint) {
    const fallbackDescendsFromPrimary = snapshotDescendsFrom(fallback, primary);
    const primaryDescendsFromFallback = snapshotDescendsFrom(primary, fallback);
    if (fallbackDescendsFromPrimary && !primaryDescendsFromFallback) {
      selected = fallback;
    } else if (!primaryDescendsFromFallback || fallbackDescendsFromPrimary) {
      throw new StrongerDataRecoveryError("Stored workout copies are divergent branches and require recovery.");
    }
  } else if (fallback && primary && fallback.savedAt > primary.savedAt) {
    selected = fallback;
  }
  if (!selected) {
    queuedExpectedSavedAt = 0;
    queuedExpectedFingerprint = null;
    queuedExpectedLineage = null;
    confirmedPrimarySavedAt = 0;
    confirmedPrimaryFingerprint = null;
    primaryWriteUnavailable = false;
    return createDefaultData();
  }
  queuedExpectedSavedAt = selected.savedAt;
  queuedExpectedFingerprint = selected.fingerprint;
  queuedExpectedLineage = selected;
  confirmedPrimarySavedAt = selected === primary ? selected.savedAt : primary?.savedAt ?? 0;
  confirmedPrimaryFingerprint = selected === primary ? selected.fingerprint : primary?.fingerprint ?? null;

  if (selected === fallback && hasIndexedDb) {
    try {
      await putIfCurrentRevisionMatches(
        selected.storedValue,
        primary?.savedAt ?? 0,
        primary?.fingerprint ?? null,
      );
      confirmedPrimarySavedAt = selected.savedAt;
      confirmedPrimaryFingerprint = selected.fingerprint;
      primaryWriteUnavailable = false;
    } catch (error) {
      if (error instanceof StrongerDataConflictError || error instanceof StrongerDataRecoveryError) throw error;
      primaryWriteUnavailable = true;
      // The newer emergency copy remains authoritative and available for the next launch.
    }
  } else {
    primaryWriteUnavailable = false;
  }
  return selected.data;
}

export function saveData(data: StrongerData): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const expectedSavedAt = queuedExpectedSavedAt;
  const expectedFingerprint = queuedExpectedFingerprint;
  const expectedLineage = queuedExpectedLineage;
  let snapshot: PendingSnapshot;
  try {
    snapshot = createStoredSnapshot(
      data,
      expectedSavedAt,
      expectedFingerprint,
      confirmedPrimarySavedAt,
      confirmedPrimaryFingerprint,
    );
  } catch (error) {
    return Promise.reject(error);
  }
  queuedExpectedSavedAt = snapshot.savedAt;
  queuedExpectedFingerprint = snapshot.fingerprint;
  queuedExpectedLineage = snapshot;
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const saveWhileLocked = async () => {
      const fallback = readFallbackSnapshot();
      assertFallbackCompatible(fallback, expectedLineage);
      if (hasIndexedDatabase() && !primaryWriteUnavailable) {
        try {
          await putIfCurrentRevisionMatches(snapshot.storedValue, expectedSavedAt, expectedFingerprint);
          confirmedPrimarySavedAt = snapshot.savedAt;
          confirmedPrimaryFingerprint = snapshot.fingerprint;
          primaryWriteUnavailable = false;
          mirrorPrimaryToFallback(snapshot.storedValue);
          return;
        } catch (error) {
          if (error instanceof StrongerDataConflictError || error instanceof StrongerDataRecoveryError) throw error;
          primaryWriteUnavailable = true;
        }
      }
      rebaseEmergencySnapshot(snapshot, confirmedPrimarySavedAt, confirmedPrimaryFingerprint);
      window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(snapshot.storedValue));
    };

    if (hasFallbackWriteLock()) {
      await withFallbackWriteLock(saveWhileLocked);
      return;
    }
    if (hasIndexedDatabase() && !primaryWriteUnavailable && readFallbackSnapshot() === null) {
      await putIfCurrentRevisionMatches(snapshot.storedValue, expectedSavedAt, expectedFingerprint);
      confirmedPrimarySavedAt = snapshot.savedAt;
      confirmedPrimaryFingerprint = snapshot.fingerprint;
      return;
    }
    throw new StrongerDataRecoveryError(
      "This browser cannot safely coordinate workout storage across tabs.",
    );
  });
  return writeQueue;
}

export function replaceData(
  data: StrongerData,
  options: { allowRecoveryOverwrite?: boolean } = {},
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const expectedSavedAt = queuedExpectedSavedAt;
  const expectedFingerprint = queuedExpectedFingerprint;
  const expectedLineage = queuedExpectedLineage;
  let snapshot: PendingSnapshot;
  try {
    snapshot = createStoredSnapshot(
      data,
      expectedSavedAt,
      expectedFingerprint,
      confirmedPrimarySavedAt,
      confirmedPrimaryFingerprint,
    );
  } catch (error) {
    return Promise.reject(error);
  }
  queuedExpectedSavedAt = snapshot.savedAt;
  queuedExpectedFingerprint = snapshot.fingerprint;
  queuedExpectedLineage = snapshot;
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const replaceWhileLocked = async () => {
      const fallback = options.allowRecoveryOverwrite ? null : readFallbackSnapshot();
      if (!options.allowRecoveryOverwrite) {
        assertFallbackCompatible(fallback, expectedLineage);
      }
      if (hasIndexedDatabase()) {
        if (options.allowRecoveryOverwrite) {
          await transact<IDBValidKey>("readwrite", (store) => store.put(snapshot.storedValue, DATA_KEY));
        } else {
          await putIfCurrentRevisionMatches(snapshot.storedValue, expectedSavedAt, expectedFingerprint);
        }
        confirmedPrimarySavedAt = snapshot.savedAt;
        confirmedPrimaryFingerprint = snapshot.fingerprint;
        primaryWriteUnavailable = false;
        mirrorPrimaryToFallback(snapshot.storedValue);
        return;
      }
      rebaseEmergencySnapshot(snapshot, confirmedPrimarySavedAt, confirmedPrimaryFingerprint);
      window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(snapshot.storedValue));
    };

    if (hasFallbackWriteLock()) {
      await withFallbackWriteLock(replaceWhileLocked);
      return;
    }
    if (hasIndexedDatabase() && (options.allowRecoveryOverwrite || readFallbackSnapshot() === null)) {
      if (options.allowRecoveryOverwrite) {
        await transact<IDBValidKey>("readwrite", (store) => store.put(snapshot.storedValue, DATA_KEY));
      } else {
        await putIfCurrentRevisionMatches(snapshot.storedValue, expectedSavedAt, expectedFingerprint);
      }
      confirmedPrimarySavedAt = snapshot.savedAt;
      confirmedPrimaryFingerprint = snapshot.fingerprint;
      primaryWriteUnavailable = false;
      return;
    }
    throw new StrongerDataRecoveryError(
      "This browser cannot safely coordinate workout storage across tabs.",
    );
  });
  return writeQueue;
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    return false;
  }
  return false;
}

export function toDisplayWeight(weightKg: number, unit: WeightUnit): number {
  if (!Number.isFinite(weightKg)) return 0;
  const value = unit === "kg" ? weightKg : weightKg * 2.2046226218;
  return Math.round(value * 100) / 100;
}

export function toKilograms(value: number, unit: WeightUnit): number {
  if (!Number.isFinite(value)) return 0;
  const kilograms = unit === "kg" ? value : value / 2.2046226218;
  return Math.max(0, Math.round(kilograms * 1000) / 1000);
}

export function formatWeight(weightKg: number, unit: WeightUnit): string {
  return toDisplayWeight(weightKg, unit).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function completedSets(session: WorkoutSession): WorkoutSet[] {
  return session.exercises.flatMap((exercise) =>
    exercise.sets.filter((set) => set.completed && set.reps > 0 && !set.dropSetOf));
}

export function completedSetSegments(session: WorkoutSession): WorkoutSet[] {
  return session.exercises.flatMap((exercise) => exercise.sets.filter((set) => set.completed && set.reps > 0));
}

export function workoutVolumeKg(session: WorkoutSession): number {
  return completedSetSegments(session).reduce((total, set) => total + set.weightKg * set.reps, 0);
}

export function estimatedOneRepMax(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0 || reps > 12) return 0;
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30);
}
