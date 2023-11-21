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
import { range } from "~/lib/helpers";

type Node = {
  id: number;
  outgoing: number[];
  incoming: number[];
};

type Link = {
  source: number;
  target: number;
  weight: number;
};

export function GraphUploadDialog() {
  const [startsAt1, setStartsAt1] = useState(false);

  const onUpload = async (files: File[]) => {
    if (!files) return;

    const [file] = files;
    if (!file) return;

    const contents = await file.text();
    const lines = contents
      .split(/\n/g)
      .map((line) => line.replace(/\r/, "").trim().replace(/\s+/g, " "))
      .filter((line) => line.trim().length > 0);

    const metadata = {
      startsAt1,
      description: lines.at(0),
      source: startsAt1 ? 1 : 0,
      sinks: lines.at(1)?.split(" ")?.map(Number),
      adjacency: lines.slice(2)?.map((row) => row.split(" ").map(Number)),
    };

    const numberOfVertexes = metadata.adjacency[0]?.length ?? 0;
    const isSquared =
      metadata.adjacency.length === numberOfVertexes &&
      metadata.adjacency.every((weights) => weights.length === numberOfVertexes);

    if (!isSquared) {
      console.error("Graph isn't squared");
      alert("Graph isn't squared");
      return;
    }

    const increment = metadata.startsAt1 ? 1 : 0;
    const nodeList = range(0 + increment, metadata.adjacency.length + increment);

    const nodes: Node[] = nodeList.map((node) => ({
      id: node,
      outgoing: [],
      incoming: [],
    }));

    const links: Link[] = [];
    nodeList.forEach((source) =>
      nodeList.forEach((target) => {
        const link = {
          source,
          target,
          weight: metadata.adjacency[source - increment]?.[target - increment] ?? 0,
        };
        if (link.weight > 0) links.push(link);
      }),
    );

    links.forEach(({ source, target }) => {
      nodes[source - increment]?.outgoing.push(target);
      nodes[target - increment]?.incoming.push(source);
    });

    const graph = {
      ...metadata,
      nodes,
      links,
    };

    console.log({ graph });
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
            <Switch id="vertex-offset" checked={startsAt1} onCheckedChange={setStartsAt1} />
            <Label htmlFor="vertex-offset">Nodes start at &quot;1&quot;</Label>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
