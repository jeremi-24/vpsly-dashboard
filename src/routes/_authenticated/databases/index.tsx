import { createFileRoute } from '@tanstack/react-router'
import { Databases } from '@/features/databases'

export const Route = createFileRoute('/_authenticated/databases/')({
  component: Databases,
})
