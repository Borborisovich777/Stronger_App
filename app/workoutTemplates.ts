import { BUILT_IN_EXERCISES } from "./exercises";
import type { Routine, RoutineExercise, StrongerData } from "./storage";

export const TEMPLATE_CATEGORIES = ["Chest", "Back", "Arms", "Shoulders", "Legs", "Calisthenics", "Full body"] as const;
export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];
export type TemplateSlot = {
  id: string;
  exerciseKey: string;
  sets: number;
  min: number;
  max: number;
  restSeconds: number;
  seconds?: boolean;
  optional?: boolean;
  perSide?: boolean;
  alternatives?: string[];
  cue?: string;
};
export type WorkoutTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  style: string;
  level: string;
  equipment: string;
  minutes: string;
  description: string;
  guidance: string;
  slots: TemplateSlot[];
};
export type TemplateChoices = Record<string, { exerciseKey?: string; included?: boolean }>;

const exerciseByKey = new Map(BUILT_IN_EXERCISES.map((exercise) => [exercise.exerciseKey, exercise]));
export function templateExercise(key: string) {
  const exercise = exerciseByKey.get(key);
  if (!exercise) throw new Error(`Unknown template exercise: ${key}`);
  return exercise;
}

const lift = (exerciseKey: string, sets: number, min: number, max: number, restSeconds: number, extra: Partial<TemplateSlot> = {}): TemplateSlot =>
  ({ id: exerciseKey, exerciseKey, sets, min, max, restSeconds, ...extra });

export const TEMPLATE_TRAINING_GUIDANCE = "Warm up with easy movement and lighter practice sets before your first loaded lifts. Choose a load or variation that leaves about 2 good reps in reserve; start easier while learning. When all sets reach the top of the range with controlled technique for two sessions, use the smallest practical load increase or a slightly harder variation and return to the lower end. For holds, build time before difficulty. These are working sets; warm-ups are additional.";
export const TEMPLATE_LOAD_GUIDANCE = "Choose your starting weights in the editor. Zero is an unset external load; for bodyweight exercises, zero added load means bodyweight only. Stronger can prefill previous results for the same exercise and measurement type when you start. Check those values against today's rep range. Equipment changes need their own loads.";
export const TEMPLATE_SCHEDULE_GUIDANCE = "Choose sessions to fit a weekly plan, not a rotation through this whole library. For a simple starting schedule, alternate Full body A and B on 2–3 nonconsecutive days. Body-part sessions are options within a broader split; chest and back work already involve arms and shoulders, so adjust accessory volume. Aim to cover all major muscle groups at least twice weekly as recovery allows.";

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "chest-barbell", name: "Chest A · Barbell foundations", category: "Chest", style: "Strength emphasis", level: "Some lifting experience",
    equipment: "Barbell, bench, dumbbells, pec deck", minutes: "35–45",
    description: "A main bench press, an incline press, and a fly. A stable press-first session with an optional dip finish.",
    guidance: "Use a spotter or correctly positioned safeties for barbell bench. The optional dips are extra chest and triceps work; leave them out if pressing is already enough today.",
    slots: [
      lift("bench-press", 3, 6, 8, 180, { alternatives: ["dumbbell-bench-press", "chest-press-machine"] }),
      lift("incline-dumbbell-press", 2, 8, 12, 120, { alternatives: ["incline-bench-press-barbell", "incline-chest-press-machine"] }),
      lift("pec-deck", 2, 12, 15, 90, { alternatives: ["cable-fly"] }),
      lift("chest-dip", 2, 6, 10, 120, { optional: true, alternatives: ["chest-dip-assisted"], cue: "Use a comfortable shoulder range. Choose assisted dips if needed; set assistance separately." }),
    ],
  },
  {
    id: "chest-dumbbell", name: "Chest B · Dumbbells & cables", category: "Chest", style: "Muscle building", level: "All levels; adjust load",
    equipment: "Dumbbells, bench, incline press machine, cable", minutes: "30–45",
    description: "Moderate-rep presses followed by cable fly work, with push-ups available as a short finish.",
    guidance: "The dumbbell and barbell bench entries keep separate progress. Make an equipment choice and keep it consistent for several sessions so comparisons are useful.",
    slots: [
      lift("dumbbell-bench-press", 3, 8, 12, 120, { alternatives: ["bench-press", "chest-press-machine"] }),
      lift("incline-chest-press-machine", 2, 10, 15, 120, { alternatives: ["incline-dumbbell-press"] }),
      lift("cable-fly", 2, 12, 15, 90, { alternatives: ["pec-deck"] }),
      lift("push-up", 2, 8, 15, 90, { optional: true, alternatives: ["push-up-knees"], cue: "Finish while you can still do controlled reps; this is not an all-out test." }),
    ],
  },
  {
    id: "back-rows", name: "Back A · Rows & pulldowns", category: "Back", style: "Muscle building", level: "All levels; adjust load",
    equipment: "Pulldown, T-bar row, reverse-fly machine", minutes: "35–45",
    description: "A vertical pull and a row first, then rear delts. Straight-arm pulldowns are an optional accessory.",
    guidance: "Keep the row controlled. Choose the chest-supported alternative if supporting a bent-over position is tiring after your leg session.",
    slots: [
      lift("lat-pulldown", 3, 8, 12, 120, { alternatives: ["pull-up-assisted", "lat-pulldown-machine"] }),
      lift("t-bar-row", 3, 8, 12, 150, { alternatives: ["chest-supported-row", "seated-cable-row"] }),
      lift("reverse-fly-machine", 2, 12, 20, 90, { alternatives: ["reverse-fly-dumbbell", "reverse-fly-cable"] }),
      lift("straight-arm-pulldown", 2, 10, 15, 90, { optional: true }),
    ],
  },
  {
    id: "back-free-weights", name: "Back B · Pull-ups & free weights", category: "Back", style: "Strength emphasis", level: "Some lifting experience",
    equipment: "Pull-up bar, barbell, dumbbell, bench", minutes: "40–50",
    description: "Pull-ups and a heavier row anchor the session. One-arm rows give each side its own work.",
    guidance: "Choose assisted pull-ups if strict reps are not yet repeatable. Keep the rowing position steady and avoid treating the row as a lower-back lift.",
    slots: [
      lift("pull-up", 3, 5, 8, 180, { alternatives: ["pull-up-assisted", "lat-pulldown"] }),
      lift("barbell-row", 3, 6, 8, 180, { alternatives: ["chest-supported-row", "seated-cable-row"] }),
      lift("one-arm-dumbbell-row", 2, 10, 12, 90, { perSide: true }),
      lift("shrug-barbell", 2, 10, 15, 90, { optional: true, alternatives: ["shrug-dumbbell", "shrug-machine"] }),
    ],
  },
  {
    id: "arms-cable", name: "Arms A · Cable focus", category: "Arms", style: "Moderate-rep accessories", level: "All levels; adjust load",
    equipment: "Cable station, dumbbells", minutes: "30–40",
    description: "Alternate biceps and triceps exercises, using cables for most of the session.",
    guidance: "These are straight sets with normal rest, not a mandatory superset. If adding this after chest or back, choose one curl and one extension instead of the whole session.",
    slots: [
      lift("cable-curl", 3, 10, 15, 90),
      lift("triceps-extension-cable", 3, 10, 15, 90),
      lift("hammer-curl", 2, 10, 15, 90, { alternatives: ["hammer-curl-cable"] }),
      lift("triceps-pushdown", 2, 10, 15, 90),
    ],
  },
  {
    id: "arms-dumbbell", name: "Arms B · Dumbbells & bench", category: "Arms", style: "Controlled free weights", level: "Some lifting experience",
    equipment: "Dumbbells, adjustable bench", minutes: "30–40",
    description: "Incline curls, lying extensions, and hammer curls with an optional overhead extension.",
    guidance: "Use a comfortable elbow and shoulder range. Take the listed reps with control; do not add momentum to reach the top of the range.",
    slots: [
      lift("incline-curl-dumbbell", 3, 8, 12, 90),
      lift("skullcrusher-dumbbell", 3, 8, 12, 90),
      lift("hammer-curl", 2, 10, 15, 90),
      lift("overhead-triceps-extension", 2, 10, 15, 90, { optional: true, alternatives: ["triceps-pushdown"] }),
    ],
  },
  {
    id: "shoulders-press", name: "Shoulders A · Press & raise", category: "Shoulders", style: "Press emphasis", level: "Some lifting experience",
    equipment: "Dumbbells, bench, reverse-fly machine", minutes: "30–40",
    description: "One overhead press, then lateral and rear-delt raises. No extra front raises are needed in this session.",
    guidance: "Account for pressing already done on chest days. Choose this instead of adding another heavy shoulder session when recovery is limited.",
    slots: [
      lift("dumbbell-shoulder-press", 3, 6, 10, 150, { alternatives: ["shoulder-press-machine", "overhead-press-barbell"] }),
      lift("lateral-raise", 3, 12, 20, 90, { alternatives: ["lateral-raise-cable", "lateral-raise-machine"] }),
      lift("reverse-fly-machine", 2, 12, 20, 90, { alternatives: ["reverse-fly-dumbbell", "reverse-fly-cable"] }),
    ],
  },
  {
    id: "shoulders-cable", name: "Shoulders B · Machines & cables", category: "Shoulders", style: "Higher-rep accessories", level: "All levels; adjust load",
    equipment: "Shoulder press machine, cable station", minutes: "25–35",
    description: "A small dose of machine pressing with more focus on side and rear delts.",
    guidance: "Keep the raises controlled and use a load that allows the same range throughout each set. Reduce pressing if this follows a chest session.",
    slots: [
      lift("shoulder-press-machine", 2, 10, 15, 120, { alternatives: ["dumbbell-shoulder-press"] }),
      lift("lateral-raise-cable", 3, 12, 20, 90, { perSide: true }),
      lift("reverse-fly-cable", 3, 12, 20, 90, { alternatives: ["reverse-fly-machine"] }),
    ],
  },
  {
    id: "legs-machines", name: "Legs A · Machine foundations", category: "Legs", style: "Quad & hamstring balance", level: "All levels; adjust load",
    equipment: "Leg press, leg curl, extension, calf machine", minutes: "40–50",
    description: "Leg press first, then curls, extensions, and calves. Familiar machine work in a consistent order.",
    guidance: "Keep foot placement and machine setup repeatable for useful progress comparisons. Optional lunges are extra work, not required to complete the session.",
    slots: [
      lift("leg-press", 3, 8, 12, 150, { alternatives: ["hack-squat", "squat-smith-machine"] }),
      lift("seated-leg-curl-machine", 3, 10, 15, 120, { alternatives: ["leg-curl"] }),
      lift("leg-extension", 2, 10, 15, 90),
      lift("seated-calf-raise-machine", 3, 10, 15, 90, { alternatives: ["standing-calf-raise-smith-machine"] }),
      lift("lunge-bodyweight", 2, 10, 12, 90, { optional: true, perSide: true }),
    ],
  },
  {
    id: "legs-hinge", name: "Legs B · Hinge & single leg", category: "Legs", style: "Posterior chain & balance", level: "Some lifting experience",
    equipment: "Barbell or dumbbells, bench, calf station", minutes: "40–55",
    description: "A hip hinge, a squat, and a split squat with calf work. Leg curls are available as an extra.",
    guidance: "Practice the hip hinge with a light load first. Per-side reps mean completing both legs before counting a set; allow enough time for each side.",
    slots: [
      lift("romanian-deadlift", 3, 6, 10, 180, { alternatives: ["romanian-deadlift-dumbbell"] }),
      lift("goblet-squat", 3, 8, 12, 150, { alternatives: ["squat-smith-machine"] }),
      lift("bulgarian-split-squat", 2, 8, 12, 120, { perSide: true, alternatives: ["lunge-dumbbell"] }),
      lift("standing-calf-raise", 2, 12, 20, 90, { alternatives: ["standing-calf-raise-dumbbell"] }),
      lift("leg-curl", 2, 10, 15, 90, { optional: true, alternatives: ["seated-leg-curl-machine"] }),
    ],
  },
  {
    id: "calisthenics-foundations", name: "Calisthenics A · Bar foundations", category: "Calisthenics", style: "Controlled bodyweight", level: "Beginner / scalable",
    equipment: "Secure dip bars for rows, pull-up bar, mat", minutes: "30–40",
    description: "Push-ups and easier rows on the dip bars, plus legs and hanging core work. A gentler alternative to strict pull-ups and dips.",
    guidance: "Use securely fixed dip bars with enough clearance for rows. Bend the knees and keep feet on the floor to make rows easier. Use the pull-up bar for knee raises only if you can hang comfortably; flat knee raises are the floor alternative.",
    slots: [
      lift("push-up-knees", 3, 6, 12, 90, { alternatives: ["push-up"] }),
      lift("inverted-row-bodyweight", 3, 6, 10, 120),
      lift("squat-bodyweight", 2, 10, 15, 90),
      lift("hip-thrust-bodyweight", 2, 10, 15, 90),
      lift("hanging-knee-raise", 2, 8, 12, 90, { alternatives: ["flat-knee-raise"] }),
      lift("plank", 2, 20, 40, 60, { seconds: true, optional: true, cue: "Stop the hold before your position changes." }),
    ],
  },
  {
    id: "calisthenics-bars", name: "Calisthenics B · Bar strength", category: "Calisthenics", style: "Strict reps & control", level: "Intermediate; strict pull-ups and dips",
    equipment: "Pull-up bar, dip bars, mat", minutes: "35–50",
    description: "Strict pull-ups and dips with single-leg work and hanging knee raises.",
    guidance: "Choose this when the lower rep targets are comfortable with strict form, or select assistance. No kipping, muscle-ups, or maximal holds are required. Complete both sides for unilateral exercises.",
    slots: [
      lift("pull-up", 3, 4, 8, 180, { alternatives: ["pull-up-assisted"] }),
      lift("dip", 3, 5, 10, 150, { alternatives: ["chest-dip-assisted", "push-up"] }),
      lift("lunge-bodyweight", 3, 8, 12, 120, { perSide: true }),
      lift("single-leg-bridge", 2, 10, 15, 90, { perSide: true }),
      lift("hanging-knee-raise", 2, 8, 12, 90),
    ],
  },
  {
    id: "full-body-gym", name: "Full body A · Gym essentials", category: "Full body", style: "Balanced strength", level: "Some lifting experience",
    equipment: "Rack, barbell, bench, pulldown, mat", minutes: "45–60",
    description: "Squat, press, pull, and hinge with a timed core finish. A complete session for a simpler weekly plan.",
    guidance: "Use rack safeties and learn squat and hinge technique with light practice sets. Two working sets per lift keep this manageable. Alternate with Full body B on nonconsecutive days.",
    slots: [
      lift("back-squat", 2, 6, 10, 180, { alternatives: ["goblet-squat", "squat-smith-machine"] }),
      lift("bench-press", 2, 6, 10, 180, { alternatives: ["dumbbell-bench-press", "chest-press-machine"] }),
      lift("lat-pulldown", 2, 8, 12, 120, { alternatives: ["pull-up-assisted"] }),
      lift("romanian-deadlift", 2, 8, 10, 150, { alternatives: ["romanian-deadlift-dumbbell"] }),
      lift("plank", 2, 20, 40, 60, { seconds: true }),
      lift("lateral-raise", 2, 12, 20, 90, { optional: true }),
    ],
  },
  {
    id: "full-body-dumbbells", name: "Full body B · Dumbbell essentials", category: "Full body", style: "Simple equipment", level: "All levels; adjust load",
    equipment: "Dumbbells, bench, mat", minutes: "40–55",
    description: "A squat, dumbbell press, one-arm row, hinge, and side plank with minimal station changes.",
    guidance: "Use this as a complete session. Per-side exercises include both sides in each set. Alternate with Full body A, or repeat this setup consistently if it suits your equipment.",
    slots: [
      lift("goblet-squat", 2, 10, 12, 120),
      lift("dumbbell-bench-press", 2, 8, 12, 120),
      lift("one-arm-dumbbell-row", 2, 10, 12, 120, { perSide: true }),
      lift("romanian-deadlift-dumbbell", 2, 8, 12, 120),
      lift("side-plank", 2, 20, 30, 60, { seconds: true, perSide: true }),
      lift("hammer-curl", 2, 10, 15, 90, { optional: true }),
    ],
  },
];

export function templateTargetLabel(slot: TemplateSlot): string {
  return `${slot.sets} × ${slot.min}–${slot.max}${slot.seconds ? " sec" : " reps"}${slot.perSide ? " / side" : ""}`;
}

export function templateSelection(template: WorkoutTemplate, choices: TemplateChoices = {}) {
  return template.slots.map((slot) => {
    const choice = choices[slot.id];
    const key = choice?.exerciseKey ?? slot.exerciseKey;
    if (![slot.exerciseKey, ...(slot.alternatives ?? [])].includes(key)) throw new Error("Choose a listed exercise alternative.");
    return { slot, exercise: templateExercise(key), included: !slot.optional || choice?.included === true };
  });
}

/** Produces an unsaved, independent draft; never receives or mutates user data. */
export function createRoutineFromTemplate(template: WorkoutTemplate, choices: TemplateChoices, createId: (prefix: string) => string): Routine {
  return {
    id: createId("routine"),
    name: template.name,
    notes: `${template.description}\n${template.guidance}\n${TEMPLATE_TRAINING_GUIDANCE}\n${TEMPLATE_LOAD_GUIDANCE}`,
    exercises: templateSelection(template, choices).filter((selection) => selection.included).map(({ slot, exercise }): RoutineExercise => ({
      id: createId("routine-exercise"),
      exerciseKey: exercise.exerciseKey,
      name: exercise.name,
      tracking: exercise.tracking ?? "weight-reps",
      weightMode: exercise.weightMode ?? "external",
      targetSets: slot.sets,
      targetWeightKg: 0,
      targetReps: slot.seconds ? 0 : slot.min,
      ...(slot.seconds ? { targetDurationSeconds: slot.min } : {}),
      restSeconds: slot.restSeconds,
      notes: `${templateTargetLabel(slot)}. Rest ${slot.restSeconds}s.${slot.perSide ? " Complete both sides before marking a set done." : ""}${slot.cue ? ` ${slot.cue}` : ""}`,
    })),
  };
}

/** Fresh-install defaults: independent copies with stable IDs for storage comparisons. */
export function createDefaultRoutines(): Routine[] {
  return WORKOUT_TEMPLATES.map((template) => {
    let exerciseIndex = 0;
    return createRoutineFromTemplate(template, {}, (prefix) => prefix === "routine"
      ? `routine-${template.id}`
      : `routine-${template.id}-exercise-${++exerciseIndex}`);
  });
}

export function missingPreparedTemplates(routines: Routine[]): Routine[] {
  const ids = new Set(routines.map((routine) => routine.id));
  const names = new Set(routines.map((routine) => routine.name.trim().toLowerCase()));
  return createDefaultRoutines().filter((routine) => !ids.has(routine.id) && !names.has(routine.name.toLowerCase()));
}

/** An explicit addition for existing users; preserves every existing record. */
export function addPreparedTemplates(data: StrongerData, maxRoutines: number): StrongerData {
  const additions = missingPreparedTemplates(data.routines);
  if (!additions.length) return data;
  if (data.routines.length + additions.length > maxRoutines) {
    throw new Error("There is not enough room to add all prepared templates. Use Browse to choose individual sessions.");
  }
  return { ...data, routines: [...data.routines, ...additions] };
}
