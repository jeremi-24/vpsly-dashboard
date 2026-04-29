import { createFileRoute } from '@tanstack/react-router'
import SettingsBackups from '@/features/settings/backups'

export const Route = createFileRoute('/_authenticated/settings/backups')({
  component: SettingsBackups,
})
