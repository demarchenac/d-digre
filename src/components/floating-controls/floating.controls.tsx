"use client";

import { useAtomValue, useStore } from "jotai";
import { stateAtom } from "~/lib/jotai";
import { GraphUploadDialog } from "~/components/graph-upload-dialog";
import { GraphControls } from "./graph-controls";

export function FloatingControls() {
  const state = useAtomValue(stateAtom, { store: useStore() });

  return (
    <aside className="absolute left-4 top-4 z-20 flex min-w-[320px] max-w-xs flex-col gap-4 rounded-lg bg-background p-4 ring-1 ring-inset ring-white/10">
      Current state: {state}
      <GraphUploadDialog />
      <GraphControls />
    </aside>
  );
}
