import { Button } from '@/components/ui/button'
import { useRouter } from '@tanstack/react-router'

export function NotFoundError() {
  const router = useRouter()
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] text-center p-4'>
      <h1 className='text-6xl font-bold text-primary mb-4'>404</h1>
      <h2 className='text-2xl font-semibold mb-2 uppercase tracking-tight'>Page introuvable</h2>
      <p className='text-muted-foreground mb-8 max-w-md'>
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Button onClick={() => router.navigate({ to: '/' })}>Retour à l'accueil</Button>
    </div>
  )
}
