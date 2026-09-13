# Wave 0 — Protect

Wave 0 changes safety infrastructure only. It does not add Session Rescue, Weekly Review, Plate Calculator, coaching, or schema fields.

## Source recovery

- Pre-R&D baseline commit: `06ca539`
- Recovery tag: `pre-rnd-2026-08-28`
- Wave branch: `rnd/wave-0-protect`

The tag is the exact recovery point from before Wave 0 source changes.

## Production-data gate

Before Wave 1 is deployed:

1. In the installed production app, open Settings → Backup & restore → Export JSON.
2. Keep the JSON backup in two locations, including one outside the phone.
3. Import a copy only into a separate test origin or installation.
4. Verify routine count, active workout, history count, units, and a sample of exercise keys and weights.
5. Keep the original production installation unchanged until the copied-data check passes.

Do not test a restore against the only production copy. Git protects source code; it cannot protect IndexedDB data stored by Safari or an installed PWA.

## Protected data invariants

- `formatVersion` stays at `1` until an explicit migration is required.
- `weightKg` remains the canonical stored weight regardless of display units.
- Workout, exercise, set, and routine IDs are preserved.
- `exerciseKey` values are never renamed during normalization.
- Active-workout timestamps and incomplete sets survive backup normalization.
- History ordering is preserved during version-1 normalization.
- Unsupported or malformed stored data blocks autosave instead of being replaced with starter data.
- IndexedDB writes resolve only when the transaction completes.
- IndexedDB and emergency copies carry a backward-compatible storage revision; a newer fingerprint-qualified descendant wins, while divergent copies pause for recovery.
- Emergency saves identify the primary revision they follow, so a stale tab cannot make a branched fallback overwrite a newer confirmed workout.
- Parent links include compact payload fingerprints; matching timestamps alone never count as proof that one stored copy descends from another.
- The full primary-or-emergency save decision takes an origin-wide browser lock. Successful primary commits mirror the emergency copy; if the lock is unavailable, saving stops and offers an export instead of risking a last-writer-wins overwrite.
- A failed primary write can seed and continue an ordered emergency-copy chain even after the primary has revision metadata.
- A valid revised primary remains usable when the emergency store is unavailable; its first later write must reconcile any recovered emergency branch under the browser lock before overwriting it. The emergency store is required before creating starter data.
- Saves and restores use optimistic revision checks; an older tab is stopped and asks for a reload instead of overwriting newer data.
- Optimistic checks compare both revision and normalized payload, catching rollback builds that preserve old revision metadata while changing a workout.
- Backup envelopes identify Stronger and validate both backup and data-format versions.
- Restore operations share the persistence queue, require a primary commit when IndexedDB exists, leave unrelated emergency copies untouched, and lock editing until storage and UI agree.
- Resource caps and unique-ID checks reject files that could exhaust the UI or make workout completion ambiguous.
- Previously writable version-1 records above the new screen caps remain loadable in read-only recovery and can be exported without being rendered or rewritten.
- If autosave stops, editing is locked and the current in-memory data can be exported before reload.

## Verification gate

Run all of the following before Wave 1 begins:

```bash
npm run lint
npm run typecheck
npm test
git diff --check
git status --short
```

The Pages deployment workflow runs lint and the complete test command before publishing `dist`.
