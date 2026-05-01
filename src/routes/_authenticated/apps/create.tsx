import { createFileRoute } from '@tanstack/react-router'
import CreateAppPage from '@/features/apps/pages/create-app-page'

export const Route = createFileRoute('/_authenticated/apps/create')({
  component: CreateAppPage,
})
