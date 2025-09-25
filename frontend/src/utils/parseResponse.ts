// Safe response parser: handles empty bodies and non-JSON text without throwing
export async function parseResponse(response: Response) {
  try {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      // Return raw text when it's not JSON
      return { text };
    }
  } catch (e) {
    return {};
  }
}
