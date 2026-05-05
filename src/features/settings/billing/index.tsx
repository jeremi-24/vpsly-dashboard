import { CreditCard, Zap, Server, Package, ExternalLink, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Link } from '@tanstack/react-router'
import { PLANS, getPlanById } from '@/config/plans'

export default function BillingPage() {
  // En attendant l'intégration API réelle, on simule les données utilisateur
  const userPlanId = 'starter' 
  const plan = getPlanById(userPlanId)
  
  const usage = {
    appsUsed: 1,
    serversUsed: 1,
  }

  const getUsagePercentage = (used: number, max: number) => {
    if (max === -1) return 0;
    return (used / max) * 100;
  }

  const formatLimit = (limit: number) => limit === -1 ? 'Illimité' : limit;

  return (
    <div className='p-4 space-y-8 max-w-4xl'>
      <div className='flex flex-col space-y-1.5'>
        <h2 className='text-2xl font-bold tracking-tight'>Facturation</h2>
        <p className='text-muted-foreground text-sm'>
          Gérez votre abonnement et suivez votre consommation de ressources.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Plan Actuel Card */}
        <div className='p-6 rounded-3xl border bg-card/50 space-y-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-3 rounded-2xl bg-primary/10 text-primary'>
                <Zap size={20} className='fill-current' />
              </div>
              <div>
                <p className='text-xs font-black uppercase tracking-widest opacity-40'>Plan Actuel</p>
                <h3 className='font-bold text-lg'>{plan.name}</h3>
              </div>
            </div>
            <Button variant='outline' size='sm' className='h-9 rounded-xl font-bold text-xs' asChild>
                <Link to='/pricing'>Changer de plan</Link>
            </Button>
          </div>

          <div className='h-px bg-border' />

          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-[11px] font-black uppercase tracking-wider'>
                <div className='flex items-center gap-2 opacity-50'>
                  <Package size={14} />
                  <span>Applications</span>
                </div>
                <span>{usage.appsUsed} / {formatLimit(plan.maxApps)}</span>
              </div>
              <Progress value={getUsagePercentage(usage.appsUsed, plan.maxApps)} className='h-2' />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-[11px] font-black uppercase tracking-wider'>
                <div className='flex items-center gap-2 opacity-50'>
                  <Server size={14} />
                  <span>Serveurs</span>
                </div>
                <span>{usage.serversUsed} / {formatLimit(plan.maxServers)}</span>
              </div>
              <Progress value={getUsagePercentage(usage.serversUsed, plan.maxServers)} className='h-2' />
            </div>
          </div>
        </div>

        {/* Facturation Infos */}
        <div className='p-6 rounded-3xl border border-dashed bg-muted/30 flex flex-col justify-center items-center text-center space-y-4'>
            <div className='p-4 rounded-full bg-background border'>
                <CreditCard size={24} className='opacity-20' />
            </div>
            <div className='space-y-1'>
                <p className='text-sm font-bold'>Prochaine facturation</p>
                <p className='text-xs text-muted-foreground'>Aucune facture en attente pour le plan Starter.</p>
            </div>
        </div>
      </div>

      <div className='p-6 rounded-3xl border bg-primary/5 border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex items-center gap-4'>
              <div className='p-3 rounded-2xl bg-primary/10 text-primary'>
                <HelpCircle size={20} />
              </div>
              <div className='space-y-1'>
                  <p className='text-sm font-bold'>Besoin d'un plan sur mesure ?</p>
                  <p className='text-xs text-muted-foreground'>Vous gérez plus de 10 serveurs ? Contactez-nous pour une offre agence personnalisée.</p>
              </div>
          </div>
          <Button size='sm' variant='secondary' className='rounded-xl font-bold gap-2' asChild>
            <a href="https://wa.me/22879012470" target="_blank" rel="noreferrer">
              Nous contacter <ExternalLink size={14} />
            </a>
          </Button>
      </div>
    </div>
  )
}
