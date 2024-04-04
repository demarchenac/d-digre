"use client";

import { cn } from "~/lib/utils";
import {
  useDropzone,
  type Accept,
  type DropzoneInputProps as InitialDropzoneInputProps,
  type DropEvent,
} from "react-dropzone";
import { MimeTypeIcon } from "./mime-type-icon";
import { useState } from "react";
import { processFolderUpload } from "~/lib/helpers";
import { type FileWithFolder, type FileDTO } from "~/types";

type DropzoneInputProps = InitialDropzoneInputProps & { webkitdirectory: string };

export type DropzoneProps = {
  multiple?: boolean;
  isForFolderUpload?: boolean;
  id?: string;
  className?: string;
  description?: string;
  accept?: Accept;
  onUpload?: (files: File[]) => void;
  onFolderUpload?: (files: File[]) => void;
};

const defaultProps: DropzoneProps = {
  multiple: false,
  isForFolderUpload: false,
  className: "",
  description: "Drag Files to Upload or Click Here",
  accept: { "text/plain": [".txt", ".csv"] },
  onUpload: () => {
    console.warn("Empty onUpload handler");
  },
  onFolderUpload: () => {
    console.warn("Empty onFolderUpload handler");
  },
};

export function Dropzone({
  id,
  multiple = defaultProps.multiple,
  isForFolderUpload = defaultProps.isForFolderUpload,
  className = defaultProps.className,
  description = defaultProps.description,
  accept = defaultProps.accept,
  onUpload: onDropzoneUpload = defaultProps.onUpload,
  onFolderUpload = defaultProps.onFolderUpload,
}: DropzoneProps = defaultProps) {
  const [directoryFiles, setDirectoryFiles] = useState<FileDTO[]>([]);

  const handleFolderUpload = (event: DropEvent) =>
    processFolderUpload(event, {
      onUpload: (files) => {
        setDirectoryFiles(files);
        onFolderUpload?.(files as File[]);
      },
    });

  const handleDefaultUpload = async (event: DropEvent): Promise<FileDTO[]> => {
    const fileHandles = event as unknown as FileSystemFileHandle[];
    return Promise.all(fileHandles.map((handle) => handle.getFile()));
  };

  const {
    acceptedFiles: accepted,
    getRootProps,
    getInputProps,
  } = useDropzone({
    accept,
    multiple,
    onDrop: onDropzoneUpload,
    useFsAccessApi: !isForFolderUpload,
    getFilesFromEvent: isForFolderUpload ? handleFolderUpload : handleDefaultUpload,
  });

  const selectedFiles = (isForFolderUpload ? directoryFiles : accepted) as File[];
  const [file] = selectedFiles;
  const [mime] = Object.keys(accept ?? {});

  const files = selectedFiles.length;
  const folder = isForFolderUpload && file ? (file as FileWithFolder).folder : null;
  const props = isForFolderUpload
    ? ({ webkitdirectory: "true" } as DropzoneInputProps)
    : ({} as DropzoneInputProps);

  return (
    <div
      {...getRootProps({
        id,
        className: cn(
          "cursor-pointer w-full rounded-lg border-2 border-dashed border-gray-300 bg-muted p-8 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          className,
        ),
      })}
    >
      <div className="flex items-center justify-center gap-2">
        <MimeTypeIcon mimeType={mime} isFolder={isForFolderUpload} />
        {!multiple && !isForFolderUpload && file && (
          <p className="text-sm text-muted-foreground">{file.name}</p>
        )}
        {folder && (
          <p className="text-sm text-muted-foreground">
            {folder} ({files})
          </p>
        )}
      </div>
      <p className="leading-7 [&:not(:first-child)]:mt-6">{description}</p>
      <input {...getInputProps({ ...props })} />
    </div>
  );
}

Dropzone.displayName = "Dropzone";
