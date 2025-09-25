export async function parseResponse<T = any>(res: Response): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const result: { ok: boolean; status: number; data?: T; error?: string } = { ok: res.ok, status: res.status };
  const text = await res.text().catch(() => "");
  if (!text) {
    if (!res.ok) result.error = `HTTP ${res.status}`;
    return result;
  }

  try {
    const json = JSON.parse(text);
    if (res.ok) result.data = json as T;
    else result.error = (json && (json.error || json.message)) || JSON.stringify(json);
  } catch (e) {
    // not JSON
    if (res.ok) result.data = text as unknown as T;
    else result.error = text;
  }

  return result;
}
