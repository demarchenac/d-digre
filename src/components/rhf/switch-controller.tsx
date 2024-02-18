"use client";

import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

type SwitchControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues> &
  React.ComponentProps<typeof Switch> & {
    label: string;
  };

export function SwitchController<TFieldValues extends FieldValues>({
  label,
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  ...props
}: SwitchControllerProps<TFieldValues>) {
  const controllerProps = { name, rules, shouldUnregister, defaultValue, control };
  const {
    field: { value, onChange },
  } = useController(controllerProps);

  return (
    <div className="flex items-center space-x-2">
      <Switch {...props} id={name} checked={value} onCheckedChange={onChange} />
      <Label htmlFor={name}>{label}</Label>
    </div>
  );
}
