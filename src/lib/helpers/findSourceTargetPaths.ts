import { copy } from "./copy";
import { DFS } from "./dfs";

export function findSourceTargetPaths(graph: number[][], source: number, target: number) {
  const cachedGraph = copy(graph);
  const length = graph.length;
  const visited = Array.from({ length }, () => false);
  const path: number[] = [];
  const paths: number[][] = [];

  DFS(graph, source, target, visited, path, paths);

  paths.sort((a, b) => (a.length < b.length ? -1 : 1));

  const connectedToSource = cachedGraph[source]!.map((w, i) => ({ w, i }))
    .filter(({ w }) => w > 0)
    .map(({ i }) => i);

  paths.sort((a, b) => {
    // all paths will include at minimum the source and target
    const secondFromA = a.at(1)!;
    const secondFromB = b.at(1)!;
    const secondFromAPriority = connectedToSource.indexOf(secondFromA);
    const secondFromBPriority = connectedToSource.indexOf(secondFromB);

    if (secondFromAPriority !== -1 && secondFromBPriority !== -1) {
      if (secondFromAPriority < secondFromBPriority) return -1;
      else if (secondFromAPriority > secondFromBPriority) return 1;
    } else if (secondFromAPriority > 0 && secondFromBPriority === -1) {
      return -1;
    } else if (secondFromAPriority === -1 && secondFromBPriority > 0) {
      return 1;
    }

    return a.length < b.length ? -1 : 1;
  });

  return paths;
}
