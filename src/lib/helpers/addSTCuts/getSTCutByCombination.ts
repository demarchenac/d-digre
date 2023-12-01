import { type STCutMetadata, type DirectedGraph } from "~/types";
import { areSTPathsBlocked } from "./areSTPathsBlocked";
import { type getSTPaths } from "./getSTPaths";
import { parseDirectedToBiDirected } from "./parseDirectedToBiDirected";
import { dfs } from "./dfs";
import { parseLinkIdToLink } from "../linkAndIdParsing";

type GetSTCutByCombinationProps = {
  graph: DirectedGraph;
  linkIds: string[];
  target: number;
  stPaths: ReturnType<typeof getSTPaths>;
  cuts: string[][];
  combination: string[];
};

type GetSTCutByCombinationReturnValue =
  | {
      id: string[];
      metadata: STCutMetadata;
    }
  | undefined;

export function getSTCutByCombination({
  graph,
  linkIds,
  target,
  cuts,
  stPaths,
  combination,
}: GetSTCutByCombinationProps): GetSTCutByCombinationReturnValue {
  const hasMinCut = cuts.some((cut) => cut.every((link) => combination.includes(link)));
  if (hasMinCut) return undefined;

  const subgraphLinks = linkIds.filter((id) => !combination.includes(id));
  const isSTBlocked = areSTPathsBlocked({ stPaths, linkIds: subgraphLinks });
  if (!isSTBlocked) return undefined;

  const subgraph = parseDirectedToBiDirected(graph, combination);
  const subgraphJumps = dfs(subgraph.nodes, subgraph.nodes[0]);
  const isSubgraphConnected =
    subgraph.nodes.length === 1
      ? true
      : Object.values(subgraphJumps).every((jump) => jump !== Infinity);

  if (isSubgraphConnected) return undefined;

  const sources = Object.entries(subgraphJumps)
    .filter(([_, distance]) => distance !== Infinity)
    .map(([jumpDestination]) => +jumpDestination);

  if (sources.includes(target)) return undefined;

  const targets = graph.nodes.filter((node) => !sources.includes(node.id)).map(({ id }) => id);

  if (sources.length + targets.length !== graph.nodes.length) return undefined;

  const sourceSet = subgraph.nodes.filter(({ id }) => sources.includes(id));
  const targetSet = subgraph.nodes.filter(({ id }) => targets.includes(id));

  const sourceJumps = dfs(sourceSet, sourceSet[0]);
  const isSourceSetConnected =
    sourceSet.length === 1 ? true : Object.values(sourceJumps).every((jump) => jump !== Infinity);

  const targetJumps = dfs(targetSet, targetSet[0]);
  const isTargetSetConnected =
    targetSet.length === 1 ? true : Object.values(targetJumps).every((jump) => jump !== Infinity);

  if (!isSubgraphConnected && isSourceSetConnected && isTargetSetConnected) {
    const cut = combination.map(parseLinkIdToLink);
    const capacity = cut
      .map(({ source, target, weight }) => {
        if (!sources.includes(source)) return 0;
        if (sources.includes(target)) return 0;
        if (!targets.includes(target)) return 0;
        return weight;
      })
      .reduce((sum, value) => sum + value, 0);

    return { id: combination, metadata: { capacity, sources, targets, cut } };
  }

  return undefined;
}
