export type SearchableExercise = {
  exerciseKey: string;
  name: string;
  category: string;
  aliases?: string[];
};

type ExerciseSearchMedia = {
  equipment?: string;
  muscles?: string[];
};

export function normalizeExerciseSearch(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function matchesExerciseSearch(
  exercise: SearchableExercise,
  query: string,
  media?: ExerciseSearchMedia,
): boolean {
  const queryTokens = normalizeExerciseSearch(query).split(" ").filter(Boolean);
  if (!queryTokens.length) return true;
  const searchableTokens = normalizeExerciseSearch([
    exercise.name,
    ...(exercise.aliases ?? []),
    exercise.category,
    media?.equipment ?? "",
    ...(media?.muscles ?? []),
  ].join(" ")).split(" ");
  return queryTokens.every((token) => searchableTokens.some((candidate) =>
    token.length === 1 ? candidate === token : candidate.startsWith(token),
  ));
}

// Names can coincide without identifying the same saved movement or history.
export function mergeExerciseCatalog<T extends SearchableExercise>(...groups: readonly (readonly T[])[]): T[] {
  const keys = new Set<string>();
  return groups.flat().filter((exercise) => {
    if (!exercise.name.trim() || !exercise.exerciseKey.trim() || keys.has(exercise.exerciseKey)) return false;
    keys.add(exercise.exerciseKey);
    return true;
  });
}

export function findExistingExercise<T extends SearchableExercise>(catalog: readonly T[], name: string): T | undefined {
  const normalizedName = normalizeExerciseSearch(name);
  if (!normalizedName) return undefined;
  const matches = catalog.filter((exercise) => [exercise.name, ...(exercise.aliases ?? [])]
    .some((candidate) => normalizeExerciseSearch(candidate) === normalizedName));
  return matches.find((exercise) => exercise.category === "Custom")
    ?? matches.find((exercise) => exercise.category === "Saved")
    ?? matches[0];
}
