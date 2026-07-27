const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = `请求失败（${response.status}）`
    try {
      const body = (await response.json()) as { message?: string | string[] }
      if (typeof body.message === 'string') {
        message = body.message
      } else if (Array.isArray(body.message)) {
        message = body.message.join('、')
      }
    } catch {
      // Keep the HTTP status message when the API does not return JSON.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}
