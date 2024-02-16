"use client";

import { useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useAtom, useSetAtom, useStore } from "jotai";
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
import { DropzoneController } from "~/components/rhf/dropzone-controller";
import { SwitchController } from "~/components/rhf/switch-controller";
import { parseFileToGraph } from "~/lib/helpers";
import { algorithmAtom, graphAtom, sourceTargetPairAtom, stateAtom } from "~/lib/jotai";

type FormValues = {
  startsAt1: boolean;
  graphFiles: File[];
};

export function GraphUploadDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const rhfGraphUpload = useForm<FormValues>();
  const [state, setState] = useAtom(stateAtom, { store: useStore() });
  const setGraph = useSetAtom(graphAtom, { store: useStore() });
  const setAlgorithm = useSetAtom(algorithmAtom, { store: useStore() });
  const setPair = useSetAtom(sourceTargetPairAtom, { store: useStore() });
  const { control } = rhfGraphUpload;

  const onSubmit: SubmitHandler<FormValues> = async ({ graphFiles, startsAt1 }) => {
    if (!graphFiles) return;

    setIsLoading(true);
    const [file] = graphFiles;
    const graph = await parseFileToGraph({ file, startsAt1 });

    setGraph(graph);
    setState("graph-loaded");
    setAlgorithm("none");
    setPair(undefined);

    setIsLoading(false);
    rhfGraphUpload.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">{state === "no-graph" ? "Import" : "Import another"} graph</Button>
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
