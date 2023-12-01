import { type DirectedGraph, type DirectedNode } from "~/types";
import { getSTPathsByLength } from "./getSTPathsByLength";

type GetSTPathsProps = {
  graph: DirectedGraph;
  nodes: DirectedNode[];
  source: number;
  target: number;
};

export function getSTPaths({ graph, nodes, source, target }: GetSTPathsProps) {
  let stPaths: number[][] = [];

  for (let stPathLength = 2; stPathLength <= nodes.length; stPathLength++) {
    const sourceNode = nodes[source];
    const targetNode = nodes[target];
    const length = stPathLength;
    const path = [source];
    const args = { graph, source: sourceNode, target: targetNode, path, length };

    const paths = getSTPathsByLength(args);

    stPaths = [...stPaths, ...paths];
  }

  return stPaths;
}
