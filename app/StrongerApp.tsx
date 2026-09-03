"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BACKUP_FORMAT_VERSION,
  BACKUP_KIND,
  completedSets,
  createDefaultData,
  CURRENT_FORMAT_VERSION,
  CustomExercise,
  EffortScale,
  formatWeight,
  isValidDropWeightTransition,
  isWithinSafeResourceLimits,
  loadData,
  makeId,
  MAX_CUSTOM_EXERCISES,
  MAX_EXERCISES_PER_ITEM,
  MAX_HISTORY_SESSIONS,
  MAX_PROGRAM_BLOCKS,
  MAX_PROGRAM_BLOCK_LOAD_PERCENT,
  MAX_PROGRAM_BLOCK_WEEKS,
  MAX_ROUTINES,
  MAX_SETS_PER_EXERCISE,
  MAX_TOTAL_SETS_PER_ITEM,
  MAX_WEIGHT_KG,
  MIN_PROGRAM_BLOCK_LOAD_PERCENT,
  MIN_PROGRAM_BLOCK_WEEKS,
  normalizeStrongerBackup,
  ProgramBlock,
  replaceData,
  requestPersistentStorage,
  Routine,
  RoutineExercise,
  saveData,
  SetEffort,
  StrongerDataConflictError,
  StrongerData,
  toDisplayWeight,
  toKilograms,
  WeightUnit,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
  workoutVolumeKg,
} from "./storage";
import {
  BUILT_IN_EXERCISES,
  equipmentAlternativesFor,
  equipmentForExercise,
} from "./exercises";
import { buildHistoryCsv } from "./historyCsv";
import {
  completedDropSegments,
  dropNumber,
  dropSegmentsFor,
  insertDropSegment,
  isDropSegment,
  isFinalSetSegment,
  precedingSegment,
  removeSetWithContinuations,
  workingSetNumber,
  workingSets,
} from "./dropSets";
import {
  effortHint,
  effortOptionLabel,
  effortScaleLabel,
  effortValues,
  formatSetEffort,
  toggleSetCompletion,
} from "./effort";
import {
  copyRoutineToProgramBlock,
  programBlockTargetWeight,
  updateProgramBlockWeek,
} from "./programBlocks";
import {
  calculatePlateLoad,
  createEmptyPlateInventory,
  MAX_CALCULATOR_LOAD,
  MAX_PLATE_PAIRS_PER_SIZE,
  PlateInventoryItem,
} from "./plateCalculator";
import { buildNextSetPreview } from "./nextSetPreview";
import {
  buildPeriodProgress,
  type ProgressPeriod,
} from "./overallProgress";
import {
  confirmLongSessionContinuation,
  finishWorkoutTimer,
  pauseForLongSessionCheck,
  pauseWorkoutTimer,
  resumeWorkoutTimer,
  sessionInactivityMs,
  shouldOfferLongSessionCheck,
  shouldOfferSessionRescue,
  workoutElapsedSeconds,
} from "./sessionRescue";
import { nextRoutineInRotation } from "./weeklyReview";

type Tab = "workout" | "history" | "progress" | "settings";
type ThemeMode = "light" | "dark";
type SessionRescuePrompt = {
  workoutId: string;
  offeredAt: number;
  reason: "inactivity" | "long-session";
};
type DismissedRescuePrompt = Pick<SessionRescuePrompt, "workoutId" | "reason">;
type PlateCalculatorDraft = {
  unit: WeightUnit;
  targetTotal: number;
  barWeight: number;
  inventory: PlateInventoryItem[];
};

const THEME_STORAGE_KEY = "stronger-theme";
const REST_DURATION_OPTIONS = [0, 30, 45, 60, 90, 120, 150, 180, 240, 300] as const;
const REPORT_CATEGORIES_BY_EXERCISE_KEY = Object.fromEntries(
  BUILT_IN_EXERCISES.map((exercise) => [exercise.exerciseKey, exercise.category]),
) as Record<string, (typeof BUILT_IN_EXERCISES)[number]["category"]>;

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
  exercise: ExerciseCatalogItem | null;
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

function formatReportDateRange(range: { startDate: string; endDate: string } | null): string {
  if (!range) return "All saved workouts";
  const formatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  const start = formatter.format(new Date(`${range.startDate}T12:00:00`));
  if (range.startDate === range.endDate) return start;
  const end = formatter.format(new Date(`${range.endDate}T12:00:00`));
  return `${start}–${end}`;
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

function formatPlateWeight(value: number): string {
  return String(Math.round(value * 100) / 100);
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
    const comparableSets = workingSets(exercise);
    const comparable = comparableSets[setIndex] ?? [...comparableSets].reverse().find((set) => set.completed);
    if (comparable?.completed) return comparable;
  }
  return undefined;
}

function previousDropSet(
  history: WorkoutSession[],
  exerciseKey: string,
  exerciseName: string,
  workingSetIndex: number,
  dropIndex: number,
) {
  for (const session of history) {
    const exercise = session.exercises.find(
      (item) => item.exerciseKey === exerciseKey || sameExercise(item.name, exerciseName),
    );
    if (!exercise) continue;
    const root = workingSets(exercise)[workingSetIndex];
    if (!root) continue;
    const comparable = dropSegmentsFor(exercise, root.id)[dropIndex];
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
    exercises: session.exercises.map((exercise) => {
      const replacementIds = new Map(exercise.sets.map((set) => [set.id, makeId("set")]));
      return {
        id: makeId("session-exercise"),
        exerciseKey: exercise.exerciseKey,
        name: exercise.name,
        restSeconds: exercise.restSeconds,
        sets: exercise.sets.map((set) => ({
          id: replacementIds.get(set.id)!,
          weightKg: set.weightKg,
          reps: set.reps,
          completed: false,
          ...(set.dropSetOf ? { dropSetOf: replacementIds.get(set.dropSetOf)! } : {}),
        })),
      };
    }),
  };
}

function Modal({
  title,
  eyebrow,
  children,
  onClose,
  wide = false,
  initialFocus = "form",
  descriptionId,
  closeLabel = "Close",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  initialFocus?: "form" | "close" | "primary";
  descriptionId?: string;
  closeLabel?: string;
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
        : initialFocus === "primary"
          ? dialog.querySelector<HTMLElement>("[data-modal-primary]")
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
        aria-describedby={descriptionId}
      >
        <div className="modal-handle" aria-hidden="true" />
        <header className="modal-header">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <button className="round-button" type="button" onClick={onClose} aria-label={closeLabel} data-modal-close>
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
  const [alternativeForKey, setAlternativeForKey] = useState("");

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
    if (!result.exercise) {
      setCustomStatus("The custom exercise limit has been reached.");
      return;
    }
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
          {filtered.map((exercise) => {
            const equipment = equipmentForExercise(exercise.exerciseKey);
            const alternatives = equipmentAlternativesFor(exercise.exerciseKey);
            const alternativesOpen = alternativeForKey === exercise.exerciseKey;

            return (
              <div className="exercise-option-shell" key={exercise.exerciseKey}>
                <div className="exercise-option-row">
                  <button
                    className="exercise-option"
                    type="button"
                    aria-label={`Select ${exercise.name}`}
                    onClick={() => onSelect(exercise)}
                  >
                    <span>
                      <strong>{exercise.name}</strong>
                      <small>{equipment ? `${exercise.category} · ${equipment}` : exercise.category}</small>
                    </span>
                    <span aria-hidden="true">›</span>
                  </button>
                  {alternatives.length ? (
                    <button
                      className="equipment-alternative-trigger"
                      type="button"
                      aria-expanded={alternativesOpen}
                      aria-controls={`equipment-alternatives-${exercise.exerciseKey}`}
                      onClick={() => setAlternativeForKey(alternativesOpen ? "" : exercise.exerciseKey)}
                    >
                      Alternatives
                    </button>
                  ) : null}
                </div>
                {alternativesOpen ? (
                  <section
                    className="equipment-alternatives"
                    id={`equipment-alternatives-${exercise.exerciseKey}`}
                    aria-label={`Different-equipment alternatives for ${exercise.name}`}
                  >
                    <div className="equipment-alternatives-heading">
                      <div>
                        <small>{alternatives[0].movementLabel.toUpperCase()}</small>
                        <strong>Different equipment</strong>
                      </div>
                      <button className="small-button" type="button" onClick={() => setAlternativeForKey("")}>Close</button>
                    </div>
                    <p>Same movement pattern, different equipment. Loads and difficulty are not equivalent.</p>
                    <div className="equipment-alternative-list">
                      {alternatives.map((alternative) => (
                        <button
                          className="equipment-alternative-option"
                          key={alternative.exerciseKey}
                          type="button"
                          onClick={() => {
                            setAlternativeForKey("");
                            onSelect({
                              exerciseKey: alternative.exerciseKey,
                              name: alternative.name,
                              category: alternative.category,
                            });
                          }}
                        >
                          <span><strong>{alternative.name}</strong><small>{alternative.equipment}</small></span>
                          <span>Choose</span>
                        </button>
                      ))}
                    </div>
                    <small>Choosing only selects this exercise. Saved workouts stay unchanged.</small>
                  </section>
                ) : null}
              </div>
            );
          })}
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
                <NumericInput id="custom-exercise-weight" decimal value={draft.weight} max={toDisplayWeight(MAX_WEIGHT_KG, unit)} onValueChange={(weight) => setDraft((current) => ({ ...current, weight }))} />
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
  const [limitStatus, setLimitStatus] = useState("");

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
    const targetSetCount = draft.exercises.reduce((total, exercise) => total + exercise.targetSets, 0);
    if (draft.exercises.length > MAX_EXERCISES_PER_ITEM || targetSetCount > MAX_TOTAL_SETS_PER_ITEM) {
      setLimitStatus("Reduce this routine to the safe limit of 100 exercises and 500 total sets.");
      return;
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      exercises: draft.exercises
        .filter((exercise) => exercise.name.trim())
        .map((exercise) => ({ ...exercise, name: exercise.name.trim() })),
    });
  }

  function addCatalogExercise(exercise: ExerciseCatalogItem) {
    if (draft.exercises.length >= MAX_EXERCISES_PER_ITEM ||
      draft.exercises.reduce((total, item) => total + item.targetSets, 0) + 3 > MAX_TOTAL_SETS_PER_ITEM) {
      setLimitStatus("This routine has reached its safe exercise or set limit.");
      setAddingExercise(false);
      return;
    }
    setLimitStatus("");
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
                <label htmlFor={`routine-${exercise.id}-weight`}>{unit.toUpperCase()}<NumericInput id={`routine-${exercise.id}-weight`} decimal value={toDisplayWeight(exercise.targetWeightKg, unit)} max={toDisplayWeight(MAX_WEIGHT_KG, unit)} onValueChange={(weight) => updateExercise(index, { targetWeightKg: toKilograms(weight, unit) })} /></label>
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
        {limitStatus ? <p className="field-status" role="status">{limitStatus}</p> : null}
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
  const elapsed = activeWorkout ? workoutElapsedSeconds(activeWorkout, now) : 0;

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
        {activeWorkout ? <span className="timer-pill" aria-label={`Workout time ${formatDuration(elapsed)}${activeWorkout.timerPausedAt !== undefined ? ", paused" : ""}`}>{formatDuration(elapsed)}</span> : null}
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
  const [storageRecoveryRequired, setStorageRecoveryRequired] = useState(false);
  const [canOverwriteUnreadableStorage, setCanOverwriteUnreadableStorage] = useState(false);
  const [oversizedStoredData, setOversizedStoredData] = useState(false);
  const [isReplacingData, setIsReplacingData] = useState(false);
  const [sessionRescuePrompt, setSessionRescuePrompt] = useState<SessionRescuePrompt | null>(null);
  const [tab, setTab] = useState<Tab>("workout");
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [editingWorkout, setEditingWorkout] = useState(false);
  const [collapsedExerciseIds, setCollapsedExerciseIds] = useState<Set<string>>(() => new Set());
  const [showBlankWorkout, setShowBlankWorkout] = useState(false);
  const [blankName, setBlankName] = useState("Workout");
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [routineDraft, setRoutineDraft] = useState<Routine | null>(null);
  const [showProgramBlockSetup, setShowProgramBlockSetup] = useState(false);
  const [programBlockSourceId, setProgramBlockSourceId] = useState("");
  const [programBlockWeekCount, setProgramBlockWeekCount] = useState(4);
  const [programBlockDetailId, setProgramBlockDetailId] = useState<string | null>(null);
  const [historyDetail, setHistoryDetail] = useState<WorkoutSession | null>(null);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historySearchFocused, setHistorySearchFocused] = useState(false);
  const [historyKeyboardOpen, setHistoryKeyboardOpen] = useState(false);
  const [selectedExerciseKey, setSelectedExerciseKey] = useState("");
  const [progressPeriod, setProgressPeriod] = useState<ProgressPeriod>("week");
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [installGuide, setInstallGuide] = useState(false);
  const [plateCalculatorDraft, setPlateCalculatorDraft] = useState<PlateCalculatorDraft | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const importInputRef = useRef<HTMLInputElement>(null);
  const finishingRef = useRef(false);
  const skipNextSaveRef = useRef(true);
  const rescueEligibleWorkoutIdRef = useRef<string | null>(null);
  const dismissedRescuePromptRef = useRef<DismissedRescuePrompt | null>(null);
  const deferredRescueCheckRef = useRef(false);
  const progressDetailsRef = useRef<HTMLDivElement>(null);

  const activeWorkout = data.activeWorkout;
  const unit = data.settings.unit;
  const sessionRescueWorkout = activeWorkout?.id === sessionRescuePrompt?.workoutId ? activeWorkout : null;
  const workoutTimerPaused = activeWorkout?.timerPausedAt !== undefined;
  const longSessionDecisionPending = activeWorkout
    ? shouldOfferLongSessionCheck(activeWorkout, now)
    : false;
  const effortScaleSetting = data.settings.effortScale ?? "off";
  const activeEffortScale: EffortScale | null = effortScaleSetting === "off" ? null : effortScaleSetting;
  const nextSetPreviewEnabled = data.settings.nextSetPreview ?? false;
  const programBlocks = data.programBlocks ?? [];
  const programBlockDetail = programBlocks.find((block) => block.id === programBlockDetailId) ?? null;
  const otherModalOpen = Boolean(
    showBlankWorkout || showExerciseModal || routineDraft || showProgramBlockSetup || programBlockDetail ||
      historyDetail || summary || installGuide || plateCalculatorDraft,
  );

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
    const viewport = window.visualViewport;
    if (!viewport) return;
    const syncKeyboardInset = () => {
      const coveredHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setHistoryKeyboardOpen(coveredHeight > 120);
    };
    syncKeyboardInset();
    viewport.addEventListener("resize", syncKeyboardInset);
    viewport.addEventListener("scroll", syncKeyboardInset);
    return () => {
      viewport.removeEventListener("resize", syncKeyboardInset);
      viewport.removeEventListener("scroll", syncKeyboardInset);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadData()
      .then((saved) => {
        if (!cancelled) {
          skipNextSaveRef.current = true;
          setData(saved);
          const withinSafeLimits = isWithinSafeResourceLimits(saved);
          if (!withinSafeLimits) {
            setStorageRecoveryRequired(true);
            setCanOverwriteUnreadableStorage(false);
            setOversizedStoredData(true);
            setMessage("Your existing data was preserved in read-only recovery because it exceeds the new screen safety limits.");
          } else if (saved.activeWorkout) {
            rescueEligibleWorkoutIdRef.current = saved.activeWorkout.id;
            const offeredAt = Date.now();
            if (shouldOfferLongSessionCheck(saved.activeWorkout, offeredAt)) {
              setTab("workout");
            } else if (shouldOfferSessionRescue(saved.activeWorkout, offeredAt)) {
              setSessionRescuePrompt({ workoutId: saved.activeWorkout.id, offeredAt, reason: "inactivity" });
              setTab("workout");
            }
          }
          setHydrated(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStorageRecoveryRequired(true);
          setCanOverwriteUnreadableStorage(true);
          setOversizedStoredData(false);
          rescueEligibleWorkoutIdRef.current = null;
          setHydrated(true);
          setMessage("Stronger stopped before replacing any stored workout data.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || storageRecoveryRequired) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    void saveData(data).catch((error: unknown) => {
      setStorageRecoveryRequired(true);
      setCanOverwriteUnreadableStorage(false);
      setOversizedStoredData(false);
      if (error instanceof StrongerDataConflictError) {
        setMessage("Workout data changed in another tab. Reload before making more changes.");
        return;
      }
      setMessage("Saving stopped before more changes could be made. Reload and check your available iPhone storage.");
    });
  }, [data, hydrated, storageRecoveryRequired]);

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
    const workout = data.activeWorkout;
    if (!hydrated || storageRecoveryRequired || !workout || sessionRescuePrompt ||
      !shouldOfferLongSessionCheck(workout, now)) return;
    const shouldPause = workout.timerPausedAt === undefined;
    const longSessionPromptDismissed = dismissedRescuePromptRef.current?.workoutId === workout.id &&
      dismissedRescuePromptRef.current.reason === "long-session";
    if (!shouldPause && (otherModalOpen || longSessionPromptDismissed)) return;
    const expectedWorkoutId = workout.id;
    const checkAt = now;
    const timer = window.setTimeout(() => {
      if (shouldPause) {
        setData((current) => current.activeWorkout?.id === expectedWorkoutId &&
          shouldOfferLongSessionCheck(current.activeWorkout, checkAt)
          ? { ...current, activeWorkout: pauseForLongSessionCheck(current.activeWorkout, checkAt) }
          : current);
      }
      const longSessionDismissed = dismissedRescuePromptRef.current?.workoutId === expectedWorkoutId &&
        dismissedRescuePromptRef.current.reason === "long-session";
      if (otherModalOpen || longSessionDismissed) {
        deferredRescueCheckRef.current = true;
        return;
      }
      deferredRescueCheckRef.current = false;
      setSessionRescuePrompt({ workoutId: expectedWorkoutId, offeredAt: checkAt, reason: "long-session" });
      setTab("workout");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data.activeWorkout, hydrated, now, otherModalOpen, sessionRescuePrompt, storageRecoveryRequired]);

  useEffect(() => {
    const offerRescueOnReturn = () => {
      if (!hydrated || storageRecoveryRequired || document.visibilityState === "hidden") return;
      const workout = data.activeWorkout;
      if (!workout || rescueEligibleWorkoutIdRef.current !== workout.id ||
        sessionRescuePrompt?.workoutId === workout.id) return;
      const offeredAt = Date.now();
      if (shouldOfferLongSessionCheck(workout, offeredAt)) {
        if (workout.timerPausedAt === undefined) {
          setData((current) => current.activeWorkout?.id === workout.id
            ? { ...current, activeWorkout: pauseForLongSessionCheck(current.activeWorkout, offeredAt) }
            : current);
        }
        const longSessionDismissed = dismissedRescuePromptRef.current?.workoutId === workout.id &&
          dismissedRescuePromptRef.current.reason === "long-session";
        if (otherModalOpen || longSessionDismissed) {
          deferredRescueCheckRef.current = true;
          return;
        }
        deferredRescueCheckRef.current = false;
        setSessionRescuePrompt({ workoutId: workout.id, offeredAt, reason: "long-session" });
        setTab("workout");
        return;
      }
      if (otherModalOpen) {
        deferredRescueCheckRef.current = true;
        return;
      }
      deferredRescueCheckRef.current = false;
      if (dismissedRescuePromptRef.current?.workoutId === workout.id &&
        dismissedRescuePromptRef.current.reason === "inactivity") return;
      if (shouldOfferSessionRescue(workout, offeredAt)) {
        setSessionRescuePrompt({ workoutId: workout.id, offeredAt, reason: "inactivity" });
        setTab("workout");
      }
    };
    window.addEventListener("pageshow", offerRescueOnReturn);
    document.addEventListener("visibilitychange", offerRescueOnReturn);
    if (!otherModalOpen && deferredRescueCheckRef.current) offerRescueOnReturn();
    return () => {
      window.removeEventListener("pageshow", offerRescueOnReturn);
      document.removeEventListener("visibilitychange", offerRescueOnReturn);
    };
  }, [data.activeWorkout, hydrated, otherModalOpen, sessionRescuePrompt?.workoutId, storageRecoveryRequired]);

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

  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLocaleLowerCase();
    if (!query) return data.history;
    return data.history.filter((session) =>
      session.name.toLocaleLowerCase().includes(query) ||
      session.workoutDate.includes(query) ||
      session.exercises.some((exercise) => exercise.name.toLocaleLowerCase().includes(query)),
    );
  }, [data.history, historySearch]);

  const todayDateKey = localDateKey(new Date(now));
  const activeWorkoutForProgress = tab === "progress" ? data.activeWorkout : null;
  const periodProgress = useMemo(
    () => buildPeriodProgress(data.history, progressPeriod, todayDateKey, {
      activeWorkout: activeWorkoutForProgress,
      categoriesByExerciseKey: REPORT_CATEGORIES_BY_EXERCISE_KEY,
      customExerciseKeys: data.customExercises.map((exercise) => exercise.exerciseKey),
    }),
    [activeWorkoutForProgress, data.customExercises, data.history, progressPeriod, todayDateKey],
  );
  const currentReport = periodProgress.report.current;
  const comparisonReport = periodProgress.report.comparison;

  const exerciseOptions = currentReport.exercises.map((exercise) => ({
    key: exercise.exerciseKey,
    name: exercise.name,
  }));

  const effectiveSelectedExerciseKey = exerciseOptions.some((exercise) => exercise.key === selectedExerciseKey)
    ? selectedExerciseKey
    : exerciseOptions[0]?.key ?? "";

  const progressRecords = useMemo(() => {
    if (!effectiveSelectedExerciseKey) return [];
    return currentReport.sessions.flatMap((session) => {
      const exercise = session.exercises.find(
        (candidate) => candidate.exerciseKey === effectiveSelectedExerciseKey,
      );
      if (!exercise || exercise.bestWeightKg === null) return [];
      return [{
        sessionId: session.sessionId,
        workoutDate: session.workoutDate,
        timestamp: session.timestamp,
        bestWeightKg: exercise.bestWeightKg,
        bestEstimatedKg: exercise.bestEstimatedOneRepMaxKg,
        volumeKg: exercise.externalLoadVolumeKg,
      }];
    });
  }, [currentReport, effectiveSelectedExerciseKey]);
  const nextRoutine = useMemo(
    () => nextRoutineInRotation(data.history, data.routines),
    [data.history, data.routines],
  );
  const summaryWorkoutCount = currentReport.totals.sessions;
  const progressHeadline = summaryWorkoutCount === 0
    ? currentReport.emptyReason === "active-workout-excluded"
      ? "Workout in progress"
      : currentReport.emptyReason === "no-completed-work"
        ? progressPeriod === "all" ? "No completed work saved yet" : `No completed work this ${progressPeriod} yet`
        : progressPeriod === "all" ? "No workouts logged yet" : `No workouts logged this ${progressPeriod} yet`
    : progressPeriod === "all"
      ? `You completed ${summaryWorkoutCount} ${summaryWorkoutCount === 1 ? "workout" : "workouts"}`
      : `You trained ${summaryWorkoutCount === 1 ? "once" : `${summaryWorkoutCount} times`} this ${progressPeriod}`;
  const weeklyTargetSessions = Math.max(1, Math.min(7, data.settings.weeklyDays));
  const weeklyCompletedSessions = currentReport.totals.sessions;
  const weeklyProgressPercent = Math.min(100, weeklyCompletedSessions / weeklyTargetSessions * 100);
  const sessionsToTarget = Math.max(weeklyTargetSessions - weeklyCompletedSessions, 0);
  const sessionsPastTarget = Math.max(weeklyCompletedSessions - weeklyTargetSessions, 0);
  const monthWorkoutDifference = periodProgress.previous
    ? periodProgress.current.completedSessions - periodProgress.previous.completedSessions
    : null;
  const progressSupportCopy = progressPeriod === "week"
    ? sessionsToTarget > 0
      ? `${sessionsToTarget} more to reach your weekly goal`
      : sessionsPastTarget > 0
        ? `${sessionsPastTarget} ${sessionsPastTarget === 1 ? "workout" : "workouts"} beyond your weekly goal`
        : "You reached your weekly goal"
    : progressPeriod === "month"
      ? monthWorkoutDifference === null
        ? `${periodProgress.current.exerciseCount} ${periodProgress.current.exerciseCount === 1 ? "exercise" : "exercises"} logged this month`
        : monthWorkoutDifference === 0
          ? "Same workout count as this point last month"
          : `${Math.abs(monthWorkoutDifference)} ${monthWorkoutDifference > 0 ? "more" : "fewer"} ${Math.abs(monthWorkoutDifference) === 1 ? "workout" : "workouts"} than this point last month`
      : summaryWorkoutCount > 0
        ? `Across ${periodProgress.current.exerciseCount} ${periodProgress.current.exerciseCount === 1 ? "exercise" : "exercises"} in your saved history`
        : "Finish a workout to start seeing progress";
  const periodRecordKeys = new Set(periodProgress.report.highlights
    .filter((highlight) => highlight.kind === "weight-pr")
    .map((highlight) => highlight.exerciseKey));
  const strengthHighlights = periodProgress.exercises
    .filter((exercise) => exercise.bestWeightKg > 0)
    .map((exercise, index) => {
      const deltaKg = exercise.previousBestWeightKg === null
        ? null
        : Math.round((exercise.bestWeightKg - exercise.previousBestWeightKg) * 1000) / 1000;
      const isNewBest = progressPeriod !== "all" && periodRecordKeys.has(exercise.exerciseKey);
      const priority = isNewBest ? 4 : deltaKg !== null && deltaKg > 0 ? 3
        : deltaKg === 0 ? 2 : deltaKg === null ? 1 : 0;
      return { ...exercise, deltaKg, isNewBest, priority, index };
    })
    .sort((first, second) => second.priority - first.priority || first.index - second.index)
    .slice(0, 3);
  const reportRangeLabel = formatReportDateRange(currentReport.range);
  const comparisonRangeLabel = formatReportDateRange(comparisonReport?.range ?? null);
  const hasSavedTrainingDose = currentReport.totals.sessions > 0;
  const trackedDuration = currentReport.totals.measuredDurationSessions > 0
    ? formatDuration(currentReport.totals.durationSeconds)
    : "Not tracked";
  const categoryCoverage = currentReport.categories.filter((category) => category.workingSets > 0);
  const progressStrengthEmptyCopy = currentReport.emptyReason === "active-workout-excluded"
    ? "Finish the active workout to add its completed sets here."
    : currentReport.emptyReason === "no-completed-work"
      ? "Only completed sets with at least one rep appear here."
      : "Finish a workout to see exercise changes here.";
  const plateCalculatorResult = useMemo(() => plateCalculatorDraft
    ? calculatePlateLoad(
      plateCalculatorDraft.targetTotal,
      plateCalculatorDraft.barWeight,
      plateCalculatorDraft.inventory,
    )
    : null, [plateCalculatorDraft]);

  function openProgressDetails(exerciseKey?: string) {
    if (exerciseKey) setSelectedExerciseKey(exerciseKey);
    setShowProgressDetails(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => progressDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  }

  function openPlateCalculator() {
    const defaultBarWeight = unit === "kg" ? 20 : 45;
    setPlateCalculatorDraft({
      unit,
      targetTotal: defaultBarWeight,
      barWeight: defaultBarWeight,
      inventory: createEmptyPlateInventory(unit),
    });
  }

  function updateActive(update: (workout: WorkoutSession) => WorkoutSession) {
    setData((current) => current.activeWorkout && current.activeWorkout.timerPausedAt === undefined
      ? { ...current, activeWorkout: update(current.activeWorkout) }
      : current);
  }

  function toggleExercisePanel(exerciseId: string) {
    setCollapsedExerciseIds((current) => {
      const next = new Set(current);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }

  function startWorkout(workout: WorkoutSession) {
    if (data.activeWorkout && !window.confirm("Replace the workout currently in progress? Its unfinished changes will be removed.")) return;
    rescueEligibleWorkoutIdRef.current = workout.id;
    dismissedRescuePromptRef.current = null;
    setSessionRescuePrompt(null);
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
    if (data.customExercises.length >= MAX_CUSTOM_EXERCISES) {
      setMessage("The custom exercise limit has been reached. Remove an unused custom exercise before adding another.");
      return { exercise: null, created: false };
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
      startedAt: now,
      exercises: [],
    });
    setShowBlankWorkout(false);
    setBlankName("Workout");
    setEditingWorkout(true);
  }

  function addExerciseToActive(draft: ExerciseDraft) {
    if (!data.activeWorkout) return;
    const currentSetCount = data.activeWorkout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
    if (data.activeWorkout.exercises.length >= MAX_EXERCISES_PER_ITEM ||
      currentSetCount + draft.sets > MAX_TOTAL_SETS_PER_ITEM) {
      setMessage("This workout has reached its safe exercise or set limit.");
      return;
    }
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
    updateActive((workout) => {
      let invalidatedCompletedWork = false;
      const exercises = workout.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const updatedSets = exercise.sets.map((set) => set.id === setId ? { ...set, ...update } : set);
        let invalidatedRootId: string | undefined;
        const sets = updatedSets.map((set, index) => {
          if (!set.dropSetOf) {
            invalidatedRootId = set.completed && set.reps <= 0 ? set.id : undefined;
          } else if (invalidatedRootId !== set.dropSetOf) {
            const previous = updatedSets[index - 1];
            const invalidLoad = previous !== undefined &&
              !isValidDropWeightTransition(previous.weightKg, set.weightKg);
            if (!previous?.completed || set.reps <= 0 || invalidLoad) invalidatedRootId = set.dropSetOf;
          }
          if (invalidatedRootId !== (set.dropSetOf ?? set.id) || !set.completed) return set;
          invalidatedCompletedWork = true;
          const incomplete: WorkoutSet = { ...set, completed: false };
          delete incomplete.completedAt;
          delete incomplete.effort;
          return incomplete;
        });
        return { ...exercise, sets };
      });
      return {
        ...workout,
        restEndsAt: invalidatedCompletedWork ? undefined : workout.restEndsAt,
        exercises,
      };
    });
  }

  function updateSetEffort(exerciseId: string, setId: string, effort: SetEffort | undefined) {
    updateActive((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => exercise.id === exerciseId
        ? {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.id !== setId || !set.completed) return set;
            const nextSet = { ...set };
            if (effort) nextSet.effort = effort;
            else delete nextSet.effort;
            return nextSet;
          }),
        }
        : exercise),
    }));
  }

  function toggleSet(exercise: WorkoutExercise, setId: string) {
    const target = exercise.sets.find((set) => set.id === setId);
    if (!target) return;
    if (!target.completed && target.reps <= 0) {
      setMessage(`Enter at least 1 rep before completing this ${target.dropSetOf ? "drop" : "set"}.`);
      document.getElementById(`reps-${setId}`)?.focus();
      return;
    }
    const priorSegment = precedingSegment(exercise, target);
    if (!target.completed && target.dropSetOf && !priorSegment?.completed) {
      setMessage("Complete the preceding set segment before this drop.");
      document.getElementById(priorSegment ? `reps-${priorSegment.id}` : `weight-${setId}`)?.focus();
      return;
    }
    if (!target.completed && target.dropSetOf && priorSegment &&
      !isValidDropWeightTransition(priorSegment.weightKg, target.weightKg)) {
      setMessage(priorSegment.weightKg === 0
        ? "A bodyweight continuation must stay at zero weight. Record the continuation with reps."
        : "A drop continuation needs a lower weight than the preceding segment.");
      document.getElementById(`weight-${setId}`)?.focus();
      return;
    }
    const timestamp = Date.now();
    const completingFinalSegment = !target.completed && isFinalSetSegment(exercise, target);
    updateActive((workout) => ({
      ...workout,
      restEndsAt: completingFinalSegment
        ? exercise.restSeconds > 0
          ? timestamp + exercise.restSeconds * 1000
          : undefined
        : undefined,
      exercises: workout.exercises.map((item) => item.id === exercise.id
        ? {
          ...item,
          sets: item.sets.map((set, index) => {
            if (set.id === setId) return toggleSetCompletion(set, timestamp);
            const targetIndex = item.sets.findIndex((candidate) => candidate.id === setId);
            const targetRootId = target.dropSetOf ?? target.id;
            if (!target.completed || index <= targetIndex || set.dropSetOf !== targetRootId || !set.completed) return set;
            return toggleSetCompletion(set, timestamp);
          }),
        }
        : item),
    }));
  }

  function addSet(exercise: WorkoutExercise) {
    const totalSetCount = data.activeWorkout?.exercises.reduce((total, item) => total + item.sets.length, 0) ?? 0;
    if (exercise.sets.length >= MAX_SETS_PER_EXERCISE || totalSetCount >= MAX_TOTAL_SETS_PER_ITEM) {
      setMessage("This workout has reached its safe set limit.");
      return;
    }
    const newSetId = makeId("set");
    updateActive((workout) => {
      const currentExercise = workout.exercises.find((item) => item.id === exercise.id);
      const currentTotalSetCount = workout.exercises.reduce((total, item) => total + item.sets.length, 0);
      if (!currentExercise || currentExercise.sets.length >= MAX_SETS_PER_EXERCISE ||
        currentTotalSetCount >= MAX_TOTAL_SETS_PER_ITEM) return workout;
      const last = workingSets(currentExercise).at(-1);
      return {
        ...workout,
        exercises: workout.exercises.map((item) => item.id === currentExercise.id
          ? {
            ...item,
            sets: [...item.sets, {
              id: newSetId,
              weightKg: last?.weightKg ?? 0,
              reps: last?.reps ?? 8,
              completed: false,
            }],
          }
          : item),
      };
    });
  }

  function addDropSet(exercise: WorkoutExercise, sourceSetId: string) {
    const totalSetCount = data.activeWorkout?.exercises.reduce((total, item) => total + item.sets.length, 0) ?? 0;
    if (exercise.sets.length >= MAX_SETS_PER_EXERCISE || totalSetCount >= MAX_TOTAL_SETS_PER_ITEM) {
      setMessage("This workout has reached its safe set limit.");
      return;
    }
    const newSetId = makeId("set");
    updateActive((workout) => {
      const currentExercise = workout.exercises.find((item) => item.id === exercise.id);
      const currentTotalSetCount = workout.exercises.reduce((total, item) => total + item.sets.length, 0);
      if (!currentExercise || !currentExercise.sets.some((set) => set.id === sourceSetId) ||
        currentExercise.sets.length >= MAX_SETS_PER_EXERCISE ||
        currentTotalSetCount >= MAX_TOTAL_SETS_PER_ITEM) return workout;
      return {
        ...workout,
        restEndsAt: undefined,
        exercises: workout.exercises.map((item) => item.id === currentExercise.id
          ? insertDropSegment(item, sourceSetId, newSetId)
          : item),
      };
    });
  }

  function removeSet(exercise: WorkoutExercise, setId: string) {
    const set = exercise.sets.find((item) => item.id === setId);
    if (!set) return;
    const removed = set.dropSetOf
      ? [set]
      : exercise.sets.filter((item) => item.id === set.id || item.dropSetOf === set.id);
    if (removed.some((item) => item.completed) &&
      !window.confirm(set.dropSetOf
        ? "Remove this completed drop?"
        : `Remove this set${removed.length > 1 ? " and all of its drop continuations" : ""}?`)) return;
    updateActive((workout) => ({
      ...workout,
      restEndsAt: undefined,
      exercises: workout.exercises.map((item) => item.id === exercise.id
        ? removeSetWithContinuations(item, setId)
        : item),
    }));
  }

  function finishWorkout(options: {
    expectedWorkoutId?: string;
    closeAtLastActivity?: boolean;
    skipIncompleteConfirmation?: boolean;
  } = {}): boolean {
    const active = data.activeWorkout;
    if (!active || finishingRef.current ||
      (options.expectedWorkoutId !== undefined && active.id !== options.expectedWorkoutId)) return false;
    if (data.history.length >= MAX_HISTORY_SESSIONS) {
      setMessage("The history safety limit has been reached. Export a backup and remove an old workout before finishing this one.");
      return false;
    }
    const incomplete = active.exercises.reduce(
      (total, exercise) => total + exercise.sets.filter((set) => !set.completed).length,
      0,
    );
    if (!options.skipIncompleteConfirmation && incomplete > 0 &&
      !window.confirm(`Finish with ${incomplete} incomplete ${incomplete === 1 ? "set entry" : "set entries"}? Only completed work counts toward progress.`)) return false;
    finishingRef.current = true;
    const finished = finishWorkoutTimer(
      structuredClone(active),
      Date.now(),
      options.closeAtLastActivity ?? false,
    );
    setData((current) => {
      if (current.activeWorkout?.id !== finished.id || current.history.some((session) => session.id === finished.id)) return current;
      return { ...current, activeWorkout: null, history: [finished, ...current.history] };
    });
    rescueEligibleWorkoutIdRef.current = null;
    dismissedRescuePromptRef.current = null;
    setSessionRescuePrompt(null);
    setEditingWorkout(false);
    setSummary(finished);
    void requestPersistentStorage();
    window.setTimeout(() => {
      finishingRef.current = false;
    }, 500);
    return true;
  }

  function dismissSessionRescue() {
    const returnToLongSessionDecision = sessionRescuePrompt?.reason === "long-session";
    if (sessionRescuePrompt) {
      dismissedRescuePromptRef.current = {
        workoutId: sessionRescuePrompt.workoutId,
        reason: sessionRescuePrompt.reason,
      };
    }
    setSessionRescuePrompt(null);
    if (returnToLongSessionDecision) {
      window.setTimeout(() => document.getElementById("long-session-continue")?.focus(), 0);
    }
  }

  function focusActiveWorkout() {
    window.setTimeout(() => {
      document.getElementById("active-workout-title")?.focus();
    }, 0);
  }

  function continueRescuedWorkout() {
    if (!sessionRescueWorkout) return;
    if (sessionRescuePrompt?.reason === "long-session") {
      resumePausedWorkout();
      return;
    }
    dismissedRescuePromptRef.current = { workoutId: sessionRescueWorkout.id, reason: "inactivity" };
    setSessionRescuePrompt(null);
    setTab("workout");
    focusActiveWorkout();
  }

  function pauseRescuedWorkout() {
    if (!sessionRescueWorkout || sessionRescuePrompt?.reason !== "inactivity") return;
    const expectedWorkoutId = sessionRescueWorkout.id;
    setData((current) => current.activeWorkout?.id === expectedWorkoutId
      ? { ...current, activeWorkout: pauseWorkoutTimer(current.activeWorkout, Date.now()) }
      : current);
    dismissedRescuePromptRef.current = { workoutId: expectedWorkoutId, reason: "inactivity" };
    setSessionRescuePrompt(null);
    setTab("workout");
    setMessage("Workout timer paused at the last recorded activity. Logged work is unchanged.");
  }

  function resumePausedWorkout() {
    if (!activeWorkout || activeWorkout.timerPausedAt === undefined) return;
    const expectedWorkoutId = activeWorkout.id;
    const resumedAt = Date.now();
    const confirmingLongSession = shouldOfferLongSessionCheck(activeWorkout, resumedAt);
    setData((current) => {
      if (current.activeWorkout?.id !== expectedWorkoutId) return current;
      const resumedWorkout = shouldOfferLongSessionCheck(current.activeWorkout, resumedAt)
        ? confirmLongSessionContinuation(current.activeWorkout, resumedAt)
        : resumeWorkoutTimer(current.activeWorkout, resumedAt);
      return { ...current, activeWorkout: resumedWorkout };
    });
    dismissedRescuePromptRef.current = null;
    setSessionRescuePrompt(null);
    setTab("workout");
    setMessage(confirmingLongSession
      ? "Workout continued. Time spent on the three-hour check will not count toward duration."
      : "Workout timer resumed. Time spent paused will not count toward duration.");
    focusActiveWorkout();
  }

  function closeWorkoutSafely(expectedWorkoutId: string, closeAtLastActivity: boolean) {
    const workout = data.activeWorkout;
    if (!workout || workout.id !== expectedWorkoutId) return;
    const completed = completedSets(workout).length;
    const drops = completedDropSegments(workout).length;
    const timing = closeAtLastActivity ? "The timer will end at the last recorded activity." : "The paused timer will be kept.";
    if (!window.confirm(
      `Close ${workout.name} and save ${completed} completed ${completed === 1 ? "set" : "sets"}${drops ? ` plus ${drops} ${drops === 1 ? "drop" : "drops"}` : ""} to History? ${timing} Incomplete entries remain visible but do not count toward progress.`,
    )) return;
    finishWorkout({
      expectedWorkoutId,
      closeAtLastActivity,
      skipIncompleteConfirmation: true,
    });
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
    const exists = data.routines.some((item) => item.id === routine.id);
    if (!exists && data.routines.length >= MAX_ROUTINES) {
      setMessage("The routine safety limit has been reached. Remove an unused routine before adding another.");
      return;
    }
    setData((current) => {
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

  function openProgramBlockSetup() {
    setProgramBlockSourceId(data.routines[0]?.id ?? "");
    setProgramBlockWeekCount(4);
    setShowProgramBlockSetup(true);
  }

  function createProgramBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sourceRoutine = data.routines.find((routine) => routine.id === programBlockSourceId);
    if (!sourceRoutine) {
      setMessage("Choose a routine to copy first.");
      return;
    }
    if (programBlocks.length >= MAX_PROGRAM_BLOCKS) {
      setMessage("The program sandbox limit has been reached. Remove an old copy before creating another.");
      return;
    }
    const block = copyRoutineToProgramBlock(sourceRoutine, programBlockWeekCount, Date.now(), makeId);
    setData((current) => ({
      ...current,
      programBlocks: [...(current.programBlocks ?? []), block],
    }));
    setShowProgramBlockSetup(false);
    setProgramBlockDetailId(block.id);
    setMessage("Program copy created. Your routine and workouts are unchanged.");
  }

  function setProgramWeekLoad(blockId: string, weekId: string, loadPercent: number) {
    setData((current) => ({
      ...current,
      programBlocks: (current.programBlocks ?? []).map((block) =>
        block.id === blockId ? updateProgramBlockWeek(block, weekId, loadPercent) : block,
      ),
    }));
  }

  function deleteProgramBlock(block: ProgramBlock) {
    if (!window.confirm(`Delete the ${block.name} sandbox copy? Its source routine and all workouts will stay unchanged.`)) return;
    setData((current) => ({
      ...current,
      programBlocks: (current.programBlocks ?? []).filter((item) => item.id !== block.id),
    }));
    setProgramBlockDetailId(null);
    setMessage("Program copy removed. Live training data was not changed.");
  }

  async function exportData() {
    const payload = JSON.stringify({
      kind: BACKUP_KIND,
      backupVersion: BACKUP_FORMAT_VERSION,
      formatVersion: CURRENT_FORMAT_VERSION,
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

  async function exportWorkoutCsv() {
    if (!data.history.length) {
      setMessage("Finish a workout before exporting workout history.");
      return;
    }
    const file = new File(
      [buildHistoryCsv(data.history)],
      `stronger-workouts-${localDateKey()}.csv`,
      { type: "text/csv;charset=utf-8" },
    );
    const shareNavigator = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
    try {
      if (navigator.share && shareNavigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Stronger workout CSV", files: [file] });
      } else {
        const link = document.createElement("a");
        const url = URL.createObjectURL(file);
        link.href = url;
        link.download = file.name;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setMessage("Workout CSV created. It is a readable copy, not a backup.");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setMessage("The workout CSV could not be shared.");
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
    let replacement: StrongerData | null = null;
    try {
      replacement = normalizeStrongerBackup(JSON.parse(await file.text()) as unknown);
    } catch {
      // The message below deliberately does not reveal parser details from an untrusted file.
    }
    if (!replacement) {
      setMessage("This file is not a valid Stronger backup. Your current data was not changed.");
      return;
    }
    if (!window.confirm("Replace the exercise library, routines, program copies, workouts, history, and settings on this installation with this backup? This cannot be merged or undone.")) return;
    setIsReplacingData(true);
    try {
      await replaceData(replacement, { allowRecoveryOverwrite: canOverwriteUnreadableStorage });
      skipNextSaveRef.current = true;
      rescueEligibleWorkoutIdRef.current = replacement.activeWorkout?.id ?? null;
      dismissedRescuePromptRef.current = null;
      setSessionRescuePrompt(null);
      setData(replacement);
      setStorageRecoveryRequired(false);
      setCanOverwriteUnreadableStorage(false);
      setOversizedStoredData(false);
      setTab("workout");
      setMessage("Backup restored.");
    } catch {
      setMessage("The backup could not be committed. Your current on-screen data was not changed.");
    } finally {
      setIsReplacingData(false);
    }
  }

  function resetAllData() {
    if (!window.confirm("Reset Stronger and permanently remove every custom exercise, workout, routine, and setting? Export first if you may need this data.")) return;
    rescueEligibleWorkoutIdRef.current = null;
    dismissedRescuePromptRef.current = null;
    setSessionRescuePrompt(null);
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

  if (isReplacingData) {
    return (
      <main className="loading-screen" role="status">
        <span className="brand-mark large" aria-hidden="true">S</span>
        <strong>Restoring backup…</strong>
        <small>Stronger is keeping the current screen locked until storage and the app agree.</small>
      </main>
    );
  }

  if (storageRecoveryRequired) {
    return (
      <main className="loading-screen" aria-labelledby="storage-recovery-title">
        <span className="brand-mark large" aria-hidden="true">S</span>
        <h1 id="storage-recovery-title">Stored data needs attention</h1>
        <small>{canOverwriteUnreadableStorage
          ? "Stronger paused before writing starter data over a record it could not read. Reload, or restore a verified JSON backup."
          : oversizedStoredData
            ? "This version will not render or rewrite a log beyond its screen safety limits. Export the preserved data before using a cleanup or rollback build."
            : "Saving stopped because storage changed or became unavailable. Export the current on-screen data if it includes unsaved changes, then reload this tab."}</small>
        <div className="button-pair">
          <button className="secondary-button" type="button" onClick={() => window.location.reload()}>Try again</button>
          {canOverwriteUnreadableStorage ? (
            <button className="primary-button" type="button" onClick={() => importInputRef.current?.click()}>Choose backup</button>
          ) : (
            <button className="primary-button" type="button" onClick={() => void exportData()}>Export current data</button>
          )}
        </div>
        <input ref={importInputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importData(event)} />
        {message ? <small role="status">{message}</small> : null}
      </main>
    );
  }

  const restRemaining = activeWorkout?.restEndsAt && !workoutTimerPaused && !sessionRescueWorkout
    ? Math.max(0, Math.ceil((activeWorkout.restEndsAt - now) / 1000))
    : null;
  const exerciseDoneCount = activeWorkout?.exercises.filter(
    (exercise) => exercise.sets.length > 0 && exercise.sets.every((set) => set.completed && set.reps > 0),
  ).length ?? 0;
  const completedSetCount = activeWorkout ? completedSets(activeWorkout).length : 0;
  const completedDropCount = activeWorkout ? completedDropSegments(activeWorkout).length : 0;
  const totalSetCount = activeWorkout?.exercises.reduce((total, exercise) => total + workingSets(exercise).length, 0) ?? 0;
  const totalDropCount = activeWorkout?.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter(isDropSegment).length,
    0,
  ) ?? 0;
  const totalEntries = totalSetCount + totalDropCount;
  const progressPercent = totalEntries
    ? Math.round(((completedSetCount + completedDropCount) / totalEntries) * 100)
    : 0;
  const progressEstimatedValues = progressRecords.flatMap((record) =>
    record.bestEstimatedKg === null ? [] : [record.bestEstimatedKg],
  );
  const selectedExerciseHasWeightPr = periodProgress.report.highlights.some((highlight) =>
    highlight.kind === "weight-pr" && highlight.exerciseKey === effectiveSelectedExerciseKey,
  );
  const progressDetailPeriodLabel = progressPeriod === "all" ? "ALL-TIME" : `THIS ${progressPeriod.toUpperCase()}`;

  return (
    <div className="app-shell">
      <AppHeader activeWorkout={activeWorkout} now={now} onOpenSettings={() => {
        setHistorySearchFocused(false);
        setTab("settings");
      }} />

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
              {workoutTimerPaused ? (
                <section className="session-paused-card" aria-labelledby="session-paused-title">
                  <div>
                    <p className="section-kicker">{longSessionDecisionPending ? "3-HOUR CHECK" : "SESSION RESCUE"}</p>
                    <h2 id="session-paused-title">{longSessionDecisionPending ? "Still working out?" : "Workout timer paused"}</h2>
                    <p>{longSessionDecisionPending
                      ? "Stronger paused the timer after three active hours. Logged sets are safe, and paused time will not count."
                      : "Logged sets are unchanged. Resume when you are ready; paused time will not count toward duration."}</p>
                  </div>
                  <div className="button-pair">
                    <button id={longSessionDecisionPending ? "long-session-continue" : undefined} className="primary-button" type="button" onClick={resumePausedWorkout}>
                      {longSessionDecisionPending ? "Continue workout" : "Resume timer"}
                    </button>
                    <button className="secondary-button" type="button" onClick={() => {
                      if (longSessionDecisionPending) finishWorkout({ expectedWorkoutId: activeWorkout.id });
                      else closeWorkoutSafely(activeWorkout.id, false);
                    }}>{longSessionDecisionPending ? "Finish workout" : "Close safely"}</button>
                  </div>
                </section>
              ) : null}

              <fieldset className={`workout-editing-surface ${workoutTimerPaused ? "is-paused" : ""}`} disabled={workoutTimerPaused}>
              <section className="page-heading workout-heading">
                <div>
                  <p className="section-kicker">CURRENT WORKOUT · {formatDate(activeWorkout.workoutDate).toUpperCase()}</p>
                  {editingWorkout ? (
                    <input
                      id="active-workout-title"
                      className="workout-name-input"
                      aria-label="Workout name"
                      value={activeWorkout.name}
                      onChange={(event) => updateActive((workout) => ({ ...workout, name: event.target.value }))}
                    />
                  ) : <h1 id="active-workout-title" tabIndex={-1}>{activeWorkout.name}</h1>}
                </div>
                <button className="text-button" type="button" onClick={() => setEditingWorkout((value) => !value)}>
                  {editingWorkout ? "Done" : "Edit"}
                </button>
              </section>

              <section className="progress-card" aria-label="Workout progress">
                <div className="progress-copy">
                  <strong>{exerciseDoneCount} of {activeWorkout.exercises.length} exercises complete</strong>
                  <span>{completedSetCount}/{totalSetCount} sets{totalDropCount
                    ? ` · ${completedDropCount}/${totalDropCount} drops`
                    : ""}</span>
                </div>
                <div className="progress-track" aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>
              </section>

              {activeWorkout.exercises.length ? activeWorkout.exercises.map((exercise, exerciseIndex) => {
                const exerciseComplete = exercise.sets.length > 0 && exercise.sets.every((set) => set.completed);
                const exerciseWorkingSets = workingSets(exercise);
                const exerciseDropSegments = exercise.sets.filter(isDropSegment);
                const exerciseCompletedSetCount = exerciseWorkingSets.filter((set) => set.completed && set.reps > 0).length;
                const exerciseCompletedDropCount = exerciseDropSegments.filter((set) => set.completed && set.reps > 0).length;
                const exerciseExpanded = !collapsedExerciseIds.has(exercise.id);
                const exercisePanelId = `exercise-panel-${exercise.id}`;
                const nextSetPreview = nextSetPreviewEnabled
                  ? buildNextSetPreview(
                    exercise,
                    data.history,
                    toKilograms(unit === "kg" ? 2.5 : 5, unit),
                    MAX_WEIGHT_KG,
                    Boolean(activeEffortScale),
                  )
                  : null;
                return (
                  <article className={`exercise-card ${exerciseComplete ? "exercise-complete" : ""} ${exerciseExpanded ? "" : "is-collapsed"}`} key={exercise.id}>
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
                          <p className="exercise-note">{exerciseCompletedSetCount}/{exerciseWorkingSets.length} sets{exerciseDropSegments.length
                            ? ` · ${exerciseCompletedDropCount}/${exerciseDropSegments.length} drops`
                            : ""} · {exercise.restSeconds === 0 ? "Rest timer off" : `${exercise.restSeconds}s rest`}</p>
                        </div>
                      </div>
                      <div className="exercise-header-actions">
                        {editingWorkout ? (
                          <div className="stacked-actions" aria-label={`Reorder ${exercise.name}`}>
                            <button type="button" className="mini-icon-button" disabled={exerciseIndex === 0} onClick={() => moveExercise(exerciseIndex, -1)} aria-label={`Move ${exercise.name} up`}>↑</button>
                            <button type="button" className="mini-icon-button" disabled={exerciseIndex === activeWorkout.exercises.length - 1} onClick={() => moveExercise(exerciseIndex, 1)} aria-label={`Move ${exercise.name} down`}>↓</button>
                          </div>
                        ) : null}
                        <button
                          className="exercise-disclosure"
                          type="button"
                          aria-expanded={exerciseExpanded}
                          aria-controls={exercisePanelId}
                          aria-label={`${exerciseExpanded ? "Collapse" : "Expand"} ${exercise.name}`}
                          onClick={() => toggleExercisePanel(exercise.id)}
                        >
                          <span className="exercise-disclosure-icon" aria-hidden="true">›</span>
                        </button>
                      </div>
                    </header>

                    <div id={exercisePanelId} className="exercise-panel" hidden={!exerciseExpanded}>
                    {nextSetPreview ? (
                      <section className="next-set-preview" aria-label={`Optional next-set preview for ${exercise.name}`}>
                        <div className="next-set-preview-heading">
                          <span>OPTIONAL · READ-ONLY</span>
                          <strong>Consider {formatWeight(nextSetPreview.suggestedWeightKg, unit)} {unit} for set {nextSetPreview.nextSetNumber}</strong>
                        </div>
                        <p>Set {nextSetPreview.nextSetNumber} is still {formatWeight(nextSetPreview.plannedWeightKg, unit)} {unit} × {nextSetPreview.plannedReps}. These two results met or exceeded that plan:</p>
                        <div className="next-set-evidence">
                          <span><small>TODAY</small><strong>{formatWeight(nextSetPreview.todayEvidence.weightKg, unit)} {unit} × {nextSetPreview.todayEvidence.reps}</strong>{nextSetPreview.todayEvidence.effort ? <em>{formatSetEffort(nextSetPreview.todayEvidence.effort)}</em> : null}</span>
                          <span><small>{formatDate(nextSetPreview.historyEvidence.workoutDate).toUpperCase()}</small><strong>{formatWeight(nextSetPreview.historyEvidence.weightKg, unit)} {unit} × {nextSetPreview.historyEvidence.reps}</strong>{nextSetPreview.historyEvidence.effort ? <em>{formatSetEffort(nextSetPreview.historyEvidence.effort)}</em> : null}</span>
                        </div>
                        <small>This does not assess fatigue, pain, technique, or equipment. The next set stays unchanged unless you edit it.</small>
                      </section>
                    ) : null}

                    <div className="set-grid set-grid-header" aria-hidden="true">
                      <span>SET</span><span>PREVIOUS</span><span>{unit.toUpperCase()}</span><span>REPS</span><span>DONE</span>
                    </div>
                    <div className="set-list">
                      {exercise.sets.map((set) => {
                        const setNumber = workingSetNumber(exercise, set);
                        const currentDropNumber = dropNumber(exercise, set);
                        const setLabel = currentDropNumber ? `drop ${currentDropNumber} after set ${setNumber}` : `set ${setNumber}`;
                        const prior = currentDropNumber
                          ? previousDropSet(
                            data.history,
                            exercise.exerciseKey,
                            exercise.name,
                            setNumber - 1,
                            currentDropNumber - 1,
                          )
                          : previousSet(data.history, exercise.exerciseKey, exercise.name, setNumber - 1);
                        return (
                          <div className={`set-entry ${currentDropNumber ? "is-drop-segment" : ""}`} key={set.id}>
                            <div className={`set-grid set-row ${set.completed ? "is-done" : ""}`}>
                              <span className="set-number" aria-label={setLabel}>{currentDropNumber ? `D${currentDropNumber}` : setNumber}</span>
                              <span className="previous-value">{prior ? `${formatWeight(prior.weightKg, unit)} × ${prior.reps}` : "—"}</span>
                              <label className="visually-hidden" htmlFor={`weight-${set.id}`}>Weight in {unit} for {exercise.name}, {setLabel}</label>
                              <NumericInput
                                id={`weight-${set.id}`}
                                className="set-input"
                                decimal
                                enterKeyHint="next"
                                value={toDisplayWeight(set.weightKg, unit)}
                                max={toDisplayWeight(MAX_WEIGHT_KG, unit)}
                                onValueChange={(weight) => updateSet(exercise.id, set.id, { weightKg: toKilograms(weight, unit) })}
                              />
                              <label className="visually-hidden" htmlFor={`reps-${set.id}`}>Repetitions for {exercise.name}, {setLabel}</label>
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
                                aria-label={`${set.completed ? "Mark" : "Complete"} ${exercise.name} ${setLabel}${set.completed ? " incomplete" : ""}`}
                                onClick={() => toggleSet(exercise, set.id)}
                              >✓</button>
                              {editingWorkout ? (
                                <button className="remove-set-button" type="button" onClick={() => removeSet(exercise, set.id)} aria-label={`Remove ${exercise.name} ${setLabel}`}>Remove</button>
                              ) : null}
                            </div>
                            {activeEffortScale && set.completed ? (
                              <div className="set-effort-row">
                                <label htmlFor={`effort-${set.id}`}>
                                  <span>{set.effort && set.effort.scale !== activeEffortScale
                                    ? `Replace with ${effortScaleLabel(activeEffortScale)}`
                                    : effortScaleLabel(activeEffortScale)}</span>
                                  <select
                                    id={`effort-${set.id}`}
                                    aria-label={`${effortScaleLabel(activeEffortScale)} for ${exercise.name}, ${setLabel}`}
                                    value={set.effort?.scale === activeEffortScale ? String(set.effort.value) : ""}
                                    onChange={(event) => updateSetEffort(
                                      exercise.id,
                                      set.id,
                                      event.target.value === ""
                                        ? undefined
                                        : { scale: activeEffortScale, value: Number(event.target.value) },
                                    )}
                                  >
                                    <option value="">{set.effort && set.effort.scale !== activeEffortScale
                                      ? `Keep ${formatSetEffort(set.effort)}`
                                      : "Not recorded"}</option>
                                    {effortValues(activeEffortScale).map((value) => (
                                      <option key={value} value={value}>{effortOptionLabel(activeEffortScale, value)}</option>
                                    ))}
                                  </select>
                                </label>
                                <small>{effortHint(activeEffortScale)}</small>
                              </div>
                            ) : null}
                            {isFinalSetSegment(exercise, set) ? (
                              <div className="set-continuation-row">
                                <button
                                  type="button"
                                  aria-label={currentDropNumber
                                    ? `Add drop ${currentDropNumber + 1} to ${exercise.name}, set ${setNumber}`
                                    : `Add drop to ${exercise.name}, set ${setNumber}`}
                                  onClick={() => addDropSet(exercise, set.id)}
                                >
                                  {currentDropNumber ? "+ Add another drop" : "+ Add drop"}
                                </button>
                                {currentDropNumber ? <small>Continuation of set {setNumber}</small> : null}
                              </div>
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
                    </div>
                  </article>
                );
              }) : <EmptyState title="Add your first exercise" copy="This workout is empty. Add an exercise, then enter weight and reps as you train." />}

              <button className="secondary-button full-width" type="button" onClick={() => setShowExerciseModal(true)}>+ Add exercise</button>
              <button className="finish-button" type="button" onClick={() => { finishWorkout(); }}>Finish workout</button>
              <button
                className="danger-link"
                type="button"
                onClick={() => {
                  if (!window.confirm("Discard this unfinished workout? This cannot be undone.")) return;
                  const expectedWorkoutId = activeWorkout.id;
                  rescueEligibleWorkoutIdRef.current = null;
                  dismissedRescuePromptRef.current = null;
                  setSessionRescuePrompt(null);
                  setData((current) => current.activeWorkout?.id === expectedWorkoutId
                    ? { ...current, activeWorkout: null }
                    : current);
                }}
              >Discard workout</button>
              </fieldset>
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

              <section className="section-block program-lab">
                <div className="section-heading">
                  <div><p className="section-kicker">EXPERIMENTAL · COPIED DATA</p><h2>Program lab</h2></div>
                  <button className="text-button" type="button" onClick={openProgramBlockSetup} disabled={!data.routines.length}>New copy</button>
                </div>
                <p className="section-copy">Preview a multi-week block without changing a routine or starting a workout. Every week begins at the copied targets.</p>
                {programBlocks.length ? (
                  <div className="program-block-list">
                    {programBlocks.map((block) => (
                      <article className="program-block-card" key={block.id}>
                        <button type="button" onClick={() => setProgramBlockDetailId(block.id)}>
                          <span><strong>{block.name}</strong><small>{block.weeks.length} weeks · copied from {block.sourceRoutineName}</small></span>
                          <span aria-hidden="true">Review →</span>
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="program-lab-empty">
                    <strong>No sandbox copies</strong>
                    <span>Create one only when you want to explore a block. Nothing is applied automatically.</span>
                  </div>
                )}
                <button className="secondary-button full-width" type="button" onClick={openProgramBlockSetup} disabled={!data.routines.length}>
                  {data.routines.length ? "Create a program copy" : "Create a routine first"}
                </button>
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
            <input
              type="search"
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
              onFocus={() => setHistorySearchFocused(true)}
              onBlur={() => setHistorySearchFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              placeholder="Search workout or exercise"
            />
          </label>
          {filteredHistory.length ? (
            <div className="history-list">
              {filteredHistory.map((session) => (
                <article className="history-card" key={session.id}>
                  <button type="button" onClick={() => setHistoryDetail(session)}>
                    <span className="history-date"><strong>{session.workoutDate.slice(8)}</strong><small>{new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(`${session.workoutDate}T12:00:00`))}</small></span>
                    <span className="history-main"><strong>{session.name}</strong><small>{session.exercises.length} exercises · {completedSets(session).length} sets{completedDropSegments(session).length
                      ? ` · ${completedDropSegments(session).length} drops`
                      : ""}</small></span>
                    <span className="history-metric"><strong>{formatVolume(workoutVolumeKg(session), unit)}</strong><small>{formatDuration(workoutElapsedSeconds(session, now))}</small></span>
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
        <main className="progress-page">
          <section className="page-heading progress-page-heading">
            <p className="eyebrow">USEFUL SIGNALS ONLY</p>
            <h1>Progress</h1>
          </section>

          <div className="progress-period-tabs" role="group" aria-label="Progress period">
            {(["week", "month", "all"] as ProgressPeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={progressPeriod === period}
                onClick={() => setProgressPeriod(period)}
              >{period === "all" ? "All time" : `${period[0].toUpperCase()}${period.slice(1)}`}</button>
            ))}
          </div>

          <section className="progress-story-card" aria-labelledby="progress-story-title">
            <div className="progress-story-copy">
              <div className="progress-live-context">
                <strong>{progressPeriod === "all" ? "SAVED HISTORY" : "LIVE"}</strong>
                <span>{reportRangeLabel}</span>
              </div>
              <h2 id="progress-story-title">{progressHeadline}</h2>
              <p>{progressSupportCopy}</p>
            </div>

            {currentReport.dataQuality.activeWorkoutHasReportableWork ? (
              <p className="progress-report-notice" role="note">
                <strong>Active workout not included yet.</strong> Finish it to add those sets to this report.
              </p>
            ) : null}

            {progressPeriod === "week" ? (
              <div className="progress-goal-row">
                <div
                  className="progress-goal-track"
                  role="progressbar"
                  aria-label="Weekly workout target"
                  aria-valuemin={0}
                  aria-valuemax={weeklyTargetSessions}
                  aria-valuenow={Math.min(weeklyCompletedSessions, weeklyTargetSessions)}
                >
                  <span style={{ width: `${weeklyProgressPercent}%` }} />
                </div>
                <strong>{weeklyCompletedSessions} <span>of {weeklyTargetSessions}</span></strong>
              </div>
            ) : null}

            {hasSavedTrainingDose ? (
              <section className="progress-dose-block" aria-labelledby="progress-dose-title">
                <div className="progress-dose-heading">
                  <p className="section-kicker" id="progress-dose-title">TRAINING DOSE</p>
                  <span>{currentReport.totals.daysTrained} {currentReport.totals.daysTrained === 1 ? "day" : "days"}</span>
                </div>
                <p className="progress-dose-summary">
                  <strong>{currentReport.totals.workingSets}</strong> working {currentReport.totals.workingSets === 1 ? "set" : "sets"}
                  <span aria-hidden="true"> · </span>
                  <strong>{currentReport.totals.totalReps.toLocaleString("en-US")}</strong> reps
                  <span aria-hidden="true"> · </span>
                  <strong>{currentReport.totals.drops}</strong> {currentReport.totals.drops === 1 ? "drop" : "drops"}
                </p>
                <dl className="progress-dose-details">
                  <div>
                    <dt>External-load volume</dt>
                    <dd>{formatVolume(currentReport.totals.externalLoadVolumeKg, unit)}</dd>
                  </div>
                  <div>
                    <dt>Tracked time</dt>
                    <dd>{trackedDuration}</dd>
                  </div>
                </dl>
                {comparisonReport ? (
                  <p className="progress-dose-comparison">
                    <span>Previous matched period · {comparisonRangeLabel}</span>
                    <strong>{comparisonReport.totals.sessions} {comparisonReport.totals.sessions === 1 ? "workout" : "workouts"} · {comparisonReport.totals.workingSets} sets · {comparisonReport.totals.totalReps.toLocaleString("en-US")} reps · {comparisonReport.totals.drops} {comparisonReport.totals.drops === 1 ? "drop" : "drops"}</strong>
                  </p>
                ) : null}
                {categoryCoverage.length ? (
                  <div className="progress-coverage">
                    <p className="section-kicker">PRIMARY CATEGORY COVERAGE</p>
                    <ul aria-label="Working sets by primary exercise category">
                      {categoryCoverage.map((category) => (
                        <li key={category.category}>
                          <strong>{category.category}</strong>
                          <span>{category.workingSets} {category.workingSets === 1 ? "set" : "sets"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {currentReport.dataQuality.zeroExternalLoadWorkingSets > 0 ? (
                  <p className="progress-dose-note">Bodyweight work counts in sets and reps; external-load volume excludes body mass.</p>
                ) : null}
                {currentReport.totals.drops > 0 || (comparisonReport?.totals.drops ?? 0) > 0 ? (
                  <p className="progress-dose-note">Drop reps and external-load volume are included above; drops do not count as working sets or records.</p>
                ) : null}
                {categoryCoverage.some((category) => category.category === "Unclassified") ? (
                  <p className="progress-dose-note">Custom exercises remain Unclassified instead of being assigned a guessed category.</p>
                ) : null}
                {currentReport.dataQuality.missingDurationSessions > 0 || currentReport.dataQuality.invalidDurationSessions > 0 ? (
                  <p className="progress-dose-note">Time is shown only for workouts with a valid recorded duration.</p>
                ) : null}
              </section>
            ) : null}

            <div className="progress-strength-block">
              <p className="section-kicker">GETTING STRONGER</p>
              {strengthHighlights.length ? (
                <ul className="progress-strength-list">
                  {strengthHighlights.map((exercise) => {
                    const comparisonPeriod = progressPeriod === "week" ? "last week" : "last month";
                    const status = progressPeriod === "all" ? "All-time best"
                      : exercise.isNewBest ? "NEW BEST"
                        : exercise.deltaKg === null ? "No comparison yet"
                          : exercise.deltaKg > 0 ? `+${formatWeight(exercise.deltaKg, unit)} ${unit}`
                            : exercise.deltaKg === 0 ? `Same as ${comparisonPeriod}`
                              : `Best this ${progressPeriod}`;
                    const positive = exercise.isNewBest || (exercise.deltaKg !== null && exercise.deltaKg > 0);
                    return (
                      <li key={exercise.exerciseKey}>
                        <button
                          type="button"
                          onClick={() => openProgressDetails(exercise.exerciseKey)}
                          aria-label={`${exercise.name}, ${formatWeight(exercise.bestWeightKg, unit)} ${unit} best, ${status}. Open ${progressDetailPeriodLabel.toLocaleLowerCase()} details.`}
                        >
                          <span className="progress-strength-main">
                            <strong>{exercise.name}</strong>
                            <small>{formatWeight(exercise.bestWeightKg, unit)} {unit} best</small>
                          </span>
                          <span className={`progress-change${positive ? " is-positive" : ""}`}>{status}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="progress-strength-empty">
                  {periodProgress.current.completedSessions
                    ? "No weighted exercises to compare in this period."
                    : progressStrengthEmptyCopy}
                </p>
              )}
              {exerciseOptions.length ? (
                <button
                  className="progress-see-all"
                  type="button"
                  aria-expanded={showProgressDetails}
                  aria-controls="progress-exercise-details"
                  onClick={() => showProgressDetails ? setShowProgressDetails(false) : openProgressDetails()}
                >
                  {showProgressDetails ? "Hide exercise details" : "See all exercises"}
                </button>
              ) : null}
            </div>
          </section>

          <button
            className="progress-next-card"
            type="button"
            onClick={() => {
              setTab("workout");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label={activeWorkout
              ? `Continue ${activeWorkout.name} in Workout`
              : nextRoutine
                ? `Go to ${nextRoutine.name} in Workout`
                : "Go to Workout to choose or create a routine"}
          >
            <span>
              <small>{activeWorkout ? "WORKOUT IN PROGRESS" : "NEXT IN YOUR ROUTINE"}</small>
              <strong>{activeWorkout?.name ?? nextRoutine?.name ?? "Choose or create a routine"}</strong>
            </span>
            <span className="progress-next-action">Open Workout</span>
          </button>

          {showProgressDetails && exerciseOptions.length ? (
            <div ref={progressDetailsRef} id="progress-exercise-details" className="progress-exercise-details">
              <div className="progress-detail-heading">
                <p className="section-kicker">{progressDetailPeriodLabel} EXERCISE DETAIL</p>
                <h2>Exercise progress</h2>
                <p>Choose one exercise for records and its best-weight trend in the selected period.</p>
              </div>
              <label className="select-card">Exercise
                <select value={effectiveSelectedExerciseKey} onChange={(event) => setSelectedExerciseKey(event.target.value)}>
                  {exerciseOptions.map((exercise) => <option key={exercise.key} value={exercise.key}>{exercise.name}</option>)}
                </select>
              </label>
              {selectedExerciseHasWeightPr ? <div className="milestone-card"><span aria-hidden="true">★</span><div><strong>New best weight</strong><small>This period includes a new all-time high for this exercise.</small></div></div> : null}
              <section className="stat-grid" aria-label={`${progressDetailPeriodLabel.toLocaleLowerCase()} exercise records`}>
                <article><small>HEAVIEST SET</small><strong>{progressRecords.length ? formatWeight(Math.max(...progressRecords.map((record) => record.bestWeightKg)), unit) : "—"}<em>{unit}</em></strong></article>
                <article><small>EST. ONE-REP MAX</small><strong>{progressEstimatedValues.length ? formatWeight(Math.max(...progressEstimatedValues), unit) : "—"}{progressEstimatedValues.length ? <em>{unit}</em> : null}</strong></article>
                <article><small>TRAINING VOLUME</small><strong>{formatVolume(progressRecords.reduce((total, record) => total + record.volumeKg, 0), unit)}</strong></article>
              </section>
              <section className="trend-card">
                <div className="section-heading compact">
                  <div><p className="section-kicker">HEAVIEST SET BY WORKOUT</p><h2>Recent trend</h2></div>
                  <span>{progressRecords.length === 1 ? "One workout logged" : `${progressRecords.length} workouts`}</span>
                </div>
                <div className="bar-chart" aria-label="Heaviest completed set by workout">
                  {progressRecords.slice(-5).map((record) => {
                    const maximum = Math.max(...progressRecords.slice(-5).map((item) => item.bestWeightKg), 1);
                    const height = Math.max(10, (record.bestWeightKg / maximum) * 100);
                    return (
                      <div className="bar-column" key={record.sessionId} title={`${formatDate(record.workoutDate)}: ${formatWeight(record.bestWeightKg, unit)} ${unit}`}>
                        <span className="bar-value">{formatWeight(record.bestWeightKg, unit)}</span>
                        <span className="bar" style={{ height: `${height}%` }} />
                        <small>{record.workoutDate.slice(5).replace("-", "/")}</small>
                      </div>
                    );
                  })}
                </div>
                <p className="chart-note">{progressRecords.length === 1 ? "More sessions are needed for a trend. " : ""}Each bar shows the heaviest completed working set in that workout. Drop segments are not used for best-weight records.</p>
              </section>
            </div>
          ) : null}
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
            <label className="setting-row" htmlFor="effort-scale">
              <span>
                <strong>Effort tracking</strong>
                <small id="effort-scale-help">{activeEffortScale
                  ? effortHint(activeEffortScale)
                  : "Optional and off by default. Existing effort entries are kept when hidden."}</small>
              </span>
              <select
                id="effort-scale"
                aria-label="Effort tracking"
                aria-describedby="effort-scale-help"
                value={effortScaleSetting}
                onChange={(event) => setData((current) => ({
                  ...current,
                  settings: {
                    ...current.settings,
                    effortScale: event.target.value as NonNullable<StrongerData["settings"]["effortScale"]>,
                  },
                }))}
              >
                <option value="off">Off</option>
                <option value="rpe">RPE</option>
                <option value="rir">RIR</option>
              </select>
            </label>
            <div className="setting-row">
              <div>
                <strong>Next-set previews</strong>
                <small>Off by default. Shows a small evidence-backed prompt after two matching results; never edits a set.</small>
              </div>
              <button
                className="theme-switch"
                type="button"
                role="switch"
                aria-label="Next-set previews"
                aria-checked={nextSetPreviewEnabled}
                onClick={() => setData((current) => ({
                  ...current,
                  settings: { ...current.settings, nextSetPreview: !(current.settings.nextSetPreview ?? false) },
                }))}
              >
                <span className="theme-switch-label" aria-hidden="true">{nextSetPreviewEnabled ? "On" : "Off"}</span>
                <span className="theme-switch-track" aria-hidden="true"><span /></span>
              </button>
            </div>
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
            <p className="section-kicker">TEMPORARY TOOL</p><h2>Plate calculator</h2>
            <p className="section-copy">Shows which plates to load on each side for your target weight. It never changes your workout.</p>
            <button className="secondary-button full-width" type="button" onClick={openPlateCalculator}>Open plate calculator</button>
          </section>

          <section className="section-block settings-section">
            <p className="section-kicker">IPHONE APP</p><h2>Install & offline</h2>
            <p className="section-copy">Open once online, then add Stronger from Safari to your Home Screen. The app shell works offline after that first complete load.</p>
            <button className="secondary-button full-width" type="button" onClick={() => setInstallGuide(true)}>{isStandalone ? "Review install & data notes" : "Install on iPhone"}</button>
          </section>

          <section className="section-block settings-section">
            <p className="section-kicker">LOCAL DATA</p><h2>Backup & restore</h2>
            <p className="section-copy">JSON is the complete backup you can restore. CSV is a readable workout-history copy for spreadsheets.</p>
            <div className="button-pair">
              <button className="primary-button" type="button" onClick={() => void exportData()}>Export JSON</button>
              <button className="secondary-button" type="button" onClick={() => importInputRef.current?.click()}>Import JSON</button>
            </div>
            <button className="secondary-button full-width backup-csv-button" type="button" onClick={() => void exportWorkoutCsv()} disabled={!data.history.length}>Export workout CSV</button>
            <p className="backup-export-note">CSV cannot be imported and does not replace your JSON backup.</p>
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

      {createPortal(<nav
        className={`bottom-nav${tab === "history" && (historySearchFocused || historyKeyboardOpen) ? " is-history-searching" : ""}`}
        aria-label="Main navigation"
        hidden={otherModalOpen || Boolean(sessionRescueWorkout && sessionRescuePrompt)}
      >
        {([
          ["workout", "▰", "Workout"],
          ["history", "◷", "History"],
          ["progress", "↗", "Progress"],
          ["settings", "••", "Settings"],
        ] as const).map(([itemTab, icon, label]) => (
          <button key={itemTab} type="button" className={tab === itemTab ? "active" : ""} aria-current={tab === itemTab ? "page" : undefined} onClick={() => {
            setHistorySearchFocused(false);
            setTab(itemTab);
            const workout = data.activeWorkout;
            if (itemTab === "workout" && !otherModalOpen && workout && rescueEligibleWorkoutIdRef.current === workout.id &&
              !sessionRescuePrompt) {
              const offeredAt = Date.now();
              if (shouldOfferLongSessionCheck(workout, offeredAt)) {
                if (workout.timerPausedAt === undefined) {
                  setData((current) => current.activeWorkout?.id === workout.id
                    ? { ...current, activeWorkout: pauseForLongSessionCheck(current.activeWorkout, offeredAt) }
                    : current);
                }
                const longSessionDismissed = dismissedRescuePromptRef.current?.workoutId === workout.id &&
                  dismissedRescuePromptRef.current.reason === "long-session";
                if (!longSessionDismissed) {
                  setSessionRescuePrompt({ workoutId: workout.id, offeredAt, reason: "long-session" });
                }
              } else if (shouldOfferSessionRescue(workout, offeredAt) &&
                !(dismissedRescuePromptRef.current?.workoutId === workout.id &&
                  dismissedRescuePromptRef.current.reason === "inactivity")) {
                setSessionRescuePrompt({ workoutId: workout.id, offeredAt, reason: "inactivity" });
              }
            }
          }}>
            <span aria-hidden="true">{icon}</span><small>{label}</small>
          </button>
        ))}
      </nav>, document.body)}

      {message ? <div className={`toast ${restRemaining !== null ? "with-rest" : ""}`} role="status">{message}</div> : null}

      {sessionRescueWorkout && sessionRescuePrompt ? (
        <Modal
          eyebrow={sessionRescuePrompt.reason === "long-session" ? "3-HOUR CHECK" : "SESSION RESCUE"}
          title={sessionRescuePrompt.reason === "long-session" ? "Still working out?" : "Unfinished workout found"}
          onClose={dismissSessionRescue}
          initialFocus="primary"
          descriptionId="session-rescue-description session-rescue-note"
          closeLabel={sessionRescuePrompt.reason === "long-session" ? "Close and keep workout paused" : "Close"}
        >
          <div id="session-rescue-description" className="session-rescue-copy">
            {sessionRescuePrompt.reason === "long-session" ? (
              <p><strong>{sessionRescueWorkout.name}</strong> reached three active hours, so Stronger paused the timer. Logged sets are safe, and paused time will not count.</p>
            ) : (
              <p><strong>{sessionRescueWorkout.name}</strong> has been inactive for {formatDuration(
                sessionInactivityMs(sessionRescueWorkout, sessionRescuePrompt.offeredAt) / 1000,
              )}.</p>
            )}
            <p>{completedSetCount} of {totalSetCount} {totalSetCount === 1 ? "set is" : "sets are"} complete. {sessionRescuePrompt.reason === "long-session"
              ? "Choose whether to continue or finish the workout."
              : "Nothing will be changed until you choose an action."}</p>
          </div>
          <div className="session-rescue-actions">
            <button className="primary-button" type="button" onClick={continueRescuedWorkout} data-modal-primary>
              Continue workout
            </button>
            {sessionRescuePrompt.reason === "long-session" ? (
              <button className="secondary-button" type="button" onClick={() => finishWorkout({ expectedWorkoutId: sessionRescueWorkout.id })}>
                Finish workout
              </button>
            ) : (
              <>
                <button className="secondary-button" type="button" onClick={pauseRescuedWorkout}>
                  Pause timer
                </button>
                <button className="secondary-button" type="button" onClick={() => closeWorkoutSafely(sessionRescueWorkout.id, true)}>
                  Close safely
                </button>
              </>
            )}
          </div>
          <small id="session-rescue-note">{sessionRescuePrompt.reason === "long-session"
            ? "Closing this check keeps the workout paused. Finish saves it to History; it never discards logged sets."
            : "Pause excludes the time since your last recorded activity. Close saves the workout to History; it never discards it."}</small>
        </Modal>
      ) : null}

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

      {showProgramBlockSetup ? (
        <Modal eyebrow="PROGRAM LAB · SANDBOX" title="Copy a routine into a block" onClose={() => setShowProgramBlockSetup(false)}>
          <form className="form-stack" onSubmit={createProgramBlock}>
            <label htmlFor="program-source-routine">Routine to copy
              <select id="program-source-routine" value={programBlockSourceId} onChange={(event) => setProgramBlockSourceId(event.target.value)} required>
                {data.routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}
              </select>
            </label>
            <label htmlFor="program-week-count">Block length
              <select id="program-week-count" value={programBlockWeekCount} onChange={(event) => setProgramBlockWeekCount(Number(event.target.value))}>
                {Array.from(
                  { length: MAX_PROGRAM_BLOCK_WEEKS - MIN_PROGRAM_BLOCK_WEEKS + 1 },
                  (_, index) => index + MIN_PROGRAM_BLOCK_WEEKS,
                ).map((weeks) => <option key={weeks} value={weeks}>{weeks} weeks</option>)}
              </select>
            </label>
            <div className="program-safety-note">
              <strong>A snapshot is made now.</strong>
              <p>Later edits to either copy stay separate. This experiment cannot start workouts or overwrite the source routine.</p>
            </div>
            <button className="primary-button" type="submit" disabled={!programBlockSourceId}>Create sandbox copy</button>
          </form>
        </Modal>
      ) : null}

      {programBlockDetail ? (
        <Modal eyebrow="PROGRAM LAB · COPIED DATA" title={programBlockDetail.name} onClose={() => setProgramBlockDetailId(null)} wide initialFocus="close">
          <div className="program-safety-note">
            <strong>Preview only · created {formatHeaderDate(new Date(programBlockDetail.createdAt))}</strong>
            <p>Percentages are manual planning math, not recommendations. No value here can change {programBlockDetail.sourceRoutineName} or an active workout.</p>
          </div>
          <div className="program-week-list">
            {programBlockDetail.weeks.map((week, weekIndex) => (
              <article className="program-week-card" key={week.id}>
                <div className="program-week-heading">
                  <div><small>WEEK {weekIndex + 1}</small><strong>{week.loadPercent}% of copied load</strong></div>
                  <label htmlFor={`program-week-${week.id}`}>Load
                    <select
                      id={`program-week-${week.id}`}
                      aria-label={`Week ${weekIndex + 1} copied load percentage`}
                      value={week.loadPercent}
                      onChange={(event) => setProgramWeekLoad(programBlockDetail.id, week.id, Number(event.target.value))}
                    >
                      {Array.from(
                        { length: (MAX_PROGRAM_BLOCK_LOAD_PERCENT - MIN_PROGRAM_BLOCK_LOAD_PERCENT) / 5 + 1 },
                        (_, index) => MIN_PROGRAM_BLOCK_LOAD_PERCENT + index * 5,
                      ).map((percent) => (
                        <option key={percent} value={percent}>{percent}%</option>
                      ))}
                    </select>
                  </label>
                </div>
                <details>
                  <summary>Preview {programBlockDetail.exercises.length} exercises</summary>
                  <div className="program-target-list">
                    {programBlockDetail.exercises.map((exercise) => (
                      <div key={exercise.id}>
                        <span><strong>{exercise.name}</strong><small>{exercise.targetSets} sets × {exercise.targetReps} reps</small></span>
                        <strong>{exercise.targetWeightKg > 0
                          ? `${formatWeight(programBlockTargetWeight(exercise.targetWeightKg, week), unit)} ${unit}`
                          : "Unloaded"}</strong>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>
          <div className="button-pair">
            <button className="primary-button" type="button" onClick={() => setProgramBlockDetailId(null)}>Done</button>
            <button className="secondary-button danger-text" type="button" onClick={() => deleteProgramBlock(programBlockDetail)}>Delete copy</button>
          </div>
        </Modal>
      ) : null}

      {plateCalculatorDraft && plateCalculatorResult ? (
        <Modal
          eyebrow="TEMPORARY TOOL · NO SET CHANGES"
          title="Plate calculator"
          onClose={() => setPlateCalculatorDraft(null)}
          wide
        >
          <div className="plate-calculator-intro">
            <p>Enter your target, bar weight, and available plate pairs. The result shows what to load on each side.</p>
            <small>One pair = one plate per side. Add collars to the bar weight if needed.</small>
          </div>

          <div className="plate-calculator-loads">
            <label htmlFor="plate-target-load">Target total ({plateCalculatorDraft.unit})
              <NumericInput
                id="plate-target-load"
                value={plateCalculatorDraft.targetTotal}
                onValueChange={(targetTotal) => setPlateCalculatorDraft((current) => current ? { ...current, targetTotal } : current)}
                decimal
                max={MAX_CALCULATOR_LOAD}
                enterKeyHint="next"
              />
            </label>
            <label htmlFor="plate-bar-weight">Bar weight ({plateCalculatorDraft.unit})
              <NumericInput
                id="plate-bar-weight"
                value={plateCalculatorDraft.barWeight}
                onValueChange={(barWeight) => setPlateCalculatorDraft((current) => current ? { ...current, barWeight } : current)}
                decimal
                max={MAX_CALCULATOR_LOAD}
                enterKeyHint="done"
              />
            </label>
          </div>

          <fieldset className="plate-inventory">
            <legend>Available matching pairs</legend>
            <p>Enter complete pairs only.</p>
            <div className="plate-inventory-grid">
              {plateCalculatorDraft.inventory.map((item, index) => (
                <label key={item.plateWeight} htmlFor={`plate-pairs-${index}`}>
                  <span><strong>{formatPlateWeight(item.plateWeight)}</strong> {plateCalculatorDraft.unit}</span>
                  <select
                    id={`plate-pairs-${index}`}
                    aria-label={`${formatPlateWeight(item.plateWeight)} ${plateCalculatorDraft.unit} plate pairs available`}
                    value={item.availablePairs}
                    onChange={(event) => {
                      const availablePairs = Number(event.target.value);
                      setPlateCalculatorDraft((current) => current ? {
                        ...current,
                        inventory: current.inventory.map((candidate, candidateIndex) => candidateIndex === index
                          ? { ...candidate, availablePairs }
                          : candidate),
                      } : current);
                    }}
                  >
                    {Array.from({ length: MAX_PLATE_PAIRS_PER_SIZE + 1 }, (_, count) => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>

          <section className={`plate-result ${plateCalculatorResult.targetBelowBar ? "has-warning" : ""}`} aria-live="polite">
            <small>LOAD ON THE BAR</small>
            <strong>{formatPlateWeight(plateCalculatorResult.actualTotal)} <span>{plateCalculatorDraft.unit}</span></strong>
            <p>{plateCalculatorResult.targetBelowBar
              ? "Target is lighter than the entered bar. Use a lighter bar or raise the target."
              : plateCalculatorResult.exact
                ? "Exact target with the selected inventory."
                : `Closest load without exceeding target: ${formatPlateWeight(plateCalculatorResult.actualTotal)} ${plateCalculatorDraft.unit} (${formatPlateWeight(plateCalculatorResult.shortfall)} ${plateCalculatorDraft.unit} under).`}</p>
            <div className="plate-per-side">
              <span>Each side</span>
              {plateCalculatorResult.platesPerSide.length ? (
                <ul>
                  {plateCalculatorResult.platesPerSide.map((item) => (
                    <li key={item.plateWeight}>{item.platesPerSide} × {formatPlateWeight(item.plateWeight)} {plateCalculatorDraft.unit}</li>
                  ))}
                </ul>
              ) : <strong>Bar only · no plates per side</strong>}
            </div>
          </section>

          <div className="program-safety-note plate-safety-note">
            <strong>Verify before loading.</strong>
            <p>Check the bar, plates, collars, and both sides before lifting. This tool never changes your workout data.</p>
          </div>
          <button className="primary-button full-width" type="button" onClick={() => setPlateCalculatorDraft(null)}>Done</button>
        </Modal>
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
            <div><small>DURATION</small><strong>{formatDuration(workoutElapsedSeconds(historyDetail, now))}</strong></div>
            <div><small>SETS / DROPS</small><strong>{completedSets(historyDetail).length} / {completedDropSegments(historyDetail).length}</strong></div>
            <div><small>VOLUME</small><strong>{formatVolume(workoutVolumeKg(historyDetail), unit)}</strong></div>
          </div>
          <div className="history-detail-list">
            {historyDetail.exercises.map((exercise) => (
              <article key={exercise.id}>
                <h3>{exercise.name}</h3>
                <div>{exercise.sets.length
                  ? exercise.sets.map((set) => (
                    <span
                      className={[
                        set.dropSetOf ? "history-drop-segment" : "",
                        !set.completed || set.reps <= 0 ? "history-incomplete-segment" : "",
                      ].filter(Boolean).join(" ") || undefined}
                      key={set.id}
                    >
                      {set.dropSetOf
                        ? `↳ Drop ${dropNumber(exercise, set)}`
                        : `${workingSetNumber(exercise, set)}.`} {formatWeight(set.weightKg, unit)} {unit} × {set.reps}
                      {set.completed && set.reps > 0 && set.effort ? ` · ${formatSetEffort(set.effort)}` : ""}
                      {!set.completed
                        ? " · Incomplete"
                        : set.reps <= 0
                          ? " · Incomplete (no reps recorded)"
                          : ""}
                    </span>
                  ))
                  : <span>No set entries</span>}</div>
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
            <div><small>TIME</small><strong>{formatDuration(workoutElapsedSeconds(summary, now))}</strong></div>
            <div><small>SETS / DROPS</small><strong>{completedSets(summary).length} / {completedDropSegments(summary).length}</strong></div>
            <div><small>VOLUME</small><strong>{formatVolume(workoutVolumeKg(summary), unit)}</strong></div>
          </div>
          <button className="primary-button" type="button" onClick={() => { setSummary(null); setTab("history"); }}>View in history</button>
        </Modal>
      ) : null}
    </div>
  );
}
