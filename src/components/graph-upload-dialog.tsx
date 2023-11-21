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
import { range } from "~/lib/helpers";
import { SwitchController } from "./rhf/switch-controller";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { DropzoneController } from "./rhf/dropzone-controller";
import { useState } from "react";

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

type FormValues = {
  startsAt1: boolean;
  graphFiles: File[];
};

export function GraphUploadDialog() {
  const [open, setOpen] = useState(false);
  const rhfGraphUpload = useForm<FormValues>();
  const { control } = rhfGraphUpload;

  const onSubmit: SubmitHandler<FormValues> = async ({ graphFiles, startsAt1 }) => {
    if (!graphFiles) return;

    const [file] = graphFiles;
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
    rhfGraphUpload.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Import Graph</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...rhfGraphUpload}>
          <form className="flex flex-col" onSubmit={rhfGraphUpload.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Upload Graph</DialogTitle>
              <DialogDescription>
                Upload your directed graph with weights as a CSV file
              </DialogDescription>
              <div className="flex flex-col pb-2 pt-4">
                <DropzoneController
                  name="graphFiles"
                  description="Drag a file to upload your directed graph with weights"
                />
              </div>
              <SwitchController name="startsAt1" label={'Nodes starts at "1"'} control={control} />
            </DialogHeader>
            <DialogFooter>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
