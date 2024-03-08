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

export function BatchUploadDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const rhfGraphUpload = useForm<FormValues>();
  const { control } = rhfGraphUpload;

  const onSubmit: SubmitHandler<FormValues> = ({ graphFiles }) => {
    if (!graphFiles) return;

    setIsLoading(true);
    console.log({ graphFiles });
    setIsLoading(false);
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
                />
              </div>
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
