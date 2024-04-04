"use client";

import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
import { Dropzone, type DropzoneProps } from "../ui/dropzone";

type DropzoneControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues> &
  DropzoneProps;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

export function DropzoneController<TFieldValues extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  ...props
}: DropzoneControllerProps<TFieldValues>) {
  const controllerProps = { name, rules, shouldUnregister, defaultValue, control };

  const {
    field: { onChange },
  } = useController(controllerProps);

  const onUpload = props.isForFolderUpload ? noOp : onChange;
  const onFolderUpload = props.isForFolderUpload ? onChange : noOp;

  return <Dropzone {...props} id={name} onUpload={onUpload} onFolderUpload={onFolderUpload} />;
}
