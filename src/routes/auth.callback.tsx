import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { apiFetch } from '@/lib/api'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      navigate({ to: '/sign-in', replace: true })
      return
    }

    // 1. Stocker AVANT tout pour que les route guards puissent le voir
    localStorage.setItem('vpsly_auth_token', token)
    auth.setAccessToken(token)

    // 2. Nettoyer l'URL (query params) sans changer le chemin pour viter le "flash" vers sign-in
    window.history.replaceState({}, document.title, window.location.pathname)

    // 3. Fetch user profile
    apiFetch('/user')
      .then((user) => {
        auth.setUser(user)
        // Redirection vers le Dashboard une fois le profil charg
        navigate({ to: '/', replace: true })
      })
      .catch((err) => {
        console.error('Auth sync failed:', err)
        auth.reset()
        navigate({ to: '/sign-in', replace: true })
      })
  }, [])

  return (
    <div className='flex h-screen w-full items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
        <div className='text-center'>
          <h1 className='text-xl font-semibold text-foreground'>Authenticating...</h1>
          <p className='text-sm text-muted-foreground'>Securing your session, please wait.</p>
        </div>
      </div>
    </div>
  )
}
