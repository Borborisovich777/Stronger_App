# Stronger — Gym Progress Tracker

Stronger is a free, offline-first workout tracker designed for iPhone. It lets you create routines, record sets quickly, review workout history, and see simple strength trends without an account, subscription, ads, or social features.

> Live app: **[Open Stronger](https://borborisovich777.github.io/Stronger_App/)**

## What kind of app is this?

Stronger is a Progressive Web App (PWA). It is delivered from a secure HTTPS address but can be installed on an iPhone Home Screen and opened in its own app window.

It is not an App Store app and does not require an Apple Developer subscription. After installation, it has its own icon and can continue working without internet access once its files have been cached.

Your workout records stay in the browser storage on your device. Stronger does not use a cloud account or automatically synchronize data between devices.

## Main features

- Installable on an iPhone Home Screen
- Works offline after the first successful online load
- Starter Push, Pull, and Legs routines
- Searchable library of 50 built-in exercises
- Explicit different-equipment alternatives for selected movement patterns
- Custom exercises saved to your personal library
- Editable active workouts
- Quick decimal weight, reps, and set completion
- Optional read-only next-set previews with visible evidence
- Previous results shown beside new sets
- Foreground workout timer with an optional per-exercise rest timer
- Searchable workout history
- Duplicate a past workout for today
- Best weight, estimated one-rep max, volume, and trend views
- Kilograms and pounds
- Temporary plate calculator with bounded pair inventory
- Persistent light and dark appearance modes
- Fixed workout header and bottom navigation for long sessions
- Local JSON backup and restore, plus readable workout CSV export
- No account, ads, subscription, or server-side workout database

# User manual

## Install Stronger on iPhone

Use Safari for the initial installation.

1. Open `https://borborisovich777.github.io/Stronger_App/` in **Safari**.
2. Wait for the app to finish loading.
3. Tap Safari’s **Share** button—the square with an upward arrow.
4. Scroll down and tap **Add to Home Screen**.
5. If your iPhone shows an **Open as Web App** option, leave it enabled.
6. Confirm the name **Stronger**, then tap **Add**.
7. Return to the Home Screen and open Stronger from its new icon.

Use **Add to Home Screen**, not **Add Bookmark**. Launching Stronger from its Home Screen icon gives the most app-like experience and enables its standalone display.

The first visit requires internet access. After that, the installed app shell can open offline.

> **Install before logging important data.** On iPhone, Safari and the installed Home Screen app can use separate local storage. Workouts entered in a Safari tab may therefore not appear when you later open the Home Screen icon. Install first, then use the icon as your one regular copy of Stronger.

Apple’s general instructions are available in [Turn a website into an app in Safari on iPhone](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios).

## First setup

Before starting a workout, open **Settings** and check:

- **Appearance:** light or dark mode
- **Units:** kilograms (kg) or pounds (lb)
- **Default rest time:** the countdown used after completing a set, or **Off** for no automatic timer

You can change these later. Changing units converts the displayed values; it does not erase or weaken the original workout records.

Stronger stores weights internally in kilograms and converts them for display when pounds are selected. Small rounding differences may appear after switching units repeatedly.

## Appearance and fixed controls

Open **Settings → Appearance** and use the switch to choose light or dark mode. Stronger remembers this appearance on the current installation. Dark mode keeps the same cream, charcoal, lime, and red palette; it only remaps those colors for a darker canvas.

The header and bottom navigation remain fixed while you scroll. During an active workout, the header keeps the workout timer visible, while the footer keeps Workout, History, Progress, and Settings within thumb reach. Page content includes extra safe-area spacing so these controls do not cover the first or last workout actions.

## Navigation

Stronger has four main areas:

- **Workout:** routines and the active training session
- **History:** completed workouts, search, details, duplicate, and delete
- **Progress:** exercise-specific strength and volume trends
- **Settings:** appearance, units, default rest time, installation help, backup, restore, and reset

## Create and edit routines

Stronger includes Push, Pull, and Legs starter routines. They are starting points and can be changed.

To create a routine:

1. Open **Workout**.
2. Choose the option to create a routine.
3. Enter a routine name.
4. Tap **Add exercise**, then search or browse the exercise library.
5. Add the desired starting sets, weights, and repetitions.
6. Save the routine.

While editing a routine, you can:

- Rename the routine
- Add an exercise from the built-in or custom library
- Rename an exercise
- Change its target sets, weight, or reps
- Move an exercise using **Move up** or **Move down**
- Remove an exercise
- Delete the entire routine

Deleting or editing a routine does not rewrite completed workout history. Completed workouts retain the values that were performed at that time.

## Exercise library and custom exercises

Stronger includes 50 common strength exercises across Chest, Back, Shoulders, Arms, Legs, and Core. When adding an exercise to a workout or routine:

1. Tap **Add exercise**.
2. Browse **All**, choose a category, or type in **Search exercises**.
3. Tap an exercise name.
4. Set the starting sets, weight, reps, and rest time.
5. Tap **Add to workout**. In the routine builder, selecting a name adds it directly to the routine so you can edit its targets.

To add an exercise that is not included:

1. Open the exercise library.
2. Tap **Create custom exercise**.
3. Enter its name and tap **Save and select**.
4. Finish its targets as usual.

The custom exercise is saved immediately to the **Custom** category and can be reused in later workouts and routines. Names are checked without regard to capitalization or extra spaces. If the name already exists, Stronger selects the existing exercise instead of creating a duplicate.

Each library exercise has a stable internal identity. Reusing the same library entry lets Previous and Progress connect results across workouts. Renaming an exercise inside a particular routine or active workout changes that displayed copy; when possible, reuse the library entry rather than typing a different lift over an unrelated one.

### Equipment alternatives

Some built-in exercise rows include **Alternatives**. Open it when the planned equipment is unavailable. Stronger shows up to three curated exercises with the same broad movement pattern and different equipment.

Loads and difficulty are not equivalent between machines, free weights, cables, and bodyweight movements. Choosing an alternative only selects it in the current add-exercise flow. It never replaces an existing exercise or changes saved routines, workouts, or History. Unsupported and custom exercises do not receive automatic suggestions.

## Start a workout

You can start from a saved routine or create a blank workout.

### Start from a routine

1. Open **Workout**.
2. Select Push, Pull, Legs, or another saved routine.
3. Tap the start control.
4. Confirm or edit the workout name.
5. Begin logging sets.

Starting a routine creates a working copy for today. Changes made inside the active workout do not silently rewrite the original routine.

### Start a blank workout

1. Open **Workout**.
2. Choose **Blank workout**.
3. Name the workout.
4. Add the exercises you plan to perform from the searchable library, or create a custom exercise.
5. Add sets and enter weight and rep targets.

### Resume an active workout

An unfinished workout is saved locally as you make changes. If Stronger is closed or the page reloads, open the app again and resume the active workout.

Closing the app is not the same as finishing the workout. Use **Finish workout** when the session is complete so that it becomes part of History and Progress.

If a persisted workout has no recorded activity for six hours, Stronger opens **Session Rescue** when the app loads or returns to the foreground. It never changes the workout automatically:

- **Continue workout** keeps the current session and timer as-is.
- **Pause timer** freezes duration at the last completed set or explicit resume and clears an obsolete rest countdown. Resuming later excludes paused time without rewriting workout or set timestamps.
- **Close safely** asks for confirmation, then saves the workout to History at its last recorded activity. Incomplete sets remain visible but do not count toward Progress.

Closing the rescue sheet postpones the decision until the next app launch. It does not save, finish, or discard anything.

## Edit an active workout

Training plans often change at the gym. During an active session, you can:

- Rename the workout
- Add, rename, reorder, or remove exercises
- Add or remove sets
- Change weight and reps
- Mark a completed set incomplete again

Use the explicit **Move up** and **Move down** controls when changing exercise order. Reordering does not depend on dragging, which makes it more reliable on a phone.

Edits are saved locally as you work.

## Experimental program blocks

Wave 3A adds a **Program lab** below the routine list. It is available when no workout is active and works only on copied data:

1. Choose **Create a program copy**.
2. Select a source routine and a block length from 2–12 weeks.
3. Review the copied targets for each week.
4. Optionally change a week’s load percentage from 50–120% in five-point steps.

Every week begins at a neutral 100% of the copied routine. Percentages are user-entered arithmetic previews, not coaching recommendations. Sets, reps, exercise order, and rest settings remain exactly as copied.

A program copy cannot start a workout, update its source routine, or change history and Progress. Editing or deleting the copy affects only the sandbox. Later changes to the live routine also do not rewrite the snapshot. Program copies remain local and are included in Stronger backups.

## Log a set

Each set includes:

- Set number
- Previous result, when available
- Weight
- Repetitions
- Completion control

To record a set:

1. Tap its weight field and enter the weight used.
2. Tap its reps field and enter the completed repetitions.
3. Mark the set complete.
4. Continue to the next set.

Weight fields accept decimal values with up to two digits after the decimal point, such as `7.5` or `12.25`. The decimal keyboard also accepts a comma and normalizes it to a decimal point. A cleared reps field stays empty while you type, so entering `10` will not produce `010`.

Tap a completed set again if it was marked by mistake.

Previous values come from completed workout history for the same exercise. A new or renamed exercise may not show a previous result until it has been completed in a workout.

Workout progress updates as sets and exercises are completed.

### Optional RPE or RIR

Effort tracking is off by default. Turn it on in **Settings → Effort tracking** and choose one scale:

- **RPE:** 6–10 in half steps. RPE 10 means maximal effort; lower values mean more left in reserve.
- **RIR:** 0–10 whole reps. RIR 0 means no reps were left; higher values mean more left in reserve.

The optional selector appears only after a set is marked complete. Each saved entry keeps its original scale, so changing the setting later does not reinterpret history. Turning effort tracking off hides the selectors without deleting recorded values. Marking a set incomplete removes its effort entry because the set is no longer recorded as performed.

RPE and RIR are subjective notes only in Wave 2A. They do not change weights, reps, routines, Progress calculations, or future workouts, and they do not create automatic coaching suggestions.

### Optional next-set previews

Wave 6A adds an opt-in, read-only prompt. Turn on **Settings → Next-set previews** to allow it; the setting is off by default.

A preview appears only when all of these conditions are true:

- There is an unfinished next set with a positive planned load and rep count.
- The immediately preceding completed set today met or exceeded that planned load and reps.
- The latest saved History session containing completed sets for the same exercise also has a set that met or exceeded the plan. A newer miss cannot be skipped in favor of an older success.
- If effort tracking is enabled, today's effort must be entered before a preview can appear. If either evidence set has effort recorded, it is no higher than RPE 8.5 or no lower than RIR 2. Missing historical effort is treated as unknown, not as proof that the set was easy.

The preview shows both evidence sets and one small possible increment: 2.5 kg when displaying kilograms or 5 lb when displaying pounds. It has no apply button and does not change the next set, routine, History, or Progress. If the prompt is useful, edit the next set manually; otherwise ignore it or turn the setting off.

This arithmetic rule cannot assess fatigue, pain, technique, equipment, sleep, or readiness. It is not a requirement to add load and is not medical or coaching advice.

## Rest timer

Completing a set starts the rest countdown using the duration selected for that exercise. The timer is stored as a deadline rather than as a fragile in-memory counter, so reopening the app can recalculate the correct remaining time.

Choose **Off** in **Settings → Default rest** to make newly created exercises start without a timer. You can also choose **Off** for an individual exercise while editing a routine or active workout. Completing a set for that exercise will still record the set normally but will not show a rest countdown.

### Important iPhone limitation

The timer is a foreground aid. An installed web app cannot guarantee an offline sound or notification while the iPhone is locked or while iOS has suspended the app.

For an exact alert, keep Stronger visible during the rest period or use the iPhone Clock app as a backup. Reopening Stronger will show the recalculated timer, but an alert may have been missed while the app was inactive.

## Finish a workout

When training is complete:

1. Review the exercises and completed sets.
2. Tap **Finish workout**.
3. Review the workout summary.

Finishing creates a permanent history entry and makes its completed results available to Progress and to future “previous result” comparisons.

Do not finish a workout merely to close the app. An active workout can be resumed later.

## History

The History screen lists completed workouts with useful session information such as date, workout name, duration, exercises, and volume.

You can:

- Search completed workouts
- Open a workout to inspect its exercises and sets
- Duplicate a past workout for today
- Delete an unwanted history entry

### Duplicate a past workout

1. Open **History**.
2. Select the workout.
3. Choose **Duplicate for today**.
4. Review or edit the new active workout.

The original history entry remains unchanged.

### Delete a history entry

Deleting a completed workout is permanent on that device. It can also change previous-set comparisons and progress calculations.

Export a backup first if the workout may be needed later.

## Progress

Open **Progress** and select an exercise to see its available records and trends.

Metrics include:

- **Best weight:** the heaviest completed logged set
- **Estimated one-rep max (e1RM):** a calculated estimate based on weight and reps
- **Volume:** weight multiplied by reps across completed sets
- **Trend bars:** a simple view of changes across workouts

Only completed workout data contributes to progress.

Estimated one-rep max is a planning signal, not a tested maximum or medical recommendation. Rep speed, technique, fatigue, equipment, and exercise variation can all affect the estimate.

New exercises will not show a useful trend until enough completed workouts exist.

### Weekly review

Wave 4A adds a read-only summary at the top of **Progress**:

- **Sessions:** finished History entries from Monday through Sunday that contain at least one completed set, compared with **Settings → Weekly days**.
- **Recent best weights:** exercises whose heaviest completed set with at least one rep this week exceeds every comparable weight logged before the week began. A first logged result establishes a baseline and is not labeled as a new best.
- **Next in routine order:** the routine after the latest completed routine that still exists in the saved routine list. Blank workouts do not move the rotation.

The card also repeats the saved training goal as context without interpreting it. The review is recalculated from existing local data. It does not store a score, modify history, count an unfinished active workout, schedule a session, or start the displayed routine.

## Units

Choose kilograms or pounds in Settings.

- Changing units updates displayed workout and history values.
- Completed history is retained.
- Stronger uses kilograms as its canonical internal unit.
- Converted pound values may be rounded for practical display.

Before entering a value, confirm that the unit label matches the plates or equipment you are using.

### Temporary plate calculator

Open **Settings → Plate calculator** to check how a target total can be loaded with the bar and matching plate pairs available to you.

1. Confirm the displayed unit.
2. Enter the target total and the labeled bar weight.
3. For each plate size, select how many complete pairs are available. One pair means one matching plate for each side.
4. Read the total load and the plate list for each side.

The calculator chooses the closest load it can make without exceeding the target and never invents more pairs than you entered. When two combinations make the same load, it uses the one with fewer plates. If the target is below the entered bar, it stops at the bar and shows a warning.

The tool is temporary: closing it clears its inputs. It has no apply button and cannot change a set, workout, routine, History, Progress, setting, or backup. Collars are excluded unless you include their weight in the bar field. Always verify the bar label, plate markings, collars, and both sides before lifting.

# Backup and restore

## Why backups matter

There is no cloud account and no automatic server backup. Your data is tied to:

- This device
- This browser’s storage
- The exact HTTPS address used to open Stronger

Data can be lost if Safari website data is cleared, the app is reset, the device is erased, browser storage is removed, or Stronger moves to a different web address.

Do not rely on iCloud to preserve PWA storage. Export a backup regularly.

## Export a backup

1. Open **Settings**.
2. Choose **Export JSON**.
3. Save the generated JSON file to the Files app, iCloud Drive, or another location you control.
4. Keep at least one recent copy outside Stronger.

A backup may contain built-in selections, custom exercise names, workout dates, weights, reps, and settings. Treat it as personal data.

### Export workout CSV

Choose **Export workout CSV** when you want a readable copy of saved History for a spreadsheet. The CSV keeps history order and includes one row per saved set, including whether the set was completed, its canonical kilogram value, reps, optional RPE or RIR, timestamps, and stable exercise keys. A saved workout with no sets receives one workout-only row so it is not silently omitted.

CSV is not a backup and cannot be imported into Stronger. It excludes the active unfinished workout, routines, program copies, custom-exercise definitions, and settings. Keep exporting JSON separately for complete recovery.

Good times to export include:

- After an important workout
- Before clearing Safari data
- Before reinstalling or resetting the phone
- Before moving Stronger to another HTTPS address
- Before importing another backup
- Before using **Reset all data**

## Import a backup

Import is **replace-only**. It does not merge two workout libraries.

1. Export the current data first.
2. Open **Settings**.
3. Choose **Import JSON**.
4. Select a Stronger JSON backup.
5. Read the replacement warning carefully.
6. Confirm only if you want the imported file to replace all current local data.

Stronger validates a backup before replacing existing records. Corrupted, malformed, or unsupported files are rejected without replacing the current library.

Do not manually edit a backup unless you understand its data format.

## Reset all data

**Reset all data** permanently removes custom exercises, local routines, the active workout, history, progress source data, and settings.

Export a backup first. Reset cannot be undone unless a valid backup exists.

# Offline behavior

After Stronger has loaded successfully online, its service worker caches the application shell so it can open without gym Wi-Fi or cellular service.

While offline, you can continue to:

- Open the installed app
- Start or resume a workout
- Edit exercises and sets
- Finish a workout
- Review locally stored history and progress
- Change local settings

The first load on a new device requires internet access. A newly deployed version should also be opened online once before relying on it offline.

Workout records live in IndexedDB on the device. The service worker caches app files; it is not a cloud backup.

# App updates

Stronger checks for newer application files when internet access is available.

To receive an update:

1. Connect to the internet.
2. Close Stronger.
3. Reopen it from the Home Screen.
4. If the old version remains, open the HTTPS address in Safari and refresh it once.
5. Close and reopen the installed app.

Do not clear Safari website data as a routine update step. Export first if clearing storage becomes necessary.

An update to the same HTTPS address should preserve local data. Moving to a different domain or subdomain creates a different browser storage area, so export from the old address and import at the new one.

# Data safety and privacy

- No Stronger account is required.
- Workout records are stored locally in IndexedDB.
- The app does not use D1, R2, or another workout database.
- Workout history is not intentionally uploaded by the application.
- There is no automatic device-to-device or iCloud synchronization.
- Anyone with access to the unlocked iPhone may be able to open the app.
- Hosting infrastructure may still receive normal web request metadata, such as IP address and browser information, when application files are downloaded.
- Exported JSON files are not encrypted by Stronger; store them somewhere appropriate.

For better safety:

- Use an iPhone passcode and Face ID.
- Make regular exports.
- Keep the original HTTPS address bookmarked.
- Avoid using Stronger in Private Browsing.
- Do not clear its Safari website data without a backup.

# Current limitations

- Stronger is an installed web app, not a native App Store application.
- There is no cloud sync, login, or automatic backup.
- Data does not automatically move to another iPhone.
- The rest timer cannot guarantee locked-screen or background alerts.
- The first load and application updates require internet access.
- Clearing browser data can remove workout records.
- HealthKit, Apple Watch, widgets, and native Live Activities are not included.
- Progress metrics are intentionally simple and are not coaching or medical advice.

# Troubleshooting

## “Add to Home Screen” is missing

- Confirm the page is open in Safari, not an in-app browser.
- If the link opened inside another app, use its menu to choose **Open in Safari**.
- Scroll through the Safari Share sheet.
- Use **Edit Actions** if Add to Home Screen is hidden.
- Confirm the page uses `https://`.

## Stronger opens with Safari controls

The existing icon may be a bookmark instead of an installed web app.

Open the HTTPS address in Safari again, choose **Add to Home Screen**, and enable **Open as Web App** if that option appears.

Export before removing or reinstalling anything if important workout data already exists.

## Stronger does not open offline

The app must complete at least one online load before offline use.

1. Reconnect to the internet.
2. Open the HTTPS address.
3. Wait for it to finish loading.
4. Close and reopen the Home Screen app.
5. Test again in Airplane Mode.

After a new deployment, repeat an online launch so the new files can be cached.

## My data appears to be missing

Check that:

- You opened the same HTTPS address as before.
- The hostname and subdomain have not changed.
- You are using the installed app or normal Safari, not Private Browsing.
- Safari website data was not cleared.
- The iPhone was not reset or restored without the relevant browser data.

If a valid export exists, use **Import JSON**. Remember that import replaces current local data.

## The rest timer did not alert me

This is an expected iOS web-app limitation when Stronger is locked, backgrounded, or suspended. Keep it visible for reliable on-screen timing, or use the native Clock app for an exact alarm.

## An import was rejected

- Confirm the selected file was exported by Stronger.
- Do not rename its extension away from `.json`.
- Try exporting a fresh backup from the original installation.
- A corrupted file or an unsupported future or older data format will be rejected before replacement.

## The app still shows an older version

Connect to the internet, close the Home Screen app, open the HTTPS address in Safari, refresh once, then reopen the installed app.

Export before clearing website data.

## Storage errors appear

Free some storage on the iPhone, reopen Stronger, and export data as soon as possible. Browser storage is managed by iOS and should not be treated as a guaranteed backup location.

# Developer guide

## Technology

- React 19
- TypeScript
- Vite
- IndexedDB for local workout data
- Web App Manifest for installation
- Service worker for offline application files
- GitHub Pages and GitHub Actions for free HTTPS hosting

The project intentionally has no workout-data backend. GitHub hosts only the static application files; workout records remain in each installation’s IndexedDB.

## Requirements

- Node.js `22.13.0` or newer
- npm

Check installed versions:

```bash
node --version
npm --version
```

## Install dependencies

From the project directory:

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open the local URL printed by the development server.

Localhost is useful for development on the Mac. For realistic iPhone installation and offline testing, use a deployed HTTPS URL because service workers and PWA installation require a secure context.

## Validate changes

Run all relevant checks before publishing:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Available scripts:

- `npm run dev` — start the local development server
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript’s full type checker
- `npm run test:data` — run executable schema, migration, backup, unit, and recovery tests
- `npm run test:shell` — verify the built static shell and deployment contracts
- `npm test` — run data tests, build the app, and verify the static shell
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally

The staged R&D safety gate is documented in [`docs/WAVE_0_PROTECTION.md`](docs/WAVE_0_PROTECTION.md). Complete its production-backup check before beginning Wave 1.

The product research, competitor findings, feature rationale, and staged rollout are summarized in the [`Stronger R&D Feature Roadmap`](Stronger_R%26D_Feature_Roadmap.pptx) presentation. Each implemented wave also has a concise decision record in the `docs` folder.

## Publish with free HTTPS

This repository includes `.github/workflows/deploy-pages.yml`. Every push to `main` validates the app, builds the static `dist` folder, and publishes it with GitHub Pages.

For the initial setup:

1. Use the public GitHub repository named `Stronger_App`.
2. Push this project to its `main` branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open the **Actions** tab and confirm “Deploy Stronger to GitHub Pages” succeeds.
6. Open `https://borborisovich777.github.io/Stronger_App/` online on the iPhone.
7. Install it through Safari.
8. Create a small test workout, then close and reopen the app.
9. Enable Airplane Mode and confirm the app still launches.
10. Return online and test export and replace-only import.

The configured Vite base path depends on the repository remaining named `Stronger_App`. If the repository name changes, update `base` in `vite.config.ts`, the production URLs in `index.html` and this README, then rebuild before publishing.

Free hosting services may change their quotas or terms. Keep the project source and data exports so the app can be moved if necessary.

## PWA verification checklist

Before considering a release ready:

- The manifest loads without errors.
- The app has a name, short name, theme color, and suitable icons.
- `display` is configured for standalone use.
- The service worker registers on HTTPS.
- The application shell opens offline after one online visit.
- Safe-area padding works around the iPhone notch and Home indicator.
- Inputs remain usable when the iOS keyboard opens.
- Touch controls have comfortable target sizes.
- An active workout survives refresh and relaunch.
- Unit changes preserve equivalent stored values.
- History deletion updates Progress correctly.
- Program sandbox changes survive relaunch without changing their source routine.
- Next-set previews are off by default, require matching evidence, and never change the planned set.
- A valid import replaces data only after confirmation.
- An invalid import leaves existing data intact.
- Reset requires strong confirmation.
- The rest-timer limitation is visible to users.
- The hosted app does not require a login.

## Data model and compatibility notes

Application data is stored locally in IndexedDB. Keep exported backups versioned so future releases can validate or migrate older files safely.

When changing the stored schema:

1. Preserve existing IndexedDB data.
2. Add an explicit migration.
3. Update backup format validation if necessary.
4. Test an upgrade using realistic existing data.
5. Test both valid and invalid imports.
6. Confirm that failure leaves the original library untouched.

Changing the production hostname changes the browser storage origin. Treat a domain move as a data migration: export from the old origin and import into the new one.

## Manual release test

A useful release test on a real iPhone is:

1. Load the current production version online.
2. Install it to the Home Screen.
3. Create or edit a routine.
4. Start a workout and complete several sets.
5. Lock and unlock the phone.
6. Close and relaunch Stronger.
7. Finish the workout.
8. Verify History, duplicate, and Progress.
9. Export a backup.
10. Add temporary data.
11. Import the backup and confirm replacement.
12. Switch between kg and lb.
13. Launch in Airplane Mode.
14. Deploy an update and confirm it is picked up after reconnecting.

# Scope

Stronger is intentionally focused on fast personal workout logging. Accounts, subscriptions, social feeds, advertising, cloud sync, coaching, HealthKit, and large analytics dashboards are outside the current MVP.
