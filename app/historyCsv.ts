import type { WorkoutSession } from "./storage";

const CSV_HEADERS = [
  "workout_date",
  "workout_name",
  "duration_seconds",
  "exercise_name",
  "exercise_key",
  "exercise_order",
  "set_order",
  "completed",
  "weight_kg",
  "reps",
  "effort_scale",
  "effort_value",
  "started_at",
  "finished_at",
  "set_completed_at",
  "workout_id",
  "exercise_id",
  "set_id",
  "source_routine_id",
  "set_type",
  "drop_set_of",
  "drop_order",
] as const;

type CsvValue = string | number | null | undefined;

function isoTimestamp(timestamp: number | undefined): string {
  return timestamp === undefined ? "" : new Date(timestamp).toISOString();
}

function spreadsheetSafeText(value: string): string {
  return /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: CsvValue): string {
  const text = typeof value === "string" ? spreadsheetSafeText(value) : value?.toString() ?? "";
  return `"${text.replaceAll('"', '""')}"`;
}

function csvRow(values: CsvValue[]): string {
  return values.map(csvCell).join(",");
}

export function buildHistoryCsv(history: WorkoutSession[]): string {
  const rows = history.flatMap((session) => {
    const durationSeconds = session.finishedAt === undefined
      ? ""
      : Math.max(0, Math.round((session.finishedAt - session.startedAt) / 1_000));
    const sessionValues: CsvValue[] = [
      session.workoutDate,
      session.name,
      durationSeconds,
    ];
    const setRows = session.exercises.flatMap((exercise, exerciseIndex) =>
      exercise.sets.map((set, setIndex) => csvRow([
        ...sessionValues,
        exercise.name,
        exercise.exerciseKey,
        exerciseIndex + 1,
        setIndex + 1,
        set.completed ? "yes" : "no",
        set.weightKg,
        set.reps,
        set.effort?.scale.toUpperCase() ?? "",
        set.effort?.value ?? "",
        isoTimestamp(session.startedAt),
        isoTimestamp(session.finishedAt),
        isoTimestamp(set.completedAt),
        session.id,
        exercise.id,
        set.id,
        session.sourceRoutineId ?? "",
        set.dropSetOf ? "drop" : "working",
        set.dropSetOf ?? "",
        set.dropSetOf
          ? exercise.sets.slice(0, setIndex).filter((candidate) => candidate.dropSetOf === set.dropSetOf).length + 1
          : "",
      ])),
    );

    if (setRows.length) return setRows;
    return [csvRow([
      ...sessionValues,
      "", "", "", "", "", "", "", "", "",
      isoTimestamp(session.startedAt),
      isoTimestamp(session.finishedAt),
      "",
      session.id,
      "", "",
      session.sourceRoutineId ?? "",
      "", "", "",
    ])];
  });

  return `\uFEFF${[csvRow([...CSV_HEADERS]), ...rows].join("\r\n")}\r\n`;
}
