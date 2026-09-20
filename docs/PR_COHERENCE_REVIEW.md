# Integrated PR review — 20 September 2026

Reviewed the seven repository PRs and their combined behavior at `main` commit `6599ab12e218d866a213f8abb191d747bd41ecfd`. All seven were merged; no PR remained open at the start of this review. Their deployment runs succeeded.

| PR | Integrated product behavior |
| --- | --- |
| [#1 — Safer workout workflows and progress insights](https://github.com/Borborisovich777/Stronger_App/pull/1) | Local recovery, backups, optional effort, copied program blocks, reports and read-only load tools. |
| [#2 — Equipment alternatives](https://github.com/Borborisovich777/Stronger_App/pull/2) | Explicit choices in the add-exercise picker; no automatic exercise replacement. |
| [#3 — Drop sets and simpler progress](https://github.com/Borborisovich777/Stronger_App/pull/3) | Drop continuations contribute reps and volume, but do not inflate working-set counts or records. Rest begins after the final continuation. |
| [#4 — Exercise reordering](https://github.com/Borborisovich777/Stronger_App/pull/4) | Deliberate active-workout reordering through the move grip or keyboard. |
| [#5 — Illustrated library and compact logging](https://github.com/Borborisovich777/Stronger_App/pull/5) | Compact tables, exercise illustrations, and distinct weight/reps, reps, time, distance, added-load and assistance conventions. |
| [#6 — Prepared templates](https://github.com/Borborisovich777/Stronger_App/pull/6) | Prepared session content and editable independent copies. Its automatic starter-template behavior was superseded by #7. |
| [#7 — Browse and save individual templates](https://github.com/Borborisovich777/Stronger_App/pull/7) | Empty saved-template list on first launch; the prepared library is available to new and existing users; save only the selected session. |

## Corrections from this review

- Previous results and next-set evidence now inspect all matching exercise rows in a saved workout. A later completed row cannot be missed because an earlier row was unfinished. A recent miss cannot be bypassed in favor of an older successful workout. Only valid completed working sets with matching tracking and load conventions qualify.
- Period strength summaries use the same measurement series as exercise details. External load, added weight and assistance never share a strength baseline or record badge. Aggregate workload still includes the performed work. Added weight is explicitly labeled.
- Editing prepared workout guidance preserves the focused textarea when its contents become one line or empty.
- Previous values retain readable numbers in compact columns; full measurements remain available in their accessible description and tooltip. Distance and duration use separate lines.
- Visible copy and current README instructions consistently use **Template**. Reset messaging accurately describes empty saved templates. Historical plans and wave reports remain historical records.
- A separate read-only PR workflow runs dependency installation, lint and the complete build/test suite before merge. Deployment remains in the existing `main` workflow. Requiring the check through repository branch protection is a separate repository setting.

The compact layout and Stronger color scheme are retained. The withdrawn History-to-template update and active-exercise Skip/Replace experiments are not restored. Existing explicit picker alternatives and prior-result prefilling remain available.

## Verification

- Baseline: 180 automated tests and lint passed on the integrated `main` checkout.
- Final local validation: `npm test` passed all 187 tests and the production build; `npm run lint` and `git diff --check` passed.
- Regression coverage: repeated exercise rows, latest-session evidence, incompatible measurement modes, mode-specific records, future records, assistance and timed exercises.
- Browser: empty launch → prepared library → assisted pull-up choice → customize and save one template → start workout → replace/clear/type guidance → complete eight working sets and one drop → finish → History → start the template again → inspect Previous → Progress.
- Verified that rest starts after the drop continuation, working-set counts exclude the drop, assistance is excluded from external-load volume and strength highlights, and saved template guidance is independent of workout notes.
- At 320px and 390px viewports, the tested assistance Previous value (`50 × 8`) fits without clipping or page overflow; its accessible description still includes `Assistance 50 kg × 8`.
- No browser warning/error logs during the tested flow. Browser tests used isolated in-memory preview data, not persisted user workouts.
- The production build retains its existing advisory about the main JavaScript chunk exceeding 500 kB; this does not fail the build. Native iPhone installation, vibration and device-specific offline behavior were not re-tested in this review.
