export type ExerciseCategory = "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core";

export type BuiltInExercise = {
  exerciseKey: string;
  name: string;
  category: ExerciseCategory;
};

export type ExerciseEquipment = "Barbell" | "Dumbbells" | "Cable" | "Machine" | "Bodyweight";

type AlternativeProfile = {
  exerciseKey: string;
  equipment: ExerciseEquipment;
  movementPattern: string;
  movementLabel: string;
};

export const BUILT_IN_EXERCISES: BuiltInExercise[] = [
  { exerciseKey: "bench-press", name: "Bench press", category: "Chest" },
  { exerciseKey: "incline-dumbbell-press", name: "Incline dumbbell press", category: "Chest" },
  { exerciseKey: "dumbbell-bench-press", name: "Dumbbell bench press", category: "Chest" },
  { exerciseKey: "chest-press-machine", name: "Chest press machine", category: "Chest" },
  { exerciseKey: "push-up", name: "Push-up", category: "Chest" },
  { exerciseKey: "cable-fly", name: "Cable fly", category: "Chest" },
  { exerciseKey: "pec-deck", name: "Pec deck", category: "Chest" },
  { exerciseKey: "deadlift", name: "Deadlift", category: "Back" },
  { exerciseKey: "barbell-row", name: "Barbell row", category: "Back" },
  { exerciseKey: "lat-pulldown", name: "Lat pulldown", category: "Back" },
  { exerciseKey: "pull-up", name: "Pull-up", category: "Back" },
  { exerciseKey: "assisted-pull-up", name: "Assisted pull-up", category: "Back" },
  { exerciseKey: "seated-cable-row", name: "Seated cable row", category: "Back" },
  { exerciseKey: "one-arm-dumbbell-row", name: "One-arm dumbbell row", category: "Back" },
  { exerciseKey: "chest-supported-row", name: "Chest-supported row", category: "Back" },
  { exerciseKey: "straight-arm-pulldown", name: "Straight-arm pulldown", category: "Back" },
  { exerciseKey: "face-pull", name: "Face pull", category: "Back" },
  { exerciseKey: "shoulder-press", name: "Shoulder press", category: "Shoulders" },
  { exerciseKey: "dumbbell-shoulder-press", name: "Dumbbell shoulder press", category: "Shoulders" },
  { exerciseKey: "arnold-press", name: "Arnold press", category: "Shoulders" },
  { exerciseKey: "lateral-raise", name: "Lateral raise", category: "Shoulders" },
  { exerciseKey: "rear-delt-fly", name: "Rear delt fly", category: "Shoulders" },
  { exerciseKey: "front-raise", name: "Front raise", category: "Shoulders" },
  { exerciseKey: "biceps-curl", name: "Biceps curl", category: "Arms" },
  { exerciseKey: "hammer-curl", name: "Hammer curl", category: "Arms" },
  { exerciseKey: "preacher-curl", name: "Preacher curl", category: "Arms" },
  { exerciseKey: "cable-curl", name: "Cable curl", category: "Arms" },
  { exerciseKey: "triceps-pushdown", name: "Triceps pushdown", category: "Arms" },
  { exerciseKey: "overhead-triceps-extension", name: "Overhead triceps extension", category: "Arms" },
  { exerciseKey: "skull-crusher", name: "Skull crusher", category: "Arms" },
  { exerciseKey: "close-grip-bench-press", name: "Close-grip bench press", category: "Arms" },
  { exerciseKey: "dip", name: "Dip", category: "Arms" },
  { exerciseKey: "back-squat", name: "Back squat", category: "Legs" },
  { exerciseKey: "front-squat", name: "Front squat", category: "Legs" },
  { exerciseKey: "goblet-squat", name: "Goblet squat", category: "Legs" },
  { exerciseKey: "romanian-deadlift", name: "Romanian deadlift", category: "Legs" },
  { exerciseKey: "leg-press", name: "Leg press", category: "Legs" },
  { exerciseKey: "bulgarian-split-squat", name: "Bulgarian split squat", category: "Legs" },
  { exerciseKey: "walking-lunge", name: "Walking lunge", category: "Legs" },
  { exerciseKey: "hip-thrust", name: "Hip thrust", category: "Legs" },
  { exerciseKey: "leg-extension", name: "Leg extension", category: "Legs" },
  { exerciseKey: "leg-curl", name: "Leg curl", category: "Legs" },
  { exerciseKey: "standing-calf-raise", name: "Standing calf raise", category: "Legs" },
  { exerciseKey: "seated-calf-raise", name: "Seated calf raise", category: "Legs" },
  { exerciseKey: "hip-abduction", name: "Hip abduction", category: "Legs" },
  { exerciseKey: "plank", name: "Plank", category: "Core" },
  { exerciseKey: "hanging-leg-raise", name: "Hanging leg raise", category: "Core" },
  { exerciseKey: "cable-crunch", name: "Cable crunch", category: "Core" },
  { exerciseKey: "ab-wheel-rollout", name: "Ab-wheel rollout", category: "Core" },
  { exerciseKey: "russian-twist", name: "Russian twist", category: "Core" },
];

const ALTERNATIVE_PROFILES: AlternativeProfile[] = [
  { exerciseKey: "bench-press", equipment: "Barbell", movementPattern: "horizontal-press", movementLabel: "Horizontal press" },
  { exerciseKey: "dumbbell-bench-press", equipment: "Dumbbells", movementPattern: "horizontal-press", movementLabel: "Horizontal press" },
  { exerciseKey: "chest-press-machine", equipment: "Machine", movementPattern: "horizontal-press", movementLabel: "Horizontal press" },
  { exerciseKey: "push-up", equipment: "Bodyweight", movementPattern: "horizontal-press", movementLabel: "Horizontal press" },
  { exerciseKey: "cable-fly", equipment: "Cable", movementPattern: "chest-fly", movementLabel: "Chest fly" },
  { exerciseKey: "pec-deck", equipment: "Machine", movementPattern: "chest-fly", movementLabel: "Chest fly" },
  { exerciseKey: "barbell-row", equipment: "Barbell", movementPattern: "horizontal-row", movementLabel: "Horizontal row" },
  { exerciseKey: "seated-cable-row", equipment: "Cable", movementPattern: "horizontal-row", movementLabel: "Horizontal row" },
  { exerciseKey: "one-arm-dumbbell-row", equipment: "Dumbbells", movementPattern: "horizontal-row", movementLabel: "Horizontal row" },
  { exerciseKey: "lat-pulldown", equipment: "Cable", movementPattern: "vertical-pull", movementLabel: "Vertical pull" },
  { exerciseKey: "pull-up", equipment: "Bodyweight", movementPattern: "vertical-pull", movementLabel: "Vertical pull" },
  { exerciseKey: "back-squat", equipment: "Barbell", movementPattern: "squat", movementLabel: "Squat pattern" },
  { exerciseKey: "front-squat", equipment: "Barbell", movementPattern: "squat", movementLabel: "Squat pattern" },
  { exerciseKey: "goblet-squat", equipment: "Dumbbells", movementPattern: "squat", movementLabel: "Squat pattern" },
  { exerciseKey: "leg-press", equipment: "Machine", movementPattern: "squat", movementLabel: "Squat pattern" },
];

export type EquipmentAlternative = BuiltInExercise & {
  equipment: ExerciseEquipment;
  movementLabel: string;
};

function profileForExercise(exerciseKey: string): AlternativeProfile | undefined {
  return ALTERNATIVE_PROFILES.find((profile) => profile.exerciseKey === exerciseKey);
}

export function equipmentForExercise(exerciseKey: string): ExerciseEquipment | null {
  return profileForExercise(exerciseKey)?.equipment ?? null;
}

export function equipmentAlternativesFor(exerciseKey: string): EquipmentAlternative[] {
  const selected = profileForExercise(exerciseKey);
  if (!selected) return [];

  const usedEquipment = new Set<ExerciseEquipment>([selected.equipment]);
  const alternatives: EquipmentAlternative[] = [];

  for (const profile of ALTERNATIVE_PROFILES) {
    if (profile.exerciseKey === selected.exerciseKey ||
      profile.movementPattern !== selected.movementPattern ||
      usedEquipment.has(profile.equipment)) continue;

    const exercise = BUILT_IN_EXERCISES.find((candidate) => candidate.exerciseKey === profile.exerciseKey);
    if (!exercise) continue;

    usedEquipment.add(profile.equipment);
    alternatives.push({ ...exercise, equipment: profile.equipment, movementLabel: profile.movementLabel });
    if (alternatives.length === 3) break;
  }

  return alternatives;
}
