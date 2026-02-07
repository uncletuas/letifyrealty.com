export interface FetchJsonResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  errorText?: string;
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<FetchJsonResult<T>> {
  try {
    const response = await fetch(input, init);
    const status = response.status;
    const text = await response.text();
    if (!text) {
      return { ok: response.ok, status };
    }
    try {
      const data = JSON.parse(text) as T;
      if (!response.ok) {
        return { ok: false, status, data, errorText: (data as any)?.error ?? text };
      }
      return { ok: true, status, data };
    } catch {
      return { ok: false, status, errorText: text };
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      errorText: error instanceof Error ? error.message : String(error),
    };
  }
}
