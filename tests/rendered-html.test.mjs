import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { createHash } from "node:crypto";
import ts from "typescript";

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
  const [manifestText, serviceWorker, app, storage, sessionRescue, effort, programBlocks, weeklyReview, overallProgress, reportMetrics, plateCalculator, nextSetPreview, historyCsv, dropSets, exerciseReorder, exercises, styles, packageText, workflow] = await Promise.all([
    readFile(new URL("dist/manifest.webmanifest", projectRoot), "utf8"),
    readFile(new URL("dist/sw.js", projectRoot), "utf8"),
    readFile(new URL("app/StrongerApp.tsx", projectRoot), "utf8"),
    readFile(new URL("app/storage.ts", projectRoot), "utf8"),
    readFile(new URL("app/sessionRescue.ts", projectRoot), "utf8"),
    readFile(new URL("app/effort.ts", projectRoot), "utf8"),
    readFile(new URL("app/programBlocks.ts", projectRoot), "utf8"),
    readFile(new URL("app/weeklyReview.ts", projectRoot), "utf8"),
    readFile(new URL("app/overallProgress.ts", projectRoot), "utf8"),
    readFile(new URL("app/reportMetrics.ts", projectRoot), "utf8"),
    readFile(new URL("app/plateCalculator.ts", projectRoot), "utf8"),
    readFile(new URL("app/nextSetPreview.ts", projectRoot), "utf8"),
    readFile(new URL("app/historyCsv.ts", projectRoot), "utf8"),
    readFile(new URL("app/dropSets.ts", projectRoot), "utf8"),
    readFile(new URL("app/exerciseReorder.ts", projectRoot), "utf8"),
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
  assert.match(app, /Rest after each set/);
  assert.match(app, /exercise\.restSeconds === 0 \? "Rest timer off"/);
  assert.match(app, /insertDropSegment/);
  assert.match(app, /isValidDropWeightTransition/);
  assert.match(app, /restEndsAt: invalidatedCompletedWork \? undefined : workout\.restEndsAt/);
  assert.match(app, /Add drop \$\{currentDropNumber \+ 1\} to \$\{exercise\.name\}, set \$\{setNumber\}/);
  assert.match(app, /history-incomplete-segment/);
  assert.match(app, /Incomplete \(no reps recorded\)/);
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
  assert.match(app, /Unfinished workout found/);
  assert.match(app, /Continue workout/);
  assert.match(app, /Pause timer/);
  assert.match(app, /Close safely/);
  assert.match(app, /reason: "long-session"/);
  assert.match(app, /3-HOUR CHECK/);
  assert.match(app, /Still working out\?/);
  assert.match(app, /pauseForLongSessionCheck/);
  assert.match(app, /confirmLongSessionContinuation/);
  assert.match(app, /Closing this check keeps the workout paused/);
  assert.match(app, /descriptionId="session-rescue-description session-rescue-note"/);
  assert.match(app, /long-session-continue/);
  assert.match(app, /Close and keep workout paused/);
  assert.match(app, /type DismissedRescuePrompt = Pick<SessionRescuePrompt, "workoutId" \| "reason">/);
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
  assert.match(app, /You trained/);
  assert.match(app, /No workouts logged/);
  assert.match(app, /Progress period/);
  assert.match(app, /aria-pressed=\{progressPeriod === period\}/);
  assert.match(app, /\["week", "month", "all"\]/);
  assert.match(app, /All time/);
  assert.match(app, /GETTING STRONGER/);
  assert.match(app, /See all exercises/);
  assert.match(app, /aria-expanded=\{showProgressDetails\}/);
  assert.match(app, /NEXT IN YOUR ROUTINE/);
  assert.match(app, /Open Workout/);
  assert.match(app, /progressDetailPeriodLabel/);
  assert.match(app, /TRAINING DOSE/);
  assert.match(app, /Active workout not included yet/);
  assert.match(app, /PRIMARY CATEGORY COVERAGE/);
  assert.match(app, /Previous matched period/);
  assert.match(app, /"Heaviest set"/);
  assert.match(app, /trendLabel\.toUpperCase\(\)/);
  assert.match(app, /Drop segments are not used for best-weight records/);
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
  assert.match(storage, /longSessionCheckState\?: "pending" \| "confirmed"/);
  assert.match(storage, /effort\?: SetEffort/);
  assert.match(storage, /effortScale\?: EffortScale \| "off"/);
  assert.match(storage, /nextSetPreview\?: boolean/);
  assert.match(storage, /nextSetPreview: false/);
  assert.match(storage, /typeof settings\.nextSetPreview !== "boolean"/);
  assert.match(storage, /validSetEffort/);
  assert.match(storage, /export function isValidDropWeightTransition/);
  assert.match(storage, /programBlocks\?: ProgramBlock\[\]/);
  assert.match(storage, /validProgramBlock/);
  assert.match(storage, /MAX_PROGRAM_BLOCKS = 50/);
  assert.match(storage, /MAX_PROGRAM_BLOCK_LOAD_PERCENT = 120/);
  assert.match(storage, /transaction\.oncomplete[\s\S]*resolve\(request\.result\)/);
  const transactionSource = storage.match(/function transact[\s\S]*?(?=export function makeId)/)?.[0];
  assert.ok(transactionSource);
  assert.doesNotMatch(transactionSource, /request\.onsuccess\s*=\s*\(\)\s*=>\s*resolve/);

  assert.match(sessionRescue, /SESSION_RESCUE_INACTIVITY_MS = 6 \* 60 \* 60 \* 1000/);
  assert.match(sessionRescue, /LONG_SESSION_CHECK_MS = 3 \* 60 \* 60 \* 1000/);
  assert.match(sessionRescue, /latestWorkoutActivityAt/);
  assert.match(sessionRescue, /shouldOfferLongSessionCheck/);
  assert.match(sessionRescue, /longSessionCheckState: "pending"/);
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

  assert.match(overallProgress, /deriveReportMetrics/);
  assert.match(overallProgress, /totalVolumeKg/);
  assert.match(overallProgress, /progressPeriodRanges/);
  assert.match(overallProgress, /previousRange/);
  assert.match(overallProgress, /previousVolumeKg/);
  assert.doesNotMatch(overallProgress, /saveData|setData|startWorkout|estimatedOneRepMax/);

  assert.match(reportMetrics, /isCompletedTrackedSet\(set, exercise\)/);
  assert.match(reportMetrics, /externalLoadVolumeKg/);
  assert.match(reportMetrics, /activeWorkoutExcluded/);
  assert.match(reportMetrics, /mixedEffortScales/);
  assert.match(reportMetrics, /categoryModel: "primary-built-in-only"/);
  assert.match(reportMetrics, /rollingReportRanges/);
  assert.doesNotMatch(reportMetrics, /saveData|setData|startWorkout/);

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
  assert.match(historyCsv, /"set_type"/);
  assert.match(historyCsv, /"drop_set_of"/);
  assert.match(historyCsv, /"drop_order"/);
  assert.doesNotMatch(historyCsv, /saveData|setData|replaceData|startWorkout|activeWorkout/);

  assert.match(dropSets, /DEFAULT_DROP_PERCENT = 20/);
  assert.match(dropSets, /insertDropSegment/);
  assert.match(dropSets, /dropSetOf: groupId/);
  assert.match(dropSets, /removeSetWithContinuations/);

  assert.match(exercises, /export function equipmentAlternativesFor/);
  assert.match(exercises, /usedEquipment\.has\(profile\.equipment\)/);
  assert.match(exercises, /if \(alternatives\.length === 3\) break/);
  assert.doesNotMatch(exercises, /saveData|setData|replaceData|startWorkout|activeWorkout/);

  const { BUILT_IN_EXERCISES: catalogEntries } = await loadCatalogModule("app/exercises.ts");
  assert.equal(catalogEntries.length, 257);
  assert.equal(new Set(catalogEntries.map((entry) => entry.exerciseKey)).size, catalogEntries.length);
  for (const starterKey of ["bench-press", "deadlift", "back-squat", "leg-curl", "standing-calf-raise"]) {
    assert.ok(catalogEntries.some((entry) => entry.exerciseKey === starterKey), `catalog is missing ${starterKey}`);
  }

  assert.match(styles, /--font-sans:/);
  assert.match(styles, /--touch-target:\s*44px/);
  assert.match(styles, /--action-height:\s*46px/);
  assert.match(styles, /--primary-action-height:\s*48px/);
  assert.match(styles, /body\s*\{[^}]*font-size:\s*14px;/s);
  assert.match(styles, /input,\s*select,\s*textarea\s*\{[^}]*font-size:\s*16px;/s);
  assert.doesNotMatch(styles, /--font-geist-sans/);
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /\.topbar\s*\{[^}]*position:\s*fixed;/s);
  assert.match(styles, /\.workout-heading\s*\{[^}]*position:\s*sticky;[^}]*top:\s*calc\(68px \+ env\(safe-area-inset-top\)\);/s);
  assert.match(styles, /\.workout-heading\s*\{[^}]*z-index:\s*40;/s);
  assert.match(styles, /\.workout-editing-surface input,[\s\S]*scroll-margin-top:\s*calc\(170px \+ env\(safe-area-inset-top\)\);/);
  assert.match(styles, /\.bottom-nav\s*\{[^}]*position:\s*fixed;/s);
  assert.match(styles, /\.bottom-nav\s*\{[^}]*right:\s*0;[^}]*bottom:\s*0;[^}]*left:\s*0;[^}]*margin-inline:\s*auto;/s);
  assert.match(styles, /\.bottom-nav\s*\{[^}]*padding:\s*5px 8px max\(5px, env\(safe-area-inset-bottom, 0px\)\);/s);
  assert.match(styles, /\.bottom-nav\s*\{[^}]*transform:\s*none;/s);
  assert.match(styles, /\.bottom-nav\[hidden\]\s*\{[^}]*display:\s*none;/s);
  assert.match(styles, /\.bottom-nav\.is-history-searching\s*\{[^}]*visibility:\s*hidden;[^}]*opacity:\s*0;[^}]*pointer-events:\s*none;/s);
  assert.match(app, /createPortal\(<nav/);
  assert.match(app, /document\.body\)/);
  assert.match(app, /const \[historySearchFocused, setHistorySearchFocused\] = useState\(false\);/);
  assert.match(app, /const \[historyKeyboardOpen, setHistoryKeyboardOpen\] = useState\(false\);/);
  assert.match(app, /window\.visualViewport/);
  assert.match(app, /viewport\.addEventListener\("resize", syncKeyboardInset\)/);
  assert.match(app, /onFocus=\{\(\) => setHistorySearchFocused\(true\)\}/);
  assert.match(app, /onBlur=\{\(\) => setHistorySearchFocused\(false\)\}/);
  assert.match(app, /tab === "history" && \(historySearchFocused \|\| historyKeyboardOpen\)/);
  assert.match(app, /hidden=\{isLogging \|\| otherModalOpen \|\| Boolean\(sessionRescueWorkout && sessionRescuePrompt\)\}/);
  assert.match(app, /const \[collapsedExerciseIds, setCollapsedExerciseIds\] = useState<Set<string>>/);
  assert.match(app, /aria-expanded=\{exerciseExpanded\}/);
  assert.match(app, /aria-controls=\{exercisePanelId\}/);
  assert.match(app, /className="exercise-panel" hidden=\{!exerciseExpanded\}/);
  assert.match(app, /Hold the left-hand move grip, then drag to change the order/);
  assert.match(app, /onPointerDown=\{\(event\) => beginExerciseReorder\(exercise, event\)\}/);
  assert.match(app, /onPointerMove=\{moveExerciseReorder\}/);
  assert.match(app, /onPointerUp=\{finishExerciseReorder\}/);
  assert.match(app, /onPointerCancel=\{resetExerciseReorder\}/);
  assert.match(app, /onLostPointerCapture=/);
  assert.match(app, /movedBeyondLongPressTolerance/);
  assert.match(app, /aria-keyshortcuts="ArrowUp ArrowDown"/);
  assert.match(app, /data-workout-exercise-id=\{exercise\.id\}/);
  assert.match(exerciseReorder, /EXERCISE_LONG_PRESS_MS = 450/);
  assert.match(exerciseReorder, /export function reorderItemsById/);
  assert.match(styles, /\.exercise-disclosure\s*\{[^}]*width:\s*var\(--touch-target\);[^}]*height:\s*var\(--touch-target\);/s);
  assert.match(styles, /\.exercise-panel\[hidden\]\s*\{[^}]*display:\s*none;/s);
  assert.match(styles, /\.exercise-reorder-handle\.set-number\s*\{[^}]*touch-action:\s*none;/s);
  assert.match(styles, /\.exercise-reorder-handle\.set-number\s*\{[^}]*width:\s*var\(--touch-target\);[^}]*height:\s*var\(--touch-target\);/s);
  assert.match(styles, /\.workout-exercise-card\.is-reorder-target-before\s*\{/);
  assert.match(styles, /\.workout-exercise-card\.is-reorder-target-after\s*\{/);
  assert.match(styles, /\.exercise-reorder-preview\s*\{[^}]*position:\s*fixed;/s);
  assert.match(styles, /\.toast\s*\{[^}]*bottom:\s*calc\(84px \+ env\(safe-area-inset-bottom\)\);/s);
  assert.doesNotMatch(styles, /\.toast\s*\{[^}]*top:/s);
  assert.match(styles, /scroll-padding-top:\s*calc\(82px \+ env\(safe-area-inset-top\)\)/);
  assert.match(styles, /\.program-week-heading select\s*\{[^}]*min-height:\s*44px;/s);
  assert.match(styles, /\.progress-goal-track\s*\{[^}]*height:\s*12px;/s);
  assert.match(styles, /\.plate-inventory-grid select\s*\{[^}]*min-height:\s*44px;/s);
  assert.match(styles, /\.plate-result\s*\{/);
  assert.match(styles, /\.next-set-preview\s*\{/);
  assert.match(styles, /\.set-continuation-row button\s*\{[^}]*min-height:\s*var\(--touch-target\);/s);
  assert.match(styles, /\.progress-story-card\s*\{/);
  assert.match(styles, /\.progress-period-tabs\s*\{/);
  assert.match(styles, /\.progress-strength-list\s*\{/);
  assert.match(styles, /\.progress-next-card\s*\{/);
  assert.match(styles, /\.backup-csv-button\s*\{/);
  assert.match(styles, /\.equipment-alternative-trigger\s*\{/);
  assert.match(styles, /\.equipment-alternative-option\s*\{/);

  assert.match(serviceWorker, /self\.registration\.scope/);
  assert.match(serviceWorker, /v8-strong-catalog/);
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

async function loadCatalogModule(path) {
  const source = await readFile(new URL(path, projectRoot), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

test("covers every published Strong exercise and preserves all original workout keys", async () => {
  const { BUILT_IN_EXERCISES } = await loadCatalogModule("app/exercises.ts");
  const coverage = JSON.parse(await readFile(new URL("dist/exercises/strong-catalog.json", projectRoot), "utf8"));
  const catalog = new Map(BUILT_IN_EXERCISES.map((exercise) => [exercise.exerciseKey, exercise]));
  assert.equal(coverage.sourceCount, 253);
  assert.equal(coverage.localCount, BUILT_IN_EXERCISES.length);
  assert.equal(coverage.coverage.length, coverage.sourceCount);
  assert.equal(new Set(coverage.coverage.map((entry) => entry.strongId)).size, 253);
  assert.equal(new Set(coverage.coverage.map((entry) => entry.exerciseKey)).size, 253);
  for (const entry of coverage.coverage) {
    const exercise = catalog.get(entry.exerciseKey);
    assert.ok(exercise, `missing Strong exercise: ${entry.strongName}`);
    assert.equal(exercise.strongId, entry.strongId);
    assert.ok(exercise.name === entry.strongName || exercise.aliases.includes(entry.strongName));
  }
  assert.equal(coverage.preservedOriginalKeys.length, 50);
  for (const key of coverage.preservedOriginalKeys) assert.ok(catalog.has(key), `lost original key: ${key}`);
  for (const key of ["good-morning-barbell", "barbell-row", "t-bar-row", "pendlay-row-barbell", "upright-row-barbell"]) {
    assert.ok(catalog.has(key), `missing requested row or hinge variation: ${key}`);
  }
});

test("packages two illustrated positions and complete guidance for every built-in exercise", async () => {
  const [{ BUILT_IN_EXERCISES }, { EXERCISE_MEDIA }] = await Promise.all([
    loadCatalogModule("app/exercises.ts"),
    loadCatalogModule("app/exercise-media.ts"),
  ]);

  assert.equal(BUILT_IN_EXERCISES.length, 257);
  assert.deepEqual(
    Object.keys(EXERCISE_MEDIA).sort(),
    BUILT_IN_EXERCISES.map((exercise) => exercise.exerciseKey).sort(),
    "every built-in exercise must have its own media entry",
  );

  const imagePaths = new Set();
  for (const { exerciseKey } of BUILT_IN_EXERCISES) {
    const media = EXERCISE_MEDIA[exerciseKey];
    assert.equal(media.images.length, media.layout === "paired" ? 1 : 2, `${exerciseKey} needs both demonstration positions`);
    for (const [index, imagePath] of media.images.entries()) {
      assert.equal(imagePath, `exercises/${exerciseKey}-${media.layout === "paired" ? "pair" : index}.jpg`);
      assert.ok(!imagePaths.has(imagePath), `${imagePath} must be assigned to one exercise`);
      imagePaths.add(imagePath);
      const image = await readFile(new URL(`dist/${imagePath}`, projectRoot));
      assert.ok(image.length > 1000, `${imagePath} must contain an image, not an empty placeholder`);
      assert.equal(image.readUInt16BE(0), 0xffd8, `${imagePath} must be a JPEG`);
      assert.equal(image.readUInt16BE(image.length - 2), 0xffd9, `${imagePath} must be a complete JPEG`);
    }
    assert.ok(typeof media.equipment === "string" && media.equipment.trim(), `${exerciseKey} needs equipment`);
    for (const field of ["muscles", "instructions"]) {
      assert.ok(Array.isArray(media[field]) && media[field].length > 0, `${exerciseKey} needs ${field}`);
      assert.ok(media[field].every((text) => typeof text === "string" && text.trim()), `${exerciseKey} has empty ${field}`);
    }
    assert.ok(media.sourceName.trim(), `${exerciseKey} needs attribution`);
    if (media.sourceUrl) assert.equal(new URL(media.sourceUrl).protocol, "https:");
    else assert.equal(media.sourceName, "Original movement guide");
  }
  assert.equal(imagePaths.size, 307);

  const [license, attribution] = await Promise.all([
    readFile(new URL("dist/exercises/LICENSE.md", projectRoot), "utf8"),
    readFile(new URL("dist/exercises/README.md", projectRoot), "utf8"),
  ]);
  assert.match(license, /public domain/i);
  assert.match(license, /unlicense\.org/i);
  assert.match(attribution, /github\.com\/yuhonas\/free-exercise-db/);
  assert.match(attribution, /OpenAI-generated/);
});

test("ships the complete generated illustration set without stale photograph bytes", async () => {
  const manifest = JSON.parse(await readFile(new URL("dist/exercises/illustrations.json", projectRoot), "utf8"));
  const { EXERCISE_MEDIA, EXERCISE_IMAGE_VERSION } = await loadCatalogModule("app/exercise-media.ts");
  const expectedPaths = Object.values(EXERCISE_MEDIA).flatMap((media) => media.images).sort();
  assert.equal(manifest.generator, "OpenAI image generation");
  assert.equal(manifest.version, EXERCISE_IMAGE_VERSION);
  assert.deepEqual(manifest.images.map((image) => image.path).sort(), expectedPaths);
  for (const image of manifest.images) {
    const bytes = await readFile(new URL(`dist/${image.path}`, projectRoot));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), image.sha256, `${image.path} must match its generated export`);
    if (image.referenceSha256) assert.notEqual(image.sha256, image.referenceSha256, `${image.path} must replace its original photograph`);
    assert.equal(image.width / image.height, image.path.endsWith("-pair.jpg") ? 2 : 1);
  }
});

test("preloads scoped exercise media, retries failures, and serves versioned illustrations offline", async () => {
  const serviceWorker = await readFile(new URL("dist/sw.js", projectRoot), "utf8");
  const scope = "https://example.test/Stronger_App/";
  const handlers = new Map();
  const stores = new Map();
  const fetched = [];
  let offline = false;
  const keyFor = (request) => typeof request === "string" ? request : request.url;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async match(request) { return store.get(keyFor(request)); },
        async put(request, response) { store.set(keyFor(request), response); },
      };
    },
    async match(request, options = {}) {
      for (const [name, store] of stores) {
        if (options.cacheName && name !== options.cacheName) continue;
        const response = store.get(keyFor(request));
        if (response) return response;
      }
    },
  };

  runInNewContext(serviceWorker, {
    URL, Request, Response, caches,
    self: {
      registration: { scope },
      location: new URL(scope),
      addEventListener(type, handler) { handlers.set(type, handler); },
    },
    async fetch(request) {
      const url = keyFor(request);
      fetched.push(url);
      if (offline || url.endsWith("missing.jpg")) throw new Error("Network unavailable");
      const response = new Response("bundled photo");
      Object.defineProperty(response, "type", { value: "basic" });
      return response;
    },
  });

  async function preload(urls) {
    let work;
    let result;
    handlers.get("message")({
      data: { type: "CACHE_URLS", urls },
      ports: [{ postMessage(value) { result = value; } }],
      waitUntil(value) { work = value; },
    });
    await work;
    return result;
  }

  const firstPhoto = `${scope}exercises/bench-press-0.jpg`;
  const urls = [
    "exercises/bench-press-0.jpg",
    "exercises/bench-press-0.jpg",
    firstPhoto,
    "exercises/bench-press-1.jpg",
    "exercises/missing.jpg",
    "https://other.test/exercises/photo.jpg",
    "/unrelated/photo.jpg",
    null,
  ];
  const oldCache = await caches.open("stronger-assets-old-version");
  await oldCache.put(firstPhoto, new Response("outdated photo"));

  const initial = await preload(urls);
  assert.equal(initial.type, "CACHE_URLS_RESULT");
  assert.equal(initial.cached, 2);
  assert.equal(initial.failed, 1);
  assert.equal(fetched.length, 3, "only unique same-scope URLs should be fetched");
  assert.ok(fetched.includes(firstPhoto), "an old worker's photo must not suppress the current download");

  offline = true;
  const retry = await preload(urls);
  assert.equal(retry.cached, 2);
  assert.equal(retry.failed, 1);
  assert.equal(fetched.length, 4, "already cached photos should not be downloaded again");

  let offlineResponse;
  handlers.get("fetch")({
    request: new Request(firstPhoto),
    respondWith(value) { offlineResponse = value; },
  });
  const photo = await offlineResponse;
  assert.equal(await photo.text(), "bundled photo");
  assert.equal(fetched.length, 4, "viewing a cached bundled photo should not require a network request");

  // Updating artwork must bypass an older photograph even when the basename is unchanged.
  offline = false;
  const { EXERCISE_IMAGE_VERSION } = await loadCatalogModule("app/exercise-media.ts");
  const illustratedUrl = `${firstPhoto}?v=${EXERCISE_IMAGE_VERSION}`;
  const updated = await preload([illustratedUrl]);
  assert.equal(updated.cached, 1);
  assert.ok(fetched.includes(illustratedUrl));
  offline = true;
  handlers.get("fetch")({
    request: new Request(illustratedUrl),
    respondWith(value) { offlineResponse = value; },
  });
  assert.equal(await (await offlineResponse).text(), "bundled photo");
  assert.equal(fetched.length, 5, "versioned illustrations should also work offline after their first download");
});
