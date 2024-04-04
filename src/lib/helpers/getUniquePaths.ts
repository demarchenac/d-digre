export function getUniquePaths(paths: number[][], source: number, target: number) {
  let usedNodes: number[] = [];
  const pathsWithoutRepeatingNode = [];
  for (const path of paths) {
    const hasRepeatedNode = path
      .filter((node) => node !== source && node !== target)
      .some((node) => usedNodes.includes(node));

    if (hasRepeatedNode) continue;

    usedNodes = usedNodes.concat(path);
    pathsWithoutRepeatingNode.push(path);
  }

  return pathsWithoutRepeatingNode;
}
