export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const hasField = <T extends { field?: unknown }>(
  col: T
): col is T & { field: string } => typeof col.field === 'string';
