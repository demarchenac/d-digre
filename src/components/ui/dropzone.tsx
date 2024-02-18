"use client";

import { cn } from "~/lib/utils";
import { type AcceptAttribute, useDropzone } from "~/hooks";
import { MimeTypeIcon } from "./mime-type-icon";

export type DropzoneProps = {
  multiple?: boolean;
  id?: string;
  className?: string;
  description?: string;
  accept?: Partial<AcceptAttribute>;
  onUpload?: (files: File[]) => void;
};

const defaultProps: DropzoneProps = {
  multiple: false,
  className: "",
  description: "Drag Files to Upload or Click Here",
  accept: { "text/plain": [".txt", ".csv"] },
  onUpload: () => {
    console.warn("Empty onUpload handler");
  },
};

export function Dropzone({
  id,
  multiple = defaultProps.multiple,
  className = defaultProps.className,
  description = defaultProps.description,
  accept = defaultProps.accept,
  onUpload = defaultProps.onUpload,
}: DropzoneProps = defaultProps) {
  const {
    acceptedFiles: accepted,
    getRootProps,
    getInputProps,
  } = useDropzone({ multiple, accept, onDrop: onUpload });
  const [file] = accepted;
  const [mime] = Object.keys(accept ?? {});

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
        <MimeTypeIcon mimeType={mime} />
        {!multiple && file && <p className="text-sm text-muted-foreground">{file.name}</p>}
      </div>
      <p className="leading-7 [&:not(:first-child)]:mt-6">{description}</p>
      <input {...getInputProps()} />
    </div>
  );
}

Dropzone.displayName = "Button";
