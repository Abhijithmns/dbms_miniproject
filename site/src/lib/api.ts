const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) { let message = `API request failed: ${response.status}`; try { const body = await response.json() as { error?: string }; message = body.error ?? message; } catch { /* non-json error */ } throw new Error(message); }
  return response.json() as Promise<T>;
}
