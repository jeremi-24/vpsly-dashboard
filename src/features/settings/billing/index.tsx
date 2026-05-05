import { CreditCard, Zap, Server, Package, ExternalLink, HelpCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Link } from '@tanstack/react-router'
import { PLANS, getPlanById } from '@/config/plans'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { differenceInDays } from 'date-fns'

export default function BillingPage() {
  const { user, setUser } = useAuthStore((state) => state.auth)
  
  const [payments, setPayments] = useState<any[]>([])
  const [isExpiringSoon, setIsExpiringSoon] = useState(false)

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const updatedUser = await apiFetch('/user')
        setUser(updatedUser)
        
        // Check expiration
        if (updatedUser.current_team?.expires_at) {
            const daysLeft = differenceInDays(new Date(updatedUser.current_team.expires_at), new Date())
            if (daysLeft >= 0 && daysLeft <= 3) {
                setIsExpiringSoon(true)
            }
        }
        
        // Fetch payments history
        const paymentsData = await apiFetch('/payments/history')
        setPayments(paymentsData)

        // Afficher un message de succès si on revient d'un paiement
        if (window.location.search.includes('success=true')) {
          toast.success('Félicitations ! Votre plan a été mis à jour.')
          // Nettoyer l'URL
          window.history.replaceState({}, '', window.location.pathname)
        }
      } catch (error) {
        console.error('Failed to refresh billing data', error)
      }
    }
    
    refreshUser()
  }, [setUser])

  const userPlanId = user?.current_team?.plan || 'starter'
  const plan = getPlanById(userPlanId)
  
  const usage = {
    appsUsed: user?.current_team?.applications_count || 0,
    serversUsed: user?.current_team?.servers_count || 0,
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

      {isExpiringSoon && userPlanId !== 'starter' && (
          <div className='p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500'>
              <div className='flex items-center gap-3'>
                  <AlertTriangle className='text-amber-600' size={20} />
                  <div>
                      <p className='text-sm font-bold text-amber-900 dark:text-amber-400'>Attention : Expiration imminente</p>
                      <p className='text-xs text-amber-700/80 dark:text-amber-400/60'>Votre abonnement se termine dans moins de 3 jours. Renouvelez-le pour éviter toute interruption.</p>
                  </div>
              </div>
              <Button size='sm' className='bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs' asChild>
                  <Link to='/pricing'>Renouveler maintenant</Link>
              </Button>
          </div>
      )}

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
                <p className='text-sm font-bold'>Abonnement</p>
                <p className='text-xs text-muted-foreground'>
                  {userPlanId === 'starter' 
                    ? 'Aucune facture en attente pour le plan Starter.' 
                    : `Expire le : ${user?.current_team?.expires_at ? new Date(user.current_team.expires_at).toLocaleDateString() : 'Non défini'}`}
                </p>
            </div>
        </div>
      </div>

      {/* Historique des paiements */}
      <div className='space-y-4'>
        <h3 className='text-lg font-bold'>Historique des paiements</h3>
        <div className='rounded-3xl border bg-card/50 overflow-hidden shadow-sm'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-muted/50 text-[10px] font-black uppercase tracking-widest opacity-60'>
              <tr>
                <th className='px-6 py-4'>Plan</th>
                <th className='px-6 py-4'>Montant</th>
                <th className='px-6 py-4'>Date</th>
                <th className='px-6 py-4 text-right'>Référence</th>
              </tr>
            </thead>
            <tbody className='divide-y border-t'>
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='px-6 py-4 font-bold uppercase text-[12px]'>{p.plan}</td>
                    <td className='px-6 py-4 font-mono text-xs'>{p.amount} {p.currency}</td>
                    <td className='px-6 py-4 text-muted-foreground text-xs'>{new Date(p.paid_at).toLocaleDateString()}</td>
                    <td className='px-6 py-4 text-right font-mono text-[10px] opacity-50'>{p.reference}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className='px-6 py-8 text-center text-muted-foreground italic text-xs'>
                    Aucune transaction trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
