const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
export const TOKEN_STORAGE_KEY = "getit-session-token";

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  // Get stored session token if available
  let token: string | null = null;
  if (typeof window !== "undefined") {
    try {
      token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {}
  }

  const customHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Bypass-Tunnel-Reminder": "true",
    "bypass-tunnel-reminder": "true",
    ...(token ? { Authorization: `Bearer ${token}`, "X-Session-Token": token } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: customHeaders,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      /* non-json error (e.g. HTML from tunnel reminder) */
    }
    throw new Error(message);
  }

  const data = (await response.json()) as T;

  // Automatically save token if returned by auth endpoints
  if (
    typeof window !== "undefined" &&
    data &&
    typeof data === "object" &&
    "token" in data &&
    typeof (data as { token: unknown }).token === "string"
  ) {
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, (data as { token: string }).token);
    } catch {}
  }

  // Clear token on logout
  if (path.includes("/api/auth/logout") && typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
  }

  return data;
}
