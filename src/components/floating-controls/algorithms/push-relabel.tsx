"use client";

import { useAtom, useAtomValue, useStore } from "jotai";
import { Button } from "~/components/ui/button";
import { algorithmAtom, graphAtom, sourceTargetPairAtom, stateAtom } from "~/lib/jotai";
import { cn } from "~/lib/utils";
import { type AppState } from "~/types";

const nonPermissibleStatus: AppState[] = ["no-graph", "graph-loaded"];

export function WithPushRelabelControls() {
  const state = useAtomValue(stateAtom, { store: useStore() });
  const algorithm = useAtomValue(algorithmAtom, { store: useStore() });
  const graph = useAtomValue(graphAtom, { store: useStore() });
  const [pair, setPair] = useAtom(sourceTargetPairAtom, { store: useStore() });

  if (nonPermissibleStatus.includes(state)) return null;
  if (algorithm !== "push-relabel") return null;
  if (!graph) return null;

  const labelIncrement = Number(graph.startsAt1 ?? false);

  return Object.keys(graph.pushRelabel).map((key) => {
    const [source, target] = key.split("_").map(Number);

    if (source === undefined || target === undefined) return null;

    const sourceLabel = (source + labelIncrement).toString();
    const targetLabel = (target + labelIncrement).toString();

    const onSourceTargetClick = () => {
      const literalKey = key as `${number}_${number}`;
      if (pair === literalKey) return;

      setPair(literalKey);
      console.log(graph.pushRelabel[literalKey]);
    };

    return (
      <Button
        key={key}
        variant="ghost"
        onClick={onSourceTargetClick}
        className={cn({ "ring-2 ring-green-600": key === pair })}
      >
        Source: {sourceLabel}, Target: {targetLabel}
      </Button>
    );
  });
}
