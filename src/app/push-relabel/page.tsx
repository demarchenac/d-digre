"use client";

import { useAtomValue, useStore } from "jotai";
import { DirectedGraphWithWeights } from "~/components/d3/directed-graph-with-weights";
import {
  algorithmAtom,
  graphAtom,
  sourceTargetPairAtom,
  stateAtom,
  trimmingMethodAtom,
} from "~/lib/jotai";
import { type AppState } from "~/types";

export default function HomePage() {
  const graph = useAtomValue(graphAtom, { store: useStore() });
  const state = useAtomValue(stateAtom, { store: useStore() });
  const algorithm = useAtomValue(algorithmAtom, { store: useStore() });
  const pair = useAtomValue(sourceTargetPairAtom, { store: useStore() });
  const method = useAtomValue(trimmingMethodAtom, { store: useStore() });

  const centerClasses =
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center";

  const hasntRanAlgorithm = state === "graph-loaded";
  const ranAlgorithmAintPushRelabel = state === "ran-algorithm" && algorithm !== "push-relabel";

  if (!graph) return <p className={centerClasses}>Please upload your graph</p>;

  if (hasntRanAlgorithm || ranAlgorithmAintPushRelabel)
    return <p className={centerClasses}>Run the Push Relabel algorithm</p>;

  let visibleNodes: number[] = [];
  const visibleLinks: { source: number; target: number }[] = [];

  if (
    typeof pair !== "undefined" ||
    (["selected-raw-merged", "selected-trimmed-merged"] as AppState[]).includes(state)
  ) {
    let paths: number[][] = [];

    if (pair && pair.startsWith("raw:")) {
      paths = graph.pushRelabel.raw[pair]!.paths;
    } else if (pair && pair.startsWith("trimmed_")) {
      paths = graph.pushRelabel.trimmed[pair]!.paths;
    } else if (state === "selected-raw-merged" && graph.pushRelabel.rawMerged) {
      paths = graph.pushRelabel.rawMerged.paths;
    } else if (state === "selected-trimmed-merged" && method) {
      paths = graph.pushRelabel.trimmedMerged[method].paths;
    }

    const allPaths = paths.reduce((accumulator, current) => accumulator.concat(current), []);

    visibleNodes = Array.from(new Set(allPaths));

    for (const path of paths) {
      for (let targetIndex = 1; targetIndex < path.length; targetIndex++) {
        const sourceIndex = targetIndex - 1;
        visibleLinks.push({ source: path[sourceIndex]!, target: path[targetIndex]! });
      }
    }
  }

  return (
    <div className={centerClasses}>
      <DirectedGraphWithWeights
        data={graph}
        visibleNodes={visibleNodes}
        visibleLinks={visibleLinks}
      />
    </div>
  );
}
