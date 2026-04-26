import { useState } from 'react'
import { Check, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const currentPlan = 'starter'

  const plans = [
    {
      id: 'starter',
      name: 'Starter plan',
      price: '0',
      description: 'Idéal pour tester et lancer vos premiers projets.',
      features: [
        '1 Serveur connecté',
        '2 Applications actives',
        'Déploiement Git → Online',
        'Logs & Console en direct',
        'Domaine auto (*.sslip.io)',
        'Installation manuelle DB',
      ],
    },
    {
      id: 'pro',
      name: 'Pro plan',
      price: isAnnual ? '65 000' : '6 500',
      period: isAnnual ? '/ an' : '/ mois',
      description: 'La puissance et la rapidité pour les freelances.',
      popular: true,
      features: [
        '3 Serveurs connectés',
        '15 Applications production',
        'App + Base de données en 1 clic',
        'Domaines personnalisés + HTTPS',
        'Rollback instantané',
        'Support email prioritaire',
      ],
    },
    {
      id: 'business',
      name: 'Business plan',
      price: isAnnual ? '250 000' : '25 000',
      period: isAnnual ? '/ an' : '/ mois',
      description: 'L\'infrastructure complète pour votre agence.',
      features: [
        'Serveurs illimités',
        'Applications illimitées',
        'Backups automatiques',
        'Monitoring & Alertes WhatsApp',
        'Équipe (jusqu\'à 5 collaborateurs)',
        'Support dédié 24/7',
      ],
    },
  ]

  return (
    <div className='py-20 px-4 max-w-6xl mx-auto space-y-12'>
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-black tracking-tight'>Des prix simples, sans surprise.</h1>
        <p className='text-muted-foreground'>Choisissez le plan qui correspond à votre ambition.</p>
      </div>

      {/* Header & Toggle */}
      <div className='flex flex-col items-center space-y-4'>
        <div className='flex p-1 bg-muted/40 rounded-full w-fit border shadow-sm'>
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              'px-6 py-2 rounded-full text-xs font-bold transition-all',
              !isAnnual ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Mensuel
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              'px-6 py-2 rounded-full text-xs font-bold transition-all',
              isAnnual ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Annuel
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className='flex flex-col rounded-3xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden'
          >
            {/* Top Section */}
            <div className='p-8 space-y-6 relative'>
              {plan.popular && (
                <div className='absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter'>
                  Populaire
                </div>
              )}
              
              <div className='space-y-1'>
                <h3 className='font-bold text-lg tracking-tight'>{plan.name}</h3>
                <div className='flex items-baseline gap-1'>
                  <span className='text-5xl font-black tracking-tighter'>
                    {plan.id === 'starter' ? '0' : plan.price}
                  </span>
                  <div className='flex flex-col -space-y-1'>
                    <span className='text-xs font-black opacity-30 uppercase'>FCFA</span>
                    {plan.id !== 'starter' && <span className='text-xs opacity-30 font-bold'>{plan.period}</span>}
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className={cn(
                  'w-full py-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all',
                  plan.id === currentPlan
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {plan.id === currentPlan ? 'Plan actuel' : 'Démarrer maintenant'}
              </Button>
            </div>

            <div className='h-px bg-border mx-8' />

            {/* Features Section */}
            <div className='p-8 flex-1 flex flex-col space-y-6 bg-muted/5'>
              <div className='space-y-1'>
                <p className='text-xs font-black uppercase tracking-[0.2em] opacity-40'>Inclus</p>
                <p className='text-sm text-muted-foreground font-medium'>
                   {plan.id === 'starter' ? 'Pour découvrir VPSLY...' : `Tout de ${plans[plans.indexOf(plan)-1]?.name} plus...`}
                </p>
              </div>

              <div className='space-y-4'>
                {plan.features.map((feature, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <div className='h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0'>
                      <Check className='h-3 w-3 text-primary-foreground' />
                    </div>
                    <span className='text-sm font-bold tracking-tight'>{feature}</span>
                  </div>
                ))}
                
                {plan.notIncluded?.map((feature, i) => (
                  <div key={i} className='flex items-center gap-3 opacity-20'>
                    <div className='h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0'>
                      <Minus className='h-3 w-3' />
                    </div>
                    <span className='text-sm font-medium line-through tracking-tight'>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
