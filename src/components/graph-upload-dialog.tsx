"use client";

import { useState } from "react";
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
  const [hasOffset, setHasOffset] = useState(false);

  const onUpload = async (files: File[]) => {
    if (!files) return;

    const [file] = files;
    if (!file) return;

    const contents = await file.text();
    const lines = contents
      .split(/\n/g)
      .map((line) => line.replace(/\r/, "").trim().replace(/\s+/g, " "))
      .filter((line) => line.trim().length > 0);

    const graph = {
      hasOffset,
      description: lines.at(0),
      sinks: lines.at(1)?.split(" ")?.map(Number),
      adjacency: lines.slice(2)?.map((row) => row.split(" ").map(Number)),
    };

    const numberOfVertexes = graph.adjacency[0]?.length ?? 0;
    const isSquared =
      graph.adjacency.length === numberOfVertexes &&
      graph.adjacency.every((weights) => weights.length === numberOfVertexes);

    if (!isSquared) {
      console.error("Graph isn't squared");
      alert("Graph isn't squared");
      return;
    }
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
              onUpload={onUpload}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="vertex-offset" checked={hasOffset} onCheckedChange={setHasOffset} />
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
