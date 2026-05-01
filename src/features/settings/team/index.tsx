import { useAuthStore } from '@/stores/auth-store'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import * as React from 'react'
import { Users, UserPlus, Trash2, Shield, User, Loader2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

interface Member {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

export function TeamSettings() {
  const { user } = useAuthStore(state => state.auth)
  const [members, setMembers] = React.useState<Member[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isInviting, setIsInviting] = React.useState(false)

  const fetchMembers = async () => {
    if (!user?.current_team_id) return
    try {
      setLoading(true)
      const data = await apiFetch<Member[]>(`/teams/${user.current_team_id}/members`)
      setMembers(data)
    } catch (error) {
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
    } catch (e) {
      toast.error('Seul le propriétaire peut inviter des membres')
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
      setMembers(members.filter(m => m.id !== memberId))
    } catch (error) {
      toast.error('Échec du retrait du membre')
    }
  }

  const isOwner = user?.current_team?.owner_id === user?.id

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium font-bebas tracking-wider uppercase'>Gestion de l'équipe</h3>
        <p className='text-sm text-muted-foreground uppercase tracking-tight text-[10px]'>
          Gérez les membres de votre espace de travail et leurs permissions.
        </p>
      </div>
      <Separator />

      <div className='grid gap-6'>
        <Card className="border-border/40 bg-muted/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-bebas text-xl tracking-wide uppercase">Membres Actuels</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-tighter">
                  {members.length} personne{members.length > 1 ? 's ont' : ' a'} accès à cet espace.
                </CardDescription>
              </div>
              {isOwner && (
                <Button 
                    onClick={handleInvite} 
                    disabled={isInviting}
                    variant="outline"
                    className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary-foreground font-bold uppercase tracking-widest text-[10px]"
                >
                  {isInviting ? <Loader2 className="mr-2 size-3 animate-spin" /> : <UserPlus className="mr-2 size-3" />}
                  Inviter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between group transition-all py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold uppercase tracking-tight">{member.name}</span>
                          {member.id === user?.id && (
                             <Badge variant="secondary" className="text-[9px] h-4 uppercase tracking-tighter bg-zinc-900 text-zinc-100">Vous</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{member.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border/20">
                        {member.role === 'owner' ? <Shield size={12} className="text-amber-500" /> : <User size={12} className="text-zinc-400" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                          {member.role === 'owner' ? 'Propriétaire' : 'Membre'}
                        </span>
                      </div>

                      {isOwner && member.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember(member.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 transition-colors"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {isOwner && (
           <Card className="border-dashed border-primary/20 bg-primary/5">
              <CardHeader className="py-4">
                <CardTitle className="font-bebas text-lg tracking-wide uppercase flex items-center gap-2">
                   <UserPlus className="size-4 text-primary" />
                   Collaboration Rapide
                </CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-tighter">
                   Générez un lien d'invitation à usage unique pour ajouter un membre instantanément.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                 <Button 
                    onClick={handleInvite} 
                    disabled={isInviting}
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bebas tracking-widest py-6 border border-white/10 shadow-2xl"
                 >
                    {isInviting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Copy className="mr-2 size-4" />}
                    Générer & Copier le lien
                 </Button>
              </CardContent>
           </Card>
        )}
      </div>
    </div>
  )
}
