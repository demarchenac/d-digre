"use client";

import { useAtomValue, useStore } from "jotai";
import { stateAtom } from "~/lib/jotai";
import { GraphUploadDialog } from "./graph-upload-dialog";

export function FloatingControls() {
  const state = useAtomValue(stateAtom, { store: useStore() });

  if (state === "no-graph") return <GraphUploadDialog />;

  return <p>Un-handled state: {state}</p>;
}
