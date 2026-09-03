# Stronger Progress design QA

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

final result: passed
