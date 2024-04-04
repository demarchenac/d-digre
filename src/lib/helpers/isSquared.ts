export function isSquared(capacities: number[][]) {
  const numberOfVertexes = capacities[0]?.length ?? 0;
  const isSquared =
    capacities.length === numberOfVertexes &&
    capacities.every((weights) => weights.length === numberOfVertexes);

  return isSquared;
}
