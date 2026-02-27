import { apiRequest as baseApiRequest } from "./queryClient";

let currentToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;
}

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(errorText || res.statusText);
  }

  return res;
}

export async function apiRequestWithAuth(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(errorText || res.statusText);
  }

  return res;
}
