"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Dropzone } from "~/components/ui/dropzone";

export function GraphUploadDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Import Graph</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Graph</DialogTitle>
          <DialogDescription>
            Upload your directed graph with weights as a CSV file
          </DialogDescription>
          <div className="flex flex-col pb-2 pt-4">
            <Dropzone
              description="Drag a CSV file to upload your directed graph with weights"
              mimeType="text/csv"
              accept={["text/csv"]}
              onUpload={(files) => {
                console.log({ files });
              }}
            />
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
