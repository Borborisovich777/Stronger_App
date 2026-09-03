# Routine shape and drop-set logging

Updated: 2026-09-03
Audience: healthy adults using Stronger for general strength or hypertrophy training

## Direct answer

A drop set is best documented as one working set with one or more linked drop continuations. Each continuation records its own actual weight, reps, completion time, and optional effort, but it does not become another working set in the app's set count. Its weight and reps still contribute to volume.

Stronger now exposes **+ Add drop** directly under the last segment of every set. The first drop starts at 20% less weight; each later drop starts at 20% less than the preceding drop. The suggestion is editable, because available plates, machines, exercise selection, and the athlete's intent differ.

## How a routine should be shaped

The strongest current general guidance is less rigid than the old “one perfect routine” idea:

- Train all major muscle groups with high effort at least twice per week. For strength, place the lifts that matter most early in the session and commonly use 2–3 working sets at loads of at least 80% 1RM. For hypertrophy, weekly volume matters more than a single rep bracket; at least 10 weekly sets per muscle group enhanced growth in the evidence synthesis, with diminishing returns as volume grows. ([2026 ACSM Position Stand](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/))
- A practical full-body template is 5–8 exercises: a knee-dominant movement, hinge, horizontal push, horizontal pull, vertical push or pull, then optional isolation or trunk work. A split session often needs only 4–6 exercises. These are usability heuristics, not physiological cutoffs; the evidence does not identify one optimal exercise count.
- Start most exercises at 2–3 working sets. Use a goal-appropriate load and rep target, but treat reps as a range rather than a law: roughly 3–6 for strength-focused heavy work and 6–15 for convenient hypertrophy work. Hypertrophy can occur across a wider load range when effort is sufficiently high, while heavier loads are more specific to maximal strength. ([ACSM](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/), [Loading recommendations review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7927075/))
- Most ordinary sets do not need failure. About 2–3 reps in reserve is a well-supported general target; progression may come from load, reps, sets, frequency, exercise choice, or duration. Stronger should record and explain those choices, not silently prescribe them. ([2026 ACSM Position Stand](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/))

## How drop sets should work

Research commonly defines a drop set as reaching or approaching concentric failure, reducing the load with little or no rest, and continuing. A reduction around 20–25% is common, but the literature does not establish one mandatory protocol. ([2023 systematic review and meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC10390395/))

Drop sets appear to produce similar long-term hypertrophy and strength to volume-matched traditional sets while taking less time. They also produce greater acute perceived effort, lactate, and fatigue, so they are a time-saving option—not a proven upgrade that should be forced into every routine. ([2026 meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC13043944/))

Recommended app behavior:

1. The user completes or prepares a normal working set.
2. **+ Add drop** inserts a continuation immediately below it.
3. Weight is prefilled at 80% of the preceding segment; reps are blank because actual performance is unknown.
4. The user may add another drop from the last continuation. Studied protocols commonly use one to three reductions, but Stronger does not impose a special scientific limit beyond its existing data-safety limits.
5. A drop can only be completed after the preceding segment, and a positive external load must be lower than the preceding positive load.
6. The normal between-set rest timer starts only after the final continuation. Adding another drop clears a timer that may already have started.

## Counting and progression

- **Working sets:** the parent row only. A set with two drops still counts as one working set.
- **Drops:** shown separately in workout progress, History, and workout summaries.
- **Volume:** weight × reps from the parent and every completed drop.
- **Best weight and estimated 1RM:** based on working sets, preventing a drop continuation from shifting comparison positions or driving load-increase suggestions.
- **Next-set suggestions:** drops are ignored. They never cause the next ordinary set to inherit the reduced load.
- **Duplicate workout:** preserves the set/drop structure with new linked IDs; completed state and effort are reset.
- **CSV:** every row has `set_type`, `drop_set_of`, and `drop_order`, so the hierarchy can be reconstructed outside the app.

## Edge-case behavior

| Situation | Behavior |
| --- | --- |
| First drop | Insert below its working set at 80% weight and 0 reps. |
| Further drop | Append to the same set group and reduce from the latest drop, not the original weight. |
| User edits weight | Keep the edit; existing drops are not recalculated retroactively. If the edit makes a completed continuation invalid, that continuation and later drops reopen as incomplete. |
| Same or higher positive weight | Block completion and focus the weight field. |
| Zero-weight/bodyweight set | Keep the suggested drop at zero and allow reps to document the continuation; the app cannot infer an assisted or easier exercise variation. |
| Missing reps | Block completion and focus reps. |
| Out-of-order completion | Block a drop until the preceding segment is complete. |
| Parent marked incomplete | Mark all completed continuations after it incomplete and remove their completion-only effort/timestamps. |
| Middle drop marked incomplete | Mark later completed drops in that chain incomplete. |
| Delete a drop | Remove only that continuation; later drops remain linked and are renumbered. |
| Delete a working set | Remove all its continuations in the same confirmed action. |
| Add a normal set after drops | Copy the latest working-set target, never the reduced drop load. |
| Add a drop after rest starts | Cancel the current rest countdown because the set is continuing. |
| Finish with incomplete drops | Treat them as incomplete set entries and ask for confirmation. |
| History/import corruption | Reject orphaned, nested, interleaved, cyclic-by-reference, or completed-out-of-order drop data rather than guessing. |
| Old backups | Continue to load; `dropSetOf` is additive and optional in format version 1. |
| Storage limits | Drops share the existing maximum of 100 entries per exercise and 500 per workout. |

## Limitations

This guidance applies to healthy adults. Injury rehabilitation, pregnancy, cardiovascular disease, frailty, youth training, and sport-specific peaking need individualized professional guidance. Drop-set studies are comparatively small and heterogeneous, and many involve young men; the app therefore presents a flexible logging tool rather than a claim that drop sets are superior.
