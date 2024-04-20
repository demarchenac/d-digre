type SourceTargetTuple = { source: number; target: number };

export function getVisibleNodeAndLinksFromPaths(paths: number[][]) {
  const nodesInPaths = paths
    .reduce((accumulator, current) => accumulator.concat(current), [])
    .sort();
  const nodes = Array.from(new Set(nodesInPaths));

  const links: SourceTargetTuple[] = [];

  for (const path of paths) {
    for (let targetIndex = 1; targetIndex < path.length; targetIndex++) {
      const sourceIndex = targetIndex - 1;
      links.push({ source: path[sourceIndex]!, target: path[targetIndex]! });
    }
  }

  return { nodes, links };
}
