export function createId(prefix?: string) {
  const base =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
  return prefix ? `${prefix}-${base}` : base;
}

