import type { WeightUnit } from "./storage";

export const MAX_PLATE_PAIRS_PER_SIZE = 10;
export const MAX_CALCULATOR_LOAD = 5_000;

const WEIGHT_SCALE = 100;

const PLATE_SIZES: Record<WeightUnit, readonly number[]> = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25],
  lb: [55, 45, 35, 25, 10, 5, 2.5, 1.25],
};

export type PlateInventoryItem = {
  plateWeight: number;
  availablePairs: number;
};

export type PlateLoadItem = {
  plateWeight: number;
  platesPerSide: number;
};

export type PlateLoadResult = {
  platesPerSide: PlateLoadItem[];
  actualTotal: number;
  targetTotal: number;
  barWeight: number;
  shortfall: number;
  exact: boolean;
  targetBelowBar: boolean;
  perSideTarget: number;
  loadedPerSide: number;
};

type Combination = {
  counts: number[];
  plateCount: number;
};

function toWeightUnits(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(MAX_CALCULATOR_LOAD, Math.max(0, value)) * WEIGHT_SCALE);
}

function fromWeightUnits(value: number): number {
  return Math.round(value) / WEIGHT_SCALE;
}

function normalizedPairCount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_PLATE_PAIRS_PER_SIZE, Math.max(0, Math.floor(value)));
}

function normalizeInventory(inventory: readonly PlateInventoryItem[]): PlateInventoryItem[] {
  const combined = new Map<number, number>();

  inventory.forEach((item) => {
    const plateUnits = toWeightUnits(item.plateWeight);
    const availablePairs = normalizedPairCount(item.availablePairs);
    if (plateUnits <= 0 || availablePairs <= 0) return;
    combined.set(
      plateUnits,
      Math.min(MAX_PLATE_PAIRS_PER_SIZE, (combined.get(plateUnits) ?? 0) + availablePairs),
    );
  });

  return [...combined.entries()]
    .sort(([first], [second]) => second - first)
    .map(([plateUnits, availablePairs]) => ({
      plateWeight: fromWeightUnits(plateUnits),
      availablePairs,
    }));
}

export function plateSizesForUnit(unit: WeightUnit): readonly number[] {
  return [...PLATE_SIZES[unit]];
}

export function createEmptyPlateInventory(unit: WeightUnit): PlateInventoryItem[] {
  return PLATE_SIZES[unit].map((plateWeight) => ({ plateWeight, availablePairs: 0 }));
}

export function calculatePlateLoad(
  targetTotalInput: number,
  barWeightInput: number,
  inventoryInput: readonly PlateInventoryItem[],
): PlateLoadResult {
  const targetUnits = toWeightUnits(targetTotalInput);
  const barUnits = toWeightUnits(barWeightInput);
  const targetBelowBar = targetUnits < barUnits;
  const perSideTargetUnits = targetBelowBar ? 0 : Math.floor((targetUnits - barUnits) / 2);
  const inventory = normalizeInventory(inventoryInput);

  let combinations = new Map<number, Combination>([[0, {
    counts: Array.from({ length: inventory.length }, () => 0),
    plateCount: 0,
  }]]);

  inventory.forEach((item, itemIndex) => {
    const plateUnits = toWeightUnits(item.plateWeight);
    const next = new Map(combinations);

    combinations.forEach((combination, currentLoad) => {
      for (let count = 1; count <= item.availablePairs; count += 1) {
        const nextLoad = currentLoad + plateUnits * count;
        if (nextLoad > perSideTargetUnits) break;
        const nextPlateCount = combination.plateCount + count;
        const existing = next.get(nextLoad);
        if (existing && existing.plateCount <= nextPlateCount) continue;
        const counts = [...combination.counts];
        counts[itemIndex] = count;
        next.set(nextLoad, { counts, plateCount: nextPlateCount });
      }
    });

    combinations = next;
  });

  const loadedPerSideUnits = Math.max(...combinations.keys());
  const chosen = combinations.get(loadedPerSideUnits) ?? { counts: [], plateCount: 0 };
  const actualTotalUnits = barUnits + loadedPerSideUnits * 2;

  return {
    platesPerSide: inventory.flatMap((item, index) => chosen.counts[index] > 0 ? [{
      plateWeight: item.plateWeight,
      platesPerSide: chosen.counts[index],
    }] : []),
    actualTotal: fromWeightUnits(actualTotalUnits),
    targetTotal: fromWeightUnits(targetUnits),
    barWeight: fromWeightUnits(barUnits),
    shortfall: fromWeightUnits(Math.max(0, targetUnits - actualTotalUnits)),
    exact: actualTotalUnits === targetUnits,
    targetBelowBar,
    perSideTarget: fromWeightUnits(perSideTargetUnits),
    loadedPerSide: fromWeightUnits(loadedPerSideUnits),
  };
}
