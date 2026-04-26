import { CreditCard, Zap, Server, Package, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Link } from '@tanstack/react-router'

export default function BillingPage() {
  const currentPlan = {
    name: 'Starter',
    appsUsed: 1,
    appsLimit: 2,
    serversUsed: 1,
    serversLimit: 1,
  }

  return (
    <div className='p-4 space-y-8 max-w-4xl'>
      <div className='flex flex-col space-y-1.5'>
        <h2 className='text-2xl font-bold tracking-tight'>Facturation</h2>
        <p className='text-muted-foreground text-sm'>
          Gérez votre abonnement et suivez votre consommation de ressources.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Usage Card */}
        <div className='p-6 rounded-2xl border bg-card/50 space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                <Zap size={18} />
              </div>
              <span className='font-bold text-sm'>Plan Actuel : {currentPlan.name}</span>
            </div>
            <Button variant='outline' size='sm' className='h-8 text-[11px] font-bold rounded-lg' asChild>
                <Link to='/pricing'>Voir les offres</Link>
            </Button>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-xs font-medium'>
                <div className='flex items-center gap-2 opacity-60'>
                  <Package size={14} />
                  <span>Applications</span>
                </div>
                <span>{currentPlan.appsUsed} / {currentPlan.appsLimit}</span>
              </div>
              <Progress value={(currentPlan.appsUsed / currentPlan.appsLimit) * 100} className='h-1.5' />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-xs font-medium'>
                <div className='flex items-center gap-2 opacity-60'>
                  <Server size={14} />
                  <span>Serveurs</span>
                </div>
                <span>{currentPlan.serversUsed} / {currentPlan.serversLimit}</span>
              </div>
              <Progress value={(currentPlan.serversUsed / currentPlan.serversLimit) * 100} className='h-1.5' />
            </div>
          </div>
        </div>

        {/* Empty State / Info Card */}
        <div className='p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center space-y-4 bg-muted/5'>
          <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center'>
            <CreditCard size={20} className='opacity-40' />
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-bold'>Aucun mode de paiement</p>
            <p className='text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed'>
              Vous utilisez actuellement la version gratuite. Ajoutez un mode de paiement pour passer à PRO.
            </p>
          </div>
          <Button variant='secondary' size='sm' className='h-8 text-[11px] font-bold rounded-lg gap-2'>
            Bientôt disponible
          </Button>
        </div>
      </div>

      <div className='p-6 rounded-2xl border bg-primary/5 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='space-y-1'>
              <p className='text-sm font-bold'>Besoin d'aide pour choisir ?</p>
              <p className='text-xs text-muted-foreground'>Découvrez notre guide comparatif complet des plans VPSLY.</p>
          </div>
          <Button size='sm' variant='ghost' className='text-[11px] font-bold gap-2' asChild>
            <Link to='/pricing'>
              Consulter le pricing <ExternalLink size={14} />
            </Link>
          </Button>
      </div>
    </div>
  )
}
