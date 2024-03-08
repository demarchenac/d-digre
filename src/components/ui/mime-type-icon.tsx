import { Files, FolderOpen, Sheet } from "lucide-react";

const iconClasses = "h-8 w-8 text-gray-400";

export type MimeType = "*" | "text/plain" | "text/csv";

export function MimeTypeIcon({
  mimeType,
  isFolder = false,
}: {
  mimeType?: string;
  isFolder?: boolean;
}) {
  if (isFolder) return <FolderOpen className={iconClasses} />;

  switch (mimeType as MimeType) {
    case "*":
    case "text/plain":
      return <Files className={iconClasses} />;
    case "text/csv":
      return <Sheet className={iconClasses} />;

    default:
      return <Files className={iconClasses} />;
  }
}
