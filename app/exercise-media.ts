/** Original mannequin artwork with separately authored exercise guidance.
 * Catalog provenance: public/exercises/strong-catalog.json.
 * Media paths are relative to import.meta.env.BASE_URL.
 */
export const EXERCISE_IMAGE_VERSION = "strong-catalog-v1";

export type ExerciseMedia = {
  images: [string, string] | [string];
  layout?: "paired";
  illustrationNote?: string;
  equipment: string;
  muscles: string[];
  instructions: string[];
  sourceName: string;
  sourceUrl: string;
};

export const EXERCISE_MEDIA: Record<string, ExerciseMedia> = {
  "bench-press": {
    "images": [
      "exercises/bench-press-0.jpg",
      "exercises/bench-press-1.jpg"
    ],
    "equipment": "Barbell · flat bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Lie on a flat bench with feet planted. Grip the bar slightly wider than shoulder width and hold it over your chest.",
      "Keep your shoulder blades against the bench as you lower the bar toward your mid-chest with control.",
      "Press the bar upward until your arms are extended, keeping your wrists over your elbows."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Barbell_Bench_Press_-_Medium_Grip.json"
  },
  "incline-dumbbell-press": {
    "images": [
      "exercises/incline-dumbbell-press-0.jpg",
      "exercises/incline-dumbbell-press-1.jpg"
    ],
    "equipment": "Dumbbells · incline bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Sit against an incline bench with a dumbbell at each shoulder, palms facing forward and feet planted.",
      "Press the dumbbells upward over your upper chest without lifting your back off the bench.",
      "Lower both weights slowly to the starting position, keeping your forearms under the dumbbells."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Incline_Dumbbell_Press.json"
  },
  "dumbbell-bench-press": {
    "images": [
      "exercises/dumbbell-bench-press-0.jpg",
      "exercises/dumbbell-bench-press-1.jpg"
    ],
    "equipment": "Dumbbells · flat bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Lie on a flat bench with feet planted and a dumbbell on either side of your chest, palms facing forward.",
      "Press both weights upward until your arms are extended over your chest.",
      "Lower the dumbbells with control, keeping your shoulder blades supported by the bench."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dumbbell_Bench_Press.json"
  },
  "chest-press-machine": {
    "images": [
      "exercises/chest-press-machine-0.jpg",
      "exercises/chest-press-machine-1.jpg"
    ],
    "equipment": "Chest press machine",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Adjust the seat so the handles are around chest height. Sit with your back against the pad and grasp the handles.",
      "Press the handles forward smoothly, keeping your shoulders against the backrest.",
      "Bend your elbows to bring the handles back with control, without letting the weights slam."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Machine_Bench_Press.json"
  },
  "push-up": {
    "images": [
      "exercises/push-up-0.jpg",
      "exercises/push-up-1.jpg"
    ],
    "equipment": "Bodyweight",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Place your hands slightly wider than shoulder width and extend your legs behind you, forming a straight line from head to heels.",
      "Bend your elbows and lower your chest toward the floor while keeping your hips level.",
      "Press through your hands to return to straight arms without letting your lower back sag."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Pushups.json"
  },
  "cable-fly": {
    "images": [
      "exercises/cable-fly-0.jpg",
      "exercises/cable-fly-1.jpg"
    ],
    "equipment": "Cable machine · high pulleys",
    "muscles": [
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Set the pulleys above shoulder height. Hold a handle in each hand and step forward with a slight lean.",
      "Keep a soft bend in your elbows and bring the handles together in a wide arc in front of your body.",
      "Open your arms slowly to return, keeping your torso still and the movement controlled."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Cable_Crossover.json"
  },
  "pec-deck": {
    "images": [
      "exercises/pec-deck-0.jpg",
      "exercises/pec-deck-1.jpg"
    ],
    "equipment": "Pec deck machine",
    "muscles": [
      "Chest"
    ],
    "instructions": [
      "Adjust the seat so your upper arms are around shoulder height. Sit with your back supported and hold the handles.",
      "Bring your arms together in front of your chest without shrugging or leaning forward.",
      "Return slowly to the open position, staying within a comfortable shoulder range."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Butterfly.json"
  },
  "deadlift": {
    "images": [
      "exercises/deadlift-0.jpg",
      "exercises/deadlift-1.jpg"
    ],
    "equipment": "Barbell",
    "muscles": [
      "Lower back",
      "Calves",
      "Forearms",
      "Glutes",
      "Hamstrings",
      "Lats",
      "Upper back",
      "Quads",
      "Traps"
    ],
    "instructions": [
      "Stand with the bar over your mid-foot. Hinge at your hips, bend your knees and grip the bar just outside your legs.",
      "Brace your torso and push through the floor to stand, keeping the bar close to your legs.",
      "Push your hips back and bend your knees to lower the bar to the floor with control."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Barbell_Deadlift.json"
  },
  "barbell-row": {
    "images": [
      "exercises/barbell-row-0.jpg",
      "exercises/barbell-row-1.jpg"
    ],
    "equipment": "Barbell",
    "muscles": [
      "Upper back",
      "Biceps",
      "Lats",
      "Shoulders"
    ],
    "instructions": [
      "Hold a barbell with an overhand grip. Soften your knees and hinge forward, keeping your back steady.",
      "Pull the bar toward your lower ribs, drawing your elbows back close to your body.",
      "Lower the bar until your arms extend, keeping your torso at the same angle throughout."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Bent_Over_Barbell_Row.json"
  },
  "lat-pulldown": {
    "images": [
      "exercises/lat-pulldown-0.jpg",
      "exercises/lat-pulldown-1.jpg"
    ],
    "equipment": "Cable machine · wide bar",
    "muscles": [
      "Lats",
      "Biceps",
      "Upper back",
      "Shoulders"
    ],
    "instructions": [
      "Sit with your thighs secured under the pads. Grasp the bar with an overhand grip wider than your shoulders.",
      "Keep your chest lifted and pull the bar toward your upper chest, bringing your elbows down.",
      "Let the bar rise slowly until your arms extend, keeping your torso steady."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Wide-Grip_Lat_Pulldown.json"
  },
  "pull-up": {
    "images": [
      "exercises/pull-up-0.jpg",
      "exercises/pull-up-1.jpg"
    ],
    "equipment": "Pull-up bar",
    "muscles": [
      "Lats",
      "Biceps",
      "Upper back"
    ],
    "instructions": [
      "Hang from a pull-up bar with an overhand grip and arms extended. Keep your torso braced.",
      "Pull your body upward by driving your elbows down until your chin reaches above the bar.",
      "Lower yourself slowly to extended arms, avoiding swinging or kicking."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Pullups.json"
  },
  "assisted-pull-up": {
    "images": [
      "exercises/assisted-pull-up-0.jpg",
      "exercises/assisted-pull-up-1.jpg"
    ],
    "equipment": "Resistance band · pull-up bar",
    "muscles": [
      "Lats",
      "Abs",
      "Forearms",
      "Upper back"
    ],
    "instructions": [
      "Secure a suitable assistance band to the bar and place one bent knee into the loop. Grip the bar overhand.",
      "Keep the band secure and pull your body upward, driving your elbows down until your chin clears the bar.",
      "Lower yourself slowly to extended arms while avoiding swinging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Band_Assisted_Pull-Up.json"
  },
  "seated-cable-row": {
    "images": [
      "exercises/seated-cable-row-0.jpg",
      "exercises/seated-cable-row-1.jpg"
    ],
    "equipment": "Cable machine · row handle",
    "muscles": [
      "Upper back",
      "Biceps",
      "Lats",
      "Shoulders"
    ],
    "instructions": [
      "Sit with your feet on the platform and knees slightly bent. Hold the handle with arms extended and your torso upright.",
      "Pull the handle toward your lower ribs, drawing your elbows back without rocking your torso.",
      "Extend your arms slowly to return, keeping your back steady."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Seated_Cable_Rows.json"
  },
  "one-arm-dumbbell-row": {
    "images": [
      "exercises/one-arm-dumbbell-row-0.jpg",
      "exercises/one-arm-dumbbell-row-1.jpg"
    ],
    "equipment": "Dumbbell · flat bench",
    "muscles": [
      "Upper back",
      "Biceps",
      "Lats",
      "Shoulders"
    ],
    "instructions": [
      "Support one hand and knee on a bench. Hold a dumbbell in the opposite hand with your back steady.",
      "Pull the dumbbell toward your hip, keeping your elbow close and shoulders level.",
      "Lower the weight with control until your arm extends, then repeat on the other side."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/One-Arm_Dumbbell_Row.json"
  },
  "chest-supported-row": {
    "images": [
      "exercises/chest-supported-row-0.jpg",
      "exercises/chest-supported-row-1.jpg"
    ],
    "equipment": "Dumbbells · incline bench",
    "muscles": [
      "Upper back",
      "Biceps",
      "Forearms",
      "Lats",
      "Shoulders"
    ],
    "instructions": [
      "Lie chest-down on an incline bench with a dumbbell in each hand and palms facing each other.",
      "Draw your shoulder blades together and pull the dumbbells toward your sides.",
      "Lower the weights slowly to extended arms while keeping your chest on the bench."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dumbbell_Incline_Row.json"
  },
  "straight-arm-pulldown": {
    "images": [
      "exercises/straight-arm-pulldown-0.jpg",
      "exercises/straight-arm-pulldown-1.jpg"
    ],
    "equipment": "Cable machine · straight bar",
    "muscles": [
      "Lats"
    ],
    "instructions": [
      "Face a high pulley and grip the bar overhand. Step back and lean slightly forward with a small bend in your elbows.",
      "Keep your arms nearly straight and pull the bar down toward your thighs.",
      "Allow the bar to rise slowly to shoulder height, keeping your torso and elbow angle steady."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Straight-Arm_Pulldown.json"
  },
  "face-pull": {
    "images": [
      "exercises/face-pull-0.jpg",
      "exercises/face-pull-1.jpg"
    ],
    "equipment": "Cable machine · rope",
    "muscles": [
      "Shoulders",
      "Upper back"
    ],
    "instructions": [
      "Attach a rope to a high pulley and hold its ends. Step back with your arms extended and torso braced.",
      "Pull the rope toward your face, separating the ends and bringing your elbows out to the sides.",
      "Extend your arms slowly to return without leaning back or shrugging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Face_Pull.json"
  },
  "shoulder-press": {
    "images": [
      "exercises/shoulder-press-0.jpg",
      "exercises/shoulder-press-1.jpg"
    ],
    "equipment": "Barbell · seated bench",
    "muscles": [
      "Shoulders",
      "Chest",
      "Triceps"
    ],
    "instructions": [
      "Sit on a bench with back support. Hold a barbell in front of your shoulders with an overhand grip.",
      "Press the bar overhead, keeping your torso braced and the bar in front of your head.",
      "Lower it slowly toward shoulder level while keeping your back supported."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Barbell_Shoulder_Press.json"
  },
  "dumbbell-shoulder-press": {
    "images": [
      "exercises/dumbbell-shoulder-press-0.jpg",
      "exercises/dumbbell-shoulder-press-1.jpg"
    ],
    "equipment": "Dumbbells · seated bench",
    "muscles": [
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Sit against a supported bench with a dumbbell at each shoulder and palms facing forward.",
      "Press both weights overhead without arching your lower back.",
      "Lower the dumbbells slowly to shoulder level, keeping your forearms under the weights."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dumbbell_Shoulder_Press.json"
  },
  "arnold-press": {
    "images": [
      "exercises/arnold-press-0.jpg",
      "exercises/arnold-press-1.jpg"
    ],
    "equipment": "Dumbbells · seated bench",
    "muscles": [
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Sit with dumbbells in front of your shoulders, palms facing you and elbows bent.",
      "Press upward while rotating your palms forward, finishing with the weights overhead.",
      "Lower with control and reverse the rotation so your palms face you again."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Arnold_Dumbbell_Press.json"
  },
  "lateral-raise": {
    "images": [
      "exercises/lateral-raise-0.jpg",
      "exercises/lateral-raise-1.jpg"
    ],
    "equipment": "Dumbbells",
    "muscles": [
      "Shoulders"
    ],
    "instructions": [
      "Stand upright with a dumbbell by each side and a slight bend in your elbows.",
      "Raise your arms out to the sides until the weights reach around shoulder height.",
      "Lower slowly without swinging your torso or shrugging your shoulders."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Side_Lateral_Raise.json"
  },
  "rear-delt-fly": {
    "images": [
      "exercises/rear-delt-fly-0.jpg",
      "exercises/rear-delt-fly-1.jpg"
    ],
    "equipment": "Dumbbells · seated bench",
    "muscles": [
      "Shoulders"
    ],
    "instructions": [
      "Sit on the end of a bench and hinge your torso forward. Let the dumbbells hang below your chest.",
      "Keep a slight bend in your elbows and lift the weights out to the sides.",
      "Lower the dumbbells slowly, keeping your torso steady throughout."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Seated_Bent-Over_Rear_Delt_Raise.json"
  },
  "front-raise": {
    "images": [
      "exercises/front-raise-0.jpg",
      "exercises/front-raise-1.jpg"
    ],
    "equipment": "Dumbbells",
    "muscles": [
      "Shoulders"
    ],
    "instructions": [
      "Stand with a dumbbell in each hand in front of your thighs, palms facing your legs.",
      "Raise one arm forward to around shoulder height, keeping a slight bend in your elbow.",
      "Lower with control and repeat with the other arm, avoiding any swing through your torso."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Front_Dumbbell_Raise.json"
  },
  "biceps-curl": {
    "images": [
      "exercises/biceps-curl-0.jpg",
      "exercises/biceps-curl-1.jpg"
    ],
    "equipment": "Dumbbells",
    "muscles": [
      "Biceps",
      "Forearms"
    ],
    "instructions": [
      "Stand with dumbbells by your sides, palms forward and elbows close to your torso.",
      "Bend your elbows to curl the weights toward your shoulders while keeping your upper arms still.",
      "Lower slowly until your arms extend, without leaning back or swinging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dumbbell_Bicep_Curl.json"
  },
  "hammer-curl": {
    "images": [
      "exercises/hammer-curl-0.jpg",
      "exercises/hammer-curl-1.jpg"
    ],
    "equipment": "Dumbbells",
    "muscles": [
      "Biceps"
    ],
    "instructions": [
      "Stand upright with a dumbbell in each hand, palms facing inward and elbows at your sides.",
      "Curl the weights toward your shoulders while keeping your palms facing each other.",
      "Lower both dumbbells slowly, keeping your upper arms still."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Hammer_Curls.json"
  },
  "preacher-curl": {
    "images": [
      "exercises/preacher-curl-0.jpg",
      "exercises/preacher-curl-1.jpg"
    ],
    "equipment": "EZ bar · preacher bench",
    "muscles": [
      "Biceps"
    ],
    "instructions": [
      "Rest your upper arms on the preacher pad and hold an EZ bar with palms angled upward.",
      "Curl the bar toward your shoulders while keeping your upper arms in contact with the pad.",
      "Lower slowly toward extended arms without forcing your elbows to lock."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Preacher_Curl.json"
  },
  "cable-curl": {
    "images": [
      "exercises/cable-curl-0.jpg",
      "exercises/cable-curl-1.jpg"
    ],
    "equipment": "Cable machine · straight bar",
    "muscles": [
      "Biceps"
    ],
    "instructions": [
      "Attach a bar to a low pulley. Stand upright and hold it with palms facing upward, elbows close to your sides.",
      "Curl the bar toward your shoulders, keeping your upper arms and torso still.",
      "Lower slowly until your arms extend while keeping tension on the cable."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Standing_Biceps_Cable_Curl.json"
  },
  "triceps-pushdown": {
    "images": [
      "exercises/triceps-pushdown-0.jpg",
      "exercises/triceps-pushdown-1.jpg"
    ],
    "equipment": "Cable machine · straight bar",
    "muscles": [
      "Triceps"
    ],
    "instructions": [
      "Face a high pulley and hold the bar overhand, with elbows bent and tucked near your sides.",
      "Straighten your elbows to push the bar toward your thighs while keeping your upper arms still.",
      "Let the bar rise slowly until your elbows are bent again, without lifting your shoulders."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Triceps_Pushdown.json"
  },
  "overhead-triceps-extension": {
    "images": [
      "exercises/overhead-triceps-extension-0.jpg",
      "exercises/overhead-triceps-extension-1.jpg"
    ],
    "equipment": "Dumbbell · seated bench",
    "muscles": [
      "Triceps"
    ],
    "instructions": [
      "Sit on a bench with back support and hold one dumbbell overhead with both hands.",
      "Keep your upper arms close to your head as you bend your elbows to lower the weight behind you.",
      "Straighten your elbows to lift the dumbbell overhead, keeping your torso braced."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Seated_Triceps_Press.json"
  },
  "skull-crusher": {
    "images": [
      "exercises/skull-crusher-0.jpg",
      "exercises/skull-crusher-1.jpg"
    ],
    "equipment": "EZ bar · flat bench",
    "muscles": [
      "Triceps",
      "Forearms"
    ],
    "instructions": [
      "Lie on a flat bench and hold an EZ bar above your chest with your arms extended.",
      "Keep your upper arms steady and bend your elbows to lower the bar toward your forehead.",
      "Straighten your elbows to raise the bar again, using a controlled range of motion."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/EZ-Bar_Skullcrusher.json"
  },
  "close-grip-bench-press": {
    "images": [
      "exercises/close-grip-bench-press-0.jpg",
      "exercises/close-grip-bench-press-1.jpg"
    ],
    "equipment": "Barbell · flat bench",
    "muscles": [
      "Triceps",
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Lie on a flat bench with feet planted and grip the bar around shoulder width.",
      "Lower the bar toward your chest, keeping your elbows fairly close to your body.",
      "Press the bar upward until your arms extend, keeping your shoulder blades supported."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Close-Grip_Barbell_Bench_Press.json"
  },
  "dip": {
    "images": [
      "exercises/dip-0.jpg",
      "exercises/dip-1.jpg"
    ],
    "equipment": "Parallel bars",
    "muscles": [
      "Triceps",
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Support yourself on parallel bars with arms extended and your torso mostly upright.",
      "Bend your elbows and lower your body within a comfortable shoulder range, keeping your elbows close.",
      "Press through the bars to raise yourself back to the starting position without swinging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dips_-_Triceps_Version.json"
  },
  "back-squat": {
    "images": [
      "exercises/back-squat-0.jpg",
      "exercises/back-squat-1.jpg"
    ],
    "equipment": "Barbell · squat rack",
    "muscles": [
      "Quads",
      "Calves",
      "Glutes",
      "Hamstrings",
      "Lower back"
    ],
    "instructions": [
      "Place the bar across your upper back, brace your torso and stand with feet around shoulder width.",
      "Bend your hips and knees to squat down while keeping your heels planted and knees tracking with your toes.",
      "Push through your feet to stand, keeping the bar balanced over your mid-foot."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Barbell_Squat.json"
  },
  "front-squat": {
    "images": [
      "exercises/front-squat-0.jpg",
      "exercises/front-squat-1.jpg"
    ],
    "equipment": "Barbell · squat rack",
    "muscles": [
      "Quads",
      "Calves",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Rest the bar across the fronts of your shoulders with elbows lifted. Stand with feet around shoulder width.",
      "Brace your torso and bend your hips and knees, keeping your chest upright and heels planted.",
      "Push through your feet to return to standing while keeping your elbows high."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Front_Barbell_Squat.json"
  },
  "goblet-squat": {
    "images": [
      "exercises/goblet-squat-0.jpg",
      "exercises/goblet-squat-1.jpg"
    ],
    "equipment": "Kettlebell",
    "muscles": [
      "Quads",
      "Calves",
      "Glutes",
      "Hamstrings",
      "Shoulders"
    ],
    "instructions": [
      "Hold a kettlebell by its horns close to your chest and stand with feet around shoulder width.",
      "Sit down between your hips, keeping your chest lifted, heels planted and knees tracking with your toes.",
      "Push through your feet to stand while keeping the weight close to your chest."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Goblet_Squat.json"
  },
  "romanian-deadlift": {
    "images": [
      "exercises/romanian-deadlift-0.jpg",
      "exercises/romanian-deadlift-1.jpg"
    ],
    "equipment": "Barbell",
    "muscles": [
      "Hamstrings",
      "Calves",
      "Glutes",
      "Lower back"
    ],
    "instructions": [
      "Stand holding a barbell against your thighs with knees slightly bent and your torso braced.",
      "Push your hips back to lower the bar close to your legs, stopping when you feel a hamstring stretch with your back steady.",
      "Drive your hips forward to stand tall without leaning back at the top."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Romanian_Deadlift.json"
  },
  "leg-press": {
    "images": [
      "exercises/leg-press-0.jpg",
      "exercises/leg-press-1.jpg"
    ],
    "equipment": "Leg press machine",
    "muscles": [
      "Quads",
      "Calves",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Sit with your back and hips supported and place your feet around shoulder width on the platform.",
      "Release the machine's safety catches as designed, then bend your knees to lower the platform while keeping your hips on the pad.",
      "Press through your feet to extend your legs without locking your knees. Re-engage the safety catches before exiting."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Leg_Press.json"
  },
  "bulgarian-split-squat": {
    "images": [
      "exercises/bulgarian-split-squat-0.jpg",
      "exercises/bulgarian-split-squat-1.jpg"
    ],
    "equipment": "Dumbbells · flat bench",
    "muscles": [
      "Quads",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Hold dumbbells by your sides. Place one foot forward and rest the top of your rear foot on a bench.",
      "Bend your front knee and hip to lower your body, keeping your torso steady and front foot planted.",
      "Push through your front foot to rise. Complete your reps, then switch legs."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Split_Squat_with_Dumbbells.json"
  },
  "walking-lunge": {
    "images": [
      "exercises/walking-lunge-0.jpg",
      "exercises/walking-lunge-1.jpg"
    ],
    "equipment": "Bodyweight",
    "muscles": [
      "Quads",
      "Calves",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Stand upright with your feet around hip width and your hands on your hips.",
      "Step forward and bend both knees to lower your hips, keeping your front foot planted.",
      "Push through the front foot to rise, then bring the rear leg forward into the next lunge."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Bodyweight_Walking_Lunge.json"
  },
  "hip-thrust": {
    "images": [
      "exercises/hip-thrust-0.jpg",
      "exercises/hip-thrust-1.jpg"
    ],
    "equipment": "Barbell · flat bench",
    "muscles": [
      "Glutes",
      "Calves",
      "Hamstrings"
    ],
    "instructions": [
      "Rest your upper back against a stable bench, feet flat on the floor and a padded barbell across your hips.",
      "Brace your torso and drive through your feet to raise your hips until your torso is roughly level.",
      "Lower your hips with control, keeping the bar steady and avoiding an exaggerated lower-back arch."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Barbell_Hip_Thrust.json"
  },
  "leg-extension": {
    "images": [
      "exercises/leg-extension-0.jpg",
      "exercises/leg-extension-1.jpg"
    ],
    "equipment": "Leg extension machine",
    "muscles": [
      "Quads"
    ],
    "instructions": [
      "Adjust the seat so your knees line up with the machine's pivot and the roller rests above your ankles.",
      "Keep your hips against the seat and straighten your knees to raise the pad.",
      "Bend your knees slowly to lower the weight without letting the stack slam."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Leg_Extensions.json"
  },
  "leg-curl": {
    "images": [
      "exercises/leg-curl-0.jpg",
      "exercises/leg-curl-1.jpg"
    ],
    "equipment": "Lying leg curl machine",
    "muscles": [
      "Hamstrings"
    ],
    "instructions": [
      "Lie face-down with knees aligned to the machine's pivot and the roller against your lower calves.",
      "Bend your knees to curl the pad toward your glutes, keeping your hips against the bench.",
      "Straighten your knees slowly to lower the weight with control."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Lying_Leg_Curls.json"
  },
  "standing-calf-raise": {
    "images": [
      "exercises/standing-calf-raise-0.jpg",
      "exercises/standing-calf-raise-1.jpg"
    ],
    "equipment": "Standing calf machine",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Place your shoulders under the pads and the balls of your feet on the platform, with heels free to move.",
      "Rise onto your toes by lifting your heels, keeping your knees steady.",
      "Lower your heels slowly through a comfortable range without bouncing."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Standing_Calf_Raises.json"
  },
  "seated-calf-raise": {
    "images": [
      "exercises/seated-calf-raise-0.jpg",
      "exercises/seated-calf-raise-1.jpg"
    ],
    "equipment": "Seated calf machine",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Sit with the balls of your feet on the platform and the pads resting on your lower thighs.",
      "Lift your heels to rise onto your toes, keeping your feet in place.",
      "Lower your heels slowly through a comfortable range while controlling the weight."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Seated_Calf_Raise.json"
  },
  "hip-abduction": {
    "images": [
      "exercises/hip-abduction-0.jpg",
      "exercises/hip-abduction-1.jpg"
    ],
    "equipment": "Hip abduction machine",
    "muscles": [
      "Hip abductors",
      "Glutes"
    ],
    "instructions": [
      "Sit with your back supported, feet positioned on the machine and pads against the outsides of your thighs.",
      "Press your knees outward while keeping your torso and hips still.",
      "Bring your legs back together slowly without letting the weight stack slam."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Thigh_Abductor.json"
  },
  "plank": {
    "images": [
      "exercises/plank-0.jpg",
      "exercises/plank-1.jpg"
    ],
    "equipment": "Bodyweight",
    "muscles": [
      "Abs"
    ],
    "instructions": [
      "Place your forearms on the floor with elbows below your shoulders and extend your legs behind you.",
      "Brace your abdomen and glutes so your body forms a straight line from head to heels.",
      "Hold the position while breathing normally. Finish the hold when you can no longer keep your hips level."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Plank.json"
  },
  "hanging-leg-raise": {
    "images": [
      "exercises/hanging-leg-raise-0.jpg",
      "exercises/hanging-leg-raise-1.jpg"
    ],
    "equipment": "Pull-up bar",
    "muscles": [
      "Abs"
    ],
    "instructions": [
      "Hang from a bar with your arms extended and legs together, keeping your shoulders controlled.",
      "Brace your abdomen and raise your legs in front of you toward hip height without swinging.",
      "Lower your legs slowly to the hanging position, keeping the movement controlled."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Hanging_Leg_Raise.json"
  },
  "cable-crunch": {
    "images": [
      "exercises/cable-crunch-0.jpg",
      "exercises/cable-crunch-1.jpg"
    ],
    "equipment": "Cable machine · rope",
    "muscles": [
      "Abs"
    ],
    "instructions": [
      "Kneel facing a high pulley and hold the rope beside your head with elbows bent.",
      "Keep your hips mostly still and curl your torso downward by bringing your ribs toward your pelvis.",
      "Return slowly to the starting position without pulling the rope with your arms."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Cable_Crunch.json"
  },
  "ab-wheel-rollout": {
    "images": [
      "exercises/ab-wheel-rollout-0.jpg",
      "exercises/ab-wheel-rollout-1.jpg"
    ],
    "equipment": "Ab wheel",
    "muscles": [
      "Abs",
      "Shoulders"
    ],
    "instructions": [
      "Kneel on the floor and hold the ab wheel beneath your shoulders with both hands.",
      "Brace your abdomen and roll forward only as far as you can keep your lower back from sagging.",
      "Draw the wheel back toward your knees with control, keeping your abdomen engaged."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Ab_Roller.json"
  },
  "russian-twist": {
    "images": [
      "exercises/russian-twist-0.jpg",
      "exercises/russian-twist-1.jpg"
    ],
    "equipment": "Weight plate",
    "muscles": [
      "Abs",
      "Lower back"
    ],
    "instructions": [
      "Sit with knees bent and feet supported. Lean your torso back slightly and hold a weight plate in front of you.",
      "Rotate your torso to one side while keeping your hips steady.",
      "Move through the center to the other side slowly, keeping your abdomen braced."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Russian_Twist.json"
  },
  "aerobics": {
    "images": [
      "exercises/aerobics-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Legs",
      "Core",
      "Cardiovascular system"
    ],
    "instructions": [
      "Start with an easy march, leaving space to move in each direction.",
      "Alternate side steps with comfortable arm reaches, keeping the knees soft.",
      "Maintain a steady rhythm and finish with slower steps."
    ],
    "illustrationNote": "An example low-impact aerobic step; class routines vary.",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "battle-ropes": {
    "images": [
      "exercises/battle-ropes-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Battle ropes · floor anchor",
    "muscles": [
      "Shoulders",
      "Arms",
      "Core"
    ],
    "instructions": [
      "Hold one rope end in each hand and stand with a slight bend in the hips and knees.",
      "Alternate lifting and lowering the hands to send waves toward the anchor.",
      "Keep the torso steady and use a pace you can sustain."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "climbing": {
    "images": [
      "exercises/climbing-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Climbing wall · climbing shoes",
    "muscles": [
      "Back",
      "Forearms",
      "Legs",
      "Core"
    ],
    "instructions": [
      "Choose a route and equipment suited to the climbing area.",
      "Place the feet on secure holds and use the legs to lift while reaching for the next handhold.",
      "Move deliberately, keeping the other points of contact stable during each reach."
    ],
    "illustrationNote": "Indoor climbing is shown as a representative example.",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "cycling": {
    "images": [
      "exercises/cycling-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bicycle · helmet",
    "muscles": [
      "Quadriceps",
      "Glutes",
      "Calves"
    ],
    "instructions": [
      "Set the saddle and handlebars so you can pedal comfortably with a slight knee bend at the bottom.",
      "Keep both hands on the bars and pedal smoothly through each revolution.",
      "Choose a sustainable gear and pace for the route."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "cycling-indoor": {
    "images": [
      "exercises/cycling-indoor-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Stationary bike",
    "muscles": [
      "Quadriceps",
      "Glutes",
      "Calves"
    ],
    "instructions": [
      "Adjust the seat so the knee remains slightly bent when the pedal is farthest away.",
      "Keep the hips supported on the saddle and pedal in a smooth rhythm.",
      "Set resistance and cadence to a pace you can maintain."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "elliptical-machine": {
    "images": [
      "exercises/elliptical-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Elliptical trainer",
    "muscles": [
      "Legs",
      "Glutes",
      "Arms"
    ],
    "instructions": [
      "Step onto the pedals and hold the handles with an upright posture.",
      "Move the feet through a smooth oval path, letting the handles move with the stride.",
      "Adjust the resistance to keep the motion controlled and comfortable."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "hiking": {
    "images": [
      "exercises/hiking-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Walking shoes · backpack",
    "muscles": [
      "Legs",
      "Glutes",
      "Calves"
    ],
    "instructions": [
      "Choose footwear and a route appropriate for the conditions.",
      "Take controlled steps, shortening the stride on steeper sections.",
      "Keep a sustainable pace and stable footing as the terrain changes."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "jump-rope": {
    "images": [
      "exercises/jump-rope-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Jump rope",
    "muscles": [
      "Calves",
      "Shoulders",
      "Core"
    ],
    "instructions": [
      "Hold a handle in each hand with the elbows close to the sides.",
      "Turn the rope with small wrist circles and make low, light jumps as it passes under the feet.",
      "Land softly and keep a regular rhythm."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "rowing-machine": {
    "images": [
      "exercises/rowing-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Rowing ergometer",
    "muscles": [
      "Legs",
      "Back",
      "Arms",
      "Core"
    ],
    "instructions": [
      "At the front of the stroke, bend the knees and reach forward with straight arms and a neutral back.",
      "Push through the legs, then lean back slightly and draw the handle toward the lower ribs.",
      "Extend the arms, hinge forward and bend the knees to return smoothly."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "running": {
    "images": [
      "exercises/running-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Running shoes",
    "muscles": [
      "Legs",
      "Glutes",
      "Core"
    ],
    "instructions": [
      "Start at a comfortable pace with the torso tall and arms relaxed.",
      "Use a natural stride and let the arms swing opposite the legs.",
      "Keep the effort sustainable and slow gradually at the end."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "running-treadmill": {
    "images": [
      "exercises/running-treadmill-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Treadmill",
    "muscles": [
      "Legs",
      "Glutes",
      "Core"
    ],
    "instructions": [
      "Use the treadmill's safety clip and begin at a slow belt speed.",
      "Build to a comfortable pace while staying near the center of the belt.",
      "Reduce the speed before stepping off."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "skating": {
    "images": [
      "exercises/skating-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Inline skates · helmet",
    "muscles": [
      "Glutes",
      "Quadriceps",
      "Core"
    ],
    "instructions": [
      "Use suitable protective equipment and keep the knees softly bent.",
      "Push one skate diagonally outward while transferring weight to the other foot.",
      "Alternate smooth pushes and keep the torso balanced over the supporting skate."
    ],
    "illustrationNote": "Inline skating is shown as one skating variation.",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "skiing": {
    "images": [
      "exercises/skiing-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Skis · ski poles · helmet",
    "muscles": [
      "Legs",
      "Glutes",
      "Core"
    ],
    "instructions": [
      "Use equipment and terrain appropriate to your skiing level.",
      "Keep the knees and hips flexed, with balanced pressure through the ski boots.",
      "Link controlled turns while looking in the direction of travel."
    ],
    "illustrationNote": "A balanced alpine-ski stance and turn are shown.",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "snowboarding": {
    "images": [
      "exercises/snowboarding-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Snowboard · boots · helmet",
    "muscles": [
      "Legs",
      "Glutes",
      "Core"
    ],
    "instructions": [
      "Secure both boots in the bindings and use terrain suited to your level.",
      "Keep the hips and knees flexed with the torso balanced between the feet.",
      "Control each turn by gradually shifting pressure onto an edge."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "swimming": {
    "images": [
      "exercises/swimming-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pool · swim goggles",
    "muscles": [
      "Back",
      "Shoulders",
      "Core",
      "Legs"
    ],
    "instructions": [
      "Choose a stroke and pace suited to your ability and the swimming area.",
      "For front crawl, alternate the arms while maintaining a relaxed flutter kick and long body position.",
      "Coordinate breathing with the stroke and keep the rhythm controlled."
    ],
    "illustrationNote": "Front crawl is shown as a representative swimming stroke.",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "walking": {
    "images": [
      "exercises/walking-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Walking shoes",
    "muscles": [
      "Legs",
      "Glutes",
      "Calves"
    ],
    "instructions": [
      "Stand tall with the shoulders relaxed and look ahead.",
      "Walk with a comfortable stride, letting the arms swing naturally.",
      "Maintain a steady pace and place each foot smoothly."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "yoga": {
    "images": [
      "exercises/yoga-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Exercise mat",
    "muscles": [
      "Core",
      "Legs",
      "Shoulders"
    ],
    "instructions": [
      "Begin with steady breathing on a stable surface.",
      "Move into each chosen pose with control, using a comfortable range of motion.",
      "Keep breathing evenly and ease out of the pose before changing position."
    ],
    "illustrationNote": "Mountain pose and Warrior II are examples; yoga sequences vary.",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "stretching": {
    "images": [
      "exercises/stretching-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Hamstrings",
      "Calves"
    ],
    "instructions": [
      "Choose a stretch for the area you want to move and settle into a stable position.",
      "Ease into a gentle stretch without bouncing, keeping your breathing relaxed.",
      "Release the stretch slowly and repeat on the other side where appropriate."
    ],
    "illustrationNote": "A standing hamstring stretch is shown as one example.",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "ball-slams": {
    "images": [
      "exercises/ball-slams-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Slam ball",
    "muscles": [
      "Abs",
      "Shoulders",
      "Glutes"
    ],
    "instructions": [
      "Stand with feet about shoulder width and hold a slam ball with both hands.",
      "Lift the ball overhead, then drive it down in front of your feet as you bend your hips and knees.",
      "Pick up the ball with control and stand before beginning the next repetition."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Overhead_Slam.json"
  },
  "bicycle-crunch": {
    "images": [
      "exercises/bicycle-crunch-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Abs",
      "Obliques"
    ],
    "instructions": [
      "Lie on your back with hands lightly beside your head and both feet raised.",
      "Turn your right shoulder toward your left knee while extending your right leg above the floor.",
      "Switch sides smoothly, keeping your lower back controlled and avoiding a pull on your neck."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Air_Bike.json"
  },
  "burpee": {
    "images": [
      "exercises/burpee-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Legs",
      "Chest",
      "Abs"
    ],
    "instructions": [
      "Bend your knees, place your hands on the floor and move your feet back into a plank.",
      "Lower your chest toward the floor, press back up and bring your feet underneath you.",
      "Stand and jump with your arms overhead, then land softly before repeating."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Two key positions from the full burpee sequence."
  },
  "cable-twist": {
    "images": [
      "exercises/cable-twist-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · handle",
    "muscles": [
      "Obliques",
      "Abs"
    ],
    "instructions": [
      "Stand side-on to a chest-height pulley and hold its handle with both hands in front of your chest.",
      "Extend your arms and rotate your torso away from the pulley through a comfortable range.",
      "Return slowly, keeping your knees soft and the cable under control; repeat on the other side."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Pallof_Press_With_Rotation.json"
  },
  "clean-barbell": {
    "images": [
      "exercises/clean-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Quads",
      "Glutes",
      "Traps"
    ],
    "instructions": [
      "Set the bar over mid-foot, grip just outside your legs and brace with your chest lifted.",
      "Push through the floor, extend your hips and pull under the bar to receive it on your shoulders in a front squat.",
      "Keep your elbows forward and stand tall from the receiving position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Clean.json",
    "illustrationNote": "Two key positions from the clean: floor setup and front-squat catch."
  },
  "clean-and-jerk-barbell": {
    "images": [
      "exercises/clean-and-jerk-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Quads",
      "Glutes",
      "Shoulders",
      "Traps"
    ],
    "instructions": [
      "Clean the bar from the floor to your shoulders, then stand with your elbows forward.",
      "Dip a few inches with your torso upright, then drive with your legs and move into a split stance under the bar.",
      "Lock your arms overhead, settle your balance and bring your feet back together."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Clean_and_Jerk.json",
    "illustrationNote": "Two key positions from the clean and jerk: front rack and split catch."
  },
  "cross-body-crunch": {
    "images": [
      "exercises/cross-body-crunch-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Abs",
      "Obliques"
    ],
    "instructions": [
      "Lie on your back with knees bent, feet on the floor and hands lightly beside your head.",
      "Curl your right shoulder toward your left knee as you lift that knee toward your chest.",
      "Lower with control and alternate sides without pulling your head forward."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Cross-Body_Crunch.json"
  },
  "crunch": {
    "images": [
      "exercises/crunch-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Abs"
    ],
    "instructions": [
      "Lie on your back with knees bent and feet planted, crossing your arms over your chest.",
      "Exhale and curl your shoulder blades a short distance off the floor while your lower back stays supported.",
      "Pause briefly, then lower your shoulders with control."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Crunches.json"
  },
  "crunch-machine": {
    "images": [
      "exercises/crunch-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Ab crunch machine",
    "muscles": [
      "Abs"
    ],
    "instructions": [
      "Adjust the seat and pads so you can sit firmly with your feet supported and grasp the handles.",
      "Bring your ribs toward your pelvis by curling your trunk against the machine resistance.",
      "Return slowly without letting the weight stack drop."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Ab_Crunch_Machine.json"
  },
  "crunch-stability-ball": {
    "images": [
      "exercises/crunch-stability-ball-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Stability ball",
    "muscles": [
      "Abs"
    ],
    "instructions": [
      "Rest your mid-back on a stability ball with knees bent and feet firmly planted.",
      "Cross your arms over your chest and curl your shoulders toward your hips while the ball supports your lower back.",
      "Lower your upper back slowly without letting the ball roll away."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Exercise_Ball_Crunch.json"
  },
  "deadlift-high-pull-barbell": {
    "images": [
      "exercises/deadlift-high-pull-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Glutes",
      "Quads",
      "Traps",
      "Shoulders"
    ],
    "instructions": [
      "Stand over the bar with a hip-width stance and grip just outside your legs.",
      "Extend your knees and hips, then shrug and guide the bar upward with elbows traveling high and outward.",
      "Lower the bar toward your hips, then hinge and bend your knees to return it to the floor."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Two key positions from the deadlift high pull."
  },
  "decline-crunch": {
    "images": [
      "exercises/decline-crunch-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Decline bench",
    "muscles": [
      "Abs"
    ],
    "instructions": [
      "Secure your feet at the raised end of a decline bench and lie back with your arms crossed.",
      "Curl your shoulder blades off the bench, bringing your ribs toward your pelvis.",
      "Lower with control while keeping your hips and lower back supported."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Decline_Crunch.json"
  },
  "flat-knee-raise": {
    "images": [
      "exercises/flat-knee-raise-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Flat bench",
    "muscles": [
      "Abs",
      "Hip flexors"
    ],
    "instructions": [
      "Lie on a flat bench and hold its edges beside your hips, with your legs extending beyond the end.",
      "Bend your knees and draw them toward your chest while keeping your upper back supported.",
      "Extend your legs outward again without dropping them or arching your lower back."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Bent-knee variation on a flat bench."
  },
  "flat-leg-raise": {
    "images": [
      "exercises/flat-leg-raise-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Flat bench",
    "muscles": [
      "Abs",
      "Hip flexors"
    ],
    "instructions": [
      "Lie on a flat bench with your legs beyond the end and your hands holding the bench.",
      "Raise both legs together while keeping a small, steady bend in your knees.",
      "Lower your legs slowly as far as you can control without arching your lower back."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Flat_Bench_Lying_Leg_Raise.json"
  },
  "hang-clean-barbell": {
    "images": [
      "exercises/hang-clean-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Glutes",
      "Quads",
      "Traps"
    ],
    "instructions": [
      "Hold the bar at your thighs, then hinge slightly with soft knees to set the hang position.",
      "Extend your legs and hips, then pull underneath and catch the bar across your front shoulders.",
      "Stand from the front squat with elbows lifted before returning the bar to the hang."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Hang_Clean.json",
    "illustrationNote": "Two key positions from the hang clean."
  },
  "hang-snatch-barbell": {
    "images": [
      "exercises/hang-snatch-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Glutes",
      "Quads",
      "Shoulders",
      "Traps"
    ],
    "instructions": [
      "Hold the bar with a wide snatch grip and hinge to bring it to your upper thighs.",
      "Extend your hips and legs, then pull underneath and receive the bar overhead in a squat.",
      "Keep your elbows locked and stand with the bar balanced over your feet."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Hang_Snatch.json",
    "illustrationNote": "Two key positions from the hang snatch."
  },
  "hanging-knee-raise": {
    "images": [
      "exercises/hanging-knee-raise-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pull-up bar",
    "muscles": [
      "Abs",
      "Hip flexors"
    ],
    "instructions": [
      "Hang from a pull-up bar with straight arms and steady shoulders.",
      "Bend both knees and lift them toward your chest without swinging your body.",
      "Lower your legs slowly until you return to a quiet hang."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Bent-knee variation of a hanging raise."
  },
  "jackknife-sit-up": {
    "images": [
      "exercises/jackknife-sit-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Abs",
      "Hip flexors"
    ],
    "instructions": [
      "Lie long on your back with your arms extended overhead and your legs together.",
      "Lift your torso and legs at the same time, reaching your hands toward your shins.",
      "Lower both ends of your body slowly and reset before the next repetition."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Jackknife_Sit-Up.json"
  },
  "jump-shrug-barbell": {
    "images": [
      "exercises/jump-shrug-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Glutes",
      "Calves",
      "Traps"
    ],
    "instructions": [
      "Hold the bar at mid-thigh with straight arms and soften your knees and hips.",
      "Drive through your legs into a small jump while shrugging your shoulders, keeping your elbows straight.",
      "Land softly and let your hips and knees absorb the return to the hang position."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Keep the arms long through the jump shrug."
  },
  "jumping-jack": {
    "images": [
      "exercises/jumping-jack-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Calves",
      "Quads",
      "Shoulders"
    ],
    "instructions": [
      "Start standing tall with your feet together and arms at your sides.",
      "Jump your feet apart while sweeping both arms overhead.",
      "Jump back to the starting stance and repeat with soft, controlled landings."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "kettlebell-swing": {
    "images": [
      "exercises/kettlebell-swing-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Kettlebell",
    "muscles": [
      "Glutes",
      "Hamstrings",
      "Abs"
    ],
    "instructions": [
      "Hold the kettlebell with both hands and hinge your hips back as it travels between your legs.",
      "Drive your hips forward to swing the bell up to about chest height, keeping your arms relaxed.",
      "Let the bell fall back into the hinge while keeping your back steady."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "kettlebell-turkish-get-up": {
    "images": [
      "exercises/kettlebell-turkish-get-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Kettlebell · mat",
    "muscles": [
      "Shoulders",
      "Abs",
      "Glutes"
    ],
    "instructions": [
      "Lie on your back with the kettlebell held above one shoulder and the knee on that side bent.",
      "Keep the weight overhead as you rise to your opposite elbow and hand, sweep the straight leg beneath you and reach a half-kneeling position.",
      "Stand tall, then reverse each stage slowly to return to the floor; repeat on the other side."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Kettlebell_Turkish_Get-Up_Lunge_style.json",
    "illustrationNote": "Start and finish of the get-up; the movement also passes through seated and kneeling positions."
  },
  "knee-raise-captain-s-chair": {
    "images": [
      "exercises/knee-raise-captain-s-chair-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Captain's chair",
    "muscles": [
      "Abs",
      "Hip flexors"
    ],
    "instructions": [
      "Support your forearms on the pads, grip the handles and keep your back against the backrest.",
      "Lift both bent knees toward your chest without swinging your legs.",
      "Lower your knees slowly until your legs hang beneath you."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Bent-knee raise with forearm and back support."
  },
  "knees-to-elbows": {
    "images": [
      "exercises/knees-to-elbows-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pull-up bar",
    "muscles": [
      "Abs",
      "Hip flexors",
      "Lats"
    ],
    "instructions": [
      "Hang from the bar with a firm grip and your shoulders engaged.",
      "Tuck your pelvis and draw both knees upward toward your elbows while keeping the movement controlled.",
      "Lower to a steady hang before starting the next repetition."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Two key positions of the hanging knee-to-elbow raise."
  },
  "mountain-climber": {
    "images": [
      "exercises/mountain-climber-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Abs",
      "Hip flexors",
      "Shoulders"
    ],
    "instructions": [
      "Start in a high plank with hands below shoulders and your body in a straight line.",
      "Bring one knee under your chest while keeping your shoulders over your hands.",
      "Switch legs smoothly, extending one leg as the other knee comes forward."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Mountain_Climbers.json"
  },
  "muscle-up": {
    "images": [
      "exercises/muscle-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pull-up bar",
    "muscles": [
      "Lats",
      "Chest",
      "Triceps",
      "Abs"
    ],
    "instructions": [
      "Hang from the bar with a firm overhand grip and your shoulders engaged.",
      "Pull your chest toward and above the bar, then bring your shoulders over it as your wrists turn into support.",
      "Press to straight-arm support above the bar and lower through the transition with control."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Start and finish of a bar muscle-up; the pull and transition occur between these positions."
  },
  "oblique-crunch": {
    "images": [
      "exercises/oblique-crunch-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Obliques",
      "Abs"
    ],
    "instructions": [
      "Lie on your side with knees slightly bent and your upper hand lightly beside your head.",
      "Lift your upper shoulder and ribs toward your hip without pulling on your neck.",
      "Lower slowly, complete your repetitions and turn over to work the other side."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Oblique_Crunches_-_On_The_Floor.json"
  },
  "overhead-squat-barbell": {
    "images": [
      "exercises/overhead-squat-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Quads",
      "Glutes",
      "Shoulders",
      "Abs"
    ],
    "instructions": [
      "Stand with the bar held overhead in a wide grip and your arms locked straight.",
      "Squat between your heels while keeping the bar balanced over the middle of your feet.",
      "Drive through your feet to stand without letting the bar drift forward."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Overhead_Squat.json"
  },
  "power-clean": {
    "images": [
      "exercises/power-clean-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Quads",
      "Glutes",
      "Traps"
    ],
    "instructions": [
      "Set up over the bar with a braced back and a grip just outside your legs.",
      "Drive through your legs and hips, then move underneath to catch the bar on your front shoulders in a partial squat.",
      "Keep the elbows forward and stand tall to finish the repetition."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Power_Clean.json",
    "illustrationNote": "Two key positions from the power clean; the catch stays above a full squat."
  },
  "power-snatch-barbell": {
    "images": [
      "exercises/power-snatch-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Quads",
      "Glutes",
      "Shoulders",
      "Traps"
    ],
    "instructions": [
      "Take a wide snatch grip and brace over the bar with your shoulders slightly ahead of it.",
      "Extend your legs and hips, then pull underneath to receive the bar overhead in a partial squat.",
      "Stabilize your locked arms and stand with the bar over your mid-foot."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Power_Snatch.json",
    "illustrationNote": "Two key positions from the power snatch; the catch stays above a full squat."
  },
  "press-under-barbell": {
    "images": [
      "exercises/press-under-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Light barbell",
    "muscles": [
      "Shoulders",
      "Quads",
      "Abs"
    ],
    "instructions": [
      "Stand in your squat stance with a light bar across your upper back and a wide snatch grip.",
      "Squat down as you press yourself underneath the bar, keeping your feet planted and your balance centered.",
      "Finish with straight arms overhead in the bottom of the squat, then stand under control."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Two key positions of a controlled press-under, also called a pressing snatch balance."
  },
  "reverse-crunch": {
    "images": [
      "exercises/reverse-crunch-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Abs"
    ],
    "instructions": [
      "Lie on your back with your arms beside you and both knees bent above your hips.",
      "Curl your pelvis toward your ribs, lifting your tailbone a short distance from the floor.",
      "Lower your pelvis slowly while keeping your knees bent and avoiding a swing."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Reverse_Crunch.json"
  },
  "reverse-plank": {
    "images": [
      "exercises/reverse-plank-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Glutes",
      "Abs",
      "Shoulders"
    ],
    "instructions": [
      "Sit with your legs extended and place your hands on the floor behind your hips.",
      "Press through your hands and heels to lift your hips until your body forms a long line.",
      "Hold while breathing steadily, then lower your hips with control."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "russian-twist-bodyweight": {
    "images": [
      "exercises/russian-twist-bodyweight-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Obliques",
      "Abs"
    ],
    "instructions": [
      "Sit with knees bent, heels on the floor and your hands together in front of your chest.",
      "Lean back slightly and rotate your shoulders and hands to one side while keeping your hips steady.",
      "Turn through the center to the other side without rounding or jerking your back."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "side-bend-band": {
    "images": [
      "exercises/side-bend-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Obliques"
    ],
    "instructions": [
      "Stand on one end of a resistance band and hold the other end at your side.",
      "Bend sideways through a comfortable range while keeping your hips still and your chest facing forward.",
      "Return to an upright position against the band, then repeat on the other side."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "side-bend-cable": {
    "images": [
      "exercises/side-bend-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low handle",
    "muscles": [
      "Obliques"
    ],
    "instructions": [
      "Stand side-on to a low pulley and hold its handle in the hand nearest the machine.",
      "Bend your torso away from the pulley through a comfortable range, keeping both feet planted.",
      "Return slowly toward upright without twisting your shoulders or hips."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "side-bend-dumbbell": {
    "images": [
      "exercises/side-bend-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbell",
    "muscles": [
      "Obliques"
    ],
    "instructions": [
      "Stand tall with one dumbbell at your side and your free hand resting on your hip.",
      "Lower the dumbbell by bending sideways through a comfortable range, keeping your chest forward.",
      "Use the side of your trunk to return upright, then repeat on the other side."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dumbbell_Side_Bend.json"
  },
  "side-plank": {
    "images": [
      "exercises/side-plank-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Obliques",
      "Glutes",
      "Shoulders"
    ],
    "instructions": [
      "Lie on your side and place your lower elbow directly beneath your shoulder, with your legs extended.",
      "Lift your hips so your head, torso and feet form a straight line, keeping your hips stacked.",
      "Hold while breathing steadily, then lower and repeat on the other side."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "sit-up": {
    "images": [
      "exercises/sit-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Abs",
      "Hip flexors"
    ],
    "instructions": [
      "Lie on your back with knees bent, feet planted and arms crossed over your chest.",
      "Raise your torso toward your thighs in one controlled movement without pulling your neck.",
      "Lower your back to the mat slowly while keeping your feet steady."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/3_4_Sit-Up.json"
  },
  "snatch-barbell": {
    "images": [
      "exercises/snatch-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Quads",
      "Glutes",
      "Shoulders",
      "Traps"
    ],
    "instructions": [
      "Grip the bar wide and set your back firmly with the bar close to your shins.",
      "Push through the floor and extend your hips, then pull yourself under the bar into an overhead squat.",
      "Stabilize with straight arms and stand while keeping the bar over your mid-foot."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Snatch.json",
    "illustrationNote": "Two key positions from the snatch: floor setup and overhead catch."
  },
  "snatch-pull-barbell": {
    "images": [
      "exercises/snatch-pull-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Glutes",
      "Hamstrings",
      "Traps"
    ],
    "instructions": [
      "Set up over the bar with a wide snatch grip and straight arms.",
      "Push through your legs, extend your hips and shrug to accelerate the bar close to your body.",
      "Keep your arms long, then lower the bar with control back through the starting path."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Snatch_Pull.json",
    "illustrationNote": "The snatch pull finishes with extension and a shrug, without an overhead catch."
  },
  "split-jerk-barbell": {
    "images": [
      "exercises/split-jerk-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Hold the bar on your front shoulders with elbows forward and feet under your hips.",
      "Dip straight down slightly, then drive with your legs as you split your feet and push under the bar.",
      "Catch with arms locked overhead, regain balance and recover your feet to a parallel stance."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Split_Jerk.json",
    "illustrationNote": "Two key positions from the split jerk: dip and overhead catch."
  },
  "squat-row-band": {
    "images": [
      "exercises/squat-row-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band · secure anchor",
    "muscles": [
      "Quads",
      "Glutes",
      "Back"
    ],
    "instructions": [
      "Hold a band fixed in front of you and step back until it has light tension.",
      "Squat with your arms reaching forward, then stand while drawing your elbows back beside your ribs.",
      "Extend your arms and return to the squat with control."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "sumo-deadlift-high-pull-barbell": {
    "images": [
      "exercises/sumo-deadlift-high-pull-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Glutes",
      "Quads",
      "Traps",
      "Shoulders"
    ],
    "instructions": [
      "Take a wide stance with your toes slightly outward and grip the bar inside your knees.",
      "Extend your knees and hips, then shrug and pull the bar upward with elbows high and wide.",
      "Lower to your hips first, then bend your knees and hips to return the bar to the floor."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Two key positions from the sumo deadlift high pull."
  },
  "superman": {
    "images": [
      "exercises/superman-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Lower back",
      "Glutes"
    ],
    "instructions": [
      "Lie face down with your arms extended ahead of you and your legs straight.",
      "Lift your arms, chest and legs a small distance from the floor while keeping your neck in line with your spine.",
      "Pause briefly, then lower everything slowly to the mat."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Superman.json"
  },
  "thruster-barbell": {
    "images": [
      "exercises/thruster-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · bumper plates",
    "muscles": [
      "Quads",
      "Glutes",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Hold the bar on your front shoulders with elbows forward and feet in a squat stance.",
      "Squat down, then stand forcefully and continue the leg drive into an overhead press.",
      "Finish with straight arms before lowering the bar to your shoulders for the next squat."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": "",
    "illustrationNote": "Two key positions from the thruster: front squat and overhead finish."
  },
  "thruster-kettlebell": {
    "images": [
      "exercises/thruster-kettlebell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Two kettlebells",
    "muscles": [
      "Quads",
      "Glutes",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Hold two kettlebells in the front-rack position with your wrists straight.",
      "Squat down, then drive through your legs and press both kettlebells overhead as you stand.",
      "Stabilize your arms, then bring the bells back to your shoulders before the next repetition."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Kettlebell_Thruster.json",
    "illustrationNote": "Two key positions of a double-kettlebell thruster."
  },
  "toes-to-bar": {
    "images": [
      "exercises/toes-to-bar-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pull-up bar",
    "muscles": [
      "Abs",
      "Hip flexors",
      "Lats"
    ],
    "instructions": [
      "Hang from the bar with a firm grip and your shoulders engaged.",
      "Lift your legs together and curl your pelvis upward until your toes approach the bar between your hands.",
      "Lower with control back to the hanging position before repeating."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "torso-rotation-machine": {
    "images": [
      "exercises/torso-rotation-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Torso rotation machine",
    "muscles": [
      "Obliques",
      "Abs"
    ],
    "instructions": [
      "Adjust the seat and pads so your pelvis is supported and your upper body fits against the rotating pad.",
      "Turn your torso through a comfortable range against the machine resistance while keeping your hips steady.",
      "Return slowly to the center and repeat toward the other side."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "v-up": {
    "images": [
      "exercises/v-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · mat",
    "muscles": [
      "Abs",
      "Hip flexors"
    ],
    "instructions": [
      "Lie on your back with your legs together and arms extended overhead.",
      "Raise your straight legs and upper body together, reaching both hands toward your feet to form a V.",
      "Lower your arms, torso and legs slowly while keeping the movement controlled."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Jackknife_Sit-Up.json"
  },
  "back-extension": {
    "images": [
      "exercises/back-extension-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "45-degree back extension bench",
    "muscles": [
      "Spinal erectors",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Adjust the pad below your hip crease and secure your ankles.",
      "Fold forward at the hips while keeping your back long.",
      "Raise your torso until it lines up with your legs."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "back-extension-machine": {
    "images": [
      "exercises/back-extension-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Seated back extension machine",
    "muscles": [
      "Spinal erectors"
    ],
    "instructions": [
      "Set the seat so the back pad rests comfortably against your upper back.",
      "Brace your feet and extend your hips and back against the pad.",
      "Return forward slowly without bouncing the weight stack."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "bent-over-row-band": {
    "images": [
      "exercises/bent-over-row-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Stand on the band and hinge forward with a braced torso.",
      "Pull both hands toward your lower ribs with elbows close.",
      "Lower your hands slowly while keeping your torso still."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "bent-over-row-dumbbell": {
    "images": [
      "exercises/bent-over-row-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Hold two dumbbells and hinge forward with soft knees.",
      "Row both weights toward your lower ribs.",
      "Lower them under control without lifting your torso."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "bent-over-row-underhand-barbell": {
    "images": [
      "exercises/bent-over-row-underhand-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Take an underhand grip and hinge forward with a neutral back.",
      "Pull the bar toward your lower abdomen, keeping elbows close.",
      "Lower the bar until your arms are long again."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "box-jump": {
    "images": [
      "exercises/box-jump-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Plyometric box",
    "muscles": [
      "Quads",
      "Glutes",
      "Calves"
    ],
    "instructions": [
      "Stand close to a stable box and dip into a small crouch.",
      "Swing your arms and jump with both feet onto the box.",
      "Land softly with knees bent, then step back down."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "box-squat-barbell": {
    "images": [
      "exercises/box-squat-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell and box",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Position a stable box behind you and brace under the bar.",
      "Sit your hips back until you lightly touch the box.",
      "Keep tension and drive through your feet to stand."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "cable-pull-through": {
    "images": [
      "exercises/cable-pull-through-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Low cable and rope",
    "muscles": [
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Face away from a low pulley and hold the rope between your legs.",
      "Push your hips back with soft knees and a long spine.",
      "Drive your hips forward to stand tall without leaning back."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "calf-press-on-leg-press": {
    "images": [
      "exercises/calf-press-on-leg-press-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "45-degree leg press",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Place the balls of your feet on the platform edge with heels free.",
      "Keep a slight knee bend and lower your heels slowly.",
      "Press through your toes to lift your heels as high as comfortable."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "calf-press-on-seated-leg-press": {
    "images": [
      "exercises/calf-press-on-seated-leg-press-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Seated horizontal leg press",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Sit against the pad and place your forefeet on the platform edge.",
      "Keep your knees almost straight as your heels lower.",
      "Extend your ankles and press through the balls of your feet."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "chin-up": {
    "images": [
      "exercises/chin-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pull-up bar",
    "muscles": [
      "Lats",
      "Biceps"
    ],
    "instructions": [
      "Grip the bar with palms facing you and let your arms lengthen.",
      "Pull your chest toward the bar until your chin clears it.",
      "Lower smoothly to a controlled hang."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "chin-up-assisted": {
    "images": [
      "exercises/chin-up-assisted-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Assisted chin-up machine",
    "muscles": [
      "Lats",
      "Biceps"
    ],
    "instructions": [
      "Choose assistance and kneel on the support pad with an underhand grip.",
      "Pull upward until your chin reaches the bar.",
      "Lower under control while keeping your knees on the pad."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "deadlift-band": {
    "images": [
      "exercises/deadlift-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Glutes",
      "Hamstrings",
      "Spinal erectors"
    ],
    "instructions": [
      "Stand on the band and grip its ends with your chest lifted.",
      "Push through the floor and extend your hips and knees together.",
      "Hinge back and bend your knees to lower your hands."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "deadlift-dumbbell": {
    "images": [
      "exercises/deadlift-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Glutes",
      "Hamstrings",
      "Quads"
    ],
    "instructions": [
      "Set the dumbbells beside your feet and bend at hips and knees.",
      "Stand by pushing the floor away while keeping the weights close.",
      "Lower the weights by moving your hips back and bending your knees."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "deadlift-smith-machine": {
    "images": [
      "exercises/deadlift-smith-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Smith machine",
    "muscles": [
      "Glutes",
      "Hamstrings",
      "Spinal erectors"
    ],
    "instructions": [
      "Stand close to the guided bar and grip it just outside your legs.",
      "Brace and stand tall, keeping the bar close to your body.",
      "Hinge back and bend your knees to lower the bar smoothly."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "deficit-deadlift-barbell": {
    "images": [
      "exercises/deficit-deadlift-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell and low platform",
    "muscles": [
      "Glutes",
      "Hamstrings",
      "Quads",
      "Spinal erectors"
    ],
    "instructions": [
      "Stand on a low, stable platform with the bar over your midfoot.",
      "Brace and lift the bar while extending your hips and knees.",
      "Lower the plates to the floor with a controlled hip hinge."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "glute-ham-raise": {
    "images": [
      "exercises/glute-ham-raise-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Glute-ham developer",
    "muscles": [
      "Hamstrings",
      "Glutes"
    ],
    "instructions": [
      "Secure your feet and position your knees near the pad's edge.",
      "Keep your hips extended as you lower your body forward.",
      "Bend your knees and pull yourself back to an upright position."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "glute-kickback-machine": {
    "images": [
      "exercises/glute-kickback-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Glute kickback machine",
    "muscles": [
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Brace against the machine and place one foot on its moving pad.",
      "Drive that foot back by extending your hip.",
      "Bring your knee forward slowly without rotating your pelvis."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "hack-squat": {
    "images": [
      "exercises/hack-squat-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Hack squat machine",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Set your back and shoulders against the pads and place your feet on the platform.",
      "Lower the sled until your knees reach a comfortable depth.",
      "Press through your whole foot to straighten your legs."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "hack-squat-barbell": {
    "images": [
      "exercises/hack-squat-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Hold the bar behind your legs with straight arms.",
      "Bend your knees and hips while keeping your chest lifted.",
      "Push through the floor and stand with the bar close behind you."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "high-knee-skips": {
    "images": [
      "exercises/high-knee-skips-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Hip flexors",
      "Calves",
      "Quads"
    ],
    "instructions": [
      "Stand tall and lift one knee toward hip height.",
      "Push off the supporting foot with a small skip.",
      "Alternate legs while swinging the opposite arm forward."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "hip-adductor-machine": {
    "images": [
      "exercises/hip-adductor-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Hip adductor machine",
    "muscles": [
      "Adductors"
    ],
    "instructions": [
      "Sit against the back pad with the pads inside your knees.",
      "Bring your thighs together without lifting your hips.",
      "Open your legs slowly back to the starting width."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "hip-thrust-bodyweight": {
    "images": [
      "exercises/hip-thrust-bodyweight-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bench",
    "muscles": [
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Rest your upper back on a bench and plant your feet firmly.",
      "Drive your hips upward until your torso and thighs align.",
      "Lower your hips with control while keeping your feet planted."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "inverted-row-bodyweight": {
    "images": [
      "exercises/inverted-row-bodyweight-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Low fixed bar",
    "muscles": [
      "Upper back",
      "Lats",
      "Biceps"
    ],
    "instructions": [
      "Set a secure bar around waist height and hang beneath it.",
      "Keep your body straight as you pull your chest toward the bar.",
      "Extend your arms to lower yourself smoothly."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "iso-lateral-row-machine": {
    "images": [
      "exercises/iso-lateral-row-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Iso-lateral row machine",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Adjust the seat so the handles line up with your lower chest.",
      "Keep your chest against the pad and pull both handles back.",
      "Reach forward slowly while keeping your shoulders controlled."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "jump-squat": {
    "images": [
      "exercises/jump-squat-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Quads",
      "Glutes",
      "Calves"
    ],
    "instructions": [
      "Dip into a squat with your feet about shoulder-width apart.",
      "Drive through the floor and jump upward.",
      "Land softly and bend your knees into the next squat."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "kipping-pull-up": {
    "images": [
      "exercises/kipping-pull-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pull-up bar",
    "muscles": [
      "Lats",
      "Upper back",
      "Core"
    ],
    "instructions": [
      "Use a secure overhand grip and begin a controlled hollow-to-arch swing.",
      "Coordinate the hip drive with your pull toward the bar.",
      "Return to a controlled hang and rebuild the swing."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "kneeling-pulldown-band": {
    "images": [
      "exercises/kneeling-pulldown-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band and high anchor",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Kneel beneath a securely anchored overhead band.",
      "Pull your elbows down toward your sides.",
      "Let your arms reach overhead slowly while keeping your ribs down."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lat-pulldown-cable": {
    "images": [
      "exercises/lat-pulldown-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable pulldown machine",
    "muscles": [
      "Lats",
      "Biceps"
    ],
    "instructions": [
      "Secure your thighs under the pads and take an overhand grip.",
      "Pull the bar toward your upper chest while keeping your torso steady.",
      "Let the bar rise until your arms are long again."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lat-pulldown-machine": {
    "images": [
      "exercises/lat-pulldown-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Lever lat pulldown machine",
    "muscles": [
      "Lats",
      "Biceps"
    ],
    "instructions": [
      "Adjust the thigh pads and reach for the machine's handles.",
      "Pull your elbows down toward your ribs.",
      "Guide the handles upward without lifting off the seat."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lat-pulldown-single-arm": {
    "images": [
      "exercises/lat-pulldown-single-arm-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "High cable and single handle",
    "muscles": [
      "Lats",
      "Biceps"
    ],
    "instructions": [
      "Sit or kneel in line with a high pulley and hold one handle.",
      "Pull your elbow down toward your side without twisting.",
      "Reach upward slowly, then repeat on the other arm."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lat-pulldown-underhand-band": {
    "images": [
      "exercises/lat-pulldown-underhand-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band and high anchor",
    "muscles": [
      "Lats",
      "Biceps"
    ],
    "instructions": [
      "Anchor a band overhead and hold its ends with palms facing you.",
      "Pull your elbows down and bring your hands toward your shoulders.",
      "Let your arms extend overhead under control."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lat-pulldown-underhand-cable": {
    "images": [
      "exercises/lat-pulldown-underhand-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable pulldown machine",
    "muscles": [
      "Lats",
      "Biceps"
    ],
    "instructions": [
      "Sit securely and hold the bar with a shoulder-width underhand grip.",
      "Pull the bar to your upper chest with elbows close to your sides.",
      "Control the return until your arms are extended."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lateral-box-jump": {
    "images": [
      "exercises/lateral-box-jump-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Plyometric box",
    "muscles": [
      "Quads",
      "Glutes",
      "Calves"
    ],
    "instructions": [
      "Stand beside a low, stable box and dip your hips.",
      "Jump sideways onto the box with both feet.",
      "Land softly, stabilize, and step back down."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lunge-barbell": {
    "images": [
      "exercises/lunge-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Quads",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Brace the bar across your upper back and take a step forward.",
      "Lower until both knees bend comfortably, keeping your front heel down.",
      "Push through the front foot to return to standing."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lunge-bodyweight": {
    "images": [
      "exercises/lunge-bodyweight-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Quads",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Stand tall with your hands on your hips.",
      "Step forward and lower your back knee toward the floor.",
      "Press through your front foot to return to the start."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lunge-dumbbell": {
    "images": [
      "exercises/lunge-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Quads",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Hold a dumbbell at each side and stand tall.",
      "Step forward and lower into a controlled lunge.",
      "Push off the front foot and return to standing."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "pendlay-row-barbell": {
    "images": [
      "exercises/pendlay-row-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Lats",
      "Upper back",
      "Spinal erectors"
    ],
    "instructions": [
      "Hinge until your torso is nearly parallel to the floor and grip the bar.",
      "Row the bar toward your lower chest without lifting your torso.",
      "Set the plates back on the floor before the next rep."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "pistol-squat": {
    "images": [
      "exercises/pistol-squat-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Quads",
      "Glutes",
      "Core"
    ],
    "instructions": [
      "Balance on one foot with the other leg extended in front.",
      "Sit down on the supporting leg while reaching your arms forward.",
      "Push through that foot to stand, using support if needed."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "pull-up-assisted": {
    "images": [
      "exercises/pull-up-assisted-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Assisted pull-up machine",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Select an assistance level and kneel on the support pad.",
      "Take an overhand grip and pull your chest toward the bar.",
      "Lower slowly while keeping your knees centered on the pad."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "rack-pull-barbell": {
    "images": [
      "exercises/rack-pull-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell and power rack",
    "muscles": [
      "Glutes",
      "Spinal erectors",
      "Upper back"
    ],
    "instructions": [
      "Set the bar on rack safeties just below your knees.",
      "Brace and extend your hips to stand tall with the bar close.",
      "Lower the bar back onto the safeties under control."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "romanian-deadlift-dumbbell": {
    "images": [
      "exercises/romanian-deadlift-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Hamstrings",
      "Glutes"
    ],
    "instructions": [
      "Stand with dumbbells in front of your thighs and knees slightly bent.",
      "Push your hips back while lowering the weights close to your legs.",
      "Drive your hips forward when you feel a controlled hamstring stretch."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "seated-calf-raise-machine": {
    "images": [
      "exercises/seated-calf-raise-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Selectorized seated calf machine",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Set the thigh pad securely and place your forefeet on the block.",
      "Lower your heels through a comfortable range.",
      "Push through your toes and raise your heels slowly."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "seated-leg-curl-machine": {
    "images": [
      "exercises/seated-leg-curl-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Seated leg curl machine",
    "muscles": [
      "Hamstrings"
    ],
    "instructions": [
      "Adjust the backrest and secure the thigh pad.",
      "Curl your heels down and back against the lower roller.",
      "Straighten your knees slowly without lifting your thighs."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "seated-leg-press-machine": {
    "images": [
      "exercises/seated-leg-press-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Seated horizontal leg press",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Sit against the back pad and place both feet on the platform.",
      "Press the platform away until your knees are almost straight.",
      "Bend your knees to return without rounding your lower back."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "seated-row-machine": {
    "images": [
      "exercises/seated-row-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Seated row machine",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Set the seat so the handles are level with your lower ribs.",
      "Keep your chest against the pad and pull your elbows back.",
      "Return the handles slowly without shrugging your shoulders."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "seated-wide-grip-row-cable": {
    "images": [
      "exercises/seated-wide-grip-row-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Low cable row and wide bar",
    "muscles": [
      "Upper back",
      "Rear delts",
      "Lats"
    ],
    "instructions": [
      "Brace your feet and take a wide overhand grip on the bar.",
      "Row toward your upper abdomen with elbows angled outward.",
      "Reach forward slowly while keeping your torso steady."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "single-leg-bridge": {
    "images": [
      "exercises/single-leg-bridge-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Exercise mat",
    "muscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "instructions": [
      "Lie on your back with one foot planted and the other leg lifted.",
      "Drive through the planted heel to raise your hips.",
      "Lower slowly while keeping your pelvis level, then switch legs."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "squat-band": {
    "images": [
      "exercises/squat-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Stand on the band and hold its upper section at your shoulders.",
      "Sit down between your hips while keeping your feet planted.",
      "Stand tall against the band's resistance."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "squat-bodyweight": {
    "images": [
      "exercises/squat-bodyweight-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Stand with feet about shoulder-width apart.",
      "Bend your hips and knees while keeping your heels grounded.",
      "Press through your whole feet to return to standing."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "squat-dumbbell": {
    "images": [
      "exercises/squat-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Hold one dumbbell at each side with your feet shoulder-width apart.",
      "Lower into a squat while keeping your chest lifted.",
      "Drive through your feet and stand tall."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "squat-machine": {
    "images": [
      "exercises/squat-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "V-squat machine",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Set your shoulders under the pads and brace against the support.",
      "Lower with the machine while keeping your knees aligned with your toes.",
      "Push through your feet to stand without snapping your knees straight."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "squat-smith-machine": {
    "images": [
      "exercises/squat-smith-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Smith machine",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Position the guided bar across your upper back and set your stance.",
      "Lower into a controlled squat while keeping your feet planted.",
      "Press upward and straighten your legs without locking forcefully."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "standing-calf-raise-barbell": {
    "images": [
      "exercises/standing-calf-raise-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell and calf block",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Rest the bar across your upper back and place your forefeet on a low block.",
      "Lower your heels slowly while keeping your knees nearly straight.",
      "Rise onto your toes and pause before lowering."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "standing-calf-raise-bodyweight": {
    "images": [
      "exercises/standing-calf-raise-bodyweight-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight and calf block",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Place your forefeet on a step and use nearby support for balance if needed.",
      "Lower your heels through a comfortable stretch.",
      "Rise onto your toes, pause, and lower slowly."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "standing-calf-raise-dumbbell": {
    "images": [
      "exercises/standing-calf-raise-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells and calf block",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Hold dumbbells at your sides and place your forefeet on a low block.",
      "Keep your knees almost straight as you lower your heels.",
      "Raise your heels by pushing through your toes."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "standing-calf-raise-smith-machine": {
    "images": [
      "exercises/standing-calf-raise-smith-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Smith machine and calf block",
    "muscles": [
      "Calves"
    ],
    "instructions": [
      "Set the guided bar on your upper back and stand with forefeet on a block.",
      "Lower your heels while keeping a soft bend in your knees.",
      "Press through your toes to raise your heels under control."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "step-up": {
    "images": [
      "exercises/step-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Exercise box",
    "muscles": [
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Place one whole foot on a stable step or box.",
      "Drive through that foot to bring your body upward.",
      "Step down slowly and repeat, then change the leading leg."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "stiff-leg-deadlift-barbell": {
    "images": [
      "exercises/stiff-leg-deadlift-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Hamstrings",
      "Glutes",
      "Spinal erectors"
    ],
    "instructions": [
      "Hold the bar in front of your thighs with knees softly unlocked.",
      "Hinge at the hips while keeping the knee angle nearly unchanged.",
      "Return to standing by extending your hips with a long spine."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "stiff-leg-deadlift-dumbbell": {
    "images": [
      "exercises/stiff-leg-deadlift-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Hamstrings",
      "Glutes",
      "Spinal erectors"
    ],
    "instructions": [
      "Hold the dumbbells in front of your thighs with a small knee bend.",
      "Lower by hinging at your hips while keeping the weights close.",
      "Extend your hips to stand without rounding your back."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "straight-leg-deadlift-band": {
    "images": [
      "exercises/straight-leg-deadlift-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Hamstrings",
      "Glutes",
      "Spinal erectors"
    ],
    "instructions": [
      "Stand on the band and hold its ends with knees softly unlocked.",
      "Hinge forward at your hips without turning the movement into a squat.",
      "Stand by extending your hips against the band."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "sumo-deadlift-barbell": {
    "images": [
      "exercises/sumo-deadlift-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Glutes",
      "Adductors",
      "Quads",
      "Spinal erectors"
    ],
    "instructions": [
      "Take a wide stance with toes turned out and grip the bar inside your knees.",
      "Brace and push the floor away as you extend hips and knees.",
      "Lower the bar close to your legs and reset on the floor."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "trap-bar-deadlift": {
    "images": [
      "exercises/trap-bar-deadlift-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Trap bar",
    "muscles": [
      "Quads",
      "Glutes",
      "Hamstrings"
    ],
    "instructions": [
      "Stand in the center of the trap bar and grip both side handles.",
      "Brace and stand by extending your hips and knees together.",
      "Lower the bar under control until the plates touch down."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "wide-pull-up": {
    "images": [
      "exercises/wide-pull-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pull-up bar",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Grip the bar wider than shoulder width with palms facing away.",
      "Pull upward by drawing your elbows down toward your sides.",
      "Lower smoothly until your arms are extended."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "zercher-squat-barbell": {
    "images": [
      "exercises/zercher-squat-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Quads",
      "Glutes",
      "Core"
    ],
    "instructions": [
      "Cradle the bar in your elbow creases and hold it close to your body.",
      "Brace your torso and squat between your hips.",
      "Drive through your feet to stand while keeping the bar secure."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "good-morning-barbell": {
    "equipment": "Barbell",
    "muscles": [
      "Hamstrings",
      "Glutes",
      "Spinal erectors"
    ],
    "instructions": [
      "Set the bar across your upper back and soften your knees.",
      "Push your hips back while keeping your spine long and the bar steady.",
      "Extend your hips to return to a tall stance."
    ],
    "images": [
      "exercises/good-morning-barbell-pair.jpg"
    ],
    "layout": "paired",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "t-bar-row": {
    "equipment": "Landmine barbell and neutral-grip handle",
    "muscles": [
      "Lats",
      "Upper back",
      "Biceps"
    ],
    "instructions": [
      "Straddle the anchored bar and hinge forward to hold the handle.",
      "Pull the handle toward your lower chest while keeping your torso still.",
      "Lower the weight until your arms are long again."
    ],
    "images": [
      "exercises/t-bar-row-pair.jpg"
    ],
    "layout": "paired",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "upright-row-barbell": {
    "equipment": "Barbell",
    "muscles": [
      "Deltoids",
      "Upper traps"
    ],
    "instructions": [
      "Hold the bar in front of your thighs with an overhand grip.",
      "Raise it close to your body, leading your elbows outward.",
      "Stop at a comfortable height below your shoulders and lower slowly."
    ],
    "images": [
      "exercises/upright-row-barbell-pair.jpg"
    ],
    "layout": "paired",
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "around-the-world": {
    "images": [
      "exercises/around-the-world-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells · flat bench",
    "muscles": [
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Lie on a flat bench with light dumbbells beside your hips, palms up and elbows softly bent.",
      "Sweep both arms outward and around toward your head while keeping the weights near bench height.",
      "Reverse the arc to your hips without changing your elbow bend or lifting your torso."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Around_The_Worlds.json"
  },
  "bench-dip": {
    "images": [
      "exercises/bench-dip-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · flat bench",
    "muscles": [
      "Triceps",
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Place your palms on the bench edge beside your hips and move your hips just in front of the seat, heels on the floor.",
      "Bend your elbows backward to lower your hips through a comfortable range, keeping your back close to the bench.",
      "Press through your hands to straighten your arms without shrugging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Bench_Dips.json"
  },
  "bench-press-cable": {
    "images": [
      "exercises/bench-press-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulleys · flat bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Lie on a flat bench with both feet planted. Hold the weights or handles just outside your chest with your wrists above your elbows.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "bench-press-smith-machine": {
    "images": [
      "exercises/bench-press-smith-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Smith machine · flat bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Lie on a flat bench with both feet planted. Grip the guided bar slightly wider than your shoulders and release its hooks with the safety stops set.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "bench-press-wide-grip-barbell": {
    "images": [
      "exercises/bench-press-wide-grip-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Wide-grip barbell · flat bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Lie on a flat bench with both feet planted. Grip the bar well outside shoulder width.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Wide-Grip_Barbell_Bench_Press.json"
  },
  "decline-bench-press-barbell": {
    "images": [
      "exercises/decline-bench-press-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · decline bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Secure your ankles under the decline bench pads and lie back with your head lower than your hips. Hold the weights or handles just outside your chest with your wrists above your elbows.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Decline_Barbell_Bench_Press.json"
  },
  "decline-bench-press-dumbbell": {
    "images": [
      "exercises/decline-bench-press-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells · decline bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Secure your ankles under the decline bench pads and lie back with your head lower than your hips. Hold the weights or handles just outside your chest with your wrists above your elbows.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "decline-bench-press-smith-machine": {
    "images": [
      "exercises/decline-bench-press-smith-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Smith machine · decline bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Secure your ankles under the decline bench pads and lie back with your head lower than your hips. Grip the guided bar slightly wider than your shoulders and release its hooks with the safety stops set.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "incline-bench-press-barbell": {
    "images": [
      "exercises/incline-bench-press-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · incline bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Set the bench to a modest incline and sit with your back supported and feet planted. Hold the weights or handles just outside your chest with your wrists above your elbows.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "incline-bench-press-cable": {
    "images": [
      "exercises/incline-bench-press-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulleys · incline bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Set the bench to a modest incline and sit with your back supported and feet planted. Hold the weights or handles just outside your chest with your wrists above your elbows.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "incline-bench-press-smith-machine": {
    "images": [
      "exercises/incline-bench-press-smith-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Smith machine · incline bench",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Set the bench to a modest incline and sit with your back supported and feet planted. Grip the guided bar slightly wider than your shoulders and release its hooks with the safety stops set.",
      "Press upward over your chest while keeping your shoulder blades against the pad.",
      "Lower under control to the starting height; keep your forearms aligned beneath the load."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "floor-press-barbell": {
    "images": [
      "exercises/floor-press-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell · floor mat",
    "muscles": [
      "Chest",
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Lie on your back on the floor with knees bent and feet planted, holding a barbell over your chest.",
      "Lower the bar until your upper arms gently touch the floor, keeping your wrists above your elbows.",
      "Press back to extended arms while your shoulders and hips stay on the floor."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "chest-dip": {
    "images": [
      "exercises/chest-dip-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · parallel dip bars",
    "muscles": [
      "Chest",
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Support yourself above parallel bars with arms straight and knees bent behind you. Lean your torso slightly forward.",
      "Bend your elbows to lower your body through a comfortable range, keeping your shoulders controlled.",
      "Push the handles down to raise yourself to straight arms without swinging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dips_-_Chest_Version.json"
  },
  "chest-dip-assisted": {
    "images": [
      "exercises/chest-dip-assisted-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Assisted dip machine · knee pad",
    "muscles": [
      "Chest",
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Kneel on the counterweighted assistance pad and grip the parallel handles. Lean your torso slightly forward.",
      "Bend your elbows to lower your body through a comfortable range, keeping your shoulders controlled.",
      "Push the handles down to raise yourself to straight arms without swinging."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "triceps-dip-assisted": {
    "images": [
      "exercises/triceps-dip-assisted-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Assisted dip machine · knee pad",
    "muscles": [
      "Triceps",
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Kneel on the counterweighted assistance pad and grip the parallel handles. Keep your torso upright.",
      "Bend your elbows to lower your body through a comfortable range, keeping your shoulders controlled.",
      "Push the handles down to raise yourself to straight arms without swinging."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "chest-fly": {
    "images": [
      "exercises/chest-fly-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · chest-height pulleys",
    "muscles": [
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Stand in a split stance with handles at your sides and elbows softly bent.",
      "Bring your arms together in a wide arc, keeping the same soft elbow bend.",
      "Open your arms slowly to a comfortable stretch without letting your shoulders roll forward."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "chest-fly-band": {
    "images": [
      "exercises/chest-fly-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance bands · secure chest-height anchors",
    "muscles": [
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Stand in a split stance with handles at your sides and elbows softly bent.",
      "Bring your arms together in a wide arc, keeping the same soft elbow bend.",
      "Open your arms slowly to a comfortable stretch without letting your shoulders roll forward."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "chest-fly-dumbbell": {
    "images": [
      "exercises/chest-fly-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells · flat bench",
    "muscles": [
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Lie on a flat bench with a dumbbell in each hand and palms facing each other.",
      "Bring your arms together in a wide arc, keeping the same soft elbow bend.",
      "Open your arms slowly to a comfortable stretch without letting your shoulders roll forward."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dumbbell_Flyes.json"
  },
  "incline-chest-fly-dumbbell": {
    "images": [
      "exercises/incline-chest-fly-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells · incline bench",
    "muscles": [
      "Chest",
      "Shoulders"
    ],
    "instructions": [
      "Lie on a modest incline bench with a dumbbell in each hand and palms facing each other.",
      "Bring your arms together in a wide arc, keeping the same soft elbow bend.",
      "Open your arms slowly to a comfortable stretch without letting your shoulders roll forward."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "chest-press-band": {
    "images": [
      "exercises/chest-press-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band · secure chest-height anchor",
    "muscles": [
      "Chest",
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Face away from a band secured behind you at chest height and take a split stance with handles beside your chest.",
      "Press both hands forward to extend your arms while keeping your ribs and hips steady.",
      "Bend your elbows to return slowly, keeping the band under control."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "incline-chest-press-machine": {
    "images": [
      "exercises/incline-chest-press-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Incline chest press machine",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Adjust the seat so the handles meet your upper chest, then sit with your back supported and feet planted.",
      "Press both handles upward and forward without lifting your shoulders away from the pad.",
      "Return the handles slowly until your elbows are bent beside your torso."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "iso-lateral-chest-press-machine": {
    "images": [
      "exercises/iso-lateral-chest-press-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Plate-loaded iso-lateral chest press machine",
    "muscles": [
      "Chest",
      "Shoulders",
      "Triceps"
    ],
    "instructions": [
      "Adjust the seat so the handles meet your upper chest, then sit with your back supported and feet planted.",
      "Press both handles forward together without lifting your shoulders away from the pad.",
      "Return the handles slowly until your elbows are bent beside your torso."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "bicep-curl-barbell": {
    "images": [
      "exercises/bicep-curl-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Biceps",
      "Brachialis",
      "Forearms"
    ],
    "instructions": [
      "Begin standing, holding the barbell with an underhand grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Barbell_Curl.json"
  },
  "bicep-curl-machine": {
    "images": [
      "exercises/bicep-curl-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Biceps curl machine",
    "muscles": [
      "Biceps",
      "Brachialis",
      "Forearms"
    ],
    "instructions": [
      "Begin seated with upper arms on machine pads, holding the curl machine with an underhand grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Machine_Bicep_Curl.json"
  },
  "hammer-curl-band": {
    "images": [
      "exercises/hammer-curl-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Biceps",
      "Brachialis",
      "Forearms"
    ],
    "instructions": [
      "Begin standing, holding the resistance band under both feet with an neutral thumbs-up grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "hammer-curl-cable": {
    "images": [
      "exercises/hammer-curl-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulley · rope",
    "muscles": [
      "Biceps",
      "Brachialis",
      "Forearms"
    ],
    "instructions": [
      "Begin standing, holding the low cable rope with an neutral thumbs-up grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment.json"
  },
  "incline-curl-dumbbell": {
    "images": [
      "exercises/incline-curl-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells · incline bench",
    "muscles": [
      "Biceps",
      "Brachialis",
      "Forearms"
    ],
    "instructions": [
      "Begin seated against a 55-degree incline bench, holding the two dumbbells with an underhand grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Incline_Dumbbell_Curl.json"
  },
  "preacher-curl-dumbbell": {
    "images": [
      "exercises/preacher-curl-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbell · preacher bench",
    "muscles": [
      "Biceps",
      "Brachialis",
      "Forearms"
    ],
    "instructions": [
      "Begin seated with one upper arm on preacher pad, holding the one dumbbell with an underhand grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/One_Arm_Dumbbell_Preacher_Curl.json"
  },
  "preacher-curl-machine": {
    "images": [
      "exercises/preacher-curl-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Preacher curl machine",
    "muscles": [
      "Biceps",
      "Brachialis",
      "Forearms"
    ],
    "instructions": [
      "Begin seated with upper arms on sloped preacher pad, holding the preacher curl machine with an underhand grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "reverse-curl-band": {
    "images": [
      "exercises/reverse-curl-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Brachioradialis",
      "Biceps",
      "Forearms"
    ],
    "instructions": [
      "Begin standing, holding the resistance band under both feet with an overhand palms-down grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "reverse-curl-barbell": {
    "images": [
      "exercises/reverse-curl-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Brachioradialis",
      "Biceps",
      "Forearms"
    ],
    "instructions": [
      "Begin standing, holding the barbell with an overhand palms-down grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Reverse_Barbell_Curl.json"
  },
  "reverse-curl-dumbbell": {
    "images": [
      "exercises/reverse-curl-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Brachioradialis",
      "Biceps",
      "Forearms"
    ],
    "instructions": [
      "Begin standing, holding the two dumbbells with an overhand palms-down grip.",
      "Bend your elbows to raise the load toward your shoulders while your upper arms remain still.",
      "Lower slowly to extended arms without swinging or changing your wrist position."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "concentration-curl-dumbbell": {
    "images": [
      "exercises/concentration-curl-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbell · flat bench",
    "muscles": [
      "Biceps",
      "Forearms"
    ],
    "instructions": [
      "Sit with feet wide and brace the back of your working upper arm against your inner thigh. Hold one dumbbell with your palm facing up.",
      "Curl the dumbbell toward your shoulder while keeping your upper arm against your thigh.",
      "Lower with control until your elbow extends, then repeat on the other side."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Concentration_Curls.json"
  },
  "reverse-grip-concentration-curl-dumbbell": {
    "images": [
      "exercises/reverse-grip-concentration-curl-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbell · flat bench",
    "muscles": [
      "Brachioradialis",
      "Biceps",
      "Forearms"
    ],
    "instructions": [
      "Sit with feet wide and brace the back of your working upper arm against your inner thigh. Hold one dumbbell with your palm facing down.",
      "Curl the dumbbell toward your shoulder while keeping your upper arm against your thigh.",
      "Lower with control until your elbow extends, then repeat on the other side."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "cable-kickback": {
    "images": [
      "exercises/cable-kickback-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulley · single handle",
    "muscles": [
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Face a low pulley, hinge forward and bring your working upper arm alongside your torso with the elbow bent.",
      "Straighten that elbow to move the handle backward while keeping your upper arm still.",
      "Bend the elbow slowly to return, then repeat with the other arm."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "seated-palms-up-wrist-curl-dumbbell": {
    "images": [
      "exercises/seated-palms-up-wrist-curl-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells · flat bench",
    "muscles": [
      "Forearm flexors"
    ],
    "instructions": [
      "Sit on a bench with your forearms supported on your thighs, palms up and wrists just beyond your knees.",
      "Curl your hands upward at the wrists without lifting your forearms.",
      "Lower the dumbbells slowly through the same wrist range, keeping your grip secure."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl.json"
  },
  "skullcrusher-dumbbell": {
    "images": [
      "exercises/skullcrusher-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells · flat bench",
    "muscles": [
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Lie on a flat bench holding dumbbells above your shoulders with palms facing each other.",
      "Keep your upper arms steady as you bend your elbows and lower the dumbbells beside your forehead.",
      "Straighten your elbows to return the weights above your shoulders."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "triceps-extension": {
    "images": [
      "exercises/triceps-extension-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "EZ bar",
    "muscles": [
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Stand with ribs down and hold the EZ curl bar above your head, keeping your elbows near your ears.",
      "Bend your elbows to lower the load behind your head without moving your upper arms.",
      "Extend your elbows to return overhead while your torso stays still."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "triceps-extension-barbell": {
    "images": [
      "exercises/triceps-extension-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Stand with ribs down and hold the straight barbell above your head, keeping your elbows near your ears.",
      "Bend your elbows to lower the load behind your head without moving your upper arms.",
      "Extend your elbows to return overhead while your torso stays still."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Standing_Overhead_Barbell_Triceps_Extension.json"
  },
  "triceps-extension-cable": {
    "images": [
      "exercises/triceps-extension-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulley · rope",
    "muscles": [
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Stand with ribs down and hold the cable rope above your head, keeping your elbows near your ears.",
      "Bend your elbows to lower the load behind your head without moving your upper arms.",
      "Extend your elbows to return overhead while your torso stays still."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "triceps-extension-machine": {
    "images": [
      "exercises/triceps-extension-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Triceps extension machine",
    "muscles": [
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Adjust the seat and place your upper arms on the pads, then hold the machine handles with elbows bent.",
      "Extend your elbows to move the handles away while your upper arms stay supported.",
      "Return the handles slowly without letting the weight stack drop."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Machine_Triceps_Extension.json"
  },
  "wrist-roller": {
    "images": [
      "exercises/wrist-roller-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Wrist roller · rope · weight plate",
    "muscles": [
      "Forearms",
      "Shoulders"
    ],
    "instructions": [
      "Stand tall holding the roller with both hands in front of you; let its rope and weight hang clear of the floor.",
      "Turn the handle with alternating wrist rotations to wind the rope and lift the weight.",
      "Reverse the wrist turns slowly to unwind the rope and lower the weight under control."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Wrist_Roller.json"
  },
  "front-raise-band": {
    "images": [
      "exercises/front-raise-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Front deltoids",
      "Upper chest"
    ],
    "instructions": [
      "Stand tall on the middle of a band, holding an end in each hand.",
      "Raise your hands forward to shoulder height, keeping a soft elbow bend and your torso still.",
      "Lower slowly to the start without shrugging or swinging."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "front-raise-barbell": {
    "images": [
      "exercises/front-raise-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Front deltoids",
      "Upper chest"
    ],
    "instructions": [
      "Stand tall holding a barbell overhand in front of your thighs.",
      "Raise your hands forward to shoulder height, keeping a soft elbow bend and your torso still.",
      "Lower slowly to the start without shrugging or swinging."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "front-raise-cable": {
    "images": [
      "exercises/front-raise-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulley · single handle",
    "muscles": [
      "Front deltoids",
      "Upper chest"
    ],
    "instructions": [
      "Stand tall facing away from a low pulley, with its handle beside your thigh.",
      "Raise your hands forward to shoulder height, keeping a soft elbow bend and your torso still.",
      "Lower slowly to the start without shrugging or swinging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Front_Cable_Raise.json"
  },
  "front-raise-plate": {
    "images": [
      "exercises/front-raise-plate-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Weight plate",
    "muscles": [
      "Front deltoids",
      "Upper chest"
    ],
    "instructions": [
      "Stand tall holding a weight plate by its sides in front of your thighs.",
      "Raise your hands forward to shoulder height, keeping a soft elbow bend and your torso still.",
      "Lower slowly to the start without shrugging or swinging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Front_Plate_Raise.json"
  },
  "lateral-raise-band": {
    "images": [
      "exercises/lateral-raise-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band",
    "muscles": [
      "Side deltoids",
      "Traps"
    ],
    "instructions": [
      "Stand tall on the middle of a band, holding an end in each hand.",
      "Raise your arms out to the sides to shoulder height, keeping a soft elbow bend and your torso still.",
      "Lower slowly to the start without shrugging or swinging."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Lateral_Raise_-_With_Bands.json"
  },
  "lateral-raise-cable": {
    "images": [
      "exercises/lateral-raise-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulley · single handle",
    "muscles": [
      "Side deltoids",
      "Traps"
    ],
    "instructions": [
      "Stand tall beside a low pulley with the handle in the far hand.",
      "Raise your arms out to the sides to shoulder height, keeping a soft elbow bend and your torso still.",
      "Lower slowly to the start without shrugging or swinging."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "lateral-raise-machine": {
    "images": [
      "exercises/lateral-raise-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Lateral raise machine",
    "muscles": [
      "Side deltoids",
      "Traps"
    ],
    "instructions": [
      "Sit in the lateral raise machine with your upper arms against the pads and feet planted.",
      "Raise your arms out to the sides to shoulder height, keeping a soft elbow bend and your torso still.",
      "Lower slowly to the start without shrugging or swinging."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "overhead-press-barbell": {
    "images": [
      "exercises/overhead-press-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Upper chest"
    ],
    "instructions": [
      "Begin standing hip width with the barbell at shoulder height and your forearms beneath the load.",
      "Press overhead until your arms extend, keeping your ribs down and avoiding leg drive.",
      "Lower with control to shoulder height while keeping your torso steady."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "overhead-press-cable": {
    "images": [
      "exercises/overhead-press-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulleys · handles",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Upper chest"
    ],
    "instructions": [
      "Begin standing between towers with the two low cable handles at shoulder height and your forearms beneath the load.",
      "Press overhead until your arms extend, keeping your ribs down and avoiding leg drive.",
      "Lower with control to shoulder height while keeping your torso steady."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Cable_Shoulder_Press.json"
  },
  "overhead-press-dumbbell": {
    "images": [
      "exercises/overhead-press-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Upper chest"
    ],
    "instructions": [
      "Begin standing hip width with the two dumbbells at shoulder height and your forearms beneath the load.",
      "Press overhead until your arms extend, keeping your ribs down and avoiding leg drive.",
      "Lower with control to shoulder height while keeping your torso steady."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "overhead-press-smith-machine": {
    "images": [
      "exercises/overhead-press-smith-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Smith machine · upright bench",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Upper chest"
    ],
    "instructions": [
      "Begin seated against upright bench with the Smith machine bar at shoulder height and your forearms beneath the load.",
      "Press overhead until your arms extend, keeping your ribs down and avoiding leg drive.",
      "Lower with control to shoulder height while keeping your torso steady."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "strict-military-press-barbell": {
    "images": [
      "exercises/strict-military-press-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Upper chest"
    ],
    "instructions": [
      "Begin standing feet close together with the barbell at shoulder height and your forearms beneath the load.",
      "Press overhead until your arms extend, keeping your ribs down and avoiding leg drive.",
      "Lower with control to shoulder height while keeping your torso steady."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Standing_Military_Press.json"
  },
  "shoulder-press-machine": {
    "images": [
      "exercises/shoulder-press-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Shoulder press machine · weight stack",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Upper chest"
    ],
    "instructions": [
      "Begin seated with the selectorized shoulder press at shoulder height and your forearms beneath the load.",
      "Press overhead until your arms extend, keeping your ribs down and avoiding leg drive.",
      "Lower with control to shoulder height while keeping your torso steady."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "shoulder-press-plate-loaded": {
    "images": [
      "exercises/shoulder-press-plate-loaded-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Shoulder press machine · plate-loaded levers",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Upper chest"
    ],
    "instructions": [
      "Begin seated with the plate-loaded shoulder press at shoulder height and your forearms beneath the load.",
      "Press overhead until your arms extend, keeping your ribs down and avoiding leg drive.",
      "Lower with control to shoulder height while keeping your torso steady."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Leverage_Shoulder_Press.json"
  },
  "push-press": {
    "images": [
      "exercises/push-press-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Quads",
      "Glutes"
    ],
    "instructions": [
      "Stand with a barbell at your front shoulders, elbows slightly forward and feet about hip width.",
      "Dip a little at the knees, then drive through your legs and press the bar overhead in one motion.",
      "Lower the bar to your shoulders with control and reset before the next repetition."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "handstand-push-up": {
    "images": [
      "exercises/handstand-push-up-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · wall · exercise mat",
    "muscles": [
      "Shoulders",
      "Triceps",
      "Core"
    ],
    "instructions": [
      "Set your hands just outside shoulder width on a mat and establish a controlled handstand with your heels lightly against a wall.",
      "Bend your elbows to lower your head toward the mat through a range you can control.",
      "Press the floor away to straighten your arms while keeping your body aligned."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Handstand_Push-Ups.json"
  },
  "push-up-band": {
    "images": [
      "exercises/push-up-band-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Resistance band · bodyweight",
    "muscles": [
      "Chest",
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Set your hands slightly wider than your shoulders with a resistance band across your upper back and its ends secured beneath your palms; extend your legs onto your toes.",
      "Bend your elbows to lower your chest while keeping your trunk firm.",
      "Press through your palms to return to straight arms without letting your hips sag."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "push-up-knees": {
    "images": [
      "exercises/push-up-knees-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Bodyweight · exercise mat",
    "muscles": [
      "Chest",
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Set your hands slightly wider than your shoulders and rest your knees on a mat, keeping a straight line from shoulders to knees.",
      "Bend your elbows to lower your chest while keeping your trunk firm.",
      "Press through your palms to return to straight arms without letting your hips sag."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "reverse-fly-cable": {
    "images": [
      "exercises/reverse-fly-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · chest-height pulleys",
    "muscles": [
      "Rear deltoids",
      "Upper back",
      "Traps"
    ],
    "instructions": [
      "Stand between chest-height pulleys and take the left handle in your right hand and the right handle in your left hand.",
      "Open your arms out to the sides with a small fixed elbow bend, bringing your shoulder blades together.",
      "Return slowly without shrugging or rocking your torso."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "reverse-fly-dumbbell": {
    "images": [
      "exercises/reverse-fly-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Rear deltoids",
      "Upper back",
      "Traps"
    ],
    "instructions": [
      "Hold dumbbells, soften your knees and hinge forward with a neutral back; let your arms hang below your chest.",
      "Open your arms out to the sides with a small fixed elbow bend, bringing your shoulder blades together.",
      "Return slowly without shrugging or rocking your torso."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "reverse-fly-machine": {
    "images": [
      "exercises/reverse-fly-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Reverse pec deck machine",
    "muscles": [
      "Rear deltoids",
      "Upper back",
      "Traps"
    ],
    "instructions": [
      "Sit facing the reverse-fly machine pad and hold its handles at shoulder height with arms reaching forward.",
      "Open your arms out to the sides with a small fixed elbow bend, bringing your shoulder blades together.",
      "Return slowly without shrugging or rocking your torso."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Reverse_Machine_Flyes.json"
  },
  "shrug-barbell": {
    "images": [
      "exercises/shrug-barbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Barbell",
    "muscles": [
      "Traps",
      "Forearms"
    ],
    "instructions": [
      "Stand tall holding the barbell with arms straight and shoulders relaxed.",
      "Lift your shoulders straight upward without bending your elbows or rolling your shoulders.",
      "Pause briefly, then lower your shoulders slowly to the starting position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Barbell_Shrug.json"
  },
  "shrug-dumbbell": {
    "images": [
      "exercises/shrug-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Traps",
      "Forearms"
    ],
    "instructions": [
      "Stand tall holding the dumbbells with arms straight and shoulders relaxed.",
      "Lift your shoulders straight upward without bending your elbows or rolling your shoulders.",
      "Pause briefly, then lower your shoulders slowly to the starting position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Dumbbell_Shrug.json"
  },
  "shrug-machine": {
    "images": [
      "exercises/shrug-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Plate-loaded shrug machine",
    "muscles": [
      "Traps",
      "Forearms"
    ],
    "instructions": [
      "Stand tall holding the shrug machine with arms straight and shoulders relaxed.",
      "Lift your shoulders straight upward without bending your elbows or rolling your shoulders.",
      "Pause briefly, then lower your shoulders slowly to the starting position."
    ],
    "sourceName": "Free Exercise DB",
    "sourceUrl": "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/Leverage_Shrug.json"
  },
  "shrug-smith-machine": {
    "images": [
      "exercises/shrug-smith-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Smith machine",
    "muscles": [
      "Traps",
      "Forearms"
    ],
    "instructions": [
      "Stand tall holding the Smith machine with arms straight and shoulders relaxed.",
      "Lift your shoulders straight upward without bending your elbows or rolling your shoulders.",
      "Pause briefly, then lower your shoulders slowly to the starting position."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "upright-row-cable": {
    "images": [
      "exercises/upright-row-cable-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Cable machine · low pulley · straight bar",
    "muscles": [
      "Shoulders",
      "Traps",
      "Biceps"
    ],
    "instructions": [
      "Stand tall holding the low cable straight bar in front of your thighs with an overhand grip.",
      "Raise the load close to your body, leading with elbows out to the sides and stopping around lower-chest height.",
      "Lower slowly until your arms extend, keeping your torso still."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "upright-row-dumbbell": {
    "images": [
      "exercises/upright-row-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbells",
    "muscles": [
      "Shoulders",
      "Traps",
      "Biceps"
    ],
    "instructions": [
      "Stand tall holding the two dumbbells in front of your thighs with an overhand grip.",
      "Raise the load close to your body, leading with elbows out to the sides and stopping around lower-chest height.",
      "Lower slowly until your arms extend, keeping your torso still."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "pullover-dumbbell": {
    "images": [
      "exercises/pullover-dumbbell-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Dumbbell · flat bench",
    "muscles": [
      "Chest",
      "Lats",
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Lie along a flat bench with feet planted and hold one dumbbell above your chest using both hands under its upper end.",
      "Lower the dumbbell behind your head in a controlled arc, keeping a small elbow bend and ribs down.",
      "Bring the dumbbell back above your chest through the same arc."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  },
  "pullover-machine": {
    "images": [
      "exercises/pullover-machine-pair.jpg"
    ],
    "layout": "paired",
    "equipment": "Pullover machine",
    "muscles": [
      "Chest",
      "Lats",
      "Triceps",
      "Shoulders"
    ],
    "instructions": [
      "Sit in the pullover machine with your back supported and upper arms against its pads, then hold the overhead handles.",
      "Pull the handles down in an arc toward your torso while keeping your elbows softly bent.",
      "Return slowly overhead without lifting away from the seat."
    ],
    "sourceName": "Original movement guide",
    "sourceUrl": ""
  }
};
