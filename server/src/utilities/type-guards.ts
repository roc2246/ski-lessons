export function getRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

export function getErrorStatus(error: unknown, fallback = 500): number {
  const record = getRecord(error);
  const status = record?.status;
  return Number.isInteger(status) ? Number(status) : fallback;
}

export function hasErrorName(error: unknown): error is { name: string } {
  const record = getRecord(error);
  return typeof record?.name === "string";
}