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
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

export function GraphUploadDialog() {
  const onUpload = async (files: FileList | null) => {
    if (!files) return;

    const file = files.item(0);
    if (!file) return;

    const contents = await file.text();
    const lines = contents
      .split(/\n/g)
      .map((line) => line.replace(/\r/, "").trim().replace(/\s+/g, " "));

    const graph = {
      description: lines.at(0),
      sinks: lines.at(1)?.split(" ")?.map(Number),
      adjacency: lines.slice(2)?.map((row) => row.split(" ").map(Number)),
    };

    console.log(graph);
  };

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
              description="Drag a file to upload your directed graph with weights"
              mimeType="text/plain"
              accept={["text/plain"]}
              onUpload={onUpload}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="vertex-offset" />
            <Label htmlFor="vertex-offset">Offset vertex index by 1</Label>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
