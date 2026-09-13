# Wave 8A — Human-readable workout CSV

## Why this change

Stronger already has a complete JSON backup, but JSON is difficult to inspect or analyze outside the app. The competitor review identified CSV portability as a useful strength of focused logging products. This wave adds a readable workout-history copy without changing the trusted JSON restore path.

## Export design

- One row per saved set in History
- Completed and incomplete saved sets remain distinguishable
- Workouts with no sets receive one workout-only row
- History, exercise, and set order stay unchanged
- Weight is exported in canonical kilograms to avoid unit ambiguity or conversion drift
- Optional RPE or RIR values keep their recorded scale
- Stable workout, exercise, set, routine, and exercise-key identifiers are included for reliable grouping
- UTF-8 with a byte-order mark keeps international exercise names readable in spreadsheet apps
- User-controlled text that could be treated as a spreadsheet formula is prefixed safely

## Product boundary

- JSON remains the only complete, restorable backup.
- CSV cannot be imported into Stronger.
- CSV includes saved History only. It excludes the active workout, routines, program copies, custom-exercise definitions, and settings.
- Export is derived in memory and does not mutate or rewrite saved data.
- Existing JSON export and transactional restore behavior are unchanged.

## UX

The Backup & restore card now names the formats directly:

- **Export JSON** for complete recovery
- **Import JSON** for validated replacement restore
- **Export workout CSV** for viewing and spreadsheet analysis

The explanatory text states that CSV cannot replace the JSON backup. The CSV action uses the existing button sizing and native share-or-download behavior.
