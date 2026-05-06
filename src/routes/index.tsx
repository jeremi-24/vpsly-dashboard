import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const { accessToken } = useAuthStore.getState().auth
    if (accessToken) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/sign-in' })
  },
})
