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

export function formatEventTime(timeStr?: string): string {
  if (!timeStr) return "";
  let timePart = timeStr.trim();
  if (timePart.includes("T")) {
    timePart = timePart.split("T")[1].slice(0, 5);
  } else if (timePart.length > 5 && timePart.includes(":")) {
    timePart = timePart.slice(0, 5);
  }

  const parts = timePart.split(":");
  if (parts.length < 2) return timeStr;
  const hour = parseInt(parts[0], 10);
  const min = parts[1] || "00";
  if (isNaN(hour)) return timeStr;

  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}:${min} ${ampm}`;
}

export function formatEventTimeRange(startTime?: string, endTime?: string): string {
  const start = formatEventTime(startTime);
  const end = formatEventTime(endTime);
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;
  return "09:00 AM – 05:00 PM";
}
