import { BatchUploadDialog } from "./batch-upload-dialog";

export function BatchFloatingControls() {
  return (
    <aside className="absolute right-4 top-20 z-20 flex max-h-[90vh] min-w-[200px] max-w-xs flex-col gap-4 overflow-auto rounded-lg bg-background p-4 ring-1 ring-inset ring-white/10">
      <BatchUploadDialog />
    </aside>
  );
}
