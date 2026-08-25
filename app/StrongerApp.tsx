"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  completedSets,
  createDefaultData,
  CustomExercise,
  estimatedOneRepMax,
  formatWeight,
  loadData,
  makeId,
  normalizeStrongerData,
  requestPersistentStorage,
  Routine,
  RoutineExercise,
  saveData,
  StrongerData,
  toDisplayWeight,
  toKilograms,
  WeightUnit,
  WorkoutExercise,
  WorkoutSession,
  workoutVolumeKg,
} from "./storage";
import { BUILT_IN_EXERCISES } from "./exercises";

type Tab = "workout" | "history" | "progress" | "settings";
type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "stronger-theme";
const REST_DURATION_OPTIONS = [0, 30, 45, 60, 90, 120, 150, 180, 240, 300] as const;

type ExerciseDraft = {
  exerciseKey: string;
  name: string;
  sets: number;
  weight: number;
  reps: number;
  restSeconds: number;
};

const EMPTY_EXERCISE: ExerciseDraft = {
  exerciseKey: "",
  name: "",
  sets: 3,
  weight: 0,
  reps: 8,
  restSeconds: 90,
};

type ExerciseCatalogCategory = "Custom" | "Saved" | "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core";

type ExerciseCatalogItem = {
  exerciseKey: string;
  name: string;
  category: ExerciseCatalogCategory;
};

type CreateCustomExerciseResult = {
  exercise: ExerciseCatalogItem;
  created: boolean;
};

const EXERCISE_CATEGORY_ORDER: ExerciseCatalogCategory[] = [
  "Custom",
  "Saved",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
];

function cleanExerciseName(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

function normalizedExerciseName(value: string): string {
  return cleanExerciseName(value).toLocaleLowerCase("en-US");
}

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatHeaderDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function initialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const pageTheme = document.documentElement.dataset.theme;
  if (pageTheme === "light" || pageTheme === "dark") return pageTheme;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // The system preference remains a safe fallback when storage is unavailable.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatRestOption(seconds: number): string {
  return seconds === 0 ? "Off" : `${seconds}s`;
}

function formatNumericDraft(value: number, emptyWhenZero: boolean): string {
  return emptyWhenZero && value === 0 ? "" : String(value);
}

function NumericInput({
  value,
  onValueChange,
  decimal = false,
  min = 0,
  max,
  emptyWhenZero = false,
  className,
  id,
  enterKeyHint,
}: {
  value: number;
  onValueChange: (value: number) => void;
  decimal?: boolean;
  min?: number;
  max?: number;
  emptyWhenZero?: boolean;
  className?: string;
  id?: string;
  enterKeyHint?: "next" | "done";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const safeValue = Number.isFinite(value) ? Math.max(min, max === undefined ? value : Math.min(max, value)) : min;
  const [draft, setDraft] = useState(() => formatNumericDraft(safeValue, emptyWhenZero));

  useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(formatNumericDraft(safeValue, emptyWhenZero));
  }, [emptyWhenZero, safeValue]);

  function commit(rawValue: string) {
    const parsed = rawValue === "" || rawValue === "." ? min : Number(rawValue);
    const finite = Number.isFinite(parsed) ? parsed : min;
    const bounded = Math.max(min, max === undefined ? finite : Math.min(max, finite));
    onValueChange(bounded);
    return bounded;
  }

  return (
    <input
      ref={inputRef}
      id={id}
      className={className}
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      enterKeyHint={enterKeyHint}
      autoComplete="off"
      spellCheck={false}
      pattern={decimal ? "[0-9]*[.,]?[0-9]{0,2}" : "[0-9]*"}
      value={draft}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const normalized = event.target.value.replace(",", ".");
        const valid = decimal ? /^\d*(?:\.\d{0,2})?$/.test(normalized) : /^\d*$/.test(normalized);
        if (!valid) return;
        if (max !== undefined && normalized !== "" && Number(normalized) > max) {
          setDraft(String(max));
          onValueChange(max);
          return;
        }
        setDraft(normalized);
        commit(normalized);
      }}
      onBlur={() => setDraft(formatNumericDraft(commit(draft), emptyWhenZero))}
    />
  );
}

function formatVolume(volumeKg: number, unit: WeightUnit): string {
  const converted = unit === "kg" ? volumeKg : volumeKg * 2.2046226218;
  return `${Math.round(converted).toLocaleString("en-US")} ${unit}`;
}

function sameExercise(first: string, second: string): boolean {
  return first.trim().toLocaleLowerCase() === second.trim().toLocaleLowerCase();
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function previousSet(
  history: WorkoutSession[],
  exerciseKey: string,
  exerciseName: string,
  setIndex: number,
) {
  for (const session of history) {
    const exercise = session.exercises.find(
      (item) => item.exerciseKey === exerciseKey || sameExercise(item.name, exerciseName),
    );
    if (!exercise) continue;
    const comparable = exercise.sets[setIndex] ?? [...exercise.sets].reverse().find((set) => set.completed);
    if (comparable?.completed) return comparable;
  }
  return undefined;
}

function routineToWorkout(
  routine: Routine,
  history: WorkoutSession[],
  workoutDate: string,
): WorkoutSession {
  return {
    id: makeId("workout"),
    name: routine.name,
    workoutDate,
    startedAt: Date.now(),
    sourceRoutineId: routine.id,
    exercises: routine.exercises.map((exercise) => ({
      id: makeId("session-exercise"),
      exerciseKey: exercise.exerciseKey,
      name: exercise.name,
      restSeconds: exercise.restSeconds,
      sets: Array.from({ length: exercise.targetSets }, (_, index) => {
        const previous = previousSet(history, exercise.exerciseKey, exercise.name, index);
        return {
          id: makeId("set"),
          weightKg: previous?.weightKg ?? exercise.targetWeightKg,
          reps: previous?.reps ?? exercise.targetReps,
          completed: false,
        };
      }),
    })),
  };
}

function duplicateWorkout(session: WorkoutSession): WorkoutSession {
  return {
    id: makeId("workout"),
    name: session.name,
    workoutDate: localDateKey(),
    startedAt: Date.now(),
    exercises: session.exercises.map((exercise) => ({
      id: makeId("session-exercise"),
      exerciseKey: exercise.exerciseKey,
      name: exercise.name,
      restSeconds: exercise.restSeconds,
      sets: exercise.sets.map((set) => ({
        id: makeId("set"),
        weightKg: set.weightKg,
        reps: set.reps,
        completed: false,
      })),
    })),
  };
}

function Modal({
  title,
  eyebrow,
  children,
  onClose,
  wide = false,
  initialFocus = "form",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  initialFocus?: "form" | "close";
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const backdrop = dialog.parentElement;
    const shell = backdrop?.parentElement;
    const hiddenSiblings = shell
      ? [...shell.children].filter((element) => element !== backdrop).map((element) => ({
        element,
        ariaHidden: element.getAttribute("aria-hidden"),
        inert: element.hasAttribute("inert"),
      }))
      : [];

    hiddenSiblings.forEach(({ element }) => {
      element.setAttribute("aria-hidden", "true");
      element.setAttribute("inert", "");
    });

    const focusableSelector = [
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled])",
      "a[href]",
    ].join(",");
    const focusable = () => [...dialog.querySelectorAll<HTMLElement>(focusableSelector)]
      .filter((element) => element.offsetParent !== null);
    window.requestAnimationFrame(() => {
      const preferred = initialFocus === "close"
        ? dialog.querySelector<HTMLElement>("[data-modal-close]")
        : dialog.querySelector<HTMLElement>("input:not([disabled]), select:not([disabled]), textarea:not([disabled])");
      (preferred ?? focusable()[0])?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1) ?? first;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      hiddenSiblings.forEach(({ element, ariaHidden, inert }) => {
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
        if (!inert) element.removeAttribute("inert");
      });
      previousFocus?.focus();
    };
  }, [initialFocus]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className={`modal-sheet ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-handle" aria-hidden="true" />
        <header className="modal-header">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <button className="round-button" type="button" onClick={onClose} aria-label="Close" data-modal-close>
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function ExercisePicker({
  catalog,
  onSelect,
  onCreateCustom,
}: {
  catalog: ExerciseCatalogItem[];
  onSelect: (exercise: ExerciseCatalogItem) => void;
  onCreateCustom: (name: string) => CreateCustomExerciseResult;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | ExerciseCatalogCategory>("All");
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customStatus, setCustomStatus] = useState("");

  const availableCategories = EXERCISE_CATEGORY_ORDER.filter((candidate) =>
    catalog.some((exercise) => exercise.category === candidate),
  );
  const normalizedQuery = normalizedExerciseName(query);
  const filtered = catalog.filter((exercise) =>
    (category === "All" || exercise.category === category) &&
    (!normalizedQuery || normalizedExerciseName(exercise.name).includes(normalizedQuery)),
  );

  function saveCustomExercise() {
    const name = cleanExerciseName(customName);
    if (!name) {
      setCustomStatus("Enter an exercise name first.");
      return;
    }
    const result = onCreateCustom(name);
    setCustomStatus(result.created ? `${result.exercise.name} was saved to your library.` : `${result.exercise.name} is already in your library.`);
    setCustomName("");
    onSelect(result.exercise);
  }

  return (
    <div className="exercise-picker">
      <div className="exercise-picker-controls">
        <label className="exercise-picker-search">
          <span>Search exercises</span>
          <span className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              placeholder="Bench press, squat…"
              autoComplete="off"
            />
          </span>
        </label>
        <div className="exercise-category-tabs" role="group" aria-label="Exercise category">
          {(["All", ...availableCategories] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-exercise-panel">
        <button
          className="secondary-button full-width"
          type="button"
          aria-expanded={creatingCustom}
          onClick={() => {
            setCreatingCustom((current) => !current);
            setCustomStatus("");
          }}
        >
          {creatingCustom ? "Cancel custom exercise" : "+ Create custom exercise"}
        </button>
        {creatingCustom ? (
          <div className="custom-exercise-fields">
            <label>
              Custom exercise name
              <input
                value={customName}
                onChange={(event) => {
                  setCustomName(event.target.value);
                  setCustomStatus("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveCustomExercise();
                  }
                }}
                placeholder="e.g. Landmine press"
                maxLength={80}
                autoComplete="off"
              />
            </label>
            <button className="primary-button" type="button" onClick={saveCustomExercise}>Save and select</button>
          </div>
        ) : null}
        {customStatus ? <p className="field-status" role="status">{customStatus}</p> : null}
      </div>

      <p className="exercise-result-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "exercise" : "exercises"}
      </p>
      {filtered.length ? (
        <div className="exercise-option-list">
          {filtered.map((exercise) => (
            <button
              className="exercise-option"
              key={exercise.exerciseKey}
              type="button"
              onClick={() => onSelect(exercise)}
            >
              <span><strong>{exercise.name}</strong><small>{exercise.category}</small></span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="exercise-picker-empty" role="status">
          <strong>No matching exercise</strong>
          <p>Create it once and it will stay in your library.</p>
        </div>
      )}
    </div>
  );
}

function ExerciseModal({
  unit,
  defaultRestSeconds,
  catalog,
  onClose,
  onAdd,
  onCreateCustom,
}: {
  unit: WeightUnit;
  defaultRestSeconds: number;
  catalog: ExerciseCatalogItem[];
  onClose: () => void;
  onAdd: (exercise: ExerciseDraft) => void;
  onCreateCustom: (name: string) => CreateCustomExerciseResult;
}) {
  const [draft, setDraft] = useState<ExerciseDraft>({
    ...EMPTY_EXERCISE,
    restSeconds: defaultRestSeconds,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.exerciseKey || !draft.name.trim()) return;
    onAdd({
      ...draft,
      name: draft.name.trim(),
      sets: Math.max(1, Math.round(draft.sets)),
      reps: Math.max(0, Math.round(draft.reps)),
      weight: Math.max(0, draft.weight),
    });
  }

  return (
    <Modal eyebrow="EXERCISE LIBRARY" title={draft.exerciseKey ? "Set exercise targets" : "Choose an exercise"} onClose={onClose} initialFocus="close">
      <form className="form-stack" onSubmit={submit}>
        {!draft.exerciseKey ? (
          <ExercisePicker
            catalog={catalog}
            onCreateCustom={onCreateCustom}
            onSelect={(exercise) => setDraft((current) => ({
              ...current,
              exerciseKey: exercise.exerciseKey,
              name: exercise.name,
            }))}
          />
        ) : (
          <>
            <div className="selected-exercise-summary">
              <span><small>SELECTED EXERCISE</small><strong>{draft.name}</strong></span>
              <button className="small-button" type="button" onClick={() => setDraft((current) => ({ ...current, exerciseKey: "", name: "" }))}>Change</button>
            </div>
            <div className="form-grid four-columns">
              <label htmlFor="custom-exercise-sets">
                Sets
                <NumericInput id="custom-exercise-sets" value={draft.sets} min={1} max={20} onValueChange={(sets) => setDraft((current) => ({ ...current, sets }))} />
              </label>
              <label htmlFor="custom-exercise-weight">
                {unit.toUpperCase()}
                <NumericInput id="custom-exercise-weight" decimal value={draft.weight} onValueChange={(weight) => setDraft((current) => ({ ...current, weight }))} />
              </label>
              <label htmlFor="custom-exercise-reps">
                Reps
                <NumericInput id="custom-exercise-reps" emptyWhenZero value={draft.reps} max={999} onValueChange={(reps) => setDraft((current) => ({ ...current, reps }))} />
              </label>
              <label>
                Rest
                <select value={draft.restSeconds} onChange={(event) => setDraft({ ...draft, restSeconds: Number(event.target.value) })}>
                  {REST_DURATION_OPTIONS.map((seconds) => <option key={seconds} value={seconds}>{formatRestOption(seconds)}</option>)}
                </select>
              </label>
            </div>
            <button className="primary-button" type="submit">Add to workout</button>
          </>
        )}
      </form>
    </Modal>
  );
}

function RoutineEditor({
  initialRoutine,
  unit,
  defaultRestSeconds,
  catalog,
  onClose,
  onSave,
  onCreateCustom,
}: {
  initialRoutine: Routine;
  unit: WeightUnit;
  defaultRestSeconds: number;
  catalog: ExerciseCatalogItem[];
  onClose: () => void;
  onSave: (routine: Routine) => void;
  onCreateCustom: (name: string) => CreateCustomExerciseResult;
}) {
  const [draft, setDraft] = useState<Routine>(() => structuredClone(initialRoutine));
  const [addingExercise, setAddingExercise] = useState(false);

  function updateExercise(index: number, update: Partial<RoutineExercise>) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...update } : exercise,
      ),
    }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    onSave({
      ...draft,
      name: draft.name.trim(),
      exercises: draft.exercises
        .filter((exercise) => exercise.name.trim())
        .map((exercise) => ({ ...exercise, name: exercise.name.trim() })),
    });
  }

  function addCatalogExercise(exercise: ExerciseCatalogItem) {
    setDraft((current) => ({
      ...current,
      exercises: [...current.exercises, {
        id: makeId("routine-exercise"),
        exerciseKey: exercise.exerciseKey,
        name: exercise.name,
        targetSets: 3,
        targetWeightKg: 0,
        targetReps: 8,
        restSeconds: defaultRestSeconds,
      }],
    }));
    setAddingExercise(false);
  }

  return (
    <Modal eyebrow="ROUTINE BUILDER" title={initialRoutine.exercises.length ? "Edit routine" : "New routine"} onClose={onClose} wide>
      <form className="form-stack" onSubmit={submit}>
        <label>
          Routine name
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Upper body" />
        </label>

        <div className="routine-editor-list">
          {draft.exercises.map((exercise, index) => (
            <article className="routine-editor-row" key={exercise.id}>
              <div className="routine-editor-title">
                <span className="set-number">{index + 1}</span>
                <input aria-label={`Exercise ${index + 1} name`} value={exercise.name} onChange={(event) => updateExercise(index, { name: event.target.value })} />
              </div>
              <div className="form-grid four-columns compact-fields">
                <label htmlFor={`routine-${exercise.id}-sets`}>Sets<NumericInput id={`routine-${exercise.id}-sets`} value={exercise.targetSets} min={1} max={20} onValueChange={(targetSets) => updateExercise(index, { targetSets })} /></label>
                <label htmlFor={`routine-${exercise.id}-weight`}>{unit.toUpperCase()}<NumericInput id={`routine-${exercise.id}-weight`} decimal value={toDisplayWeight(exercise.targetWeightKg, unit)} onValueChange={(weight) => updateExercise(index, { targetWeightKg: toKilograms(weight, unit) })} /></label>
                <label htmlFor={`routine-${exercise.id}-reps`}>Reps<NumericInput id={`routine-${exercise.id}-reps`} emptyWhenZero value={exercise.targetReps} max={999} onValueChange={(targetReps) => updateExercise(index, { targetReps })} /></label>
                <label>Rest<select value={exercise.restSeconds} onChange={(event) => updateExercise(index, { restSeconds: Number(event.target.value) })}>{REST_DURATION_OPTIONS.map((seconds) => <option key={seconds} value={seconds}>{formatRestOption(seconds)}</option>)}</select></label>
              </div>
              <div className="row-actions">
                <button type="button" className="small-button" disabled={index === 0} onClick={() => setDraft({ ...draft, exercises: moveItem(draft.exercises, index, index - 1) })}>Move up</button>
                <button type="button" className="small-button" disabled={index === draft.exercises.length - 1} onClick={() => setDraft({ ...draft, exercises: moveItem(draft.exercises, index, index + 1) })}>Move down</button>
                <button type="button" className="small-button danger-text" onClick={() => setDraft({ ...draft, exercises: draft.exercises.filter((_, exerciseIndex) => exerciseIndex !== index) })}>Remove</button>
              </div>
            </article>
          ))}
        </div>

        {addingExercise ? (
          <section className="routine-picker-panel" aria-label="Add an exercise to this routine">
            <div className="routine-picker-heading">
              <div><p className="section-kicker">EXERCISE LIBRARY</p><h3>Choose an exercise</h3></div>
              <button className="small-button" type="button" onClick={() => setAddingExercise(false)}>Cancel</button>
            </div>
            <ExercisePicker catalog={catalog} onSelect={addCatalogExercise} onCreateCustom={onCreateCustom} />
          </section>
        ) : (
          <button className="secondary-button" type="button" onClick={() => setAddingExercise(true)}>
            + Add exercise
          </button>
        )}
        <button className="primary-button" type="submit">Save routine</button>
      </form>
    </Modal>
  );
}

function AppHeader({
  activeWorkout,
  now,
  onOpenSettings,
}: {
  activeWorkout: WorkoutSession | null;
  now: number;
  onOpenSettings: () => void;
}) {
  const elapsed = activeWorkout
    ? Math.max(0, Math.floor(((activeWorkout.finishedAt ?? now) - activeWorkout.startedAt) / 1000))
    : 0;

  return (
    <header className="topbar">
      <button className="brand-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <span className="brand-mark" aria-hidden="true">S</span>
        <span>
          <strong>Stronger</strong>
          <small>{formatHeaderDate()}</small>
        </span>
      </button>
      <div className="topbar-actions">
        {activeWorkout ? <span className="timer-pill" aria-label={`Workout time ${formatDuration(elapsed)}`}>{formatDuration(elapsed)}</span> : null}
        <button className="round-button" type="button" onClick={onOpenSettings} aria-label="Open settings">⚙</button>
      </div>
    </header>
  );
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">↗</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

export default function StrongerApp() {
  const [data, setData] = useState<StrongerData>(() => createDefaultData());
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>("workout");
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [editingWorkout, setEditingWorkout] = useState(false);
  const [showBlankWorkout, setShowBlankWorkout] = useState(false);
  const [blankName, setBlankName] = useState("Workout");
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [routineDraft, setRoutineDraft] = useState<Routine | null>(null);
  const [historyDetail, setHistoryDetail] = useState<WorkoutSession | null>(null);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [selectedExerciseKey, setSelectedExerciseKey] = useState("");
  const [installGuide, setInstallGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const importInputRef = useRef<HTMLInputElement>(null);
  const finishingRef = useRef(false);

  const activeWorkout = data.activeWorkout;
  const unit = data.settings.unit;

  const exerciseCatalog = useMemo(() => {
    const exercises: ExerciseCatalogItem[] = [];
    const names = new Set<string>();
    const keys = new Set<string>();
    const add = (exercise: ExerciseCatalogItem) => {
      const normalizedName = normalizedExerciseName(exercise.name);
      if (!normalizedName || names.has(normalizedName) || keys.has(exercise.exerciseKey)) return;
      names.add(normalizedName);
      keys.add(exercise.exerciseKey);
      exercises.push(exercise);
    };

    BUILT_IN_EXERCISES.forEach(add);
    data.customExercises.forEach((exercise) => add({ ...exercise, category: "Custom" }));
    data.routines.forEach((routine) => routine.exercises.forEach((exercise) => add({
      exerciseKey: exercise.exerciseKey,
      name: exercise.name,
      category: "Saved",
    })));
    if (data.activeWorkout) {
      data.activeWorkout.exercises.forEach((exercise) => add({
        exerciseKey: exercise.exerciseKey,
        name: exercise.name,
        category: "Saved",
      }));
    }
    data.history.forEach((session) => session.exercises.forEach((exercise) => add({
      exerciseKey: exercise.exerciseKey,
      name: exercise.name,
      category: "Saved",
    })));

    return exercises.sort((first, second) => {
      const categoryDifference = EXERCISE_CATEGORY_ORDER.indexOf(first.category) - EXERCISE_CATEGORY_ORDER.indexOf(second.category);
      return categoryDifference || first.name.localeCompare(second.name);
    });
  }, [data.activeWorkout, data.customExercises, data.history, data.routines]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme still applies for this session if localStorage is unavailable.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme === "dark" ? "#171a18" : "#f3f1e9",
    );
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [tab, activeWorkout?.id]);

  useEffect(() => {
    let cancelled = false;
    loadData()
      .then((saved) => {
        if (!cancelled) {
          setData(saved);
          setHydrated(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHydrated(true);
          setMessage("Local storage could not be opened. Export often until it is available again.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveData(data).catch(() => setMessage("This change could not be saved. Check your available iPhone storage."));
  }, [data, hydrated]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const syncClock = () => setNow(Date.now());
    window.addEventListener("pageshow", syncClock);
    document.addEventListener("visibilitychange", syncClock);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pageshow", syncClock);
      document.removeEventListener("visibilitychange", syncClock);
    };
  }, []);

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const detect = () => {
      const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
      setIsStandalone(standaloneQuery.matches || navigatorWithStandalone.standalone === true);
    };
    detect();
    standaloneQuery.addEventListener?.("change", detect);
    return () => standaloneQuery.removeEventListener?.("change", detect);
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let active = true;
    const appBase = import.meta.env.BASE_URL;
    navigator.serviceWorker.register(`${appBase}sw.js`, { scope: appBase }).then((registration) => {
      if (!active) return;
      if (registration.waiting) setUpdateReady(true);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
        });
      });
      return navigator.serviceWorker.ready;
    }).then((registration) => {
      if (!registration || !active) return;
      const urls = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((url) => {
          try {
            const resourceUrl = new URL(url);
            return resourceUrl.origin === window.location.origin && resourceUrl.pathname.startsWith(appBase);
          } catch {
            return false;
          }
        });
      registration.active?.postMessage({ type: "CACHE_URLS", urls });
    }).catch(() => {
      // Logging remains available even if the offline shell cannot register.
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 4500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const exerciseOptions = useMemo(() => {
    const exercises = new Map<string, string>();
    data.history.forEach((session) => session.exercises.forEach((exercise) => {
      if (!exercises.has(exercise.exerciseKey)) exercises.set(exercise.exerciseKey, exercise.name);
    }));
    return [...exercises.entries()].map(([key, name]) => ({ key, name }));
  }, [data.history]);

  const effectiveSelectedExerciseKey = exerciseOptions.some((exercise) => exercise.key === selectedExerciseKey)
    ? selectedExerciseKey
    : exerciseOptions[0]?.key ?? "";

  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLocaleLowerCase();
    if (!query) return data.history;
    return data.history.filter((session) =>
      session.name.toLocaleLowerCase().includes(query) ||
      session.workoutDate.includes(query) ||
      session.exercises.some((exercise) => exercise.name.toLocaleLowerCase().includes(query)),
    );
  }, [data.history, historySearch]);

  const progressRecords = useMemo(() => {
    if (!effectiveSelectedExerciseKey) return [];
    return [...data.history].reverse().flatMap((session) => {
      const exercise = session.exercises.find((item) => item.exerciseKey === effectiveSelectedExerciseKey);
      if (!exercise) return [];
      const sets = exercise.sets.filter((set) => set.completed && set.reps > 0);
      if (!sets.length) return [];
      return [{
        session,
        bestWeightKg: Math.max(...sets.map((set) => set.weightKg)),
        bestEstimatedKg: Math.max(...sets.map((set) => estimatedOneRepMax(set.weightKg, set.reps))),
        volumeKg: sets.reduce((total, set) => total + set.weightKg * set.reps, 0),
      }];
    });
  }, [data.history, effectiveSelectedExerciseKey]);

  function updateActive(update: (workout: WorkoutSession) => WorkoutSession) {
    setData((current) => current.activeWorkout
      ? { ...current, activeWorkout: update(current.activeWorkout) }
      : current);
  }

  function startWorkout(workout: WorkoutSession) {
    if (data.activeWorkout && !window.confirm("Replace the workout currently in progress? Its unfinished changes will be removed.")) return;
    setData((current) => ({ ...current, activeWorkout: workout }));
    setTab("workout");
    setEditingWorkout(false);
    setMessage(`${workout.name} is ready.`);
  }

  function createCustomExercise(rawName: string): CreateCustomExerciseResult {
    const name = cleanExerciseName(rawName).slice(0, 80);
    const existing = exerciseCatalog.find((exercise) => normalizedExerciseName(exercise.name) === normalizedExerciseName(name));
    if (existing) {
      setMessage(`${existing.name} already exists, so it was selected.`);
      return { exercise: existing, created: false };
    }

    const custom: CustomExercise = {
      exerciseKey: makeId("custom-exercise"),
      name,
    };
    setData((current) => ({
      ...current,
      customExercises: [...current.customExercises, custom],
    }));
    setMessage(`${name} was added to your exercise library.`);
    return { exercise: { ...custom, category: "Custom" }, created: true };
  }

  function startRoutine(routine: Routine) {
    startWorkout(routineToWorkout(routine, data.history, localDateKey()));
  }

  function submitBlankWorkout(event: FormEvent) {
    event.preventDefault();
    const name = blankName.trim() || "Workout";
    startWorkout({
      id: makeId("workout"),
      name,
      workoutDate: localDateKey(),
      startedAt: Date.now(),
      exercises: [],
    });
    setShowBlankWorkout(false);
    setBlankName("Workout");
    setEditingWorkout(true);
  }

  function addExerciseToActive(draft: ExerciseDraft) {
    updateActive((workout) => ({
      ...workout,
      exercises: [...workout.exercises, {
        id: makeId("session-exercise"),
        exerciseKey: draft.exerciseKey,
        name: draft.name,
        restSeconds: draft.restSeconds,
        sets: Array.from({ length: draft.sets }, () => ({
          id: makeId("set"),
          weightKg: toKilograms(draft.weight, unit),
          reps: draft.reps,
          completed: false,
        })),
      }],
    }));
    setShowExerciseModal(false);
  }

  function updateExercise(exerciseId: string, update: Partial<WorkoutExercise>) {
    updateActive((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => exercise.id === exerciseId ? { ...exercise, ...update } : exercise),
    }));
  }

  function moveExercise(index: number, direction: -1 | 1) {
    updateActive((workout) => ({ ...workout, exercises: moveItem(workout.exercises, index, index + direction) }));
  }

  function removeExercise(exercise: WorkoutExercise) {
    const hasCompletedSets = exercise.sets.some((set) => set.completed);
    if (hasCompletedSets && !window.confirm(`Remove ${exercise.name} and its completed sets from this workout?`)) return;
    updateActive((workout) => ({ ...workout, exercises: workout.exercises.filter((item) => item.id !== exercise.id) }));
  }

  function updateSet(exerciseId: string, setId: string, update: { weightKg?: number; reps?: number }) {
    updateActive((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => exercise.id === exerciseId
        ? { ...exercise, sets: exercise.sets.map((set) => set.id === setId ? { ...set, ...update } : set) }
        : exercise),
    }));
  }

  function toggleSet(exercise: WorkoutExercise, setId: string) {
    const target = exercise.sets.find((set) => set.id === setId);
    if (!target) return;
    if (!target.completed && target.reps <= 0) {
      setMessage("Enter at least 1 rep before completing this set.");
      document.getElementById(`reps-${setId}`)?.focus();
      return;
    }
    const timestamp = Date.now();
    updateActive((workout) => ({
      ...workout,
      restEndsAt: target.completed
        ? workout.restEndsAt
        : exercise.restSeconds > 0
          ? timestamp + exercise.restSeconds * 1000
          : undefined,
      exercises: workout.exercises.map((item) => item.id === exercise.id
        ? {
          ...item,
          sets: item.sets.map((set) => set.id === setId
            ? { ...set, completed: !set.completed, completedAt: set.completed ? undefined : timestamp }
            : set),
        }
        : item),
    }));
  }

  function addSet(exercise: WorkoutExercise) {
    const last = exercise.sets.at(-1);
    updateExercise(exercise.id, {
      sets: [...exercise.sets, {
        id: makeId("set"),
        weightKg: last?.weightKg ?? 0,
        reps: last?.reps ?? 8,
        completed: false,
      }],
    });
  }

  function removeSet(exercise: WorkoutExercise, setId: string) {
    const set = exercise.sets.find((item) => item.id === setId);
    if (set?.completed && !window.confirm("Remove this completed set?")) return;
    updateExercise(exercise.id, { sets: exercise.sets.filter((item) => item.id !== setId) });
  }

  function finishWorkout() {
    if (!data.activeWorkout || finishingRef.current) return;
    const incomplete = data.activeWorkout.exercises.reduce(
      (total, exercise) => total + exercise.sets.filter((set) => !set.completed).length,
      0,
    );
    if (incomplete > 0 && !window.confirm(`Finish with ${incomplete} incomplete ${incomplete === 1 ? "set" : "sets"}? Only completed sets count toward progress.`)) return;
    finishingRef.current = true;
    const finished: WorkoutSession = {
      ...structuredClone(data.activeWorkout),
      finishedAt: Date.now(),
      restEndsAt: undefined,
    };
    setData((current) => {
      if (!current.activeWorkout || current.history.some((session) => session.id === finished.id)) return current;
      return { ...current, activeWorkout: null, history: [finished, ...current.history] };
    });
    setEditingWorkout(false);
    setSummary(finished);
    void requestPersistentStorage();
    window.setTimeout(() => {
      finishingRef.current = false;
    }, 500);
  }

  function duplicateForToday(session: WorkoutSession) {
    startWorkout(duplicateWorkout(session));
    setHistoryDetail(null);
  }

  function deleteHistory(session: WorkoutSession) {
    if (!window.confirm(`Delete ${session.name} from ${formatDate(session.workoutDate)}? This cannot be undone.`)) return;
    setData((current) => ({ ...current, history: current.history.filter((item) => item.id !== session.id) }));
    setHistoryDetail(null);
  }

  function saveRoutine(routine: Routine) {
    setData((current) => {
      const exists = current.routines.some((item) => item.id === routine.id);
      return {
        ...current,
        routines: exists
          ? current.routines.map((item) => item.id === routine.id ? routine : item)
          : [...current.routines, routine],
      };
    });
    setRoutineDraft(null);
    setMessage("Routine saved.");
  }

  function deleteRoutine(routine: Routine) {
    if (!window.confirm(`Delete the ${routine.name} routine? Completed workout history will stay intact.`)) return;
    setData((current) => ({ ...current, routines: current.routines.filter((item) => item.id !== routine.id) }));
  }

  async function exportData() {
    const payload = JSON.stringify({
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      data,
    }, null, 2);
    const file = new File([payload], `stronger-backup-${localDateKey()}.json`, { type: "application/json" });
    const shareNavigator = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
    try {
      if (navigator.share && shareNavigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Stronger backup", files: [file] });
      } else {
        const link = document.createElement("a");
        const url = URL.createObjectURL(file);
        link.href = url;
        link.download = file.name;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setMessage("Backup created. Keep it somewhere safe.");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setMessage("The backup could not be shared.");
    }
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 10_000_000) {
      setMessage("That backup is too large to import safely.");
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const wrapped = parsed && typeof parsed === "object" && "data" in parsed
        ? (parsed as { data: unknown }).data
        : parsed;
      const replacement = normalizeStrongerData(wrapped);
      if (!replacement) throw new Error("Invalid Stronger backup");
      if (!window.confirm("Replace the exercise library, routines, workouts, history, and settings on this installation with this backup? This cannot be merged or undone.")) return;
      await saveData(replacement);
      setData(replacement);
      setTab("workout");
      setMessage("Backup restored.");
    } catch {
      setMessage("This file is not a valid Stronger backup. Your current data was not changed.");
    }
  }

  function resetAllData() {
    if (!window.confirm("Reset Stronger and permanently remove every custom exercise, workout, routine, and setting? Export first if you may need this data.")) return;
    setData(createDefaultData());
    setTab("workout");
    setMessage("Stronger was reset to its starter routines.");
  }

  if (!hydrated) {
    return (
      <main className="loading-screen" role="status">
        <span className="brand-mark large" aria-hidden="true">S</span>
        <strong>Loading your training log…</strong>
        <small>Your data stays on this device.</small>
      </main>
    );
  }

  const restRemaining = activeWorkout?.restEndsAt
    ? Math.max(0, Math.ceil((activeWorkout.restEndsAt - now) / 1000))
    : null;
  const exerciseDoneCount = activeWorkout?.exercises.filter(
    (exercise) => exercise.sets.length > 0 && exercise.sets.every((set) => set.completed),
  ).length ?? 0;
  const completedSetCount = activeWorkout ? completedSets(activeWorkout).length : 0;
  const totalSetCount = activeWorkout?.exercises.reduce((total, exercise) => total + exercise.sets.length, 0) ?? 0;
  const progressPercent = totalSetCount ? Math.round((completedSetCount / totalSetCount) * 100) : 0;
  const latestProgress = progressRecords.at(-1);
  const previousProgress = progressRecords.at(-2);
  const newBest = latestProgress && previousProgress
    ? latestProgress.bestWeightKg > Math.max(...progressRecords.slice(0, -1).map((record) => record.bestWeightKg))
    : false;

  return (
    <div className="app-shell">
      <AppHeader activeWorkout={activeWorkout} now={now} onOpenSettings={() => setTab("settings")} />

      {updateReady ? (
        <div className="notice-banner" role="status">
          <span><strong>Update ready.</strong> Finish your workout, then close and reopen Stronger.</span>
          <button type="button" onClick={() => setUpdateReady(false)} aria-label="Dismiss update notice">×</button>
        </div>
      ) : null}

      {tab === "workout" ? (
        <main>
          {activeWorkout ? (
            <>
              <section className="page-heading workout-heading">
                <div>
                  <p className="section-kicker">CURRENT WORKOUT · {formatDate(activeWorkout.workoutDate).toUpperCase()}</p>
                  {editingWorkout ? (
                    <input
                      className="workout-name-input"
                      aria-label="Workout name"
                      value={activeWorkout.name}
                      onChange={(event) => updateActive((workout) => ({ ...workout, name: event.target.value }))}
                    />
                  ) : <h1>{activeWorkout.name}</h1>}
                </div>
                <button className="text-button" type="button" onClick={() => setEditingWorkout((value) => !value)}>
                  {editingWorkout ? "Done" : "Edit"}
                </button>
              </section>

              <section className="progress-card" aria-label="Workout progress">
                <div className="progress-copy">
                  <strong>{exerciseDoneCount} of {activeWorkout.exercises.length} exercises complete</strong>
                  <span>{completedSetCount}/{totalSetCount} sets</span>
                </div>
                <div className="progress-track" aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>
              </section>

              {activeWorkout.exercises.length ? activeWorkout.exercises.map((exercise, exerciseIndex) => {
                const exerciseComplete = exercise.sets.length > 0 && exercise.sets.every((set) => set.completed);
                return (
                  <article className={`exercise-card ${exerciseComplete ? "exercise-complete" : ""}`} key={exercise.id}>
                    <header className="exercise-header">
                      <div className="exercise-title-wrap">
                        <span className="set-number">{exerciseComplete ? "✓" : exerciseIndex + 1}</span>
                        <div>
                          <p className="exercise-order">EXERCISE {exerciseIndex + 1}</p>
                          {editingWorkout ? (
                            <input
                              className="exercise-name-input"
                              aria-label={`Exercise ${exerciseIndex + 1} name`}
                              value={exercise.name}
                              onChange={(event) => updateExercise(exercise.id, { name: event.target.value })}
                            />
                          ) : <h2>{exercise.name}</h2>}
                          <p className="exercise-note">{exercise.restSeconds === 0 ? "Rest timer off" : `${exercise.restSeconds}s rest`} · previous results shown below</p>
                        </div>
                      </div>
                      {editingWorkout ? (
                        <div className="stacked-actions" aria-label={`Reorder ${exercise.name}`}>
                          <button type="button" className="mini-icon-button" disabled={exerciseIndex === 0} onClick={() => moveExercise(exerciseIndex, -1)} aria-label={`Move ${exercise.name} up`}>↑</button>
                          <button type="button" className="mini-icon-button" disabled={exerciseIndex === activeWorkout.exercises.length - 1} onClick={() => moveExercise(exerciseIndex, 1)} aria-label={`Move ${exercise.name} down`}>↓</button>
                        </div>
                      ) : null}
                    </header>

                    <div className="set-grid set-grid-header" aria-hidden="true">
                      <span>SET</span><span>PREVIOUS</span><span>{unit.toUpperCase()}</span><span>REPS</span><span>DONE</span>
                    </div>
                    <div className="set-list">
                      {exercise.sets.map((set, setIndex) => {
                        const prior = previousSet(data.history, exercise.exerciseKey, exercise.name, setIndex);
                        return (
                          <div className={`set-grid set-row ${set.completed ? "is-done" : ""}`} key={set.id}>
                            <span className="set-number" aria-label={`Set ${setIndex + 1}`}>{setIndex + 1}</span>
                            <span className="previous-value">{prior ? `${formatWeight(prior.weightKg, unit)} × ${prior.reps}` : "—"}</span>
                            <label className="visually-hidden" htmlFor={`weight-${set.id}`}>Weight in {unit} for {exercise.name}, set {setIndex + 1}</label>
                            <NumericInput
                              id={`weight-${set.id}`}
                              className="set-input"
                              decimal
                              enterKeyHint="next"
                              value={toDisplayWeight(set.weightKg, unit)}
                              onValueChange={(weight) => updateSet(exercise.id, set.id, { weightKg: toKilograms(weight, unit) })}
                            />
                            <label className="visually-hidden" htmlFor={`reps-${set.id}`}>Repetitions for {exercise.name}, set {setIndex + 1}</label>
                            <NumericInput
                              id={`reps-${set.id}`}
                              className="set-input"
                              emptyWhenZero
                              enterKeyHint="done"
                              max={999}
                              value={set.reps}
                              onValueChange={(reps) => updateSet(exercise.id, set.id, { reps })}
                            />
                            <button
                              className="complete-button"
                              type="button"
                              aria-pressed={set.completed}
                              aria-label={`${set.completed ? "Mark" : "Complete"} ${exercise.name} set ${setIndex + 1}${set.completed ? " incomplete" : ""}`}
                              onClick={() => toggleSet(exercise, set.id)}
                            >✓</button>
                            {editingWorkout ? (
                              <button className="remove-set-button" type="button" onClick={() => removeSet(exercise, set.id)} aria-label={`Remove ${exercise.name} set ${setIndex + 1}`}>Remove</button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <button className="add-set-button" type="button" onClick={() => addSet(exercise)}>+ Add set</button>
                    {editingWorkout ? (
                      <div className="exercise-edit-footer">
                        <label>Rest after set
                          <select value={exercise.restSeconds} onChange={(event) => {
                            const restSeconds = Number(event.target.value);
                            updateActive((workout) => ({
                              ...workout,
                              restEndsAt: restSeconds === 0 ? undefined : workout.restEndsAt,
                              exercises: workout.exercises.map((item) => item.id === exercise.id ? { ...item, restSeconds } : item),
                            }));
                          }}>
                            {REST_DURATION_OPTIONS.map((seconds) => <option key={seconds} value={seconds}>{formatRestOption(seconds)}</option>)}
                          </select>
                        </label>
                        <button type="button" className="small-button danger-text" onClick={() => removeExercise(exercise)}>Remove exercise</button>
                      </div>
                    ) : null}
                  </article>
                );
              }) : <EmptyState title="Add your first exercise" copy="This workout is empty. Add an exercise, then enter weight and reps as you train." />}

              <button className="secondary-button full-width" type="button" onClick={() => setShowExerciseModal(true)}>+ Add exercise</button>
              <button className="finish-button" type="button" onClick={finishWorkout}>Finish workout</button>
              <button
                className="danger-link"
                type="button"
                onClick={() => {
                  if (window.confirm("Discard this unfinished workout? This cannot be undone.")) setData((current) => ({ ...current, activeWorkout: null }));
                }}
              >Discard workout</button>
            </>
          ) : (
            <>
              <section className="hero-section">
                <p className="eyebrow">TRAINING NOTEBOOK</p>
                <h1>Your training.<br /><span>Kept simple.</span></h1>
                <p>Start a familiar routine or build today as you go. No account, no feed, no subscription.</p>
              </section>

              {!isStandalone ? (
                <section className="install-card">
                  <div className="install-icon" aria-hidden="true">↗</div>
                  <div>
                    <p className="eyebrow">IPHONE SETUP</p>
                    <h2>Install before you log</h2>
                    <p>Safari and the Home Screen app can keep separate local data. Install first, then enter workouts from the icon.</p>
                    <button className="inline-button" type="button" onClick={() => setInstallGuide(true)}>Show 30-second guide →</button>
                  </div>
                </section>
              ) : (
                <div className="offline-ready"><span aria-hidden="true">✓</span> Installed app · workout data stays on this device</div>
              )}

              <section className="section-block">
                <div className="section-heading">
                  <div><p className="section-kicker">CHOOSE A ROUTINE</p><h2>Ready when you are</h2></div>
                  <button className="text-button" type="button" onClick={() => setRoutineDraft({ id: makeId("routine"), name: "", exercises: [] })}>New</button>
                </div>
                <div className="routine-list">
                  {data.routines.map((routine, index) => (
                    <article className="routine-card" key={routine.id}>
                      <button className="routine-main" type="button" onClick={() => startRoutine(routine)}>
                        <span className="routine-index">0{index + 1}</span>
                        <span><strong>{routine.name}</strong><small>{routine.exercises.length} exercises · {routine.exercises.reduce((total, exercise) => total + exercise.targetSets, 0)} sets</small></span>
                        <span className="routine-arrow" aria-hidden="true">→</span>
                      </button>
                      <button className="routine-edit" type="button" onClick={() => setRoutineDraft(routine)} aria-label={`Edit ${routine.name} routine`}>Edit</button>
                    </article>
                  ))}
                </div>
                <button className="secondary-button full-width" type="button" onClick={() => setShowBlankWorkout(true)}>Start a blank workout</button>
              </section>
            </>
          )}
        </main>
      ) : null}

      {tab === "history" ? (
        <main>
          <section className="page-heading">
            <p className="eyebrow">YOUR TRAINING LOG</p>
            <h1>History</h1>
            <p>Every finished workout, kept as it happened.</p>
          </section>
          <label className="search-field">
            <span className="visually-hidden">Search workout history</span>
            <span aria-hidden="true">⌕</span>
            <input type="search" value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="Search workout or exercise" />
          </label>
          {filteredHistory.length ? (
            <div className="history-list">
              {filteredHistory.map((session) => (
                <article className="history-card" key={session.id}>
                  <button type="button" onClick={() => setHistoryDetail(session)}>
                    <span className="history-date"><strong>{session.workoutDate.slice(8)}</strong><small>{new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(`${session.workoutDate}T12:00:00`))}</small></span>
                    <span className="history-main"><strong>{session.name}</strong><small>{session.exercises.length} exercises · {completedSets(session).length} sets</small></span>
                    <span className="history-metric"><strong>{formatVolume(workoutVolumeKg(session), unit)}</strong><small>{formatDuration(Math.max(0, ((session.finishedAt ?? session.startedAt) - session.startedAt) / 1000))}</small></span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title={data.history.length ? "Nothing matches" : "Your log starts here"} copy={data.history.length ? "Try another workout or exercise name." : "Finish your first workout and it will appear here."} />
          )}
        </main>
      ) : null}

      {tab === "progress" ? (
        <main>
          <section className="page-heading">
            <p className="eyebrow">USEFUL SIGNALS ONLY</p>
            <h1>Progress</h1>
            <p>Simple records from completed sets—enough to see whether the work is moving.</p>
          </section>
          {exerciseOptions.length ? (
            <>
              <label className="select-card">Exercise
                <select value={effectiveSelectedExerciseKey} onChange={(event) => setSelectedExerciseKey(event.target.value)}>
                  {exerciseOptions.map((exercise) => <option key={exercise.key} value={exercise.key}>{exercise.name}</option>)}
                </select>
              </label>
              {newBest ? <div className="milestone-card"><span aria-hidden="true">★</span><div><strong>New best weight</strong><small>Your latest workout set a new high for this exercise.</small></div></div> : null}
              <section className="stat-grid" aria-label="Exercise records">
                <article><small>BEST WEIGHT</small><strong>{progressRecords.length ? formatWeight(Math.max(...progressRecords.map((record) => record.bestWeightKg)), unit) : "—"}<em>{unit}</em></strong></article>
                <article><small>EST. 1RM</small><strong>{progressRecords.length ? formatWeight(Math.max(...progressRecords.map((record) => record.bestEstimatedKg)), unit) : "—"}<em>{unit}</em></strong></article>
                <article><small>TOTAL VOLUME</small><strong>{formatVolume(progressRecords.reduce((total, record) => total + record.volumeKg, 0), unit)}</strong></article>
              </section>
              <section className="trend-card">
                <div className="section-heading compact">
                  <div><p className="section-kicker">BEST WEIGHT BY WORKOUT</p><h2>Recent trend</h2></div>
                  <span>{progressRecords.length} {progressRecords.length === 1 ? "workout" : "workouts"}</span>
                </div>
                <div className="bar-chart" aria-label="Best weight trend">
                  {progressRecords.slice(-8).map((record) => {
                    const maximum = Math.max(...progressRecords.slice(-8).map((item) => item.bestWeightKg), 1);
                    const height = Math.max(10, (record.bestWeightKg / maximum) * 100);
                    return (
                      <div className="bar-column" key={record.session.id} title={`${formatDate(record.session.workoutDate)}: ${formatWeight(record.bestWeightKg, unit)} ${unit}`}>
                        <span className="bar-value">{formatWeight(record.bestWeightKg, unit)}</span>
                        <span className="bar" style={{ height: `${height}%` }} />
                        <small>{record.session.workoutDate.slice(5).replace("-", "/")}</small>
                      </div>
                    );
                  })}
                </div>
                <p className="chart-note">Estimated 1RM uses completed sets of 1–12 reps. It is a training estimate, not a tested maximum.</p>
              </section>
            </>
          ) : <EmptyState title="No progress data yet" copy="Complete and finish a workout to create your first strength trend." />}
        </main>
      ) : null}

      {tab === "settings" ? (
        <main>
          <section className="page-heading">
            <p className="eyebrow">MAKE IT YOURS</p>
            <h1>Settings</h1>
            <p>Practical defaults, routine management, and local data controls.</p>
          </section>

          <section className="settings-card">
            <div className="setting-row">
              <div><strong>Appearance</strong><small>Switch between light and dark without changing Stronger’s palette.</small></div>
              <button
                className="theme-switch"
                type="button"
                role="switch"
                aria-label="Dark mode"
                aria-checked={theme === "dark"}
                onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
              >
                <span className="theme-switch-label" aria-hidden="true">{theme === "dark" ? "Dark" : "Light"}</span>
                <span className="theme-switch-track" aria-hidden="true"><span /></span>
              </button>
            </div>
            <div className="setting-row">
              <div><strong>Weight units</strong><small>Stored safely in kg; converted only for display.</small></div>
              <div className="segmented" role="group" aria-label="Weight units">
                {(["kg", "lb"] as WeightUnit[]).map((option) => <button key={option} type="button" aria-pressed={unit === option} onClick={() => setData((current) => ({ ...current, settings: { ...current.settings, unit: option } }))}>{option.toUpperCase()}</button>)}
              </div>
            </div>
            <label className="setting-row" htmlFor="default-rest">
              <span><strong>Default rest</strong><small>Used for new exercises.</small></span>
              <select id="default-rest" value={data.settings.defaultRestSeconds} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, defaultRestSeconds: Number(event.target.value) } }))}>
                {REST_DURATION_OPTIONS.map((seconds) => <option key={seconds} value={seconds}>{formatRestOption(seconds)}</option>)}
              </select>
            </label>
            <label className="setting-row" htmlFor="training-goal">
              <span><strong>Training goal</strong><small>Keeps the app focused on your intent.</small></span>
              <select id="training-goal" aria-label="Training goal" value={data.settings.goal} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, goal: event.target.value as StrongerData["settings"]["goal"] } }))}>
                <option value="strength">Strength</option><option value="muscle">Build muscle</option><option value="fitness">General fitness</option>
              </select>
            </label>
            <label className="setting-row" htmlFor="weekly-days">
              <span><strong>Weekly days</strong><small>Your preferred training rhythm.</small></span>
              <select id="weekly-days" value={data.settings.weeklyDays} onChange={(event) => setData((current) => ({ ...current, settings: { ...current.settings, weeklyDays: Number(event.target.value) } }))}>
                {[1, 2, 3, 4, 5, 6, 7].map((days) => <option key={days} value={days}>{days} {days === 1 ? "day" : "days"}</option>)}
              </select>
            </label>
          </section>

          <section className="section-block settings-section">
            <div className="section-heading"><div><p className="section-kicker">WORKOUT TEMPLATES</p><h2>Routines</h2></div><button className="text-button" type="button" onClick={() => setRoutineDraft({ id: makeId("routine"), name: "", exercises: [] })}>New</button></div>
            <div className="manage-list">
              {data.routines.map((routine) => (
                <div className="manage-row" key={routine.id}>
                  <span><strong>{routine.name}</strong><small>{routine.exercises.length} exercises</small></span>
                  <button className="small-button" type="button" onClick={() => setRoutineDraft(routine)}>Edit</button>
                  <button className="small-button danger-text" type="button" onClick={() => deleteRoutine(routine)}>Delete</button>
                </div>
              ))}
            </div>
          </section>

          <section className="section-block settings-section">
            <p className="section-kicker">IPHONE APP</p><h2>Install & offline</h2>
            <p className="section-copy">Open once online, then add Stronger from Safari to your Home Screen. The app shell works offline after that first complete load.</p>
            <button className="secondary-button full-width" type="button" onClick={() => setInstallGuide(true)}>{isStandalone ? "Review install & data notes" : "Install on iPhone"}</button>
          </section>

          <section className="section-block settings-section">
            <p className="section-kicker">LOCAL DATA</p><h2>Backup & restore</h2>
            <p className="section-copy">There is no cloud account. Export a JSON backup regularly—especially before clearing Safari data or changing this app’s web address.</p>
            <div className="button-pair">
              <button className="primary-button" type="button" onClick={() => void exportData()}>Export data</button>
              <button className="secondary-button" type="button" onClick={() => importInputRef.current?.click()}>Import data</button>
            </div>
            <input ref={importInputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importData(event)} />
            <button className="danger-link bordered" type="button" onClick={resetAllData}>Reset all data</button>
          </section>

          <section className="privacy-note">
            <span aria-hidden="true">◎</span><div><strong>Private by design</strong><p>Your workouts are stored in this installation’s browser storage and are not sent to a Stronger account or workout database.</p></div>
          </section>
        </main>
      ) : null}

      {restRemaining !== null ? (
        <div className={`rest-banner ${restRemaining === 0 ? "is-ready" : ""}`} role="timer" aria-live="off">
          {restRemaining === 0 ? <span className="visually-hidden" role="status">Rest complete. Ready for the next set.</span> : null}
          <span className="rest-ring" aria-hidden="true">{restRemaining === 0 ? "✓" : "↻"}</span>
          <span><small>{restRemaining === 0 ? "REST COMPLETE" : "REST TIMER"}</small><strong>{restRemaining === 0 ? "Ready for the next set" : formatDuration(restRemaining)}</strong></span>
          <button type="button" onClick={() => updateActive((workout) => ({ ...workout, restEndsAt: undefined }))}>{restRemaining === 0 ? "Dismiss" : "Skip"}</button>
        </div>
      ) : null}

      <nav className="bottom-nav" aria-label="Main navigation">
        {([
          ["workout", "▰", "Workout"],
          ["history", "◷", "History"],
          ["progress", "↗", "Progress"],
          ["settings", "••", "Settings"],
        ] as const).map(([itemTab, icon, label]) => (
          <button key={itemTab} type="button" className={tab === itemTab ? "active" : ""} aria-current={tab === itemTab ? "page" : undefined} onClick={() => setTab(itemTab)}>
            <span aria-hidden="true">{icon}</span><small>{label}</small>
          </button>
        ))}
      </nav>

      {message ? <div className={`toast ${restRemaining !== null ? "with-rest" : ""}`} role="status">{message}</div> : null}

      {showBlankWorkout ? (
        <Modal eyebrow="START FROM SCRATCH" title="Blank workout" onClose={() => setShowBlankWorkout(false)}>
          <form className="form-stack" onSubmit={submitBlankWorkout}>
            <label>Workout name<input value={blankName} onChange={(event) => setBlankName(event.target.value)} /></label>
            <button className="primary-button" type="submit">Create today’s workout</button>
          </form>
        </Modal>
      ) : null}

      {showExerciseModal ? (
        <ExerciseModal
          unit={unit}
          defaultRestSeconds={data.settings.defaultRestSeconds}
          catalog={exerciseCatalog}
          onClose={() => setShowExerciseModal(false)}
          onAdd={addExerciseToActive}
          onCreateCustom={createCustomExercise}
        />
      ) : null}

      {routineDraft ? (
        <RoutineEditor
          initialRoutine={routineDraft}
          unit={unit}
          defaultRestSeconds={data.settings.defaultRestSeconds}
          catalog={exerciseCatalog}
          onClose={() => setRoutineDraft(null)}
          onSave={saveRoutine}
          onCreateCustom={createCustomExercise}
        />
      ) : null}

      {installGuide ? (
        <Modal eyebrow="FREE IPHONE INSTALL" title="Add Stronger to Home Screen" onClose={() => setInstallGuide(false)}>
          <ol className="install-steps">
            <li><span>1</span><div><strong>Open in Safari</strong><p>Use the secure Stronger HTTPS link, not an in-app browser.</p></div></li>
            <li><span>2</span><div><strong>Tap Share</strong><p>Choose the square with the upward arrow.</p></div></li>
            <li><span>3</span><div><strong>Add to Home Screen</strong><p>Keep “Open as Web App” enabled if it appears, then tap Add.</p></div></li>
            <li><span>4</span><div><strong>Launch from the icon</strong><p>Complete one online launch before relying on offline mode.</p></div></li>
          </ol>
          <div className="warning-box"><strong>Install before logging important data.</strong><p>On iPhone, workouts entered in Safari may not appear in the installed Home Screen app because each can have separate local storage.</p></div>
          <button className="primary-button" type="button" onClick={() => setInstallGuide(false)}>Got it</button>
        </Modal>
      ) : null}

      {historyDetail ? (
        <Modal eyebrow={formatDate(historyDetail.workoutDate).toUpperCase()} title={historyDetail.name} onClose={() => setHistoryDetail(null)} wide>
          <div className="detail-summary">
            <div><small>DURATION</small><strong>{formatDuration(Math.max(0, ((historyDetail.finishedAt ?? historyDetail.startedAt) - historyDetail.startedAt) / 1000))}</strong></div>
            <div><small>SETS</small><strong>{completedSets(historyDetail).length}</strong></div>
            <div><small>VOLUME</small><strong>{formatVolume(workoutVolumeKg(historyDetail), unit)}</strong></div>
          </div>
          <div className="history-detail-list">
            {historyDetail.exercises.map((exercise) => (
              <article key={exercise.id}>
                <h3>{exercise.name}</h3>
                <div>{exercise.sets.filter((set) => set.completed).length ? exercise.sets.filter((set) => set.completed).map((set, index) => <span key={set.id}>{index + 1}. {formatWeight(set.weightKg, unit)} {unit} × {set.reps}</span>) : <span>No completed sets</span>}</div>
              </article>
            ))}
          </div>
          <div className="button-pair">
            <button className="primary-button" type="button" onClick={() => duplicateForToday(historyDetail)}>Duplicate for today</button>
            <button className="secondary-button danger-text" type="button" onClick={() => deleteHistory(historyDetail)}>Delete</button>
          </div>
        </Modal>
      ) : null}

      {summary ? (
        <Modal eyebrow="WORKOUT SAVED" title="Good work." onClose={() => setSummary(null)}>
          <div className="summary-mark" aria-hidden="true">✓</div>
          <p className="summary-copy">{summary.name} is now in your history and progress.</p>
          <div className="detail-summary">
            <div><small>TIME</small><strong>{formatDuration(Math.max(0, ((summary.finishedAt ?? summary.startedAt) - summary.startedAt) / 1000))}</strong></div>
            <div><small>SETS</small><strong>{completedSets(summary).length}</strong></div>
            <div><small>VOLUME</small><strong>{formatVolume(workoutVolumeKg(summary), unit)}</strong></div>
          </div>
          <button className="primary-button" type="button" onClick={() => { setSummary(null); setTab("history"); }}>View in history</button>
        </Modal>
      ) : null}
    </div>
  );
}
