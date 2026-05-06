import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/help-center')({
  component: HelpRoute,
})

function HelpRoute() {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <h1 className='text-2xl font-bold'>Centre d'Aide</h1>
      <p className='text-muted-foreground'>Bientôt disponible.</p>
    </div>
  )
}
