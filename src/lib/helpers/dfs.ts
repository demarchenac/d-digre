export function DFS(
  graph: number[][],
  source: number,
  target: number,
  visited: boolean[],
  path: number[],
  paths: number[][],
) {
  if (visited[source]) return;

  visited[source] = true;
  path.push(source);

  if (source === target) {
    paths.push(path.map(Number));
    visited[source] = false;
    path.pop();
    return;
  }

  for (const index in graph[source]) {
    const node = Number(index);
    const capacity = graph[source]![node]!;
    if (capacity === 0) continue;

    DFS(graph, node, target, visited, path, paths);
  }

  path.pop();
  visited[source] = false;
  return;
}
