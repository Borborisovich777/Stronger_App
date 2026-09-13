# Exercise demonstration media

This directory contains 307 OpenAI-generated 3D mannequin image assets demonstrating two key positions for each of Stronger's 257 exercises. The original 50 exercises retain two square files each; the 207 additions each use one wide image containing two complete poses. They are served locally so guides do not depend on an external image host.

The final JPEG payload is 31,106,904 bytes (about 31.1 MB). The app downloads these in the background for offline use; allow the initial downloads to finish before relying on all guides without a connection.

## Artwork

- Generated with the built-in OpenAI image generation tool on 2026-09-13.
- Style: faceless matte gray 3D mannequin, subtle muted-red primary-muscle highlight, simplified charcoal/gray equipment, opaque white background, and soft studio shading.
- Original square positions used the corresponding public-domain photograph as a pose/equipment reference. New pairs use original exercise-specific pose prompts, with the first generated bench-press doll as a style reference. No Strong artwork is reused.
- Square JPEG exports are 768 × 768 pixels; paired exports are 1536 × 768. Resizing and JPEG compression are delivery optimizations; all visual generation and correction used the built-in OpenAI image generation tool.
- Original source photographs, full-resolution generated PNGs, and exact per-image prompts are preserved locally under `outputs/imagegen/` (excluded from the app build).
- `illustrations.json` records all generated asset paths, dimensions, byte counts, and checksums. The complete prompt set is saved locally in `outputs/imagegen/strong-generation-prompts.json`.

## Strong catalog coverage

The catalog covers 253 unique global exercise records in a [published Strong snapshot](https://github.com/tolik518/strong-api-workout-sync/blob/fc2f671c15df76f4d1c98dac155cce22a36ab933/measurements.json), committed on 2025-03-15. An independent public client documented the same count in August 2026; its 20-record fixture matches the snapshot's IDs and names. Strong's live endpoint returned 403 during verification, so this is published-snapshot coverage rather than a claim about today's live catalog.

[strong-catalog.json](./strong-catalog.json) maps every source ID/name to its local key and lists all 50 preserved original keys. Four existing variations remain alongside the Strong set: straight-arm cable pulldown, seated rear-delt fly, walking lunge, and plate Russian twist. Exercise names, IDs, equipment tags and measurement types are factual catalog metadata. Strong's proprietary instructions and image links are not copied into the app.

## Movement references and license

- Dataset: [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), maintained by yuhonas and contributors.
- Original dataset credited by the project: [exercises.json](https://github.com/wrkout/exercises.json).
- Downloaded: 2026-09-13, from the source repository's `main` branch.
- Source declares the exercise data and imagery public domain; repository license: [The Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md).
- The upstream license is included unchanged in [LICENSE.md](./LICENSE.md).
- The displayed illustrations are newly generated artwork, not the original dataset photographs. The included Unlicense applies to the reference dataset. Where a matching public-domain movement is used, guides link to it; other guides are originally authored and say “Movement guide written for Stronger.”

The two positions are movement cues rather than a full animated repetition. Complex Olympic lifts and Turkish get-ups include notes explaining that intermediate phases are omitted. General activities such as yoga, swimming and stretching identify the representative movement shown.

## Demonstrated variants

Generic exercise names use one specific, visibly identified equipment variant: assisted pull-up with a band; chest-supported row with dumbbells on an incline bench; shoulder press with a barbell while seated; rear-delt fly seated with dumbbells; biceps curl with dumbbells; overhead triceps extension seated with a dumbbell; goblet squat with a kettlebell; walking lunge with bodyweight; leg curl lying on a machine; hip abduction on a machine; Russian twist with a weight plate. Equipment labels and cues in the app describe these exact demonstrations. The Russian-twist equipment label corrects the source metadata: its photos visibly use a weight plate, although the source JSON says bodyweight.

Asset paths in `app/exercise-media.ts` are relative to Vite's public base: prepend `import.meta.env.BASE_URL` when displaying them. Original filenames retain frame numbers (`-0.jpg`, `-1.jpg`); additions use `-pair.jpg`. All use the current image-version query so old cached artwork cannot mask an update. Offline use requires the initial background downloads to complete.

## Original 50-exercise reference mapping

For each row, local generated files are `<exercise key>-0.jpg` and `<exercise key>-1.jpg`, using `exercises/<source ID>/0.jpg` and `1.jpg` respectively as pose references.

| Exercise key | Source exercise ID |
| --- | --- |
| `bench-press` | [`Barbell_Bench_Press_-_Medium_Grip`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Barbell_Bench_Press_-_Medium_Grip) |
| `incline-dumbbell-press` | [`Incline_Dumbbell_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Incline_Dumbbell_Press) |
| `dumbbell-bench-press` | [`Dumbbell_Bench_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Dumbbell_Bench_Press) |
| `chest-press-machine` | [`Machine_Bench_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Machine_Bench_Press) |
| `push-up` | [`Pushups`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Pushups) |
| `cable-fly` | [`Cable_Crossover`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Cable_Crossover) |
| `pec-deck` | [`Butterfly`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Butterfly) |
| `deadlift` | [`Barbell_Deadlift`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Barbell_Deadlift) |
| `barbell-row` | [`Bent_Over_Barbell_Row`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Bent_Over_Barbell_Row) |
| `lat-pulldown` | [`Wide-Grip_Lat_Pulldown`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Wide-Grip_Lat_Pulldown) |
| `pull-up` | [`Pullups`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Pullups) |
| `assisted-pull-up` | [`Band_Assisted_Pull-Up`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Band_Assisted_Pull-Up) |
| `seated-cable-row` | [`Seated_Cable_Rows`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Seated_Cable_Rows) |
| `one-arm-dumbbell-row` | [`One-Arm_Dumbbell_Row`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/One-Arm_Dumbbell_Row) |
| `chest-supported-row` | [`Dumbbell_Incline_Row`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Dumbbell_Incline_Row) |
| `straight-arm-pulldown` | [`Straight-Arm_Pulldown`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Straight-Arm_Pulldown) |
| `face-pull` | [`Face_Pull`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Face_Pull) |
| `shoulder-press` | [`Barbell_Shoulder_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Barbell_Shoulder_Press) |
| `dumbbell-shoulder-press` | [`Dumbbell_Shoulder_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Dumbbell_Shoulder_Press) |
| `arnold-press` | [`Arnold_Dumbbell_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Arnold_Dumbbell_Press) |
| `lateral-raise` | [`Side_Lateral_Raise`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Side_Lateral_Raise) |
| `rear-delt-fly` | [`Seated_Bent-Over_Rear_Delt_Raise`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Seated_Bent-Over_Rear_Delt_Raise) |
| `front-raise` | [`Front_Dumbbell_Raise`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Front_Dumbbell_Raise) |
| `biceps-curl` | [`Dumbbell_Bicep_Curl`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Dumbbell_Bicep_Curl) |
| `hammer-curl` | [`Hammer_Curls`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Hammer_Curls) |
| `preacher-curl` | [`Preacher_Curl`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Preacher_Curl) |
| `cable-curl` | [`Standing_Biceps_Cable_Curl`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Standing_Biceps_Cable_Curl) |
| `triceps-pushdown` | [`Triceps_Pushdown`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Triceps_Pushdown) |
| `overhead-triceps-extension` | [`Seated_Triceps_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Seated_Triceps_Press) |
| `skull-crusher` | [`EZ-Bar_Skullcrusher`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/EZ-Bar_Skullcrusher) |
| `close-grip-bench-press` | [`Close-Grip_Barbell_Bench_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Close-Grip_Barbell_Bench_Press) |
| `dip` | [`Dips_-_Triceps_Version`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Dips_-_Triceps_Version) |
| `back-squat` | [`Barbell_Squat`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Barbell_Squat) |
| `front-squat` | [`Front_Barbell_Squat`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Front_Barbell_Squat) |
| `goblet-squat` | [`Goblet_Squat`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Goblet_Squat) |
| `romanian-deadlift` | [`Romanian_Deadlift`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Romanian_Deadlift) |
| `leg-press` | [`Leg_Press`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Leg_Press) |
| `bulgarian-split-squat` | [`Split_Squat_with_Dumbbells`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Split_Squat_with_Dumbbells) |
| `walking-lunge` | [`Bodyweight_Walking_Lunge`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Bodyweight_Walking_Lunge) |
| `hip-thrust` | [`Barbell_Hip_Thrust`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Barbell_Hip_Thrust) |
| `leg-extension` | [`Leg_Extensions`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Leg_Extensions) |
| `leg-curl` | [`Lying_Leg_Curls`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Lying_Leg_Curls) |
| `standing-calf-raise` | [`Standing_Calf_Raises`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Standing_Calf_Raises) |
| `seated-calf-raise` | [`Seated_Calf_Raise`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Seated_Calf_Raise) |
| `hip-abduction` | [`Thigh_Abductor`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Thigh_Abductor) |
| `plank` | [`Plank`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Plank) |
| `hanging-leg-raise` | [`Hanging_Leg_Raise`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Hanging_Leg_Raise) |
| `cable-crunch` | [`Cable_Crunch`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Cable_Crunch) |
| `ab-wheel-rollout` | [`Ab_Roller`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Ab_Roller) |
| `russian-twist` | [`Russian_Twist`](https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Russian_Twist) |
