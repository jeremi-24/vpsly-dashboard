import { Button } from '@/components/ui/button'

export function MaintenanceError() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] text-center p-4'>
      <h1 className='text-6xl font-bold text-primary mb-4'>503</h1>
      <h2 className='text-2xl font-semibold mb-2 uppercase tracking-tight'>Maintenance</h2>
      <p className='text-muted-foreground mb-8 max-w-md'>
        VPSly est actuellement en maintenance pour s'améliorer. Nous serons de retour dans quelques instants.
      </p>
      <Button variant='outline' onClick={() => window.location.reload()}>Vérifier à nouveau</Button>
    </div>
  )
}
