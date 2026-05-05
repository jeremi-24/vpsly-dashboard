import React from 'react'
import { Lock, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { getPlanById } from '@/config/plans'

interface PlanLockProps {
  children: React.ReactNode
  requiredPlan?: 'starter' | 'solo' | 'pro'
  featureName?: string
  checkQuota?: 'apps' | 'servers' | 'databases'
  className?: string
  showFullOverlay?: boolean
  isLocked?: boolean // Manual override
}

export function PlanLock({ 
  children, 
  requiredPlan = 'starter', 
  featureName,
  checkQuota,
  className,
  showFullOverlay = true,
  isLocked: manualIsLocked
}: PlanLockProps) {
  const { user } = useAuthStore((state) => state.auth)
  const currentTeam = user?.current_team
  const userPlanId = currentTeam?.plan || 'starter'
  
  const planWeights = { starter: 0, solo: 1, pro: 2 }
  const isPlanInsufficient = planWeights[userPlanId] < planWeights[requiredPlan]
  
  // Quota check
  const planLimits = getPlanById(userPlanId)
  let isQuotaExceeded = false
  
  if (checkQuota === 'apps' && planLimits.maxApps !== -1) {
    isQuotaExceeded = (currentTeam?.applications_count || 0) >= planLimits.maxApps
  }
  
  if (checkQuota === 'servers' && planLimits.maxServers !== -1) {
    isQuotaExceeded = (currentTeam?.servers_count || 0) >= planLimits.maxServers
  }

  if (checkQuota === 'databases' && planLimits.maxDatabases !== -1) {
    isQuotaExceeded = (currentTeam?.databases_count || 0) >= planLimits.maxDatabases
  }

  const isLocked = manualIsLocked !== undefined ? manualIsLocked : (isPlanInsufficient || isQuotaExceeded)

  if (!isLocked) return <>{children}</>

  return (
    <div className={cn("relative group", className)}>
      {/* The content is rendered but blurred/disabled */}
      <div className="opacity-40 grayscale-[0.8] pointer-events-none blur-[1px]">
        {children}
      </div>

      {/* Premium Lock Overlay */}
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-background/10 backdrop-blur-[2px] transition-all duration-300",
        !showFullOverlay && "bg-transparent"
      )}>
        <div className="bg-background/80 border border-white/10 p-4 rounded-3xl shadow-2xl space-y-4 max-w-[280px] animate-in zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto ring-4 ring-amber-500/5">
            {isPlanInsufficient ? <Crown className="text-amber-500 h-6 w-6" /> : <Lock className="text-amber-500 h-6 w-6" />}
          </div>
          
          <div className="space-y-1">
            <h4 className="text-sm font-bold tracking-tight">
              {isPlanInsufficient ? `Plan ${requiredPlan.toUpperCase()} Requis` : 'Limite Atteinte'}
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isPlanInsufficient 
                ? `La fonctionnalité ${featureName || 'avancée'} n'est pas disponible dans votre offre actuelle.` 
                : `Vous avez atteint le maximum de ${checkQuota === 'apps' ? 'applications' : 'serveurs'} pour votre plan ${userPlanId.toUpperCase()}.`}
            </p>
          </div>

          <Button size="sm" className="w-full h-9 rounded-xl font-bold text-xs gap-2" asChild>
            <Link to="/pricing">
              Passer au plan supérieur
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
