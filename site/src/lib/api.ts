const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) { let message = `API request failed: ${response.status}`; try { const body = await response.json() as { error?: string }; message = body.error ?? message; } catch { /* non-json error */ } throw new Error(message); }
  return response.json() as Promise<T>;
}
