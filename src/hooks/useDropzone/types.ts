import { type mimeTypes, type extensions, type extensionsWithDot } from "./constants";

export type Extension = (typeof extensions)[number];
export type DotExtension = (typeof extensionsWithDot)[number];
export type MimeType = (typeof mimeTypes)[number];

export type PickerOptions = [
  {
    description: string;
    accept: Record<MimeType, Extension[]>;
  },
];

export type ErrorCode =
  | "file-invalid-type"
  | "file-too-large"
  | "file-too-small"
  | "too-many-files";

export type FileError = {
  message: string;
  code: ErrorCode;
};

export type FileRejection = {
  file: File;
  errors: FileError[];
};

export type FileValidator = (file: File) => FileError | FileError[] | null;

export type DropzoneState = {
  isFocused: boolean;
  isFileDialogActive: boolean;
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  acceptedFiles: File[];
  rejectedFiles: FileRejection[];
};

type DropzoneActionType =
  | "focus"
  | "blur"
  | "openDialog"
  | "closeDialog"
  | "setDraggedFiles"
  | "setFiles"
  | "reset";

export type DropzoneAction = Partial<DropzoneState> & { type: DropzoneActionType };

export type AcceptAttribute = Record<MimeType, DotExtension[]>;

export type UseDropzoneProps = {
  accept?: Partial<AcceptAttribute>;
  multiple?: boolean;
  preventDropOnDocument?: boolean;
  noClick?: boolean;
  noKeyboard?: boolean;
  noDrag?: boolean;
  noDragEventsBubbling?: boolean;
  maxFiles?: number;
  minSize?: number;
  maxSize?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  validator?: FileValidator;
  onDragEnter?: (event: React.DragEvent) => void;
  onDragLeave?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (
    accepted: File[],
    rejected: FileRejection[],
    event: React.DragEvent | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onDropAccepted?: (
    accepted: File[],
    event: React.DragEvent | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onDropRejected?: (
    rejected: FileRejection[],
    event: React.DragEvent | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onError?: (error: unknown) => void;
};

export interface FileWithPath extends File {
  readonly path?: string;
}

export type FileArray = Array<FileValue>;
export type FileValue = FileWithPath | FileArray[];
