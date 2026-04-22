import { createFileRoute } from '@tanstack/react-router'
import { AppDetail } from '@/features/apps/components/app-detail'

export const Route = createFileRoute('/_authenticated/apps/$appId')({
  component: AppDetail,
})
