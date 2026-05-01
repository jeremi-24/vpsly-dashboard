import { createFileRoute } from '@tanstack/react-router'
import { HelpCenter } from '@/features/help/components/help-center'

export const Route = createFileRoute('/_authenticated/help-center')({
  component: HelpRoute,
})

function HelpRoute() {
  return <HelpCenter />
}
