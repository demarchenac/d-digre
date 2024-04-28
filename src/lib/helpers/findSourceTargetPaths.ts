import { DFS } from "./dfs";

export function findSourceTargetPaths(graph: number[][], source: number, target: number) {
  const length = graph.length;
  const visited = Array.from({ length }, () => false);
  const path: number[] = [];
  const paths: number[][] = [];

  DFS(graph, source, target, visited, path, paths);

  paths.sort((a, b) => (a.length < b.length ? -1 : 1));
  return paths;
}
