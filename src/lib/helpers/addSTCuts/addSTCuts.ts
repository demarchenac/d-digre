import type { DirectedGraph, STCutMetadata } from "~/types";
import { parseLinkToLinkId } from "../linkAndIdParsing";
import { getSTPaths } from "./getSTPaths";
import { getSTCutByCombination } from "./getSTCutByCombination";
import { getLinkCombinations } from "./getLinkCombinations";

export function addSTCuts(graph: DirectedGraph): DirectedGraph {
  const mutable = { ...graph };
  const linkIds = mutable.links.map(parseLinkToLinkId);

  const combinations = getLinkCombinations({
    links: mutable.links,
    nodeCount: mutable.nodes.length,
  });

  for (const source of mutable.sources) {
    for (const target of mutable.targets) {
      const cutMemory: string[][] = [];
      const cutTable: STCutMetadata[] = [];

      const stPaths = getSTPaths({ graph: mutable, nodes: mutable.nodes, source, target });
      mutable.stPaths[`from_${source}_to_${target}`] = stPaths;

      for (const combination of combinations) {
        const cut = getSTCutByCombination({
          graph: mutable,
          linkIds,
          target,
          stPaths,
          cuts: cutMemory,
          combination,
        });

        if (cut) {
          cutMemory.push(cut.id);
          cutTable.push(cut.metadata);
        }
      }

      cutTable.sort((current, next) => {
        if (current.sources.length < next.sources.length) return -2;
        if (current.sources.length > next.sources.length) return 2;

        const currentSum = current.sources.join("");
        const nextSum = next.sources.join("");
        if (currentSum < nextSum) return -1;
        if (currentSum > nextSum) return 1;
        return 0;
      });

      mutable.stCuts[`from_${source}_to_${target}`] = cutTable;
    }
  }

  return mutable;
}
