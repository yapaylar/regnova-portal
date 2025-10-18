export function formatDate(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: string | Date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function separator(value: number): string {
  return value.toLocaleString("en-US");
}
