"use client";

import { useAtom, useStore } from "jotai";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { graphAtom } from "~/lib/jotai";
import { WithAlgorithmControls } from "./with-algorithm-controls";
import { WithPushRelabelControls } from "./algorithms/push-relabel";

export function GraphControls() {
  const [graph, setGraph] = useAtom(graphAtom, { store: useStore() });
  if (!graph) return null;

  const onStartsAt1Toggle = () => graph && setGraph({ ...graph, startsAt1: !graph.startsAt1 });
  const onRenderWeightsToggle = () =>
    graph && setGraph({ ...graph, renderWeights: !graph.renderWeights });

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id="nodes-starts-at-1"
          checked={graph.startsAt1}
          onCheckedChange={onStartsAt1Toggle}
        />
        <Label htmlFor="nodes-starts-at-1">Nodes starts at 1</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="render-weights"
          checked={graph.renderWeights}
          onCheckedChange={onRenderWeightsToggle}
        />
        <Label htmlFor="render-weights">Render weights</Label>
      </div>

      <WithAlgorithmControls />
      <WithPushRelabelControls />
    </>
  );
}
