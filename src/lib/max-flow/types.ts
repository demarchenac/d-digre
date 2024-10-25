export type MaxFlowAlgorithm<T> = (
  capacities: number[][],
  source: number,
  target: number,
) => T & { maxFlow: number };

export type DFS = (
  adjacency: number[][],
  source: number,
  target: number,
  visited: boolean[],
  path: number[],
  paths: number[][],
) => void;

export type GetPaths = (...args: Parameters<MaxFlowAlgorithm<unknown>>) => number[][];
