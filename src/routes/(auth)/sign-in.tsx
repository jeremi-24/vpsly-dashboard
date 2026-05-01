import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn2 } from '@/features/auth/sign-in/sign-in-2'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: () => {
    const accessToken = localStorage.getItem('vpsly_auth_token')
    if (accessToken) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SignIn2,
  validateSearch: searchSchema,
})
