import { Button } from '@/components/ui/button'
import { useRouter } from '@tanstack/react-router'

export function GeneralError() {
  const router = useRouter()
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] text-center p-4'>
      <h1 className='text-6xl font-bold text-primary mb-4'>500</h1>
      <h2 className='text-2xl font-semibold mb-2 uppercase tracking-tight'>Erreur serveur</h2>
      <p className='text-muted-foreground mb-8 max-w-md'>
        Une erreur inattendue s'est produite. Nos ingénieurs ont été prévenus.
      </p>
      <Button onClick={() => window.location.reload()}>Réessayer</Button>
    </div>
  )
}
