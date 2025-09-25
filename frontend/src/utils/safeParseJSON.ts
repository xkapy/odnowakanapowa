// Safely parse a JSON string. Returns null on invalid input or parse errors.
export function safeParseJSON<T = any>(value: string | null | undefined): T | null {
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return null;
  }
}
