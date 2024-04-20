"use client";

import { useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { Loader2 } from "lucide-react";
import JSZip from "jszip";
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
import { DropzoneController, SwitchController } from "~/components/rhf";
import {
  parseFileToAlgorithmMetadata,
  getRawSolutions,
  getTrimmedSolutions,
  getRawMergedSolutions,
  getTrimmedMergedSolutions,
} from "~/lib/helpers";
import { type AlgorithmMetadata, type TrimmingMethod } from "~/types";

type FormValues = {
  startsAt1: boolean;
  graphFiles: File[];
};

type DownloadableFile = {
  kind: TrimmingMethod | "raw";
  name: string;
  extension: string;
  solution: AlgorithmMetadata;
};

export function BatchUploadDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const rhfGraphUpload = useForm<FormValues>();
  const { control } = rhfGraphUpload;

  const onSubmit: SubmitHandler<FormValues> = async ({ graphFiles, startsAt1 }) => {
    if (!graphFiles) return;

    setIsLoading(true);

    const downloads: DownloadableFile[] = [];

    for (const file of graphFiles) {
      const lastDotIndex = file.name.lastIndexOf(".");
      const name = file.name.substring(0, lastDotIndex);
      const extension = file.name.substring(lastDotIndex);

      const metadata = await parseFileToAlgorithmMetadata({ file, startsAt1 });
      if (!metadata) continue;

      const { adjacency } = metadata;

      const { max, min, solutions: rawSolutions } = getRawSolutions(metadata);

      const { first, longest, map, random, shouldTrimSubgraphs } = getTrimmedSolutions({
        min,
        solutions: rawSolutions,
      });

      const rawMerged = getRawMergedSolutions({ adjacency, map, max, solutions: rawSolutions });
      const trimmedSolutions = getTrimmedMergedSolutions({
        adjacency,
        first,
        longest,
        map,
        min,
        random,
        rawSolutions,
        shouldTrimSubgraphs,
      });

      if (trimmedSolutions) {
        Object.entries(trimmedSolutions).forEach(([method, solution]) => {
          downloads.push({ kind: method as TrimmingMethod, name, extension, solution });
        });
      } else {
        downloads.push({ kind: "raw", name, extension, solution: rawMerged });
      }
    }

    const zip = new JSZip();

    downloads.forEach((download) => {
      const content = [
        download.solution.targets.join(" "),
        download.solution.encoders.join(" "),
        ...download.solution.adjacency.map((row) => row.join(" ")),
      ];

      zip.file(`${download.name}_${download.kind}${download.extension}`, content.join("\n"));
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `batch_solutions_${Date.now()}.zip`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);

    setIsLoading(false);
    rhfGraphUpload.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Batch processing</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormProvider {...rhfGraphUpload}>
          <form className="flex flex-col" onSubmit={rhfGraphUpload.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Upload Your Folder</DialogTitle>
              <DialogDescription>
                Upload a folder that contains multiple directed graph with weights as a TXT files
              </DialogDescription>
              <div className="flex flex-col pb-2 pt-4">
                <DropzoneController
                  isForFolderUpload
                  name="graphFiles"
                  description="Drag a folder to upload multiple directed graphs within it to process them"
                  accept={{ "text/plain": [] }}
                  control={control}
                />
              </div>
            </DialogHeader>
            <SwitchController
              name="startsAt1"
              label={'Targets are "1" indexed'}
              className="mt-2"
              control={control}
            />
            <DialogFooter>
              <Button type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
