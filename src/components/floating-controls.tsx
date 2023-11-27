"use client";

import { useAtomValue, useStore } from "jotai";
import { stateAtom } from "~/lib/jotai";
import { GraphUploadDialog } from "./graph-upload-dialog";

export function FloatingControls() {
  const state = useAtomValue(stateAtom, { store: useStore() });

  return (
    <>
      Current state: {state}
      <GraphUploadDialog />
    </>
  );
}
