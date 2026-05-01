import { createFileRoute } from '@tanstack/react-router'
import { TeamSettings } from '@/features/settings/team'

export const Route = createFileRoute('/_authenticated/settings/team')({
  component: TeamSettings,
})
