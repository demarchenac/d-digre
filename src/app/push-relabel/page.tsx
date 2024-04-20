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
import type { AlgorithmMetadata, AppState } from "~/types";

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

  let meta: AlgorithmMetadata = {
    visibleLinks: [],
    visibleNodes: [],
    encoders: [],
  } as unknown as AlgorithmMetadata;

  if (
    typeof pair !== "undefined" ||
    (["selected-raw-merged", "selected-trimmed-merged"] as AppState[]).includes(state)
  ) {
    if (pair && pair.startsWith("raw:")) {
      meta = graph.pushRelabel.raw[pair]!;
    } else if (pair && pair.startsWith("trimmed_")) {
      meta = graph.pushRelabel.trimmed[pair]!;
    } else if (state === "selected-raw-merged" && graph.pushRelabel.rawMerged) {
      meta = graph.pushRelabel.rawMerged;
    } else if (state === "selected-trimmed-merged" && method) {
      meta = graph.pushRelabel.trimmedMerged[method]!;
    }
  }

  return (
    <div className={centerClasses}>
      <DirectedGraphWithWeights
        data={graph}
        visibleNodes={meta.visibleNodes}
        visibleLinks={meta.visibleLinks}
        encoders={meta.encoders}
      />
    </div>
  );
}
