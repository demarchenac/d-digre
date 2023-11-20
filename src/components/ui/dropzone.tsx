"use client";

import { type ChangeEvent, useRef } from "react";
import { cn } from "~/lib/utils";
import { type MimeType, MimeTypeIcon } from "./mime-type-icon";
import { useDropzone } from "~/hooks";

export type DropzoneProps = {
  multiple?: boolean;
  className?: string;
  description?: string;
  mimeType?: MimeType;
  accept?: MimeType[];
  onUpload?: (uploads: FileList | null) => void;
};

const defaultProps: DropzoneProps = {
  multiple: false,
  className: "",
  description: "Drag Files to Upload or Click Here",
  mimeType: "text/plain",
  accept: ["*"],
  onUpload: () => {
    console.warn("Empty onUpload handler");
  },
};

export function Dropzone({
  multiple = defaultProps.multiple,
  className = defaultProps.className,
  description = defaultProps.description,
  mimeType = defaultProps.mimeType,
  accept = defaultProps.accept,
  onUpload = defaultProps.onUpload,
}: DropzoneProps = defaultProps) {
  const { acceptedFiles, rejectedFiles, getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "text/plain": [".txt", ".csv"],
    },
  });

  console.log({ acceptedFiles, rejectedFiles });

  return (
    <div
      {...getRootProps({
        className: cn(
          "w-full rounded-lg border-2 border-dashed border-gray-300 bg-muted p-8 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          className,
        ),
      })}
    >
      <MimeTypeIcon mimeType={mimeType} />
      <p className="leading-7 [&:not(:first-child)]:mt-6">{description}</p>
      <input {...getInputProps()} />
    </div>
  );
}

Dropzone.displayName = "Button";
