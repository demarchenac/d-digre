import { copy } from "~/lib/helpers/copy";
import { dfs } from "./dfs";
import type { GetPaths } from "../types";

export const getPaths: GetPaths = (adjacency, source, target) => {
  const length = adjacency.length;
  const visited = Array.from({ length }, () => false);
  const path: number[] = [];
  const paths: number[][] = [];

  dfs(adjacency, source, target, visited, path, paths);

  paths.sort((a, b) => (a.length < b.length ? -1 : 1));
  return copy(paths);
};
