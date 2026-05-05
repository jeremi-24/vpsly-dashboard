import { create } from 'zustand'

const STORAGE_KEY = 'vpsly_auth_token'

interface AuthUser {
  id: number
  name: string
  email: string
  avatar?: string
  phone?: string
  current_team_id?: number
  current_team?: {
    id: number
    name: string
    owner_id: number
    plan: 'starter' | 'solo' | 'pro'
    subscription_status: string
    last_payment_at?: string
    expires_at?: string
    applications_count?: number
    servers_count?: number
    databases_count?: number
  }
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string | null
    setAccessToken: (accessToken: string | null) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = localStorage.getItem(STORAGE_KEY)

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          if (accessToken) {
            localStorage.setItem(STORAGE_KEY, accessToken)
          } else {
            localStorage.removeItem(STORAGE_KEY)
          }
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      reset: () =>
        set((state) => {
          localStorage.removeItem(STORAGE_KEY)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: null },
          }
        }),
    },
  }
})
