export const EXERCISE_LONG_PRESS_MS = 450;
export const EXERCISE_LONG_PRESS_MOVE_TOLERANCE_PX = 10;

export type ReorderPlacement = "before" | "after";

type StableIdItem = {
  id: string;
};

export function movedBeyondLongPressTolerance(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  tolerancePx = EXERCISE_LONG_PRESS_MOVE_TOLERANCE_PX,
): boolean {
  return Math.hypot(currentX - startX, currentY - startY) > tolerancePx;
}

export function reorderItemsById<T extends StableIdItem>(
  items: T[],
  sourceId: string,
  targetId: string,
  placement: ReorderPlacement,
): T[] {
  if (sourceId === targetId) return items;

  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return items;

  const currentNeighborIndex = placement === "before" ? targetIndex - 1 : targetIndex + 1;
  if (sourceIndex === currentNeighborIndex) return items;

  const reordered = [...items];
  const [source] = reordered.splice(sourceIndex, 1);
  const targetIndexAfterRemoval = reordered.findIndex((item) => item.id === targetId);
  const insertionIndex = placement === "before"
    ? targetIndexAfterRemoval
    : targetIndexAfterRemoval + 1;
  reordered.splice(insertionIndex, 0, source);
  return reordered;
}
