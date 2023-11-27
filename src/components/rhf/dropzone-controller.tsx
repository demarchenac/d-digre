"use client";

import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
import { Dropzone, type DropzoneProps } from "../ui/dropzone";

type DropzoneControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues> &
  DropzoneProps;

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

  return <Dropzone {...props} id={name} onUpload={onChange} />;
}
