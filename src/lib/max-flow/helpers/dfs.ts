import type { DFS } from "../types";

export const dfs: DFS = (adjacency, source, target, visited, path, paths) => {
  if (visited[source]) return;

  visited[source] = true;
  path.push(source);

  if (source === target) {
    paths.push(path.map(Number));
    visited[source] = false;
    path.pop();
    return;
  }

  for (const index in adjacency[source]) {
    const node = Number(index);
    const capacity = adjacency[source]![node]!;
    if (capacity === 0) continue;

    dfs(adjacency, node, target, visited, path, paths);
  }

  path.pop();
  visited[source] = false;
  return;
};
