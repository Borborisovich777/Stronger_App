# Wave 7B — Period and exercise progress

## Why this change

An all-time total shows how much work was recorded, but it does not answer whether training changed today, this week, or this month. A large workout chart also hides which exercises produced that volume. This wave keeps one compact overall card and makes both questions visible.

## What changed

- Day, Week, Month, and All filters inside Overall progress
- Matched previous-period context for Day, Week, and Month
- Current and previous workout, completed-set, and volume values
- A ranked list of volume by exercise, with set count, best load, and previous-period comparison
- The first four exercises stay visible; the rest expand on request
- Existing exercise-specific best-weight and estimated-1RM trends remain separate

## Comparison rules

- Day compares today with yesterday.
- Week compares Monday through today with the same elapsed days of the previous week.
- Month compares the first of this month through today with the same dates of the previous month. If that month is shorter, its last valid date is used.
- All shows every saved workout and does not invent a previous period.

Matching elapsed days avoids comparing an unfinished week or month with a complete one.

## Measurement rules

- Only saved sets marked complete with more than zero reps count.
- Volume is `weight × reps`, summed across qualifying sets.
- Bodyweight work with zero external load counts as a completed set but adds zero external-load volume.
- Exercise rows are ranked by volume, then completed sets, then name.
- Best load is shown per exercise and is never combined across exercises.
- Volume measures training work, not strength quality. Exercise selection and rep count can change it.

## UX and accessibility

- The period switch is a labelled button group with `aria-pressed` state.
- Every period button keeps the existing 44-pixel touch target.
- Current and comparison date ranges stay visible so a percentage is never presented without context.
- Current values lead; earlier values use concise “Was …” labels.
- The detailed exercise list is progressively disclosed to keep the mobile page scannable.

## Safety boundary

- All calculations are derived in memory from existing History.
- No storage schema, workout, routine, setting, backup, or active session is changed.
- The Weekly Review and exercise-specific progress calculations remain unchanged.
