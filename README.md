# Stronger — Gym Progress Tracker

Stronger is a free, offline-first workout tracker designed for iPhone. It lets you create routines, record sets quickly, review workout history, and see simple strength trends without an account, subscription, ads, or social features.

> Live app: **[Open Stronger](https://borborisovich777.github.io/stronger-gym-tracker/)**

## What kind of app is this?

Stronger is a Progressive Web App (PWA). It is delivered from a secure HTTPS address but can be installed on an iPhone Home Screen and opened in its own app window.

It is not an App Store app and does not require an Apple Developer subscription. After installation, it has its own icon and can continue working without internet access once its files have been cached.

Your workout records stay in the browser storage on your device. Stronger does not use a cloud account or automatically synchronize data between devices.

## Main features

- Installable on an iPhone Home Screen
- Works offline after the first successful online load
- Starter Push, Pull, and Legs routines
- Custom routines and exercises
- Editable active workouts
- Quick weight, reps, and set completion
- Previous results shown beside new sets
- Foreground workout and rest timers
- Searchable workout history
- Duplicate a past workout for today
- Best weight, estimated one-rep max, volume, and trend views
- Kilograms and pounds
- Local JSON backup and restore
- No account, ads, subscription, or server-side workout database

# User manual

## Install Stronger on iPhone

Use Safari for the initial installation.

1. Open `https://borborisovich777.github.io/stronger-gym-tracker/` in **Safari**.
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

- **Units:** kilograms (kg) or pounds (lb)
- **Default rest time:** the countdown used after completing a set

You can change these later. Changing units converts the displayed values; it does not erase or weaken the original workout records.

Stronger stores weights internally in kilograms and converts them for display when pounds are selected. Small rounding differences may appear after switching units repeatedly.

## Navigation

Stronger has four main areas:

- **Workout:** routines and the active training session
- **History:** completed workouts, search, details, duplicate, and delete
- **Progress:** exercise-specific strength and volume trends
- **Settings:** units, default rest time, installation help, backup, restore, and reset

## Create and edit routines

Stronger includes Push, Pull, and Legs starter routines. They are starting points and can be changed.

To create a routine:

1. Open **Workout**.
2. Choose the option to create a routine.
3. Enter a routine name.
4. Add exercises.
5. Add the desired starting sets, weights, and repetitions.
6. Save the routine.

While editing a routine, you can:

- Rename the routine
- Add a custom exercise
- Rename an exercise
- Change its target sets, weight, or reps
- Move an exercise using **Move up** or **Move down**
- Remove an exercise
- Delete the entire routine

Deleting or editing a routine does not rewrite completed workout history. Completed workouts retain the values that were performed at that time.

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
4. Add the exercises you plan to perform.
5. Add sets and enter weight and rep targets.

### Resume an active workout

An unfinished workout is saved locally as you make changes. If Stronger is closed or the page reloads, open the app again and resume the active workout.

Closing the app is not the same as finishing the workout. Use **Finish workout** when the session is complete so that it becomes part of History and Progress.

## Edit an active workout

Training plans often change at the gym. During an active session, you can:

- Rename the workout
- Add, rename, reorder, or remove exercises
- Add or remove sets
- Change weight and reps
- Mark a completed set incomplete again

Use the explicit **Move up** and **Move down** controls when changing exercise order. Reordering does not depend on dragging, which makes it more reliable on a phone.

Edits are saved locally as you work.

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

Tap a completed set again if it was marked by mistake.

Previous values come from completed workout history for the same exercise. A new or renamed exercise may not show a previous result until it has been completed in a workout.

Workout progress updates as sets and exercises are completed.

## Rest timer

Completing a set starts the rest countdown using the default duration from Settings. The timer is stored as a deadline rather than as a fragile in-memory counter, so reopening the app can recalculate the correct remaining time.

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

## Units

Choose kilograms or pounds in Settings.

- Changing units updates displayed workout and history values.
- Completed history is retained.
- Stronger uses kilograms as its canonical internal unit.
- Converted pound values may be rounded for practical display.

Before entering a value, confirm that the unit label matches the plates or equipment you are using.

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
2. Choose **Export data**.
3. Save the generated JSON file to the Files app, iCloud Drive, or another location you control.
4. Keep at least one recent copy outside Stronger.

A backup may contain exercise names, workout dates, weights, reps, and settings. Treat it as personal data.

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
3. Choose **Import data**.
4. Select a Stronger JSON backup.
5. Read the replacement warning carefully.
6. Confirm only if you want the imported file to replace all current local data.

Stronger validates a backup before replacing existing records. Corrupted, malformed, or unsupported files are rejected without replacing the current library.

Do not manually edit a backup unless you understand its data format.

## Reset all data

**Reset all data** permanently removes local routines, the active workout, history, progress source data, and settings.

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

If a valid export exists, use **Import data**. Remember that import replaces current local data.

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
- `npm test` — build and run the rendered HTML test
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally

## Publish with free HTTPS

This repository includes `.github/workflows/deploy-pages.yml`. Every push to `main` validates the app, builds the static `dist` folder, and publishes it with GitHub Pages.

For the initial setup:

1. Create a public GitHub repository named `stronger-gym-tracker`.
2. Push this project to its `main` branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open the **Actions** tab and confirm “Deploy Stronger to GitHub Pages” succeeds.
6. Open `https://borborisovich777.github.io/stronger-gym-tracker/` online on the iPhone.
7. Install it through Safari.
8. Create a small test workout, then close and reopen the app.
9. Enable Airplane Mode and confirm the app still launches.
10. Return online and test export and replace-only import.

The configured Vite base path depends on the repository remaining named `stronger-gym-tracker`. If the repository name changes, update `base` in `vite.config.ts`, the production URLs in `index.html` and this README, then rebuild before publishing.

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
