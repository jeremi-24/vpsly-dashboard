import { Button } from '@/components/ui/button'
import { useRouter } from '@tanstack/react-router'

export function UnauthorisedError() {
  const router = useRouter()
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] text-center p-4'>
      <h1 className='text-6xl font-bold text-primary mb-4'>401</h1>
      <h2 className='text-2xl font-semibold mb-2 uppercase tracking-tight'>Non autorisé</h2>
      <p className='text-muted-foreground mb-8 max-w-md'>
        Votre session a expiré ou vous n'avez pas les droits nécessaires pour accéder à cette page.
      </p>
      <div className='flex gap-4'>
        <Button onClick={() => router.history.back()}>Retour</Button>
        <Button variant='outline' onClick={() => router.navigate({ to: '/sign-in' })}>Se connecter</Button>
      </div>
    </div>
  )
}
