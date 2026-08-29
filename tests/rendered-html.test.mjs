import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("builds a static Stronger shell for the GitHub Pages project path", async () => {
  const html = await readFile(new URL("dist/index.html", projectRoot), "utf8");

  assert.match(html, /<title>Stronger (?:—|&#x2014;) Gym Tracker<\/title>/i);
  assert.match(html, /id=["']root["']/i);
  assert.match(html, /Loading your training log/);
  assert.match(html, /Your data stays on this device/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /\/Stronger_App\/manifest\.webmanifest/);
  assert.match(html, /\/Stronger_App\/apple-touch-icon\.png/);
  assert.match(html, /\/Stronger_App\/assets\/[^"']+\.js/);
  assert.match(html, /stronger-theme/);
  assert.doesNotMatch(html, /Your site is taking shape|vinext|codex-preview/i);

  const assets = await readdir(new URL("dist/assets/", projectRoot));
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
});

test("ships scoped install metadata and an offline shell", async () => {
  const [manifestText, serviceWorker, app, storage, sessionRescue, effort, programBlocks, weeklyReview, overallProgress, plateCalculator, nextSetPreview, historyCsv, exercises, styles, packageText, workflow] = await Promise.all([
    readFile(new URL("dist/manifest.webmanifest", projectRoot), "utf8"),
    readFile(new URL("dist/sw.js", projectRoot), "utf8"),
    readFile(new URL("app/StrongerApp.tsx", projectRoot), "utf8"),
    readFile(new URL("app/storage.ts", projectRoot), "utf8"),
    readFile(new URL("app/sessionRescue.ts", projectRoot), "utf8"),
    readFile(new URL("app/effort.ts", projectRoot), "utf8"),
    readFile(new URL("app/programBlocks.ts", projectRoot), "utf8"),
    readFile(new URL("app/weeklyReview.ts", projectRoot), "utf8"),
    readFile(new URL("app/overallProgress.ts", projectRoot), "utf8"),
    readFile(new URL("app/plateCalculator.ts", projectRoot), "utf8"),
    readFile(new URL("app/nextSetPreview.ts", projectRoot), "utf8"),
    readFile(new URL("app/historyCsv.ts", projectRoot), "utf8"),
    readFile(new URL("app/exercises.ts", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
    readFile(new URL(".github/workflows/deploy-pages.yml", projectRoot), "utf8"),
  ]);

  const manifest = JSON.parse(manifestText);
  assert.equal(manifest.id, "./");
  assert.equal(manifest.name, "Stronger — Gym Tracker");
  assert.equal(manifest.short_name, "Stronger");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.orientation, "portrait-primary");
  assert.equal(manifest.background_color, "#f3f1e9");
  assert.equal(manifest.theme_color, "#f3f1e9");

  for (const [src, sizes] of [["icon-192.png", "192x192"], ["icon-512.png", "512x512"]]) {
    const icon = manifest.icons.find((candidate) => candidate.src === src && candidate.purpose.includes("any"));
    assert.ok(icon, `manifest is missing ${src}`);
    assert.equal(icon.sizes, sizes);
    assert.equal(icon.type, "image/png");
    await access(new URL(`dist/${src}`, projectRoot));
  }
  assert.ok(manifest.icons.some((icon) => icon.src === "icon-512.png" && icon.purpose === "maskable"));
  await access(new URL("dist/apple-touch-icon.png", projectRoot));
  await access(new URL("dist/og.png", projectRoot));

  assert.match(app, /import\.meta\.env\.PROD/);
  assert.match(app, /import\.meta\.env\.BASE_URL/);
  assert.match(app, /register\(`\$\{appBase\}sw\.js`/);
  assert.match(app, /role="switch"/);
  assert.match(app, /aria-checked=\{theme === "dark"\}/);
  assert.match(app, /THEME_STORAGE_KEY = "stronger-theme"/);
  assert.match(app, /REST_DURATION_OPTIONS = \[0, 30, 45, 60, 90, 120, 150, 180, 240, 300\]/);
  assert.match(app, /function NumericInput/);
  assert.match(app, /type="text"[\s\S]*inputMode=\{decimal \? "decimal" : "numeric"\}/);
  assert.match(app, /exercise\.restSeconds > 0/);
  assert.match(app, /exercise\.restSeconds === 0 \? "Rest timer off"/);
  assert.match(app, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
  assert.match(app, /function ExercisePicker/);
  assert.match(app, /\+ Create custom exercise/);
  assert.match(app, /exerciseKey: draft\.exerciseKey/);
  assert.match(app, /normalizeStrongerBackup\(JSON\.parse/);
  assert.match(app, /storageRecoveryRequired/);
  assert.match(app, /paused before writing starter data over a record it could not read/);
  assert.match(app, /kind: BACKUP_KIND/);
  assert.match(app, /backupVersion: BACKUP_FORMAT_VERSION/);
  assert.match(app, /await replaceData\(replacement, \{ allowRecoveryOverwrite:/);
  assert.match(app, /isReplacingData/);
  assert.match(app, /Export current data/);
  assert.match(app, /isWithinSafeResourceLimits/);
  assert.match(app, /title="Unfinished workout found"/);
  assert.match(app, /Continue workout/);
  assert.match(app, /Pause timer/);
  assert.match(app, /Close safely/);
  assert.match(app, /data-modal-primary/);
  assert.match(app, /disabled={workoutTimerPaused}/);
  assert.match(app, /function startWorkout[\s\S]*?rescueEligibleWorkoutIdRef\.current = workout\.id/);
  assert.match(app, /if \(otherModalOpen\)[\s\S]*?deferredRescueCheckRef\.current = true/);
  assert.match(app, /current\.activeWorkout && current\.activeWorkout\.timerPausedAt === undefined/);
  assert.match(app, /Effort tracking/);
  assert.match(app, /Not recorded/);
  assert.match(app, /updateSetEffort/);
  assert.match(app, /set\.id !== setId \|\| !set\.completed/);
  assert.match(app, /set\.effort/);
  assert.match(app, /Program lab/);
  assert.match(app, /Preview only/);
  assert.match(app, /cannot start workouts or overwrite the source routine/);
  assert.match(app, /programBlocks: \[\.\.\.\(current\.programBlocks \?\? \[\]\), block\]/);
  assert.match(app, /Weekly review/);
  assert.match(app, /Overall progress/);
  assert.match(app, /ALL COMPLETED WORKOUTS/);
  assert.match(app, /Overall progress period/);
  assert.match(app, /aria-pressed=\{progressPeriod === period\}/);
  assert.match(app, /Volume by exercise/);
  assert.match(app, /Strength by exercise/);
  assert.match(app, /Weight × reps from completed sets/);
  assert.match(app, /Compared with/);
  assert.match(app, /READ-ONLY · THIS WEEK/);
  assert.match(app, /Nothing is scheduled or started/);
  assert.match(app, /Saved goal:/);
  assert.match(app, /role="progressbar"/);
  assert.match(app, /Plate calculator/);
  assert.match(app, /TEMPORARY TOOL · NO SET CHANGES/);
  assert.match(app, /Shows which plates to load on each side/);
  assert.match(app, /The result shows what to load on each side/);
  assert.match(app, /Closest load without exceeding target/);
  assert.match(app, /This tool never changes your workout data/);
  assert.match(app, /Next-set previews/);
  assert.match(app, /OPTIONAL · READ-ONLY/);
  assert.match(app, /The next set stays unchanged unless you edit it/);
  assert.match(app, /aria-label="Next-set previews"/);
  assert.match(app, /Export workout CSV/);
  assert.match(app, /CSV cannot be imported/);
  assert.match(app, /buildHistoryCsv\(data\.history\)/);
  assert.match(app, /Different-equipment alternatives for/);
  assert.match(app, /Same movement pattern, different equipment/);
  assert.match(app, /Loads and difficulty are not equivalent/);
  assert.match(app, /Saved workouts stay unchanged/);

  assert.match(storage, /Math\.round\(value \* 100\) \/ 100/);
  assert.match(storage, /if \(!Number\.isFinite\(value\)\) return 0/);
  assert.match(storage, /customExercises: CustomExercise\[\]/);
  assert.match(storage, /export function normalizeStrongerData/);
  assert.match(storage, /export function migrateStrongerData/);
  assert.match(storage, /STORAGE_METADATA_KEY/);
  assert.match(storage, /basedOnSavedAt/);
  assert.match(storage, /FALLBACK_WRITE_LOCK/);
  assert.match(storage, /StrongerDataConflictError/);
  assert.match(storage, /putIfCurrentRevisionMatches/);
  assert.match(storage, /MAX_TOTAL_SETS_PER_ITEM/);
  assert.match(storage, /migrateStoredStrongerData/);
  assert.match(storage, /export function replaceData/);
  assert.match(storage, /timerPausedAt\?: number/);
  assert.match(storage, /timerPausedDurationMs\?: number/);
  assert.match(storage, /timerResumedAt\?: number/);
  assert.match(storage, /effort\?: SetEffort/);
  assert.match(storage, /effortScale\?: EffortScale \| "off"/);
  assert.match(storage, /nextSetPreview\?: boolean/);
  assert.match(storage, /nextSetPreview: false/);
  assert.match(storage, /typeof settings\.nextSetPreview !== "boolean"/);
  assert.match(storage, /validSetEffort/);
  assert.match(storage, /programBlocks\?: ProgramBlock\[\]/);
  assert.match(storage, /validProgramBlock/);
  assert.match(storage, /MAX_PROGRAM_BLOCKS = 50/);
  assert.match(storage, /MAX_PROGRAM_BLOCK_LOAD_PERCENT = 120/);
  assert.match(storage, /transaction\.oncomplete[\s\S]*resolve\(request\.result\)/);
  const transactionSource = storage.match(/function transact[\s\S]*?(?=export function makeId)/)?.[0];
  assert.ok(transactionSource);
  assert.doesNotMatch(transactionSource, /request\.onsuccess\s*=\s*\(\)\s*=>\s*resolve/);

  assert.match(sessionRescue, /SESSION_RESCUE_INACTIVITY_MS = 6 \* 60 \* 60 \* 1000/);
  assert.match(sessionRescue, /latestWorkoutActivityAt/);
  assert.match(sessionRescue, /pauseWorkoutTimer/);
  assert.match(sessionRescue, /resumeWorkoutTimer/);
  assert.match(sessionRescue, /finishWorkoutTimer/);

  assert.match(effort, /RPE 10 means maximal effort/);
  assert.match(effort, /RIR 0 means no reps left/);
  assert.match(effort, /formatSetEffort/);

  assert.match(programBlocks, /routine\.exercises\.map\(\(exercise\) => \(\{ \.\.\.exercise \}\)\)/);
  assert.match(programBlocks, /loadPercent: 100/);
  assert.match(programBlocks, /weightKg \* week\.loadPercent \/ 100/);
  assert.doesNotMatch(programBlocks, /startWorkout|saveData|activeWorkout/);

  assert.match(weeklyReview, /daysSinceMonday/);
  assert.match(weeklyReview, /currentWeightKg > record\.previousWeightKg/);
  assert.match(weeklyReview, /nextRoutineInRotation/);
  assert.doesNotMatch(weeklyReview, /saveData|setData|startWorkout|activeWorkout/);

  assert.match(overallProgress, /set\.completed && set\.reps > 0/);
  assert.match(overallProgress, /totalVolumeKg/);
  assert.match(overallProgress, /exerciseKeys\.size/);
  assert.match(overallProgress, /progressPeriodRanges/);
  assert.match(overallProgress, /previousRange/);
  assert.match(overallProgress, /previousVolumeKg/);
  assert.doesNotMatch(overallProgress, /saveData|setData|startWorkout|activeWorkout|estimatedOneRepMax/);

  assert.match(plateCalculator, /MAX_PLATE_PAIRS_PER_SIZE = 10/);
  assert.match(plateCalculator, /nextLoad > perSideTargetUnits/);
  assert.match(plateCalculator, /existing\.plateCount <= nextPlateCount/);
  assert.doesNotMatch(plateCalculator, /saveData|setData|startWorkout|activeWorkout|WorkoutSet/);

  assert.match(nextSetPreview, /latestComparableSession/);
  assert.match(nextSetPreview, /effort\.value <= 8\.5/);
  assert.match(nextSetPreview, /effort\.value >= 2/);
  assert.match(nextSetPreview, /nextSet\.weightKg \+ incrementKg/);
  assert.doesNotMatch(nextSetPreview, /saveData|setData|updateSet|startWorkout|activeWorkout/);

  assert.match(historyCsv, /spreadsheetSafeText/);
  assert.match(historyCsv, /set\.completed \? "yes" : "no"/);
  assert.match(historyCsv, /session\.exercises\.flatMap/);
  assert.doesNotMatch(historyCsv, /saveData|setData|replaceData|startWorkout|activeWorkout/);

  assert.match(exercises, /export function equipmentAlternativesFor/);
  assert.match(exercises, /usedEquipment\.has\(profile\.equipment\)/);
  assert.match(exercises, /if \(alternatives\.length === 3\) break/);
  assert.doesNotMatch(exercises, /saveData|setData|replaceData|startWorkout|activeWorkout/);

  const catalogEntries = [...exercises.matchAll(/\{ exerciseKey: "([^"]+)", name: "([^"]+)", category: "([^"]+)" \}/g)];
  assert.equal(catalogEntries.length, 50);
  assert.equal(new Set(catalogEntries.map((entry) => entry[1])).size, catalogEntries.length);
  assert.equal(new Set(catalogEntries.map((entry) => entry[2].toLocaleLowerCase())).size, catalogEntries.length);
  for (const starterKey of ["bench-press", "deadlift", "back-squat", "leg-curl", "standing-calf-raise"]) {
    assert.ok(catalogEntries.some((entry) => entry[1] === starterKey), `catalog is missing ${starterKey}`);
  }

  assert.match(styles, /--font-sans:/);
  assert.match(styles, /--touch-target:\s*44px/);
  assert.match(styles, /--action-height:\s*46px/);
  assert.match(styles, /--primary-action-height:\s*48px/);
  assert.match(styles, /body\s*\{[^}]*font-size:\s*15px;/s);
  assert.doesNotMatch(styles, /--font-geist-sans/);
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /\.topbar\s*\{[^}]*position:\s*fixed;/s);
  assert.match(styles, /\.bottom-nav\s*\{[^}]*position:\s*fixed;/s);
  assert.match(styles, /\.bottom-nav\s*\{[^}]*padding:\s*5px 8px max\(5px, env\(safe-area-inset-bottom\)\);/s);
  assert.match(styles, /\.toast\s*\{[^}]*bottom:\s*calc\(84px \+ env\(safe-area-inset-bottom\)\);/s);
  assert.doesNotMatch(styles, /\.toast\s*\{[^}]*top:/s);
  assert.match(styles, /scroll-padding-top:\s*calc\(82px \+ env\(safe-area-inset-top\)\)/);
  assert.match(styles, /\.program-week-heading select\s*\{[^}]*min-height:\s*44px;/s);
  assert.match(styles, /\.weekly-review-track\s*\{[^}]*height:\s*12px;/s);
  assert.match(styles, /\.plate-inventory-grid select\s*\{[^}]*min-height:\s*44px;/s);
  assert.match(styles, /\.plate-result\s*\{/);
  assert.match(styles, /\.next-set-preview\s*\{/);
  assert.match(styles, /\.overall-progress-card\s*\{/);
  assert.match(styles, /\.progress-period-tabs\s*\{/);
  assert.match(styles, /\.exercise-volume-list\s*\{/);
  assert.match(styles, /\.backup-csv-button\s*\{/);
  assert.match(styles, /\.equipment-alternative-trigger\s*\{/);
  assert.match(styles, /\.equipment-alternative-option\s*\{/);

  assert.match(serviceWorker, /self\.registration\.scope/);
  assert.match(serviceWorker, /v5-exercise-library/);
  assert.match(serviceWorker, /APP_PATH/);
  assert.match(serviceWorker, /addEventListener\(["']install["']/);
  assert.match(serviceWorker, /addEventListener\(["']activate["']/);
  assert.match(serviceWorker, /addEventListener\(["']fetch["']/);
  assert.match(serviceWorker, /CACHE_URLS/);
  assert.match(serviceWorker, /request\.method\s*!==\s*["']GET["']/);
  assert.doesNotMatch(serviceWorker, /skipWaiting|clients\.claim|\/_next\/static/);

  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /run:\s*npm run lint/);
  assert.match(workflow, /run:\s*npm test/);
  assert.match(workflow, /path:\s*dist/);

  const packageJson = JSON.parse(packageText);
  assert.equal(packageJson.name, "stronger-gym-tracker");
  assert.equal(packageJson.scripts.dev, "vite");
  assert.equal(packageJson.devDependencies.vinext, undefined);
  assert.equal(packageJson.devDependencies.wrangler, undefined);
});
