import { Files, Sheet } from "lucide-react";

const iconClasses = "h-8 w-8 text-gray-400";

export type MimeType = "*" | "text/plain" | "text/csv";

export function MimeTypeIcon({ mimeType }: { mimeType?: string }) {
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
