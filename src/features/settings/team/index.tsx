import { useAuthStore } from '@/stores/auth-store'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import * as React from 'react'
import { Link, Loader2, LogOut, Trash2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getPlanById } from '@/config/plans'
import { UpgradeModal } from '@/components/shared/upgrade-modal'
import { cn } from '@/lib/utils'

interface Member {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

const avatarColors = [
  'bg-violet-200 text-violet-800',
  'bg-zinc-800 text-zinc-100',
  'bg-amber-200 text-amber-800',
  'bg-blue-200 text-blue-800',
  'bg-emerald-200 text-emerald-800',
  'bg-rose-200 text-rose-800',
]

export function TeamSettings() {
  const { user } = useAuthStore(state => state.auth)
  const [members, setMembers] = React.useState<Member[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isInviting, setIsInviting] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false)

  const team = user?.current_team
  const plan = team ? getPlanById(team.plan) : null
  const maxTeamMembers = plan?.maxTeamMembers || 1
  const isLocked = maxTeamMembers !== -1 && members.length >= maxTeamMembers

  const fetchMembers = async () => {
    if (!user?.current_team_id) return
    try {
      setLoading(true)
      const data = await apiFetch<Member[]>(`/teams/${user.current_team_id}/members`)
      setMembers(data)
    } catch {
      toast.error('Échec du chargement des membres')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchMembers()
  }, [user?.current_team_id])

  const handleInvite = async () => {
    try {
      setIsInviting(true)
      const res = await apiFetch<any>('/teams/invitations', {
        method: 'POST',
        body: JSON.stringify({ team_id: user?.current_team_id })
      })
      if (res.invitation_url) {
        await navigator.clipboard.writeText(res.invitation_url)
        toast.success('Lien d\'invitation copié !', {
          description: 'Partagez ce lien avec votre membre.'
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Seul le propriétaire peut inviter des membres')
    } finally {
      setIsInviting(false)
    }
  }

  const removeMember = async (memberId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return
    try {
      await apiFetch(`/teams/${user?.current_team_id}/members/${memberId}`, {
        method: 'DELETE'
      })
      toast.success('Membre retiré')
      setMembers(prev => prev.filter(m => m.id !== memberId))
    } catch {
      toast.error('Échec du retrait du membre')
    }
  }

  const handleLeave = async () => {
    if (!confirm('Quitter cet espace ? Vous perdrez l\'accès à tous les projets partagés.')) return
    try {
      setIsLeaving(true)
      await apiFetch(`/teams/${user?.current_team_id}/leave`, { method: 'DELETE' })
      toast.success('Vous avez quitté l\'équipe')
      window.location.href = '/'
    } catch {
      toast.error('Impossible de quitter l\'équipe')
    } finally {
      setIsLeaving(false)
    }
  }

  // Source de vérité : le rôle pivot retourné par l'API, pas le store (potentiellement stale)
  const isOwner = members.find(m => m.id === user?.id)?.role === 'owner'

  return (
    <div className='space-y-8'>

      {/* Header */}
      <div>
        <h2 className='text-2xl font-bebas tracking-widest uppercase'>Équipe</h2>
        <p className='text-sm text-muted-foreground mt-0.5'>
          {loading
            ? 'Chargement...'
            : `${members.length} membre${members.length > 1 ? 's ont' : ' a'} accès à cet espace de travail.`}
        </p>
      </div>

      {/* Invitation Banner — visible uniquement pour le propriétaire */}
      {isOwner && (
        <div className={cn(
          'flex items-center justify-between rounded-xl bg-zinc-900 dark:bg-zinc-950 border border-white/8 px-5 py-4 gap-4 relative overflow-hidden',
          isLocked && 'cursor-pointer group/lock'
        )}
        onClick={() => {
          if (isLocked) setIsUpgradeModalOpen(true)
        }}
        >
          <div className='flex items-center gap-4'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-lg'>
              <Link className='size-5 text-white' />
            </div>
            <div>
              <p className='text-sm font-semibold text-white flex items-center gap-2'>
                Inviter un membre 
                {isLocked && <Lock size={12} className="text-amber-500" />}
              </p>
              <p className='text-xs text-zinc-400'>
                {isLocked 
                  ? `Limite de ${maxTeamMembers} membre(s) atteinte sur votre plan ${plan?.name}` 
                  : 'Générez un lien à usage unique'}
              </p>
            </div>
          </div>
          <Button
            onClick={(e) => {
              if (isLocked) {
                e.stopPropagation()
                setIsUpgradeModalOpen(true)
              } else {
                handleInvite()
              }
            }}
            disabled={isInviting}
            variant='outline'
            className={cn(
              'shrink-0 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold text-sm gap-2',
              isLocked && 'border-amber-500/30'
            )}
          >
            {isInviting
              ? <Loader2 className='size-4 animate-spin' />
              : isLocked ? <Lock className='size-4' /> : <Link className='size-4' />}
            {isLocked ? 'Upgrade pour inviter' : 'Copier le lien'}
          </Button>
        </div>
      )}

      {/* Liste des membres */}
      <div className='space-y-3'>
        <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
          Membres ({loading ? '…' : members.length})
        </p>
        <Separator />

        {loading ? (
          <div className='space-y-4 pt-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <Skeleton className='size-10 rounded-full shrink-0' />
                <div className='space-y-1.5 flex-1'>
                  <Skeleton className='h-3.5 w-32' />
                  <Skeleton className='h-3 w-44 opacity-60' />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='divide-y divide-border/40'>
            {members.map((member, idx) => (
              <div key={member.id} className='flex items-center justify-between py-3.5 gap-4'>
                {/* Avatar + infos */}
                <div className='flex items-center gap-3 min-w-0'>
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${avatarColors[idx % avatarColors.length]}`}>
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold leading-none truncate'>{member.name}</p>
                    <p className='text-xs text-muted-foreground mt-1 truncate font-mono'>{member.email}</p>
                  </div>
                </div>

                {/* Badges + actions */}
                <div className='flex items-center gap-2 shrink-0'>
                  {member.id === user?.id && (
                    <Badge className='bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-0'>
                      Vous
                    </Badge>
                  )}
                  {member.role === 'owner' && (
                    <Badge variant='outline' className='text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full'>
                      Propriétaire
                    </Badge>
                  )}

                  {/* Bouton supprimer — uniquement pour le owner, sur les autres membres */}
                  {isOwner && member.id !== user?.id && (
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => removeMember(member.id)}
                      className='size-8 border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-colors rounded-md'
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone — Quitter (uniquement pour les non-owners) */}
      {!loading && !isOwner && (
        <div className='flex items-center justify-between rounded-xl bg-rose-950/40 border border-rose-900/50 px-5 py-4 gap-4'>
          <div>
            <p className='text-sm font-semibold text-rose-400'>Quitter l'équipe</p>
            <p className='text-xs text-rose-400/70 mt-0.5'>Vous perdrez l'accès à tous les projets partagés.</p>
          </div>
          <Button
            onClick={handleLeave}
            disabled={isLeaving}
            variant='outline'
            className='shrink-0 border-rose-800/60 bg-transparent text-rose-300 hover:bg-rose-900/40 hover:text-rose-200 font-semibold text-sm gap-2'
          >
            {isLeaving ? <Loader2 className='size-4 animate-spin' /> : <LogOut className='size-4' />}
            Quitter
          </Button>
        </div>
      )}

      <UpgradeModal 
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
      />
    </div>
  )
}
