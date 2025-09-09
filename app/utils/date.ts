export const formatDate = (date: Date | null): string => {
  if (!date) return "--.--.----";
  return date
    .toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, ".");
};
