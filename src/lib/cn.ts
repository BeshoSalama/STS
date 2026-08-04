type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined>;

export function cn(...values: ClassValue[]) {
  const classes: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
    } else {
      for (const key in value) {
        if (value[key]) classes.push(key);
      }
    }
  }
  return classes.join(" ");
}
