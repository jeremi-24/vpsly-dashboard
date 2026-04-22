const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('vpsly_auth_token')

  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },

  })

  if (res.status === 401) {
    localStorage.removeItem('vpsly_auth_token')
    window.location.href = '/sign-in'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'API error' }))
    const error = new Error(data.error || data.message || 'API error') as any
    error.status = res.status
    console.error('API ERROR:', data)
    throw error
  }

  return res.json()
}
