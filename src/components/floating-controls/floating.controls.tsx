import { GraphControls } from "./graph-controls";
import { GraphUploadDialog } from "./graph-upload-dialog";

export function FloatingControls() {
  return (
    <aside className="absolute left-4 top-4 z-20 flex max-h-[90vh] min-w-[320px] max-w-xs flex-col gap-4 overflow-auto rounded-lg bg-background p-4 ring-1 ring-inset ring-white/10">
      <GraphUploadDialog />
      <GraphControls />
    </aside>
  );
}
