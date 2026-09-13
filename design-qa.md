# Stronger design QA

## Integration with current main — passed

Verified on 2026-09-13 after resolving the PR branch against current `main`. The merged implementation retains the 257-entry illustrated library and measurement-specific logging together with drop sets, exercise reordering, effort notes, session rescue, program copies, reporting, equipment alternatives, and data protection. The historical reviews below remain scoped to their original implementations.

### Automated validation

- `npm test` passed all 172 tests, including TypeScript checking and the production build.
- `npm run lint` and `git diff --check` passed.
- Coverage includes both feature sets: catalog and asset integrity, offline caching, typed measurements, legacy data preservation, backup validation and persistence, drop continuations, effort, session rescue, program previews, reporting, and exercise ordering.
- The production build reports an advisory for its main JavaScript chunk exceeding 500 kB after minification (approximately 570 kB). The build succeeds; this is a remaining payload consideration.

### Browser verification

Interaction checks used headless Chrome with an isolated temporary profile at local port 5180. Existing user workouts and browser storage were not used. The following checks passed with no browser errors:

- Previous working-set results ignore intervening drops. Drop chains complete in order; the rest timer starts after the final segment. Effort is recorded, and edits that invalidate a completed segment reopen its dependent drops.
- Running, Plank, and assisted exercise sets use their correct measurements and completion rules. Incompatible exercises do not offer drop continuations.
- Exercise keyboard reordering and collapse/expand work. The edit sheet retains working-set and drop numbering.
- Good Morning can be found by search, opened as an illustrated guide, and added to the workout.
- Saving retains time, distance, assistance, completed drops, and incomplete entries in History. Exercise Progress uses the matching measurement type and shows no estimated one-rep max for assistance.
- A cardio template with 2.5 km and 15:10 targets saves, reopens, and starts correctly. A program copy set to 50% load preserves its time and distance targets.
- Narrow layouts have no horizontal overflow at 320 CSS pixels. Dark workout screens were inspected at 320 and 390 CSS pixels. Minimize/resume restores the intended navigation state.

Screenshots inspected during the integration review:

| Local evidence | Verified surface |
| --- | --- |
| `outputs/pr-merge/guide-320.png` | Good Morning guide at 320 px |
| `outputs/pr-merge/workout-320.png` | Mixed workout entry at 320 px |
| `outputs/pr-merge/history-320.png` | Saved measurements and drop statuses |
| `outputs/pr-merge/progress-320.png` | Measurement-specific Progress |
| `outputs/pr-merge/template-320.png` | Time and distance template controls |
| `outputs/pr-merge/dark-workout-320.png` | Dark workout at 320 px |
| `outputs/pr-merge/dark-workout-390.png` | Dark workout at 390 px |

Physical iPhone installation, a real hardware keyboard, and browser storage eviction were not tested. Keyboard behavior above was exercised through browser automation. Illustration availability offline still depends on completing the initial asset download.

# Exercise library review — before integration

Historical result: passed for the implementation reviewed at that time.

## Scope and provenance

The user requested every exercise in Strong, retaining the nonrealistic 3D doll treatment from the attached example. Stronger now includes all 253 unique exercises in the published Strong global catalog snapshot plus four existing local variations: 257 entries total. This is snapshot coverage, not a verified current live response. The exact source, date, IDs, names, and local-key mapping are recorded in `public/exercises/strong-catalog.json`.

All 50 original keys remain present. Names and aliases support familiar searches such as “morning barbell,” “bent over row,” and “landmine row.” New categories include Full body, Cardio, Olympic, and Mobility. Strong's artwork and instruction prose were not copied.

## Artwork and comparison

The collection contains 307 distinct JPEG assets showing 514 key positions: 100 original square exports for 50 exercises and 207 new paired exports. Square assets are 768×768; pairs are 1536×768. Each image was generated and, where necessary, corrected with the built-in OpenAI image generation tool. Full PNG originals and exact prompts are preserved locally.

The reference `codex-clipboard-0d8ca918-908f-4a7d-80c8-1395c3373f62.png` and the rendered Good Morning guide were displayed together for comparison. The target is the gray faceless mannequin, simplified equipment, white background, and subtle coral muscle highlights. The source phone bezel and its other app controls are outside the comparison. Stronger's existing type, colors, and navigation remain the product context.

- **Typography and content:** exercise names, equipment, muscle labels, two position captions, and instructions remain readable. Complex movements identify the omitted intermediate phases. General activities identify the example variation shown.
- **Layout:** one wide pair fills the same guide area formerly occupied by two squares. Thumbnails show the movement half of the pair. The narrow routine grid now gives duration and rest controls sufficient width.
- **Color and image treatment:** nonrealistic gray dolls and charcoal equipment retain opaque white image backgrounds in the dark interface. The existing light/dark theme tokens remain in use.
- **Anatomy and equipment:** generating agents inspected every owned output. Root separately inspected requested row variants, Good Morning, cardio movements, shrugs, pullovers, and corrected equipment details. Another agent reviewed 16 upper/lower examples.
- **P3 framing:** a few nonfunctional tower tops extend beyond the frame. Full figures, working grips, cable/lever paths, relevant pulleys, and bases remain recognizable. These are movement cues rather than equipment construction drawings.

## Corrections before packaging

Targeted image edits or regeneration corrected duplicated motion phases, calf ankle excursion, a GHD knee-flexion pose, inconsistent leading legs in step-ups, clipped feet, Olympic bar placement, machine grips, reverse-curl grip, crossed reverse-fly cables, and the T-bar shaft geometry.

The final independent review prompted three further corrections: a seated wide-grip row cable now connects through a center swivel, the seated leg-curl roller stays behind the lower calves near the ankles, and the underhand pulldown shows a supinated grip. Root also corrected upright-row cable tension, dumbbell pullover hand support, and machine pullover elbow position. The accepted replacements were inspected and included in the final manifest.

## Interaction verification

Tests used an isolated local preview on port 4174, separate from the user's existing workout origin.

- Searched “morning barbell,” opened Good Morning, and checked its pair, equipment, muscle list, and instructions.
- Selected Running and verified duration/distance target fields. Completing zero values produced the appropriate duration and distance messages.
- Logged Running at 5 km in 25:30, Plank at 0:45, and assisted chin-ups at 30 kg assistance for 8 reps.
- Saved the workout and verified all three results in History.
- Verified Running distance/time progress, Plank longest hold, and lowest-assistance records. Assistance does not produce a strength estimate.
- Saved a cardio template with 2.5 km/15:10 targets, reopened it, and verified the values persisted.
- Started the template and confirmed the previous 5 km/25:30 result appears and prefills correctly.
- Confirmed the 320 px routine and workout layouts have document width equal to scroll width, with readable controls and no horizontal page overflow.
- Reloaded the production preview on port 4173 after final packaging: the home card reports 257 movements and warning/error logs are empty. A later isolated test-tab discard interaction stalled; no additional visual claims depend on that interaction.

Evidence is in `outputs/strong-expansion/qa/`:

| Evidence | Purpose |
| --- | --- |
| `good-morning-dark.png` | Reference comparison and complete illustrated guide |
| `timed-cardio-workout.png` | Duration/distance set entry |
| `saved-measurements.png` | Preserved History results |
| `running-progress.png` | Cardio progress |
| `assistance-progress.png` | Lowest-assistance metric |
| `routine-timed-narrow.png` | Corrected 320 px template controls |
| `previous-cardio-320.png` | Previous-result layout at 320 px |

Existing user workouts and history were not modified. A temporary browser viewport override was reset after verification.

## Historical validation and limits

Before integration, `npm test` passed all 15 tests and included the TypeScript check and production build. `npm run lint` also passed. Those tests covered all 253 source IDs, all 257 local keys, every guide and image, 307 unique image paths, JPEG completeness, dimension ratios, final checksums, legacy data meaning, backup round trips, aliases, measurement-specific records, scoped caching, failed-download retries, and versioned offline image responses.

The finalizer independently verifies 307 distinct JPEG hashes, preserved generated PNGs, prompt/review records, and exactly two key positions per exercise. The final JPEG payload is 31,106,904 bytes (about 31.1 MB). Offline images require initial downloads to complete; physical iPhone installation and storage eviction were not tested.

- App assets and integrity manifest: `public/exercises/`, `public/exercises/illustrations.json`
- Original square PNGs: `outputs/imagegen/mannequin-originals/`
- Original paired PNGs: `outputs/imagegen/strong-originals/`
- Complete exact prompt set and revisions: `outputs/imagegen/strong-generation-prompts.json`
- Generation mode: built-in OpenAI image generation

# Progress review — before integration

## Comparison target

- Source visual truth: selected Product Design reference, preserved in the combined comparison below.
- Final implementation screenshot: `artifacts/product-design-audit/statistics-simplification-2026-09-03/07-implementation-week-populated-final.png`
- Final combined comparison: `artifacts/product-design-audit/statistics-simplification-2026-09-03/08-source-vs-implementation-final.png`
- Viewport: 390 x 844 CSS pixels.
- Source pixels: 853 x 1844, normalized with a proportional center fit to 390 x 844.
- Implementation pixels: 390 x 844 at device scale factor 1.
- State: dark theme, Week selected, three completed workouts against a four-day goal, two new best weights, one unchanged lift, and Pull next in saved routine order.

## Findings

- Final pass: no actionable P0, P1, or P2 differences remain.
- [P3] The generated concept includes exercise-specific illustrations that the existing dynamic exercise catalog does not provide. The implementation intentionally uses a text-first list rather than invented glyphs, CSS drawings, or mismatched stock icons. This makes the rows denser but preserves their hierarchy and supports custom exercises.
- [P3] The existing app navigation keeps its established Workout / History / Progress / Settings order and icon treatment. The selected image's reordered Current / Progress / History tabs were treated as illustrative because this task changes Statistics, not the global information architecture.
- [P3] The routine card uses the explicit action text “Open Workout” instead of an unlabeled chevron. This is an intentional accessibility and behavior clarification; it still matches the selected card hierarchy.

## Required fidelity surfaces

- Fonts and typography: passed. The implementation retains Stronger's SF/system stack, bold compact display hierarchy, tabular numerals, legible 12–14 px supporting text, and 16 px form controls in the disclosed advanced view. Headline wrapping remains readable at 320 px.
- Spacing and layout rhythm: passed. Header, period control, narrative card, strength rows, routine card, and fixed navigation follow the source order and proportions. The final 390 px screen has no horizontal overflow; the 320 px check also reports a 320 px scroll width.
- Colors and visual tokens: passed. Only the existing charcoal, cream, lime, red, border, and shadow tokens are used. The selected tab has both a lime fill and outline, so selection does not depend on color alone. Light mode was also visually checked.
- Image quality and asset fidelity: passed with the P3 icon adaptation above. The screen requires no raster photography, logo recreation, or decorative image assets. The existing Stronger brand mark remains unchanged.
- Copy and content: passed. The primary answer is a plain-language workout sentence, the weekly goal has one supporting phrase, exercise rows name their comparison, and advanced volume/e1RM values are hidden by default.
- Interaction and accessibility: passed. Week, Month, and All time controls are functional and expose pressed state; the workout target is a semantic progressbar; each exercise row opens the corresponding detail; the disclosure updates `aria-expanded`; the exercise selector works; the routine row navigates without starting a workout; touch targets remain at least 44 px; focus styling is inherited from the app.

## Comparison history

### Pass 1

- Evidence: `04-source-vs-implementation.png` comparing the source with `03-implementation-week-populated.png`.
- [P2] The Progress heading and all following content began about 30 px lower than the selected image, pushing the routine card too close to the fixed navigation.
- [P2] “Getting stronger” inherited the muted dark-theme kicker color instead of the source's lime emphasis.

### Fixes

- Added a Progress-only top-margin override so the heading, period tabs, story card, and routine row move upward without changing other screens.
- Increased the scoped selector specificity for the strength-section kicker so the intended lime token survives the later dark-theme rule.

### Pass 2 and final pass

- Evidence: `06-source-vs-implementation-pass2.png`, followed by the final `08-source-vs-implementation-final.png` after the copy refinement.
- The source and implementation now align on the major vertical regions, card proportions, text hierarchy, selected period, strength-row rhythm, and fixed footer clearance.
- The final browser screenshot contains the entire primary weekly experience above the fixed navigation at 390 x 844.

## Additional evidence and checks

- Empty week: `11-implementation-week-empty.png`.
- Minimum-width dark check: `09-implementation-week-320.png`; no horizontal overflow and wrapped comparison copy remains readable.
- Light theme check: `10-implementation-week-light.png`; palette and hierarchy remain coherent.
- Primary interactions tested in the in-app browser: Week, Month, All time, show/hide exercise details, exercise selection, and safe navigation back to Workout.
- Browser console checked after the interaction pass: no errors or warnings; only Vite connection/HMR messages and the React development notice were present.
- Focused region comparison was not needed because the combined image keeps each screen at 390 x 844 pixels and all typography, controls, dividers, and labels remain legible at that scale.

## Implementation checklist

- [x] Replace equal-priority statistic tiles with one plain-language lead answer.
- [x] Keep the weekly target to one semantic progress bar.
- [x] Limit the default strength list to three understandable rows.
- [x] Add truthful previous-period best-weight comparisons.
- [x] Put e1RM, volume, and the chart behind progressive disclosure.
- [x] Preserve the existing palette, fixed header, fixed footer, and data model.
- [x] Verify populated, empty, narrow, light, and dark states.

## Follow-up polish

- A future exercise taxonomy could provide a real, consistent icon family for built-in movements while using one neutral catalog icon for custom exercises.

Historical result: passed for the implementation reviewed at that time.
