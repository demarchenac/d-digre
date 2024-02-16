/**
 * Extracted from https://bost.ocks.org/mike/shuffle/;
 * @param array list of elements to shuffle with the Fisher-Yates method
 * @returns shuffled elements
 */

export function shuffle<T>(array: T[]) {
  const cloned = Array.from(array);
  let elementsToShuffle = cloned.length;
  let cache: T | undefined = undefined;
  let indexOfElementToShuffle: number | undefined = undefined;

  while (elementsToShuffle) {
    indexOfElementToShuffle = Math.floor(Math.random() * elementsToShuffle--);
    cache = cloned[elementsToShuffle];
    cloned[elementsToShuffle] = cloned[indexOfElementToShuffle]!;
    cloned[indexOfElementToShuffle] = cache!;
  }

  return Array.from(cloned);
}
