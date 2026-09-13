/** Catalog coverage and source snapshot: public/exercises/strong-catalog.json. */
export type ExerciseCategory = "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core" | "Cardio" | "Full body" | "Olympic" | "Mobility";

export type BuiltInExercise = {
  exerciseKey: string;
  name: string;
  category: ExerciseCategory;
  aliases?: string[];
  strongId?: string;
  tracking?: "weight-reps" | "reps" | "duration" | "distance-duration";
  weightMode?: "external" | "added" | "assistance";
};

export const BUILT_IN_EXERCISES: BuiltInExercise[] = [
  {
    "exerciseKey": "bench-press",
    "name": "Bench press",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bench Press (Barbell)"
    ],
    "strongId": "ca9ee259-a69f-4839-bbf9-46ba8cf0d7d6"
  },
  {
    "exerciseKey": "incline-dumbbell-press",
    "name": "Incline dumbbell press",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Incline Bench Press (Dumbbell)"
    ],
    "strongId": "6416d266-c84c-4aa6-a8b0-7582619c1bcb"
  },
  {
    "exerciseKey": "dumbbell-bench-press",
    "name": "Dumbbell bench press",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bench Press (Dumbbell)"
    ],
    "strongId": "737d7664-5231-44f9-a112-a4c087f67675"
  },
  {
    "exerciseKey": "chest-press-machine",
    "name": "Chest press machine",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Chest Press (Machine)"
    ],
    "strongId": "6ae27da7-92b9-4af9-b2a9-e0afd827c188"
  },
  {
    "exerciseKey": "push-up",
    "name": "Push-up",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Push Up"
    ],
    "strongId": "f0f86563-85fc-49a8-9ec7-f95ddd318ab4"
  },
  {
    "exerciseKey": "cable-fly",
    "name": "Cable fly",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Cable Crossover"
    ],
    "strongId": "b101465f-bec5-40cd-9434-0d832e5c655e"
  },
  {
    "exerciseKey": "pec-deck",
    "name": "Pec deck",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Pec Deck (Machine)"
    ],
    "strongId": "487e8b08-458f-43da-a9f6-e339c8d548a9"
  },
  {
    "exerciseKey": "deadlift",
    "name": "Deadlift",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Deadlift (Barbell)"
    ],
    "strongId": "b748103d-3014-4cae-a349-cec433528c3a"
  },
  {
    "exerciseKey": "barbell-row",
    "name": "Barbell row",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bent Over Row (Barbell)",
      "Bent-over barbell row",
      "Barbell bent over row"
    ],
    "strongId": "2ca2b6d5-f16d-4eac-89a2-05e1be0ceee7"
  },
  {
    "exerciseKey": "lat-pulldown",
    "name": "Lat pulldown",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lat Pulldown - Wide Grip (Cable)"
    ],
    "strongId": "f12e2a9b-02ea-4d38-9127-aa6234786d3a"
  },
  {
    "exerciseKey": "pull-up",
    "name": "Pull-up",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Pull Up"
    ],
    "strongId": "adb75e5a-c873-4f57-bdf0-0043710ba90d"
  },
  {
    "exerciseKey": "assisted-pull-up",
    "name": "Assisted pull-up",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "assistance",
    "aliases": [
      "Pull Up (Band)"
    ],
    "strongId": "f267d09a-c60e-4b29-83d3-d50f00ce88da"
  },
  {
    "exerciseKey": "seated-cable-row",
    "name": "Seated cable row",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Row (Cable)"
    ],
    "strongId": "143f848f-3a01-40bd-88d1-613c3a88309e"
  },
  {
    "exerciseKey": "one-arm-dumbbell-row",
    "name": "One-arm dumbbell row",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bent Over One Arm Row (Dumbbell)"
    ],
    "strongId": "860bcb49-7f45-4212-9441-e9497e1220fc"
  },
  {
    "exerciseKey": "chest-supported-row",
    "name": "Chest-supported row",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Incline Row (Dumbbell)"
    ],
    "strongId": "ed06489a-f597-4cc1-81d0-eef7804f1fc5"
  },
  {
    "exerciseKey": "straight-arm-pulldown",
    "name": "Straight-arm pulldown",
    "category": "Back"
  },
  {
    "exerciseKey": "face-pull",
    "name": "Face pull",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Face Pull (Cable)"
    ],
    "strongId": "0abcf1b6-58f6-4ec9-be63-32bd5c3cfd33"
  },
  {
    "exerciseKey": "shoulder-press",
    "name": "Shoulder press",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Overhead Press (Barbell)"
    ],
    "strongId": "560e513c-9b0f-4375-a02d-464bd35fa054"
  },
  {
    "exerciseKey": "dumbbell-shoulder-press",
    "name": "Dumbbell shoulder press",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Overhead Press (Dumbbell)"
    ],
    "strongId": "5db8f3d7-445e-48bb-bf4b-979b6dfdb1eb"
  },
  {
    "exerciseKey": "arnold-press",
    "name": "Arnold press",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Arnold Press (Dumbbell)"
    ],
    "strongId": "3c24e378-0ae0-4b62-bfd5-bed2e8bffdfa"
  },
  {
    "exerciseKey": "lateral-raise",
    "name": "Lateral raise",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lateral Raise (Dumbbell)"
    ],
    "strongId": "ae345023-155f-4c14-b6e9-fcafc87619e3"
  },
  {
    "exerciseKey": "rear-delt-fly",
    "name": "Rear delt fly",
    "category": "Shoulders"
  },
  {
    "exerciseKey": "front-raise",
    "name": "Front raise",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Front Raise (Dumbbell)"
    ],
    "strongId": "3916b75a-9ebd-4e7f-a781-097f49efb2cc"
  },
  {
    "exerciseKey": "biceps-curl",
    "name": "Biceps curl",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bicep Curl (Dumbbell)"
    ],
    "strongId": "4247db47-0f44-4314-851d-8ab4dce3317d"
  },
  {
    "exerciseKey": "hammer-curl",
    "name": "Hammer curl",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hammer Curl (Dumbbell)"
    ],
    "strongId": "ce7c6a7f-38f6-4783-93ff-cd3fb5e66260"
  },
  {
    "exerciseKey": "preacher-curl",
    "name": "Preacher curl",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Preacher Curl (Barbell)"
    ],
    "strongId": "69a4be51-4b3b-4c89-8a54-7e83997f058c"
  },
  {
    "exerciseKey": "cable-curl",
    "name": "Cable curl",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bicep Curl (Cable)"
    ],
    "strongId": "70709ccd-1f01-4725-98ad-193d2004babf"
  },
  {
    "exerciseKey": "triceps-pushdown",
    "name": "Triceps pushdown",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Triceps Pushdown (Cable - Straight Bar)"
    ],
    "strongId": "79a42fc3-5363-48d7-9fba-8e643d50bbd4"
  },
  {
    "exerciseKey": "overhead-triceps-extension",
    "name": "Overhead triceps extension",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Triceps Extension (Dumbbell)"
    ],
    "strongId": "9df1b947-b05e-4250-84c4-b8dd55348ff6"
  },
  {
    "exerciseKey": "skull-crusher",
    "name": "Skull crusher",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Skullcrusher (Barbell)"
    ],
    "strongId": "e5fa68c3-8f89-4fb8-a8b6-907c1feaceae"
  },
  {
    "exerciseKey": "close-grip-bench-press",
    "name": "Close-grip bench press",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bench Press - Close Grip (Barbell)"
    ],
    "strongId": "de39b561-a90f-4212-95a3-84789c6f4813"
  },
  {
    "exerciseKey": "dip",
    "name": "Dip",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Triceps Dip"
    ],
    "strongId": "607432af-4556-41ed-8746-a2e6c60e76a1"
  },
  {
    "exerciseKey": "back-squat",
    "name": "Back squat",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Squat (Barbell)"
    ],
    "strongId": "b2f5a2de-c684-4e94-a6e5-581e0695fcac"
  },
  {
    "exerciseKey": "front-squat",
    "name": "Front squat",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Front Squat (Barbell)"
    ],
    "strongId": "8ef3f10f-0e9a-4302-bf8f-ae98c0152933"
  },
  {
    "exerciseKey": "goblet-squat",
    "name": "Goblet squat",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Goblet Squat (Kettlebell)"
    ],
    "strongId": "fe4e5949-5f51-4c60-a31f-b45bd9ad8023"
  },
  {
    "exerciseKey": "romanian-deadlift",
    "name": "Romanian deadlift",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Romanian Deadlift (Barbell)"
    ],
    "strongId": "4bfc4dde-bd3d-4495-920d-eb646764e4de"
  },
  {
    "exerciseKey": "leg-press",
    "name": "Leg press",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Leg Press"
    ],
    "strongId": "a467f043-c96e-43c8-9133-a33eb8e62ded"
  },
  {
    "exerciseKey": "bulgarian-split-squat",
    "name": "Bulgarian split squat",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bulgarian Split Squat"
    ],
    "strongId": "eadcbaab-af0c-4f83-9e1b-c0ad5f03a0a0"
  },
  {
    "exerciseKey": "walking-lunge",
    "name": "Walking lunge",
    "category": "Legs"
  },
  {
    "exerciseKey": "hip-thrust",
    "name": "Hip thrust",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hip Thrust (Barbell)"
    ],
    "strongId": "b76cb4ce-53c9-42f8-b520-6f663ee8546b"
  },
  {
    "exerciseKey": "leg-extension",
    "name": "Leg extension",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Leg Extension (Machine)"
    ],
    "strongId": "7d1df88e-8610-495b-83a3-d68aabbfee8a"
  },
  {
    "exerciseKey": "leg-curl",
    "name": "Leg curl",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lying Leg Curl (Machine)"
    ],
    "strongId": "b2f5a8c1-b66a-4b4f-8f2a-72fbf578d943"
  },
  {
    "exerciseKey": "standing-calf-raise",
    "name": "Standing calf raise",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Standing Calf Raise (Machine)"
    ],
    "strongId": "213bd3ef-1207-4fd8-acdd-cb224a8b42a7"
  },
  {
    "exerciseKey": "seated-calf-raise",
    "name": "Seated calf raise",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Calf Raise (Plate Loaded)"
    ],
    "strongId": "4b8c9374-ab32-4912-906a-202ef1b20ea6"
  },
  {
    "exerciseKey": "hip-abduction",
    "name": "Hip abduction",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hip Abductor (Machine)",
      "Hip abduction"
    ],
    "strongId": "bad7dcc2-fac7-4ec8-8c03-1ec6bb471069"
  },
  {
    "exerciseKey": "plank",
    "name": "Plank",
    "category": "Core",
    "tracking": "duration",
    "aliases": [],
    "strongId": "943cb841-6157-4021-b842-612bd9f8b4e0"
  },
  {
    "exerciseKey": "hanging-leg-raise",
    "name": "Hanging leg raise",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Hanging Leg Raise"
    ],
    "strongId": "8eba64e0-5e50-4f85-ad66-7faeb87e5bb0"
  },
  {
    "exerciseKey": "cable-crunch",
    "name": "Cable crunch",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Cable Crunch"
    ],
    "strongId": "6102ebdd-f375-4cdb-8f3e-b50fbe0086ef"
  },
  {
    "exerciseKey": "ab-wheel-rollout",
    "name": "Ab-wheel rollout",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Ab Wheel",
      "Ab roller",
      "Ab-wheel rollout"
    ],
    "strongId": "591439ee-94d1-4997-acb0-e5674e3b2f5c"
  },
  {
    "exerciseKey": "russian-twist",
    "name": "Russian twist (Plate)",
    "category": "Core",
    "aliases": [
      "Weighted Russian twist"
    ],
    "tracking": "weight-reps",
    "weightMode": "external"
  },
  {
    "exerciseKey": "aerobics",
    "name": "Aerobics",
    "category": "Cardio",
    "tracking": "duration",
    "aliases": [
      "Aerobics"
    ],
    "strongId": "05aa6d82-6388-4c3d-87a5-8d8edc1b3431"
  },
  {
    "exerciseKey": "around-the-world",
    "name": "Around the World",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Around the World"
    ],
    "strongId": "d74736d6-ac37-408f-adaf-9766f17ee9a9"
  },
  {
    "exerciseKey": "back-extension",
    "name": "Back Extension",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Back Extension"
    ],
    "strongId": "b8bd2e32-2133-4d66-866f-4b4239be2999"
  },
  {
    "exerciseKey": "back-extension-machine",
    "name": "Back Extension (Machine)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Back Extension (Machine)"
    ],
    "strongId": "93d038a6-92fc-484d-a948-9fad070ff5b1"
  },
  {
    "exerciseKey": "ball-slams",
    "name": "Ball Slams",
    "category": "Full body",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Ball Slams"
    ],
    "strongId": "0373b862-bde8-4335-ab03-763cca57455c"
  },
  {
    "exerciseKey": "battle-ropes",
    "name": "Battle Ropes",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Battle Ropes"
    ],
    "strongId": "2c9ef821-6ea5-43a5-acbe-380477101d70"
  },
  {
    "exerciseKey": "bench-dip",
    "name": "Bench Dip",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Bench Dip"
    ],
    "strongId": "fbbd32d2-595a-4c4a-86de-05a06ef12908"
  },
  {
    "exerciseKey": "bench-press-cable",
    "name": "Bench Press (Cable)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bench Press (Cable)"
    ],
    "strongId": "59bb3ebb-acab-426b-aedf-6149b8ef9100"
  },
  {
    "exerciseKey": "bench-press-smith-machine",
    "name": "Bench Press (Smith Machine)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bench Press (Smith Machine)"
    ],
    "strongId": "b0c8a069-aae9-40d4-b842-a61a3c7cacde"
  },
  {
    "exerciseKey": "bench-press-wide-grip-barbell",
    "name": "Bench Press - Wide Grip (Barbell)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bench Press - Wide Grip (Barbell)"
    ],
    "strongId": "6b6456e0-3725-4a0a-8306-1bd555f4e5b5"
  },
  {
    "exerciseKey": "bent-over-row-band",
    "name": "Bent Over Row (Band)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Bent Over Row (Band)"
    ],
    "strongId": "828ec5b3-fc2f-4f29-b372-607dde9c799a"
  },
  {
    "exerciseKey": "bent-over-row-dumbbell",
    "name": "Bent Over Row (Dumbbell)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bent Over Row (Dumbbell)"
    ],
    "strongId": "c37a6d8d-d7d9-411b-a419-5066f341be00"
  },
  {
    "exerciseKey": "bent-over-row-underhand-barbell",
    "name": "Bent Over Row - Underhand (Barbell)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bent Over Row - Underhand (Barbell)",
      "Reverse-grip barbell row",
      "Underhand barbell row"
    ],
    "strongId": "6f66b6ce-846b-4f1c-b1ce-dd0fc0f542c2"
  },
  {
    "exerciseKey": "bicep-curl-barbell",
    "name": "Bicep Curl (Barbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bicep Curl (Barbell)"
    ],
    "strongId": "5819ecdc-a430-47fd-984d-9b221bb337ea"
  },
  {
    "exerciseKey": "bicep-curl-machine",
    "name": "Bicep Curl (Machine)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Bicep Curl (Machine)"
    ],
    "strongId": "e6cb00c6-1460-4440-9c19-7fd6f4badf8d"
  },
  {
    "exerciseKey": "bicycle-crunch",
    "name": "Bicycle Crunch",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Bicycle Crunch"
    ],
    "strongId": "37388e32-6714-4e27-8dcf-50d4b6ce6292"
  },
  {
    "exerciseKey": "box-jump",
    "name": "Box Jump",
    "category": "Legs",
    "tracking": "reps",
    "aliases": [
      "Box Jump"
    ],
    "strongId": "c6123164-6caa-46f2-aa22-c02b9b52815d"
  },
  {
    "exerciseKey": "box-squat-barbell",
    "name": "Box Squat (Barbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Box Squat (Barbell)"
    ],
    "strongId": "9ee6c51e-6b22-46ee-abb6-e716cb94ad42"
  },
  {
    "exerciseKey": "burpee",
    "name": "Burpee",
    "category": "Full body",
    "tracking": "reps",
    "aliases": [
      "Burpee"
    ],
    "strongId": "886d4155-ee4e-40ee-9da6-bda3dd44824d"
  },
  {
    "exerciseKey": "cable-kickback",
    "name": "Cable Kickback",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Cable Kickback"
    ],
    "strongId": "b45be635-5eac-4d46-8071-607c1b1834cc"
  },
  {
    "exerciseKey": "cable-pull-through",
    "name": "Cable Pull Through",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Cable Pull Through"
    ],
    "strongId": "c8fc2454-6b09-4e28-a762-397cca489fd2"
  },
  {
    "exerciseKey": "cable-twist",
    "name": "Cable Twist",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Cable Twist"
    ],
    "strongId": "75c0cf08-e391-466c-83c5-565d1b278244"
  },
  {
    "exerciseKey": "calf-press-on-leg-press",
    "name": "Calf Press on Leg Press",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Calf Press on Leg Press"
    ],
    "strongId": "819a0ba2-0a52-41f9-81dc-8f00c1f5a55d"
  },
  {
    "exerciseKey": "calf-press-on-seated-leg-press",
    "name": "Calf Press on Seated Leg Press",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Calf Press on Seated Leg Press"
    ],
    "strongId": "21ddb847-98cd-4f6c-bea5-1df51163973d"
  },
  {
    "exerciseKey": "chest-dip",
    "name": "Chest Dip",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Chest Dip"
    ],
    "strongId": "d340b2a7-9a2a-4130-b7bc-8903847ed565"
  },
  {
    "exerciseKey": "chest-dip-assisted",
    "name": "Chest Dip (Assisted)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "assistance",
    "aliases": [
      "Chest Dip (Assisted)"
    ],
    "strongId": "78e4a335-96b9-4492-a0f0-0ea26a6f69ca"
  },
  {
    "exerciseKey": "chest-fly",
    "name": "Chest Fly",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Chest Fly"
    ],
    "strongId": "a60fd1af-31d7-4235-92cd-57f76d1c39e9"
  },
  {
    "exerciseKey": "chest-fly-band",
    "name": "Chest Fly (Band)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Chest Fly (Band)"
    ],
    "strongId": "494b775e-663e-44ea-8cfb-6129de11236f"
  },
  {
    "exerciseKey": "chest-fly-dumbbell",
    "name": "Chest Fly (Dumbbell)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Chest Fly (Dumbbell)"
    ],
    "strongId": "b820cd1b-1eff-46c5-80b6-12055f927082"
  },
  {
    "exerciseKey": "chest-press-band",
    "name": "Chest Press (Band)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Chest Press (Band)"
    ],
    "strongId": "3c226a8c-4399-4d98-a1fa-339e1672a163"
  },
  {
    "exerciseKey": "chin-up",
    "name": "Chin Up",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Chin Up"
    ],
    "strongId": "52141694-cabc-4776-91c5-503b3ef6d0ff"
  },
  {
    "exerciseKey": "chin-up-assisted",
    "name": "Chin Up (Assisted)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "assistance",
    "aliases": [
      "Chin Up (Assisted)"
    ],
    "strongId": "ac66c13f-2764-4a74-b4ad-01223fd0a9f5"
  },
  {
    "exerciseKey": "clean-barbell",
    "name": "Clean (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Clean (Barbell)"
    ],
    "strongId": "e4bd5013-4679-4091-8695-310a67b2e2df"
  },
  {
    "exerciseKey": "clean-and-jerk-barbell",
    "name": "Clean and Jerk (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Clean and Jerk (Barbell)"
    ],
    "strongId": "bb8099c1-43ad-4fb7-bf0e-a736a4f7b58c"
  },
  {
    "exerciseKey": "climbing",
    "name": "Climbing",
    "category": "Cardio",
    "tracking": "duration",
    "aliases": [
      "Climbing"
    ],
    "strongId": "0ea248ec-76d2-47b1-aba5-c35160a3236f"
  },
  {
    "exerciseKey": "concentration-curl-dumbbell",
    "name": "Concentration Curl (Dumbbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Concentration Curl (Dumbbell)"
    ],
    "strongId": "2d2c4ccc-6755-4e13-a70b-feeb37f05505"
  },
  {
    "exerciseKey": "cross-body-crunch",
    "name": "Cross Body Crunch",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Cross Body Crunch"
    ],
    "strongId": "9ecccc7c-1846-4f58-8b63-fe4694915296"
  },
  {
    "exerciseKey": "crunch",
    "name": "Crunch",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Crunch"
    ],
    "strongId": "2dc47f38-396c-492a-94e2-f4aa9d012308"
  },
  {
    "exerciseKey": "crunch-machine",
    "name": "Crunch (Machine)",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Crunch (Machine)"
    ],
    "strongId": "bb94b95b-ecb0-4b90-94e3-8f6e557f774b"
  },
  {
    "exerciseKey": "crunch-stability-ball",
    "name": "Crunch (Stability Ball)",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Crunch (Stability Ball)"
    ],
    "strongId": "61e7712d-f60f-47d3-921a-f02d5b72b808"
  },
  {
    "exerciseKey": "cycling",
    "name": "Cycling",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Cycling"
    ],
    "strongId": "609a559a-a6a7-424b-8ac9-3d61d254e6d3"
  },
  {
    "exerciseKey": "cycling-indoor",
    "name": "Cycling (Indoor)",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Cycling (Indoor)"
    ],
    "strongId": "9a426b99-2830-4249-8314-bab46945fb77"
  },
  {
    "exerciseKey": "deadlift-band",
    "name": "Deadlift (Band)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Deadlift (Band)"
    ],
    "strongId": "6edf0381-ebaf-4163-9f0f-f6099f9e29ff"
  },
  {
    "exerciseKey": "deadlift-dumbbell",
    "name": "Deadlift (Dumbbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Deadlift (Dumbbell)"
    ],
    "strongId": "84a59482-5faf-451d-b5a9-6e98e868f006"
  },
  {
    "exerciseKey": "deadlift-smith-machine",
    "name": "Deadlift (Smith Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Deadlift (Smith Machine)"
    ],
    "strongId": "9000fcaf-155a-410e-b774-ee1dce73b62d"
  },
  {
    "exerciseKey": "deadlift-high-pull-barbell",
    "name": "Deadlift High Pull (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Deadlift High Pull (Barbell)"
    ],
    "strongId": "33474127-a045-46b7-b70d-4165cac41463"
  },
  {
    "exerciseKey": "decline-bench-press-barbell",
    "name": "Decline Bench Press (Barbell)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Decline Bench Press (Barbell)"
    ],
    "strongId": "9fd88d17-da0e-4abb-b5a6-77a934697877"
  },
  {
    "exerciseKey": "decline-bench-press-dumbbell",
    "name": "Decline Bench Press (Dumbbell)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Decline Bench Press (Dumbbell)"
    ],
    "strongId": "6f7f2abf-43f9-414c-8fc9-cc02193c9669"
  },
  {
    "exerciseKey": "decline-bench-press-smith-machine",
    "name": "Decline Bench Press (Smith Machine)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Decline Bench Press (Smith Machine)"
    ],
    "strongId": "4a8de470-a971-45db-830e-5f4b28db0894"
  },
  {
    "exerciseKey": "decline-crunch",
    "name": "Decline Crunch",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Decline Crunch"
    ],
    "strongId": "b17772de-f3ec-471b-8485-08ecffe4a595"
  },
  {
    "exerciseKey": "deficit-deadlift-barbell",
    "name": "Deficit Deadlift (Barbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Deficit Deadlift (Barbell)"
    ],
    "strongId": "c0748e6e-3a6a-4217-8912-0c2cc92ec704"
  },
  {
    "exerciseKey": "elliptical-machine",
    "name": "Elliptical Machine",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Elliptical Machine"
    ],
    "strongId": "4464e3b1-c412-4047-a5b9-8cdb7c8fe7b3"
  },
  {
    "exerciseKey": "flat-knee-raise",
    "name": "Flat Knee Raise",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Flat Knee Raise"
    ],
    "strongId": "44fc5df2-520e-45d5-8810-c9e74b174e49"
  },
  {
    "exerciseKey": "flat-leg-raise",
    "name": "Flat Leg Raise",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Flat Leg Raise"
    ],
    "strongId": "c331ae12-b44a-426f-ac97-4c5169c0a74f"
  },
  {
    "exerciseKey": "floor-press-barbell",
    "name": "Floor Press (Barbell)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Floor Press (Barbell)"
    ],
    "strongId": "8ea57d93-b289-47ee-9f0b-ecd4d8eb4fa3"
  },
  {
    "exerciseKey": "front-raise-band",
    "name": "Front Raise (Band)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Front Raise (Band)"
    ],
    "strongId": "ec4d5ff5-bd4d-4b33-b785-7db1c36054f8"
  },
  {
    "exerciseKey": "front-raise-barbell",
    "name": "Front Raise (Barbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Front Raise (Barbell)"
    ],
    "strongId": "594e8ce0-a34a-4349-8dc0-7ac45950b8c8"
  },
  {
    "exerciseKey": "front-raise-cable",
    "name": "Front Raise (Cable)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Front Raise (Cable)"
    ],
    "strongId": "b292faa1-44cf-4aa3-9670-43200c2d1832"
  },
  {
    "exerciseKey": "front-raise-plate",
    "name": "Front Raise (Plate)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Front Raise (Plate)"
    ],
    "strongId": "a1b1a1cb-dacc-4d18-bf62-95d597db6715"
  },
  {
    "exerciseKey": "glute-ham-raise",
    "name": "Glute Ham Raise",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Glute Ham Raise"
    ],
    "strongId": "bf2b8a82-3e96-47ca-a106-796e23193444"
  },
  {
    "exerciseKey": "glute-kickback-machine",
    "name": "Glute Kickback (Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Glute Kickback (Machine)"
    ],
    "strongId": "88b0165c-0c7c-423a-949d-0171baa354c2"
  },
  {
    "exerciseKey": "good-morning-barbell",
    "name": "Good Morning (Barbell)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Good Morning (Barbell)",
      "Barbell good morning",
      "Good mornings"
    ],
    "strongId": "8bf32b15-4ee9-49bc-87ae-57284e44b433"
  },
  {
    "exerciseKey": "hack-squat",
    "name": "Hack Squat",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hack Squat"
    ],
    "strongId": "2c0cfe0e-df0b-4e85-946c-8acef3ffa7e5"
  },
  {
    "exerciseKey": "hack-squat-barbell",
    "name": "Hack Squat (Barbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hack Squat (Barbell)"
    ],
    "strongId": "894a9de0-b8f3-4f7f-8102-6bf9cc8c5c6e"
  },
  {
    "exerciseKey": "hammer-curl-band",
    "name": "Hammer Curl (Band)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Hammer Curl (Band)"
    ],
    "strongId": "16828b87-c3bb-4641-ab68-c0c0d38d6bea"
  },
  {
    "exerciseKey": "hammer-curl-cable",
    "name": "Hammer Curl (Cable)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hammer Curl (Cable)"
    ],
    "strongId": "4a304d9a-9a7a-440f-bb9a-9fd5cde6b590"
  },
  {
    "exerciseKey": "handstand-push-up",
    "name": "Handstand Push Up",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Handstand Push Up"
    ],
    "strongId": "3395ead5-bd9b-4d02-be71-dc2b1ee5f16d"
  },
  {
    "exerciseKey": "hang-clean-barbell",
    "name": "Hang Clean (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hang Clean (Barbell)"
    ],
    "strongId": "a5fbd395-09b3-473e-95a2-7275750666ad"
  },
  {
    "exerciseKey": "hang-snatch-barbell",
    "name": "Hang Snatch (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hang Snatch (Barbell)"
    ],
    "strongId": "e6336f12-c2ff-4a76-b64e-3a1bc0d0a528"
  },
  {
    "exerciseKey": "hanging-knee-raise",
    "name": "Hanging Knee Raise",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Hanging Knee Raise"
    ],
    "strongId": "4d2ae4fc-1cf8-4d12-b1f6-b1d607b9b8b4"
  },
  {
    "exerciseKey": "high-knee-skips",
    "name": "High Knee Skips",
    "category": "Legs",
    "tracking": "reps",
    "aliases": [
      "High Knee Skips"
    ],
    "strongId": "29b69647-23ec-4da7-9299-89b8eb1fbf68"
  },
  {
    "exerciseKey": "hiking",
    "name": "Hiking",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Hiking"
    ],
    "strongId": "8ca4f443-ff3b-4501-97da-47c0792b2e40"
  },
  {
    "exerciseKey": "hip-adductor-machine",
    "name": "Hip Adductor (Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Hip Adductor (Machine)",
      "Hip adduction"
    ],
    "strongId": "312f0076-00f8-47a4-9365-38c80b99cb91"
  },
  {
    "exerciseKey": "hip-thrust-bodyweight",
    "name": "Hip Thrust (Bodyweight)",
    "category": "Legs",
    "tracking": "reps",
    "aliases": [
      "Hip Thrust (Bodyweight)"
    ],
    "strongId": "70192f8e-971a-4c67-ab93-ed05932b24e6"
  },
  {
    "exerciseKey": "incline-bench-press-barbell",
    "name": "Incline Bench Press (Barbell)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Incline Bench Press (Barbell)"
    ],
    "strongId": "63d3c1b2-26b5-49bc-9ed9-3ea000e5768d"
  },
  {
    "exerciseKey": "incline-bench-press-cable",
    "name": "Incline Bench Press (Cable)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Incline Bench Press (Cable)"
    ],
    "strongId": "7f6f4c96-4893-4f40-a7f4-2baf53cb3d04"
  },
  {
    "exerciseKey": "incline-bench-press-smith-machine",
    "name": "Incline Bench Press (Smith Machine)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Incline Bench Press (Smith Machine)"
    ],
    "strongId": "980cb0df-4ef3-4af7-9333-48ee9f3943ce"
  },
  {
    "exerciseKey": "incline-chest-fly-dumbbell",
    "name": "Incline Chest Fly (Dumbbell)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Incline Chest Fly (Dumbbell)"
    ],
    "strongId": "b17b3529-a04b-4860-84ea-16b6de4b65cc"
  },
  {
    "exerciseKey": "incline-chest-press-machine",
    "name": "Incline Chest Press (Machine)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Incline Chest Press (Machine)"
    ],
    "strongId": "247fe479-b90c-40a3-baf1-07f3c05ed014"
  },
  {
    "exerciseKey": "incline-curl-dumbbell",
    "name": "Incline Curl (Dumbbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Incline Curl (Dumbbell)"
    ],
    "strongId": "a45a5776-cbfc-4abf-9a05-f5c7d110c8ff"
  },
  {
    "exerciseKey": "inverted-row-bodyweight",
    "name": "Inverted Row (Bodyweight)",
    "category": "Back",
    "tracking": "reps",
    "aliases": [
      "Inverted Row (Bodyweight)"
    ],
    "strongId": "9a999f16-ca2a-47bf-a96c-b4977a6173ff"
  },
  {
    "exerciseKey": "iso-lateral-chest-press-machine",
    "name": "Iso-Lateral Chest Press (Machine)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Iso-Lateral Chest Press (Machine)"
    ],
    "strongId": "b710665a-f88e-4d31-99bf-5ecb7b5f6500"
  },
  {
    "exerciseKey": "iso-lateral-row-machine",
    "name": "Iso-Lateral Row (Machine)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Iso-Lateral Row (Machine)"
    ],
    "strongId": "65e1c38c-2013-40df-9d57-716a7f7f71e1"
  },
  {
    "exerciseKey": "jackknife-sit-up",
    "name": "Jackknife Sit Up",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Jackknife Sit Up"
    ],
    "strongId": "1ea74f7f-6828-4a9e-8bbb-0c17523ec40a"
  },
  {
    "exerciseKey": "jump-rope",
    "name": "Jump Rope",
    "category": "Cardio",
    "tracking": "reps",
    "aliases": [
      "Jump Rope"
    ],
    "strongId": "6f3480e3-5172-4499-9bba-a4516698d6b9"
  },
  {
    "exerciseKey": "jump-shrug-barbell",
    "name": "Jump Shrug (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Jump Shrug (Barbell)"
    ],
    "strongId": "e4c5920a-0b6b-485c-9b38-9ec25eaae77b"
  },
  {
    "exerciseKey": "jump-squat",
    "name": "Jump Squat",
    "category": "Legs",
    "tracking": "reps",
    "aliases": [
      "Jump Squat"
    ],
    "strongId": "2de0ec86-52dd-4b20-bae1-375c412adfa6"
  },
  {
    "exerciseKey": "jumping-jack",
    "name": "Jumping Jack",
    "category": "Full body",
    "tracking": "reps",
    "aliases": [
      "Jumping Jack"
    ],
    "strongId": "71bfded1-f19a-418e-8f97-0e23b2e63535"
  },
  {
    "exerciseKey": "kettlebell-swing",
    "name": "Kettlebell Swing",
    "category": "Full body",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Kettlebell Swing"
    ],
    "strongId": "74a43a3f-5e0b-43c8-953e-f7e9c7d72986"
  },
  {
    "exerciseKey": "kettlebell-turkish-get-up",
    "name": "Kettlebell Turkish Get Up",
    "category": "Full body",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Kettlebell Turkish Get Up",
      "Turkish get-up",
      "TGU"
    ],
    "strongId": "e676f31d-5fa2-4a61-bed6-af0ff6c17c77"
  },
  {
    "exerciseKey": "kipping-pull-up",
    "name": "Kipping Pull Up",
    "category": "Back",
    "tracking": "reps",
    "aliases": [
      "Kipping Pull Up"
    ],
    "strongId": "faa4fd79-b28f-40d9-b528-023a0ae23b26"
  },
  {
    "exerciseKey": "knee-raise-captain-s-chair",
    "name": "Knee Raise (Captain's Chair)",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Knee Raise (Captain's Chair)"
    ],
    "strongId": "3ee4f524-773c-453b-bcb9-192f9c6a2efa"
  },
  {
    "exerciseKey": "kneeling-pulldown-band",
    "name": "Kneeling Pulldown (Band)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Kneeling Pulldown (Band)"
    ],
    "strongId": "eff696f8-07e3-4745-aa31-a0def4c93ed1"
  },
  {
    "exerciseKey": "knees-to-elbows",
    "name": "Knees to Elbows",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Knees to Elbows"
    ],
    "strongId": "6df7b87b-4467-43b6-9458-6ade61838823"
  },
  {
    "exerciseKey": "lat-pulldown-cable",
    "name": "Lat Pulldown (Cable)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lat Pulldown (Cable)"
    ],
    "strongId": "b92aa3dd-98e1-4e99-a229-434be54c1ae5"
  },
  {
    "exerciseKey": "lat-pulldown-machine",
    "name": "Lat Pulldown (Machine)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lat Pulldown (Machine)"
    ],
    "strongId": "a8121bda-a232-4da2-be80-85bbe05c53d7"
  },
  {
    "exerciseKey": "lat-pulldown-single-arm",
    "name": "Lat Pulldown (Single Arm)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lat Pulldown (Single Arm)"
    ],
    "strongId": "b1c68d18-cdc5-466a-96ea-c233473541dc"
  },
  {
    "exerciseKey": "lat-pulldown-underhand-band",
    "name": "Lat Pulldown - Underhand (Band)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Lat Pulldown - Underhand (Band)"
    ],
    "strongId": "2f413df1-9169-4b49-bc97-be82ae29b0a5"
  },
  {
    "exerciseKey": "lat-pulldown-underhand-cable",
    "name": "Lat Pulldown - Underhand (Cable)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lat Pulldown - Underhand (Cable)"
    ],
    "strongId": "fbd89dfb-0de7-4808-86d7-979d6f35126a"
  },
  {
    "exerciseKey": "lateral-box-jump",
    "name": "Lateral Box Jump",
    "category": "Legs",
    "tracking": "reps",
    "aliases": [
      "Lateral Box Jump"
    ],
    "strongId": "d1f2e4d1-2529-4d33-bfd1-3c22b7d99dbd"
  },
  {
    "exerciseKey": "lateral-raise-band",
    "name": "Lateral Raise (Band)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Lateral Raise (Band)"
    ],
    "strongId": "3a438aef-3262-4b10-af0b-07a17c6694a7"
  },
  {
    "exerciseKey": "lateral-raise-cable",
    "name": "Lateral Raise (Cable)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lateral Raise (Cable)"
    ],
    "strongId": "091ba495-1623-4578-95f0-5bd1aeebf3e9"
  },
  {
    "exerciseKey": "lateral-raise-machine",
    "name": "Lateral Raise (Machine)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lateral Raise (Machine)"
    ],
    "strongId": "d3f21789-0e0c-4c2a-a633-3617f383a11d"
  },
  {
    "exerciseKey": "lunge-barbell",
    "name": "Lunge (Barbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lunge (Barbell)"
    ],
    "strongId": "f6e4ceab-9cd9-43ec-8f16-650f8caba2b4"
  },
  {
    "exerciseKey": "lunge-bodyweight",
    "name": "Lunge (Bodyweight)",
    "category": "Legs",
    "tracking": "reps",
    "aliases": [
      "Lunge (Bodyweight)"
    ],
    "strongId": "0891014c-f2f0-4883-acdd-6dead68ced8e"
  },
  {
    "exerciseKey": "lunge-dumbbell",
    "name": "Lunge (Dumbbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Lunge (Dumbbell)"
    ],
    "strongId": "94bd6a11-1ef7-4d52-a373-00200a7a21cb"
  },
  {
    "exerciseKey": "mountain-climber",
    "name": "Mountain Climber",
    "category": "Full body",
    "tracking": "reps",
    "aliases": [
      "Mountain Climber"
    ],
    "strongId": "d29b9cde-54e4-41df-b3ef-2e7e9bb05806"
  },
  {
    "exerciseKey": "muscle-up",
    "name": "Muscle Up",
    "category": "Full body",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Muscle Up"
    ],
    "strongId": "402c550a-194e-4b58-a2ec-b12e5b404547"
  },
  {
    "exerciseKey": "oblique-crunch",
    "name": "Oblique Crunch",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Oblique Crunch"
    ],
    "strongId": "9d6c15df-f4a9-4e18-92b3-259a8f43a356"
  },
  {
    "exerciseKey": "overhead-press-barbell",
    "name": "Overhead Press (Barbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Overhead Press (Barbell)"
    ],
    "strongId": "4d563338-f2ed-430d-ae12-ec45482edf20"
  },
  {
    "exerciseKey": "overhead-press-cable",
    "name": "Overhead Press (Cable)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Overhead Press (Cable)"
    ],
    "strongId": "45fbc14c-584e-473f-81f3-14ad422906be"
  },
  {
    "exerciseKey": "overhead-press-dumbbell",
    "name": "Overhead Press (Dumbbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Overhead Press (Dumbbell)"
    ],
    "strongId": "700ac5e1-6303-4c5d-921e-1007cd0998e5"
  },
  {
    "exerciseKey": "overhead-press-smith-machine",
    "name": "Overhead Press (Smith Machine)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Overhead Press (Smith Machine)"
    ],
    "strongId": "8951200e-5791-4885-bee1-cacac5d08c77"
  },
  {
    "exerciseKey": "overhead-squat-barbell",
    "name": "Overhead Squat (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Overhead Squat (Barbell)"
    ],
    "strongId": "c52fe00e-8ae8-4ea6-a287-4903f5c500ce"
  },
  {
    "exerciseKey": "pendlay-row-barbell",
    "name": "Pendlay Row (Barbell)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Pendlay Row (Barbell)",
      "Dead-stop barbell row",
      "Pendlay row",
      "Barbell row from floor"
    ],
    "strongId": "2d20bcc4-2a19-4016-9583-f74cdccb1f16"
  },
  {
    "exerciseKey": "pistol-squat",
    "name": "Pistol Squat",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Pistol Squat"
    ],
    "strongId": "ad292205-db0e-4ced-9cef-f82b8aa243d5"
  },
  {
    "exerciseKey": "power-clean",
    "name": "Power Clean",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Power Clean"
    ],
    "strongId": "c40d8757-5c97-4543-bc13-5cb87c315bc2"
  },
  {
    "exerciseKey": "power-snatch-barbell",
    "name": "Power Snatch (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Power Snatch (Barbell)"
    ],
    "strongId": "832eac71-da90-4faa-9031-8875081479d3"
  },
  {
    "exerciseKey": "preacher-curl-dumbbell",
    "name": "Preacher Curl (Dumbbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Preacher Curl (Dumbbell)"
    ],
    "strongId": "815c8007-0c79-4f8d-a2b8-873f7c03be9a"
  },
  {
    "exerciseKey": "preacher-curl-machine",
    "name": "Preacher Curl (Machine)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Preacher Curl (Machine)"
    ],
    "strongId": "a8eb5de6-5b77-4e81-adab-0835729506c7"
  },
  {
    "exerciseKey": "press-under-barbell",
    "name": "Press Under (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Press Under (Barbell)"
    ],
    "strongId": "83d40255-ea20-41de-9e13-d4893c100707"
  },
  {
    "exerciseKey": "pull-up-assisted",
    "name": "Pull Up (Assisted)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "assistance",
    "aliases": [
      "Pull Up (Assisted)"
    ],
    "strongId": "820ee004-4443-49d3-aeeb-50b0a53298dc"
  },
  {
    "exerciseKey": "pullover-dumbbell",
    "name": "Pullover (Dumbbell)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Pullover (Dumbbell)"
    ],
    "strongId": "1a9537c6-f56a-4d4e-a491-c5c172cfa5ed"
  },
  {
    "exerciseKey": "pullover-machine",
    "name": "Pullover (Machine)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Pullover (Machine)"
    ],
    "strongId": "04e2090c-a84e-47a1-81c5-55103b28ed2f"
  },
  {
    "exerciseKey": "push-press",
    "name": "Push Press",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Push Press"
    ],
    "strongId": "2506457c-207c-4a15-86b4-281257cb2c4d"
  },
  {
    "exerciseKey": "push-up-band",
    "name": "Push Up (Band)",
    "category": "Chest",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Push Up (Band)"
    ],
    "strongId": "e6af1fc0-c961-4e74-a815-61f61e4fe42b"
  },
  {
    "exerciseKey": "push-up-knees",
    "name": "Push Up (Knees)",
    "category": "Chest",
    "tracking": "reps",
    "aliases": [
      "Push Up (Knees)"
    ],
    "strongId": "b444429e-86ba-4b58-9584-224c9148e0ab"
  },
  {
    "exerciseKey": "rack-pull-barbell",
    "name": "Rack Pull (Barbell)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Rack Pull (Barbell)"
    ],
    "strongId": "cffa1438-6d77-4a8d-8493-b8d7529d61ba"
  },
  {
    "exerciseKey": "reverse-crunch",
    "name": "Reverse Crunch",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Reverse Crunch"
    ],
    "strongId": "910e476e-c32d-44a8-b0a5-68ee05d72011"
  },
  {
    "exerciseKey": "reverse-curl-band",
    "name": "Reverse Curl (Band)",
    "category": "Arms",
    "tracking": "reps",
    "aliases": [
      "Reverse Curl (Band)"
    ],
    "strongId": "26c6975a-b7f5-4eec-8129-527a07a59d73"
  },
  {
    "exerciseKey": "reverse-curl-barbell",
    "name": "Reverse Curl (Barbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Reverse Curl (Barbell)"
    ],
    "strongId": "222b6cd5-87f3-42b7-9a0e-1ab4f4de59ee"
  },
  {
    "exerciseKey": "reverse-curl-dumbbell",
    "name": "Reverse Curl (Dumbbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Reverse Curl (Dumbbell)"
    ],
    "strongId": "e51ee0d8-bfa7-4bcf-b11d-86997a38c298"
  },
  {
    "exerciseKey": "reverse-fly-cable",
    "name": "Reverse Fly (Cable)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Reverse Fly (Cable)"
    ],
    "strongId": "56f23487-1b65-4d4e-bcba-9d7a424110ef"
  },
  {
    "exerciseKey": "reverse-fly-dumbbell",
    "name": "Reverse Fly (Dumbbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Reverse Fly (Dumbbell)",
      "Chest-supported rear delt fly",
      "Incline reverse dumbbell fly"
    ],
    "strongId": "edd6d6dd-2605-414a-bf0d-5ac3e41b8c06"
  },
  {
    "exerciseKey": "reverse-fly-machine",
    "name": "Reverse Fly (Machine)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Reverse Fly (Machine)"
    ],
    "strongId": "8dc8a29b-674b-43c9-bf6e-46b95f3414be"
  },
  {
    "exerciseKey": "reverse-grip-concentration-curl-dumbbell",
    "name": "Reverse Grip Concentration Curl (Dumbbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Reverse Grip Concentration Curl (Dumbbell)"
    ],
    "strongId": "a953b453-9eb2-4c4e-bc55-9962770702f1"
  },
  {
    "exerciseKey": "reverse-plank",
    "name": "Reverse Plank",
    "category": "Core",
    "tracking": "duration",
    "aliases": [
      "Reverse Plank"
    ],
    "strongId": "3d2c4225-a113-4501-bf6b-abe7503dee9e"
  },
  {
    "exerciseKey": "romanian-deadlift-dumbbell",
    "name": "Romanian Deadlift (Dumbbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Romanian Deadlift (Dumbbell)"
    ],
    "strongId": "045d89bc-900c-444f-b72a-3852a05ef78f"
  },
  {
    "exerciseKey": "rowing-machine",
    "name": "Rowing (Machine)",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Rowing (Machine)"
    ],
    "strongId": "fbcdaa3f-9dbd-4622-b7bc-6f45e1267feb"
  },
  {
    "exerciseKey": "running",
    "name": "Running",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Running"
    ],
    "strongId": "a35d3d7c-6093-47b9-b4dc-939c4d799169"
  },
  {
    "exerciseKey": "running-treadmill",
    "name": "Running (Treadmill)",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Running (Treadmill)"
    ],
    "strongId": "2a19b409-da25-48de-8205-3fb89f7e95f2"
  },
  {
    "exerciseKey": "russian-twist-bodyweight",
    "name": "Russian Twist",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Russian Twist"
    ],
    "strongId": "f56c1c33-30be-4259-8ace-7ffc1bfea1d7"
  },
  {
    "exerciseKey": "seated-calf-raise-machine",
    "name": "Seated Calf Raise (Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Calf Raise (Machine)"
    ],
    "strongId": "231a78da-13dc-441d-ac31-03d5730e8168"
  },
  {
    "exerciseKey": "seated-leg-curl-machine",
    "name": "Seated Leg Curl (Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Leg Curl (Machine)"
    ],
    "strongId": "c9ef4e7a-2bec-41b1-8e62-b68dc6d81fb2"
  },
  {
    "exerciseKey": "seated-leg-press-machine",
    "name": "Seated Leg Press (Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Leg Press (Machine)"
    ],
    "strongId": "d53099b7-31f3-41fa-99e2-72fdf47c4503"
  },
  {
    "exerciseKey": "seated-palms-up-wrist-curl-dumbbell",
    "name": "Seated Palms Up Wrist Curl (Dumbbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Palms Up Wrist Curl (Dumbbell)"
    ],
    "strongId": "8304df34-df61-423e-a9c9-f0cce6f16428"
  },
  {
    "exerciseKey": "seated-row-machine",
    "name": "Seated Row (Machine)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Row (Machine)"
    ],
    "strongId": "534954cb-6720-45c4-bf63-a0766142ec6c"
  },
  {
    "exerciseKey": "seated-wide-grip-row-cable",
    "name": "Seated Wide-Grip Row (Cable)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Seated Wide-Grip Row (Cable)"
    ],
    "strongId": "aa185f9c-9341-4260-b007-593e9b74db10"
  },
  {
    "exerciseKey": "shoulder-press-machine",
    "name": "Shoulder Press (Machine)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Shoulder Press (Machine)"
    ],
    "strongId": "a3f1d57d-da0e-466d-a691-c03695d39418"
  },
  {
    "exerciseKey": "shoulder-press-plate-loaded",
    "name": "Shoulder Press (Plate Loaded)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Shoulder Press (Plate Loaded)"
    ],
    "strongId": "caa35db9-e106-4915-840c-e7205f6e7228"
  },
  {
    "exerciseKey": "shrug-barbell",
    "name": "Shrug (Barbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Shrug (Barbell)"
    ],
    "strongId": "ba31414c-4bd8-441b-9e1a-56a68220831b"
  },
  {
    "exerciseKey": "shrug-dumbbell",
    "name": "Shrug (Dumbbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Shrug (Dumbbell)"
    ],
    "strongId": "cbacf25c-6c34-42ec-bcfd-d1941d757dc1"
  },
  {
    "exerciseKey": "shrug-machine",
    "name": "Shrug (Machine)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Shrug (Machine)"
    ],
    "strongId": "3e15b3fa-bd04-49ff-a622-633208a2d5df"
  },
  {
    "exerciseKey": "shrug-smith-machine",
    "name": "Shrug (Smith Machine)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Shrug (Smith Machine)"
    ],
    "strongId": "f31e19c8-1671-40e4-9089-e341fffe7751"
  },
  {
    "exerciseKey": "side-bend-band",
    "name": "Side Bend (Band)",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Side Bend (Band)"
    ],
    "strongId": "3b8b97d5-57eb-427c-85b1-4e9222593a97"
  },
  {
    "exerciseKey": "side-bend-cable",
    "name": "Side Bend (Cable)",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Side Bend (Cable)"
    ],
    "strongId": "1edc86ac-5c4a-46b4-a29b-04141141ff6b"
  },
  {
    "exerciseKey": "side-bend-dumbbell",
    "name": "Side Bend (Dumbbell)",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Side Bend (Dumbbell)"
    ],
    "strongId": "79f272a9-2d7f-4df0-ac75-d7d973f1df25"
  },
  {
    "exerciseKey": "side-plank",
    "name": "Side Plank",
    "category": "Core",
    "tracking": "duration",
    "aliases": [
      "Side Plank"
    ],
    "strongId": "7837fcaf-0843-491c-bd3b-cf579cfa06b0"
  },
  {
    "exerciseKey": "single-leg-bridge",
    "name": "Single Leg Bridge",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Single Leg Bridge"
    ],
    "strongId": "acaf0999-7976-48f6-a5fc-80c0d6d7bb67"
  },
  {
    "exerciseKey": "sit-up",
    "name": "Sit Up",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Sit Up"
    ],
    "strongId": "784d5217-cc1a-4267-bb18-4bf611903c49"
  },
  {
    "exerciseKey": "skating",
    "name": "Skating",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Skating"
    ],
    "strongId": "95aef7e7-e232-4442-851e-2231e7b54317"
  },
  {
    "exerciseKey": "skiing",
    "name": "Skiing",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Skiing"
    ],
    "strongId": "1a7d1360-cffb-4972-9e6b-70e7e5d3e6f0"
  },
  {
    "exerciseKey": "skullcrusher-dumbbell",
    "name": "Skullcrusher (Dumbbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Skullcrusher (Dumbbell)"
    ],
    "strongId": "237314ed-ead7-406c-92db-a20de0a9166f"
  },
  {
    "exerciseKey": "snatch-barbell",
    "name": "Snatch (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Snatch (Barbell)"
    ],
    "strongId": "e7b25cc7-693d-4ede-991f-62d32d3d69e9"
  },
  {
    "exerciseKey": "snatch-pull-barbell",
    "name": "Snatch Pull (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Snatch Pull (Barbell)"
    ],
    "strongId": "fc0eaffb-e4d3-433e-8c19-7be1fdb0b0dc"
  },
  {
    "exerciseKey": "snowboarding",
    "name": "Snowboarding",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Snowboarding"
    ],
    "strongId": "9f09ef70-ea15-49a1-b6a2-0d197e95bf3b"
  },
  {
    "exerciseKey": "split-jerk-barbell",
    "name": "Split Jerk (Barbell)",
    "category": "Olympic",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Split Jerk (Barbell)"
    ],
    "strongId": "04ac1091-7b4c-44fb-9d00-b04fe3c5b1a1"
  },
  {
    "exerciseKey": "squat-band",
    "name": "Squat (Band)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Squat (Band)"
    ],
    "strongId": "0f71ee4c-5dad-4617-8e8d-e8e133afc2c1"
  },
  {
    "exerciseKey": "squat-bodyweight",
    "name": "Squat (Bodyweight)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Squat (Bodyweight)"
    ],
    "strongId": "752349b3-8813-48d2-b315-6ef4d9b4f3cb"
  },
  {
    "exerciseKey": "squat-dumbbell",
    "name": "Squat (Dumbbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Squat (Dumbbell)"
    ],
    "strongId": "3e1394a8-dba1-45d0-bc5c-d6100f8f8154"
  },
  {
    "exerciseKey": "squat-machine",
    "name": "Squat (Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Squat (Machine)"
    ],
    "strongId": "99afdf73-0e2f-4f2d-a10d-90299196b0db"
  },
  {
    "exerciseKey": "squat-smith-machine",
    "name": "Squat (Smith Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Squat (Smith Machine)"
    ],
    "strongId": "a61773eb-580a-448f-9b03-90aeb3c7c83d"
  },
  {
    "exerciseKey": "squat-row-band",
    "name": "Squat Row (Band)",
    "category": "Full body",
    "tracking": "reps",
    "aliases": [
      "Squat Row (Band)"
    ],
    "strongId": "9bf68e10-b954-4d3d-af8b-c3ca21587a70"
  },
  {
    "exerciseKey": "standing-calf-raise-barbell",
    "name": "Standing Calf Raise (Barbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Standing Calf Raise (Barbell)"
    ],
    "strongId": "2abae8f2-b1cc-497c-af76-1c8e88ae3bf6"
  },
  {
    "exerciseKey": "standing-calf-raise-bodyweight",
    "name": "Standing Calf Raise (Bodyweight)",
    "category": "Legs",
    "tracking": "reps",
    "aliases": [
      "Standing Calf Raise (Bodyweight)"
    ],
    "strongId": "4a52954f-4354-4da6-81be-fff191f29f91"
  },
  {
    "exerciseKey": "standing-calf-raise-dumbbell",
    "name": "Standing Calf Raise (Dumbbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Standing Calf Raise (Dumbbell)"
    ],
    "strongId": "ae9f2bee-8c45-4257-b7f2-da345cbf950c"
  },
  {
    "exerciseKey": "standing-calf-raise-smith-machine",
    "name": "Standing Calf Raise (Smith Machine)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Standing Calf Raise (Smith Machine)"
    ],
    "strongId": "14263e88-13d4-4582-9b18-423a36631645"
  },
  {
    "exerciseKey": "step-up",
    "name": "Step-up",
    "category": "Legs",
    "tracking": "reps",
    "aliases": [
      "Step-up"
    ],
    "strongId": "b1827979-7d0e-4d6f-8498-c0b3fb1fe187"
  },
  {
    "exerciseKey": "stiff-leg-deadlift-barbell",
    "name": "Stiff Leg Deadlift (Barbell)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Stiff Leg Deadlift (Barbell)"
    ],
    "strongId": "80057986-ebf3-4adb-8674-d48932b693c6"
  },
  {
    "exerciseKey": "stiff-leg-deadlift-dumbbell",
    "name": "Stiff Leg Deadlift (Dumbbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Stiff Leg Deadlift (Dumbbell)"
    ],
    "strongId": "00980376-619e-4898-b27c-1dde6faa0daa"
  },
  {
    "exerciseKey": "straight-leg-deadlift-band",
    "name": "Straight Leg Deadlift (Band)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Straight Leg Deadlift (Band)"
    ],
    "strongId": "8b2c7487-28e7-48c3-8d07-1ad83cc7133c"
  },
  {
    "exerciseKey": "stretching",
    "name": "Stretching",
    "category": "Mobility",
    "tracking": "duration",
    "aliases": [
      "Stretching"
    ],
    "strongId": "a4689d35-a845-4ad0-aa79-84005b8b9d27"
  },
  {
    "exerciseKey": "strict-military-press-barbell",
    "name": "Strict Military Press (Barbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Strict Military Press (Barbell)",
      "Standing military press",
      "Strict barbell press"
    ],
    "strongId": "5974b925-ff0f-40de-9385-e6ccac763ddd"
  },
  {
    "exerciseKey": "sumo-deadlift-barbell",
    "name": "Sumo Deadlift (Barbell)",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Sumo Deadlift (Barbell)"
    ],
    "strongId": "bed21e75-8a87-4711-847e-7e1b86a74436"
  },
  {
    "exerciseKey": "sumo-deadlift-high-pull-barbell",
    "name": "Sumo Deadlift High Pull (Barbell)",
    "category": "Full body",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Sumo Deadlift High Pull (Barbell)"
    ],
    "strongId": "b49268bb-058e-4139-ac4a-555d1d5ae9fb"
  },
  {
    "exerciseKey": "superman",
    "name": "Superman",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Superman"
    ],
    "strongId": "39c9395b-da2d-40d6-b18c-2a3ab22e3a50"
  },
  {
    "exerciseKey": "swimming",
    "name": "Swimming",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Swimming"
    ],
    "strongId": "a8225200-79fb-4131-8ea2-c4df95f56c77"
  },
  {
    "exerciseKey": "t-bar-row",
    "name": "T Bar Row",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "T Bar Row",
      "T-bar row",
      "Landmine row",
      "Barbell corner row"
    ],
    "strongId": "f21ec917-6402-4938-8103-128fd49d13aa"
  },
  {
    "exerciseKey": "thruster-barbell",
    "name": "Thruster (Barbell)",
    "category": "Full body",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Thruster (Barbell)"
    ],
    "strongId": "d32f8c6a-e498-4fc0-b18d-5ce16680a63c"
  },
  {
    "exerciseKey": "thruster-kettlebell",
    "name": "Thruster (Kettlebell)",
    "category": "Full body",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Thruster (Kettlebell)"
    ],
    "strongId": "55afec19-d074-4083-a554-085f533b62ce"
  },
  {
    "exerciseKey": "toes-to-bar",
    "name": "Toes To Bar",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "Toes To Bar"
    ],
    "strongId": "e0b1aa09-f4c5-4ead-95de-03a2f7530c87"
  },
  {
    "exerciseKey": "torso-rotation-machine",
    "name": "Torso Rotation (Machine)",
    "category": "Core",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Torso Rotation (Machine)"
    ],
    "strongId": "42695e60-4dd7-41a0-8233-c26b1fe24e6e"
  },
  {
    "exerciseKey": "trap-bar-deadlift",
    "name": "Trap Bar Deadlift",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Trap Bar Deadlift"
    ],
    "strongId": "57f573f8-f797-4483-bc1f-5911a70463a6"
  },
  {
    "exerciseKey": "triceps-dip-assisted",
    "name": "Triceps Dip (Assisted)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Triceps Dip (Assisted)"
    ],
    "strongId": "933a3dbf-b9c2-40f9-852f-cd2b26dd9eb1"
  },
  {
    "exerciseKey": "triceps-extension",
    "name": "Triceps Extension",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Triceps Extension"
    ],
    "strongId": "91efd24a-9acc-40dd-8f7f-16a1ab175f33"
  },
  {
    "exerciseKey": "triceps-extension-barbell",
    "name": "Triceps Extension (Barbell)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Triceps Extension (Barbell)"
    ],
    "strongId": "d3560a25-828f-4f33-8624-6fc4875d3cca"
  },
  {
    "exerciseKey": "triceps-extension-cable",
    "name": "Triceps Extension (Cable)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Triceps Extension (Cable)"
    ],
    "strongId": "3718fbd6-a0e5-4d56-bb92-10feb3600156"
  },
  {
    "exerciseKey": "triceps-extension-machine",
    "name": "Triceps Extension (Machine)",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Triceps Extension (Machine)"
    ],
    "strongId": "0973c5dd-5b62-4e9e-a15e-114cb94f440d"
  },
  {
    "exerciseKey": "upright-row-barbell",
    "name": "Upright Row (Barbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Upright Row (Barbell)",
      "Barbell upright row",
      "Standing barbell row to chest"
    ],
    "strongId": "45a0a30b-ffb7-4722-a0cf-2889baa7ff9a"
  },
  {
    "exerciseKey": "upright-row-cable",
    "name": "Upright Row (Cable)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Upright Row (Cable)"
    ],
    "strongId": "b8b33683-ce46-4392-8be5-207fe8e605bd"
  },
  {
    "exerciseKey": "upright-row-dumbbell",
    "name": "Upright Row (Dumbbell)",
    "category": "Shoulders",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Upright Row (Dumbbell)"
    ],
    "strongId": "61f41123-654e-45b9-9c3b-fd4cbea9eaf0"
  },
  {
    "exerciseKey": "v-up",
    "name": "V Up",
    "category": "Core",
    "tracking": "reps",
    "aliases": [
      "V Up"
    ],
    "strongId": "accd839b-4059-451c-b310-1c8aa2739ace"
  },
  {
    "exerciseKey": "walking",
    "name": "Walking",
    "category": "Cardio",
    "tracking": "distance-duration",
    "aliases": [
      "Walking"
    ],
    "strongId": "f7c7a96b-7586-4e2b-b972-3e9e821d8f95"
  },
  {
    "exerciseKey": "wide-pull-up",
    "name": "Wide Pull Up",
    "category": "Back",
    "tracking": "weight-reps",
    "weightMode": "added",
    "aliases": [
      "Wide Pull Up"
    ],
    "strongId": "bea508fb-4d1b-4320-8b34-20502785c6ec"
  },
  {
    "exerciseKey": "wrist-roller",
    "name": "Wrist Roller",
    "category": "Arms",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Wrist Roller"
    ],
    "strongId": "f33643ea-6cc0-4966-8b1a-b87696015072"
  },
  {
    "exerciseKey": "yoga",
    "name": "Yoga",
    "category": "Cardio",
    "tracking": "duration",
    "aliases": [
      "Yoga"
    ],
    "strongId": "6de1b274-f023-49f2-94ec-add08373b7e4"
  },
  {
    "exerciseKey": "zercher-squat-barbell",
    "name": "Zercher Squat (Barbell)",
    "category": "Legs",
    "tracking": "weight-reps",
    "weightMode": "external",
    "aliases": [
      "Zercher Squat (Barbell)"
    ],
    "strongId": "1263f3d4-4ab0-4b59-a65a-626516ca87ab"
  }
];
