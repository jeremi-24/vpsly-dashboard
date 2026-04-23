import { createFileRoute } from '@tanstack/react-router'
import { DatabaseDetail } from '@/features/databases/components/database-detail'

export const Route = createFileRoute('/_authenticated/databases/$databaseId')({
  component: DatabaseDetail,
})
