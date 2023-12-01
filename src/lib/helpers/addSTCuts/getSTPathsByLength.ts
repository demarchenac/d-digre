import type { DirectedNode, DirectedGraph } from "~/types";

type GetSTPathProps = {
  graph: DirectedGraph;
  source?: DirectedNode;
  target?: DirectedNode;
  path: number[];
  length: number;
};

export function getSTPathsByLength({
  graph,
  source,
  target,
  path = [],
  length = 2,
}: GetSTPathProps): number[][] {
  if (!source || !target) return [];

  const pathIsTooLarge = path.length > graph.nodes.length;
  if (pathIsTooLarge) return [];

  const isASTPath = path.length === length && path.at(-1) === target.id;
  const isNotASTPath = path.length === length && path.at(-1) !== target.id;
  if (isASTPath) return [path];
  else if (isNotASTPath) return [];

  const paths: number[][] = [];

  for (const node of source.outgoing) {
    paths.push(
      ...getSTPathsByLength({
        graph,
        source: graph.nodes[node],
        target,
        length,
        path: [...path, node],
      }),
    );
  }
  return paths;
}
