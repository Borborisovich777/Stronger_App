# Wave 5A — Temporary Plate Calculator

The original R&D roadmap ends at Wave 3. Wave 5A extends it with the remaining low-risk utility from the Derive stage: plate math. This slice does not add next-set prompts, substitutions, readiness, deload logic, or automatic coaching.

## Why this feature comes next

Plate loading is useful during a workout but does not require Stronger to interpret training performance. Keeping it in a temporary Settings sheet gives the calculation a clear boundary from workout records. Users enter every relevant value themselves, inspect the result, and close the tool without creating persistent state.

## Deterministic rules

- The target is the total loaded weight, including the entered bar weight.
- One available pair means one matching plate for each side.
- The calculator uses only whole pairs and the counts entered for each size.
- It selects the greatest achievable load that does not exceed the target.
- If multiple combinations reach that load, it selects the combination with fewer plates.
- The same bounded calculation is used for kg and lb; each unit has its own fixed plate-size list.
- Inputs and internal arithmetic are bounded and rounded to hundredths.
- A target below the bar produces a warning and a bar-only result instead of pretending the target can be reached.
- Collars are not modeled separately. A user who wants to count them must include them in the bar weight.

## Safety boundary

- The calculator draft exists only in React component state and resets when the sheet closes.
- No storage or backup schema change.
- No set, workout, routine, program block, History entry, Progress value, or setting is read as a target or mutated.
- No apply, accept, or copy-to-set action in Wave 5A.
- No recommended working weight, progression, substitution, deload, readiness, fatigue, or medical interpretation.
- The result explicitly asks the user to verify the physical bar, plates, collars, and both sides before lifting.

## Verification gate

Pure helper tests cover exact kg and lb loads, closest-under results, inventory bounds, target-below-bar behavior, input order and immutability, minimum-plate tie breaking, unsafe inputs, and fixed unit inventories. Shell tests enforce the no-storage/no-workout boundary. Browser QA must verify exact and closest-under flows, 320-pixel layout, 44-pixel controls, dark mode, modal accessibility, and zero console errors before checkpointing.
