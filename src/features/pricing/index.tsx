import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PLANS } from '@/config/plans'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface DisplayPlan extends Omit<typeof PLANS.starter, 'features'> {
  label: string;
  badge: string;
  popular?: boolean;
  features: {
    cat: string;
    items: string[];
  }[];
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const currentPlan = 'starter'

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return

    setLoadingPlan(planId)
    try {
      const data = await apiFetch('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId })
      })

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        toast.error('Erreur lors de la génération du paiement')
      }
    } catch (error: any) {
      toast.error('Une erreur est survenue')
      console.error(error)
    } finally {
      setLoadingPlan(null)
    }
  }

  const plans: DisplayPlan[] = [
    {
      ...PLANS.starter,
      label: '01 / Starter',
      badge: 'Usage personnel',
      features: [
        { cat: 'Infrastructure', items: ['1 serveur VPS', 'Monitoring CPU/RAM/Disque'] },
        { cat: 'Applications', items: ['1 application · 1 DB', 'Déploiement GitHub', 'Sous-domaine *.vpsly.tech'] },
        { cat: 'Limites', items: ['1 collaborateur', 'Pas de domaine perso'] }
      ],
    },
    {
      ...PLANS.solo,
      label: '02 / Solo',
      badge: 'Populaire',
      popular: true,
      features: [
        { cat: 'Infrastructure', items: ['2 serveurs VPS', 'Apps & DBs illimitées', 'Domaine perso + HTTPS'] },
        { cat: 'Déploiement', items: ['GitHub (déploiment standard)', 'Auto-scripts & Commandes', 'Backups manuels (G-Drive)'] },
        { cat: 'Équipe', items: ['2 collaborateurs & Rôles'] }
      ],
    },
    {
      ...PLANS.pro,
      label: '03 / Pro',
      badge: 'Infrastructure Agence',
      features: [
        { cat: 'Premium', items: ['Serveurs illimités', 'Alertes WhatsApp (24h)'] },
        { cat: 'Déploiement', items: ['GitHub Webhook (Auto-push)', 'Auto-deploy instantané'] },
        { cat: 'Sécurité & Équipe', items: ['Backups auto planifiés', '5 collaborateurs & Rôles'] }
      ],
    },
  ]

  return (
    <div className='py-6 px-4 max-w-7xl mx-auto space-y-8'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6'>
        <div>
          <h1 className='font-bebas text-5xl md:text-6xl leading-none uppercase'>Tarifs</h1>
          <p className='font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1'>
            * Serveurs non fournis.
          </p>
        </div>

        <div className='flex bg-muted/50 border border-border rounded-lg overflow-hidden p-0.5'>
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              'px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all rounded-md',
              !isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Mensuel
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              'px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all rounded-md',
              isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Annuel
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-0 border border-border rounded-[1.5rem] overflow-hidden'>
        {plans.map((plan) => {
          const displayPrice = isAnnual ? plan.price * 10 : plan.price;
          const period = isAnnual ? '/ AN' : '/ MOIS';

          return (
            <div
              key={plan.id}
              className={cn(
                'p-6 md:p-8 flex flex-col transition-all group relative border-r last:border-r-0 border-border',
                plan.popular
                  ? 'bg-primary text-primary-foreground z-10 shadow-[0_0_40px_rgba(0,0,0,0.1)]'
                  : 'bg-background hover:bg-muted/10'
              )}
            >
              <div className='flex items-center justify-between mb-6'>
                <div className={cn(
                  'px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded',
                  plan.popular ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                )}>
                  {plan.badge}
                </div>
                <div className={cn(
                  'font-mono text-[9px] uppercase tracking-[0.1em]',
                  plan.popular ? 'text-white/60' : 'text-muted-foreground'
                )}>
                  {plan.id.toUpperCase()}
                </div>
              </div>

              <h3 className='font-bebas text-4xl mb-1 uppercase tracking-tight'>{plan.name}</h3>

              <div className='flex items-baseline gap-1 mb-6'>
                <span className={cn(
                  'font-bebas text-6xl leading-none',
                  plan.popular ? 'text-white' : 'text-foreground'
                )}>
                  {displayPrice}
                </span>
                <span className={cn(
                  'font-mono text-[10px] uppercase tracking-tighter',
                  plan.popular ? 'text-white/60' : 'text-muted-foreground'
                )}>
                  $ {period}
                </span>
              </div>

              <div className={cn(
                'h-[1px] mb-6',
                plan.popular ? 'bg-white/20' : 'bg-border'
              )} />

              <div className='flex-1 space-y-4 mb-8'>
                {plan.features.map((group, idx) => (
                  <div key={idx} className='space-y-1.5'>
                    <div className={cn(
                      'text-[8px] font-mono uppercase tracking-[0.1em] font-black opacity-50',
                      plan.popular ? 'text-white' : 'text-primary'
                    )}>
                      {group.cat}
                    </div>
                    {group.items.map((item, i) => (
                      <div key={i} className='flex gap-2 items-center text-[13px] font-bold tracking-tight'>
                        <span className={cn('font-mono text-[10px]', plan.popular ? 'text-white' : 'text-primary')}>→</span>
                        <span className={plan.popular ? 'text-white/90' : 'text-muted-foreground/80'}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? 'secondary' : 'outline'}
                disabled={plan.id === currentPlan || loadingPlan !== null}
                onClick={() => handleUpgrade(plan.id)}
                className={cn(
                   'w-full py-5 font-bebas text-lg uppercase tracking-widest rounded-xl transition-all',
                   plan.popular
                     ? 'bg-white text-primary hover:bg-black hover:text-white border-white'
                     : 'border-border hover:border-primary hover:text-primary'
                )}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  plan.id === currentPlan ? 'Plan actuel' : 'Démarrer'
                )}
              </Button>
            </div>
          )
        })}
      </div>

      <div className='text-center pt-4'>
        <p className='font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]'>
          Besoin d'une offre agence ? <a href="https://wa.me/22879012470" className='text-primary border-b border-primary/30'>Contactez-nous</a>
        </p>
      </div>
    </div>
  )
}
