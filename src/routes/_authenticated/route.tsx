import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { apiFetch } from '@/lib/api'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const accessToken = localStorage.getItem('vpsly_auth_token')
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // Récupérer le profil si on a le token mais qu'il manque en mémoire (cas d'un rechargement de page F5)
    const { auth } = useAuthStore.getState()
    if (!auth.user) {
      try {
        const user = await apiFetch('/user')
        auth.setUser(user)
      } catch (e) {
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        })
      }
    }
  },
  component: AuthenticatedLayout,
})
