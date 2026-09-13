# Expanded exercise library design QA

final result: passed

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

## Final validation and limits

`npm test` passes all 15 tests and includes the TypeScript check and production build. `npm run lint` passes. Tests cover all 253 source IDs, all 257 local keys, every guide and image, 307 unique image paths, JPEG completeness, dimension ratios, final checksums, legacy data meaning, backup round trips, aliases, measurement-specific records, scoped caching, failed-download retries, and versioned offline image responses.

The finalizer independently verifies 307 distinct JPEG hashes, preserved generated PNGs, prompt/review records, and exactly two key positions per exercise. The final JPEG payload is 31,106,904 bytes (about 31.1 MB). Offline images require initial downloads to complete; physical iPhone installation and storage eviction were not tested.

- App assets and integrity manifest: `public/exercises/`, `public/exercises/illustrations.json`
- Original square PNGs: `outputs/imagegen/mannequin-originals/`
- Original paired PNGs: `outputs/imagegen/strong-originals/`
- Complete exact prompt set and revisions: `outputs/imagegen/strong-generation-prompts.json`
- Generation mode: built-in OpenAI image generation
