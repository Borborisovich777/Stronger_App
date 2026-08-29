# Wave 6C — Compact UI and clearer plate-calculator purpose

## Why this change

Stronger’s action controls had grown to several visual heights, from 46px to 58px. This made some screens feel less like a dense training log and increased scrolling during a workout. The plate calculator also described its inputs before explaining the practical job it performs.

## What changed

- Body copy is slightly smaller, while numeric inputs remain 16px to prevent iPhone form zoom.
- Ordinary action buttons use a 46px height.
- The primary workout-finishing action remains slightly stronger at 48px.
- Set-completion and add-set controls use the 44px minimum touch target.
- Bottom-navigation buttons are reduced to 52px inside a 66px bar.
- Plate-calculator copy now explains that it converts a target total into the plates to load on each side.

## Safety boundary

- The minimum interactive touch target remains 44px.
- No workout, history, storage, or calculation behavior changed.
- The calculator remains temporary and read-only with respect to workout sets.
- This is a density adjustment, not a visual clone of another product.

## Validation

- Automated data and shell tests
- Production TypeScript and Vite build
- Lint
- Browser checks at narrow and wide mobile sizes, including touch-target measurements and overflow
