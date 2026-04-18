export type ApiFetchInit = RequestInit & {
  json?: unknown
}

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit
): Promise<T> {
  const { json, headers, body, ...rest } = init ?? {}
  const res = await fetch(path, {
    ...rest,
    body: json !== undefined ? JSON.stringify(json) : body,
    credentials: 'include',
    headers: {
      ...(headers as Record<string, string> | undefined),
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const err = (await res.json()) as { error?: string }
      if (typeof err.error === 'string' && err.error) {
        message = err.error
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return (await res.json()) as T
  }

  return (await res.text()) as unknown as T
}
