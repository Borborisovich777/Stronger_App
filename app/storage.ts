export type WeightUnit = "kg" | "lb";
export type TrainingGoal = "strength" | "muscle" | "fitness";

export type WorkoutSet = {
  id: string;
  weightKg: number;
  reps: number;
  completed: boolean;
  completedAt?: number;
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

export type WorkoutSession = {
  id: string;
  name: string;
  workoutDate: string;
  startedAt: number;
  finishedAt?: number;
  sourceRoutineId?: string;
  restEndsAt?: number;
  exercises: WorkoutExercise[];
};

export type StrongerSettings = {
  unit: WeightUnit;
  defaultRestSeconds: number;
  goal: TrainingGoal;
  weeklyDays: number;
};

export type StrongerData = {
  formatVersion: 1;
  routines: Routine[];
  activeWorkout: WorkoutSession | null;
  history: WorkoutSession[];
  settings: StrongerSettings;
};

const DB_NAME = "stronger-gym-tracker";
const STORE_NAME = "app-state";
const DATA_KEY = "stronger-data";
const FALLBACK_KEY = "stronger-data-fallback";

let writeQueue: Promise<void> = Promise.resolve();

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

function transact<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = action(transaction.objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(transaction.error);
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
    formatVersion: 1,
    activeWorkout: null,
    settings: { unit: "kg", defaultRestSeconds: 90, goal: "strength", weeklyDays: 4 },
    history: [],
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

export function isStrongerData(value: unknown): value is StrongerData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StrongerData>;
  const settings = candidate.settings as Partial<StrongerSettings> | undefined;
  const validNumber = (number: unknown) => typeof number === "number" && Number.isFinite(number) && number >= 0;
  const validSet = (set: unknown) => {
    if (!set || typeof set !== "object") return false;
    const item = set as Partial<WorkoutSet>;
    return typeof item.id === "string" && validNumber(item.weightKg) && validNumber(item.reps) && typeof item.completed === "boolean";
  };
  const validWorkoutExercise = (exercise: unknown) => {
    if (!exercise || typeof exercise !== "object") return false;
    const item = exercise as Partial<WorkoutExercise>;
    return typeof item.id === "string" && typeof item.exerciseKey === "string" && typeof item.name === "string" && validNumber(item.restSeconds) && Array.isArray(item.sets) && item.sets.every(validSet);
  };
  const validSession = (session: unknown) => {
    if (!session || typeof session !== "object") return false;
    const item = session as Partial<WorkoutSession>;
    return typeof item.id === "string" && typeof item.name === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.workoutDate ?? "") && validNumber(item.startedAt) && Array.isArray(item.exercises) && item.exercises.every(validWorkoutExercise);
  };
  const validRoutine = (routine: unknown) => {
    if (!routine || typeof routine !== "object") return false;
    const item = routine as Partial<Routine>;
    return typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.exercises) && item.exercises.every((exercise) => {
      if (!exercise || typeof exercise !== "object") return false;
      const routineItem = exercise as Partial<RoutineExercise>;
      return typeof routineItem.id === "string" && typeof routineItem.exerciseKey === "string" && typeof routineItem.name === "string" && validNumber(routineItem.targetSets) && validNumber(routineItem.targetWeightKg) && validNumber(routineItem.targetReps) && validNumber(routineItem.restSeconds);
    });
  };
  return (
    candidate.formatVersion === 1 &&
    Array.isArray(candidate.routines) &&
    candidate.routines.every(validRoutine) &&
    Array.isArray(candidate.history) &&
    candidate.history.every(validSession) &&
    (candidate.activeWorkout === null || validSession(candidate.activeWorkout)) &&
    !!settings &&
    (settings.unit === "kg" || settings.unit === "lb") &&
    validNumber(settings.defaultRestSeconds) &&
    (settings.goal === "strength" || settings.goal === "muscle" || settings.goal === "fitness") &&
    typeof settings.weeklyDays === "number" &&
    Number.isInteger(settings.weeklyDays) &&
    (settings.weeklyDays ?? 0) >= 1 &&
    (settings.weeklyDays ?? 0) <= 7
  );
}

export async function loadData(): Promise<StrongerData> {
  if (typeof window === "undefined") return createDefaultData();
  try {
    if ("indexedDB" in window) {
      const saved = await transact<StrongerData | undefined>("readonly", (store) => store.get(DATA_KEY));
      if (isStrongerData(saved)) return saved;
    }
  } catch {
    // Fall through to the emergency localStorage copy below.
  }
  try {
    const fallback = window.localStorage.getItem(FALLBACK_KEY);
    if (fallback) {
      const parsed: unknown = JSON.parse(fallback);
      if (isStrongerData(parsed)) return parsed;
    }
  } catch {
    // A malformed fallback must not prevent Stronger from starting cleanly.
  }
  return createDefaultData();
}

export function saveData(data: StrongerData): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const snapshot = structuredClone(data);
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    try {
      if ("indexedDB" in window) {
        await transact<IDBValidKey>("readwrite", (store) => store.put(snapshot, DATA_KEY));
        return;
      }
    } catch {
      // The small localStorage fallback keeps the app usable if IndexedDB is unavailable.
    }
    window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(snapshot));
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
  const value = unit === "kg" ? weightKg : weightKg * 2.2046226218;
  return Math.round(value * 2) / 2;
}

export function toKilograms(value: number, unit: WeightUnit): number {
  const kilograms = unit === "kg" ? value : value / 2.2046226218;
  return Math.max(0, Math.round(kilograms * 1000) / 1000);
}

export function formatWeight(weightKg: number, unit: WeightUnit): string {
  return toDisplayWeight(weightKg, unit).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function completedSets(session: WorkoutSession): WorkoutSet[] {
  return session.exercises.flatMap((exercise) => exercise.sets.filter((set) => set.completed));
}

export function workoutVolumeKg(session: WorkoutSession): number {
  return completedSets(session).reduce((total, set) => total + set.weightKg * set.reps, 0);
}

export function estimatedOneRepMax(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0 || reps > 12) return 0;
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30);
}
