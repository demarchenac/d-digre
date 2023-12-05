"use client";

import { useAtomValue, useStore } from "jotai";
import { graphAtom, stateAtom } from "~/lib/jotai";
import { SourceTargetControls } from "./source-target-controls";

export function WithSTCutControls() {
  const state = useAtomValue(stateAtom, { store: useStore() });
  const graph = useAtomValue(graphAtom, { store: useStore() });
  if (state !== "with-st-cuts") return null;
  if (!graph) return null;

  return graph?.sources.map(
    (source) =>
      graph?.targets.map((target) => {
        const key = `from_${source}_to_${target}`;
        const paths = graph.stPaths[key] ?? [];
        const cuts = graph.stCuts[key] ?? [];
        return (
          <SourceTargetControls
            key={key}
            source={source}
            target={target}
            paths={paths}
            increment={graph?.startsAt1 ? 1 : 0}
            cuts={cuts}
          />
        );
      }),
  );
}
