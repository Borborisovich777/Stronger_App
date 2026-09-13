# Compact workout interface transformation plan

Status: implemented locally. The user directed implementation on 2026-09-13 and clarified that Strong's color scheme must not be copied. Browser QA results are recorded in [design-qa.md](../../design-qa.md); physical iPhone keyboard verification remains pending. This status does not indicate deployment or a passing full test suite.

Scope: compact typography, layout and presentation of the existing workout controls. The user's later retraction restores the original workout and template behavior while retaining this redesign and the separate exercise-media work.

## Accepted design direction

Use the user's Strong iPhone screenshot as the reference for typography, proportions, information density and interaction placement. The workout screen demonstrated on https://www.strong.app/ confirms the compact workout heading, shared five-column set table, completion controls and exercise actions under an ellipsis.

**Durable design rule: preserve Stronger's cream, charcoal, lime and semantic red palette in both light and dark mode. Do not copy Strong's colors.** This explicit user correction takes precedence over earlier color suggestions in this plan or its reference images. Use the reference to guide layout and font sizing while applying Stronger's existing theme tokens to surfaces, actions, completed sets and destructive controls. Keep this rule when extending the interface to other screens.

The rejected draft used too many large cards, badges, explanation panels and separate actions. Replace that composition with a compact workout log. Keep the Stronger name and existing workout data.

Sizing below is a proposed CSS specification inferred from the screenshot, not a claim about Strong's internal design tokens.

## 1. Establish a smaller visual system

| Element | Target |
| --- | --- |
| Font | Existing system font stack; SF system appearance on iPhone |
| Workout title | 22px, semibold, roughly 27px line height |
| Exercise name | 15–16px, semibold, existing theme foreground |
| Set values | 15–16px, regular or medium; tabular numerals |
| Editable numeric values | 16px |
| Column labels and metadata | 12–13px; readable neutral gray |
| Page gutters | 12–14px |
| Set row | 44–48px, one horizontal row |
| Exercise separation | 16–20px between sections |
| Controls | Small visible shapes with non-overlapping touch areas around 44px |
| Corners | 6–8px on inputs and small buttons |
| Light colors | Existing cream surfaces, charcoal text, lime primary/completion accents and semantic red |
| Dark colors | Existing charcoal surfaces, cream text, lime primary/completion accents and semantic red |
| Completed set | Subtle theme lime tint across the row, plus a checked control |

Remove gradient surfaces, exercise-card shadows, large rounded containers, oversized set-number badges and repeated uppercase captions. Use thin neutral separators. Preserve a corresponding dark theme with the same geometry. Empty notes consume only a short optional row; present saved notes as compact rows using the existing palette.

## 2. Rebuild the active workout screen first

1. Use a compact top toolbar with minimize on the left and Finish on the right. Keep Finish reachable without scrolling to the workout's end.
2. Place the workout name and its ellipsis underneath, followed by elapsed time and optional notes. Remove the separate large progress card; use a small status line if needed.
3. Present each exercise as a flat section: compact name on the left, ellipsis on the right. Retain the existing movement guide as a small secondary action or menu item.
4. Keep the same header and aligned columns at every normal phone width: **Set / Previous / kg or lb / Reps / check**.
5. Use low-chrome weight and rep inputs. Keep completion a single tap, and Add set a compact action immediately below the table.
6. Treat active logging as a focused workout sheet. Minimize returns to the app's usual navigation; the workout remains resumable. App-wide navigation must not consume the keyboard's remaining editing space.

The initial density issue was the `max-width: 370px` layout: it hid shared table headings and stacked each set into multiple rows at a minimum height of 104px. Normal rows were 61px. Four sets should occupy approximately 176–192px before the heading, rather than 244–416px. Remove this stacked breakpoint and allocate the columns explicitly across 320–430px widths.

## 3. Keep exercise actions compact and familiar

The exercise ellipsis opens a small action sheet with **Edit sets**, **Reorder**, **Notes**, **Rest timer**, and **View movement** when a guide exists.

- **Edit sets:** keep the existing controls for editing the exercise and its sets readily available.
- **Reorder:** reveal explicit Move up and Move down controls.
- **Notes and Rest timer:** show their editors on request so the workout log stays compact.
- **View movement:** preserve the exercise guide and its media.

These controls edit the active session. Template editing remains in Workout and Settings.

## 4. Carry the same design into surrounding screens

- **Templates:** compact rows showing name and exercise count; tapping the row starts the workout, and its ellipsis opens editing. Use **New**, **Template name** and **Save template** consistently in Workout and Settings. Retain each exercise's **Sets**, **Weight**, and **Reps** defaults in a compact editor.
- **History:** concise date groups and workout rows. Details reuse the compact set table in a read-only state.
- **Exercise picker and guide:** retain the separate exercise-media work and guidance; reveal detail on request so the workout log stays compact.
- **Progress and Settings:** use the same typography, gutters and flat list treatment after the core workout flows are implemented.

Preserve the original start behavior: template exercises stay in their saved order, and weight/reps use previous results when available with each exercise's template defaults as a fallback. A minimized workout returns through **Resume [workout name]**.

## Delivery sequence

1. **Compact browser implementation:** implement the active workout screen first using the supplied screenshot's hierarchy and proportions with Stronger's existing colors, actual interactive inputs and menu actions. Compare at a matching phone viewport, including a keyboard-open state. The user has authorized proceeding with the plan; continue through the remaining implementation steps without a separate design approval gate.
2. **Shared layout implementation:** extract or refactor the workout toolbar, exercise section, set table and small action sheet in the existing app. Apply the new tokens and remove the narrow-screen row stacking.
3. **Existing exercise controls:** place the retained editors and guide behind the compact exercise menu.
4. **Remaining screens and verification:** extend the same visual system and complete regression checks while preserving existing workout and template behavior.

## Code map and existing work

The planning inspection covered:

- `app/globals.css`: global heading scale, `.app-shell`, `.topbar`, `.progress-card`, `.exercise-card`, `.set-grid`, `.set-row`, `.complete-button`, narrow-screen overrides and theme rules.
- `app/StrongerApp.tsx`: active workout markup, numeric inputs, existing exercise actions, template editor, history detail and completion controls.
- `app/storage.ts`: preserve existing routine defaults, session sets, import validation and persistence.
- `app/ExerciseGuide.tsx` and exercise media: preserve the existing work when adapting the layout.
- `tests/rendered-html.test.mjs`: update assertions tied to intentionally changed CSS, and add behavior checks where meaningful.

The working tree already contained changes to the app, styles, tests, service worker, README and exercise media. Implementation must build on those changes rather than overwrite them.

## Acceptance checks

- At 320, 360, 375, 390 and 430px widths, the five table columns stay aligned with no horizontal scroll. Long exercise names can wrap without covering their actions.
- At standard text size, a four-set exercise uses 44–48px rows. Test larger text separately; accessibility resizing may increase height.
- With the mobile keyboard open, the focused weight/reps cell stays visible; input, Done/Next and Finish behavior remain usable. Test on actual iPhone Safari/PWA before calling keyboard behavior verified.
- Decimal input, comma normalization, kg/lb conversion, completed-set toggling, rest timer and workout resume continue working.
- Existing template starts retain saved exercise order and previous-result prefilling with template defaults as a fallback.
- Template editing retains per-exercise Sets, Weight and Reps defaults. Existing workouts and backups remain readable.
- Preserve Stronger's cream/charcoal/lime/semantic red palette in light and dark mode. Validate contrast, accessible labels and focus restoration. Compact visuals must retain usable touch targets.
- Run relevant lint, type and behavior tests; inspect the rendered screens against the screenshot. Existing string-based CSS tests alone do not prove visual fidelity.

## Reference evidence

- User-supplied Strong workout screenshot, reviewed in this conversation on 2026-09-13.
- [Strong official website](https://www.strong.app/): workout demonstration visually inspected in Browser on 2026-09-13.
- [Performing a workout](https://help.strongapp.io/article/229-my-first-workout): official guidance on the workout list, set entry, ordering and Finish placement.

The screenshot and website demonstration establish the layout direction. The user's subsequent color correction establishes the palette. Native Strong's live interaction behavior and accessibility were not tested. The acceptance checks above are implementation requirements, not a report of completed validation.
