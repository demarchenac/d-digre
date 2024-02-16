"use client";

import { useAtomValue } from "jotai";
import { DirectedGraphWithWeights } from "~/components/d3/directed-graph-with-weights";
import { algorithmAtom, graphAtom, sourceTargetPairAtom, stateAtom } from "~/lib/jotai";

export default function HomePage() {
  const graph = useAtomValue(graphAtom);
  const state = useAtomValue(stateAtom);
  const algorithm = useAtomValue(algorithmAtom);
  const pair = useAtomValue(sourceTargetPairAtom);

  const centerClasses =
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center";

  const hasntRanAlgorithm = state === "graph-loaded";
  const ranAlgorithmAintPushRelabel = state === "ran-algorithm" && algorithm !== "push-relabel";

  if (!graph) return <p className={centerClasses}>Please upload your graph</p>;

  if (hasntRanAlgorithm || ranAlgorithmAintPushRelabel)
    return <p className={centerClasses}>Run the Push Relabel algorithm</p>;

  let visibleNodes: number[] = [];
  const visibleLinks: { source: number; target: number }[] = [];

  if (pair) {
    const paths = graph.pushRelabel.raw[pair]!.paths;
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