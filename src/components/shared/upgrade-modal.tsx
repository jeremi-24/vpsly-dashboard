import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { PLANS } from '@/config/plans'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: string
}

export function UpgradeModal({ open, onOpenChange, reason }: UpgradeModalProps) {
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  
  const handleUpgrade = async (planId: string) => {
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
    } finally {
      setLoadingPlan(null)
      onOpenChange(false)
    }
  }

  const upgradePlans = [
    {
      ...PLANS.solo,
      label: 'SOLO',
      badge: 'Populaire',
      popular: true,
      features: [
        { cat: 'Infra', items: ['2 serveurs VPS', 'Apps & DBs illimitées'] },
        { cat: 'Features', items: ['Domaine perso + HTTPS', 'Auto-scripts'] }
      ],
    },
    {
      ...PLANS.pro,
      label: 'PRO',
      badge: 'Infrastructure Agence',
      features: [
        { cat: 'Premium', items: ['Serveurs illimités', 'Auto-deploy Webhook'] },
        { cat: 'Backup', items: ['Backups auto planifiés', 'Alertes WhatsApp'] }
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border border-border rounded-none bg-background shadow-2xl">
        <div className="flex flex-col">
          
          {/* Modal Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
            <div>
              <h2 className="font-bebas text-3xl uppercase leading-none">Passez au niveau supérieur</h2>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
                {reason || "Vous avez atteint les limites de votre plan actuel."}
              </p>
            </div>
            <button onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {upgradePlans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'p-8 flex flex-col transition-all group relative border-r last:border-r-0 border-border',
                  plan.popular
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted/5'
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    'px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest rounded',
                    plan.popular ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  )}>
                    {plan.badge}
                  </div>
                </div>

                <h3 className="font-bebas text-4xl mb-1 uppercase tracking-tight leading-none">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={cn(
                    'font-bebas text-6xl leading-none',
                    plan.popular ? 'text-white' : 'text-foreground'
                  )}>
                    {plan.price}
                  </span>
                  <span className={cn(
                    'font-mono text-[10px] uppercase tracking-tighter',
                    plan.popular ? 'text-white/60' : 'text-muted-foreground'
                  )}>
                    $ / MOIS
                  </span>
                </div>

                <div className={cn(
                  'h-[1px] mb-6',
                  plan.popular ? 'bg-white/20' : 'bg-border'
                )} />

                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((group, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className={cn(
                        'text-[8px] font-mono uppercase tracking-[0.1em] font-black opacity-50',
                        plan.popular ? 'text-white' : 'text-primary'
                      )}>
                        {group.cat}
                      </div>
                      {group.items.map((item, i) => (
                        <div key={i} className="flex gap-2 items-center text-[12px] font-bold tracking-tight">
                          <span className={cn('font-mono text-[9px]', plan.popular ? 'text-white' : 'text-primary')}>→</span>
                          <span className={plan.popular ? 'text-white/90' : 'text-muted-foreground/80'}>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.popular ? 'secondary' : 'outline'}
                  disabled={loadingPlan !== null}
                  onClick={() => handleUpgrade(plan.id)}
                  className={cn(
                    'w-full py-6 font-bebas text-xl uppercase tracking-widest rounded-xl transition-all',
                    plan.popular
                      ? 'bg-white text-primary hover:bg-black hover:text-white border-white'
                      : 'border-border hover:border-primary hover:text-primary'
                  )}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Démarrer'
                  )}
                </Button>
              </div>
            ))}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
