import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDocFilename(urlOrName?: string | null): string {
  if (!urlOrName) return "";
  if (urlOrName.startsWith("data:image/")) {
    const subtype = urlOrName.split(";")[0].split("/")[1] || "jpg";
    return `Uploaded_ID_Photo.${subtype}`;
  }
  if (urlOrName.startsWith("data:application/pdf")) {
    return "Uploaded_ID_Proof.pdf";
  }
  if (urlOrName.startsWith("data:")) {
    return "Uploaded_Document.file";
  }
  if (urlOrName.startsWith("http://") || urlOrName.startsWith("https://") || urlOrName.startsWith("blob:")) {
    const last = urlOrName.split("/").pop();
    return last ? last.split("?")[0] : "Submitted_Document";
  }
  return urlOrName.replace(/^mock:\/\//, "");
}
