"use client";

import { useAtom, useAtomValue, useStore } from "jotai";
import { graphAtom, stateAtom } from "~/lib/jotai";
import { GraphUploadDialog } from "./graph-upload-dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function FloatingControls() {
  const state = useAtomValue(stateAtom, { store: useStore() });
  const [graph, setGraph] = useAtom(graphAtom, { store: useStore() });

  const onStartsAt1Toggle = () => graph && setGraph({ ...graph, startsAt1: !graph.startsAt1 });
  const onRenderWeightsToggle = () =>
    graph && setGraph({ ...graph, renderWeights: !graph.renderWeights });

  return (
    <>
      Current state: {state}
      <GraphUploadDialog />
      {graph && (
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
        </>
      )}
    </>
  );
}
