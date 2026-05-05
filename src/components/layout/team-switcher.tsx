import * as React from 'react'
import { cn } from '@/lib/utils'
import { Logo } from '@/assets/logo'
import { ChevronsUpDown, Plus, UserCircle, Users, Copy, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { UpgradeModal } from '@/components/shared/upgrade-modal'

interface Team {
  id: number
  name: string
  owner_id: number
  owner?: {
    id: number
    name: string
  }
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { user, setUser } = useAuthStore(state => state.auth)
  const [teams, setTeams] = React.useState<Team[]>([])
  const [loading, setLoading] = React.useState(false)
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [newTeamName, setNewTeamName] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)
  const [isLoadingTeams, setIsLoadingTeams] = React.useState(true)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true)
        const data = await apiFetch<Team[]>('/teams')
        setTeams(data)
      } catch (error) {
        console.error('Failed to fetch teams', error)
      } finally {
        setIsLoadingTeams(false)
      }
    }
    fetchTeams()
  }, [])

  const getDisplayName = (team?: Team) => {
    if (!team) return 'Mon Espace'
    const isOwner = team.owner_id === user?.id
    if (isOwner || team.name !== 'Mon Espace') return team.name
    return team.owner?.name ? `Espace de ${team.owner.name}` : 'Collaboration'
  }

  const [isOpen, setIsOpen] = React.useState(false)

  const onTeamSelect = async (team: Team) => {
    if (team.id === user?.current_team_id) return

    try {
      setLoading(true)
      setIsOpen(false) // Ferme le menu immédiatement
      await apiFetch(`/teams/${team.id}/switch`, { method: 'POST' })
      
      if (user) {
        setUser({
          ...user,
          current_team_id: team.id,
          current_team: team
        })
      }

      toast.success(`Passage à l'équipe ${team.name}`)
      window.location.reload()
    } catch (error) {
      toast.error('Échec du changement d\'équipe')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    try {
      setIsCreating(true)
      const res = await apiFetch<any>('/teams', {
        method: 'POST',
        body: JSON.stringify({ name: newTeamName })
      })

      toast.success('Espace de travail créé !')
      setTeams([...teams, res.team])
      setShowCreateModal(false)
      setNewTeamName('')
      
      // Auto-switch to new team
      if (user) {
        setUser({
          ...user,
          current_team_id: res.team.id,
          current_team: res.team
        })
      }
      window.location.reload()
    } catch (error: any) {
      if (error.requires_upgrade) {
        setShowCreateModal(false)
        setIsUpgradeModalOpen(true)
      } else {
        toast.error(error.message || 'Erreur lors de la création')
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleInvite = async () => {
    const teamId = user?.current_team_id

    if (!teamId) {
        toast.error("Veuillez sélectionner un espace de travail actif")
        return
    }
    
    try {
      const res = await apiFetch<any>('/teams/invitations', {
          method: 'POST',
          body: JSON.stringify({ team_id: teamId })
      })
      
      if (res.invitation_url) {
        await navigator.clipboard.writeText(res.invitation_url)
        toast.success('Lien d\'invitation copié !', { 
            description: 'Partagez ce lien avec votre collaborateur.' 
        })
      }
    } catch (error: any) {
      console.error('Invite error:', error)
      toast.error(error.message || 'Seul le propriétaire peut inviter des collaborateurs')
    }
  }

  const currentTeam = (teams.find(t => t.id === user?.current_team_id) || user?.current_team) as Team | undefined
  const displayName = getDisplayName(currentTeam)
  const isOwner = currentTeam?.owner_id === user?.id

  const avatarColors = [
    'bg-blue-600 text-blue-50 border-blue-400/30',
    'bg-violet-600 text-violet-50 border-violet-400/30',
    'bg-emerald-600 text-emerald-50 border-emerald-400/30',
    'bg-amber-600 text-amber-50 border-amber-400/30',
    'bg-rose-600 text-rose-50 border-rose-400/30',
    'bg-cyan-600 text-cyan-50 border-cyan-400/30',
  ]

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-border/40'
              >
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-950 dark:bg-zinc-900 text-white shadow-lg border border-white/10'>
                  <Logo className="size-6" variant="dark" />
                </div>
                <div className='grid flex-1 text-start text-sm leading-tight ml-2'>
                  <span className='truncate font-bebas text-base tracking-wide uppercase text-foreground'>
                    {displayName}
                  </span>
                  <span className='truncate text-[10px] font-mono font-medium opacity-60 flex items-center gap-1'>
                      <Users size={10} /> {isOwner ? 'ESPACE PERSONNEL' : 'COLLABORATION'}
                  </span>
                </div>
                {loading ? <Loader2 className="ms-auto animate-spin h-4 w-4 opacity-50" /> : <ChevronsUpDown className='ms-auto opacity-50' />}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl border border-border bg-popover p-2 shadow-xl backdrop-blur-2xl'
              align='start'
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className='px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground'>
                Espaces de travail
              </DropdownMenuLabel>
              <div className="space-y-1 mt-1">
                {isLoadingTeams ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2">
                       <Skeleton className="size-8 rounded-lg shrink-0" />
                       <div className="flex flex-col gap-1.5 flex-1">
                          <Skeleton className="h-3 w-2/3" />
                          <Skeleton className="h-2 w-1/2 opacity-50" />
                       </div>
                    </div>
                  ))
                ) : (
                  teams.map((team) => (
                    <DropdownMenuItem
                      key={team.id}
                      onSelect={() => onTeamSelect(team)}
                      className={cn(
                          'flex items-center gap-3 px-2 py-2 cursor-pointer transition-all rounded-lg outline-none',
                          user?.current_team_id === team.id 
                            ? 'bg-accent text-accent-foreground border border-border/50' 
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent'
                      )}
                    >
                      <div className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold shadow-sm',
                          avatarColors[team.id % avatarColors.length]
                      )}>
                         {team.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                          <span className="font-bebas text-md tracking-wider uppercase truncate">
                              {team.owner_id === user?.id || team.name !== 'Mon Espace' ? team.name : `Espace de ${team.owner?.name || 'Collaborateur'}`}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-tighter">
                              {team.owner_id === user?.id ? 'Propriétaire' : 'Membre'}
                          </span>
                      </div>
                      {user?.current_team_id === team.id && (
                          <div className="ml-auto size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </div>

              <DropdownMenuSeparator className="my-2" />
              
              <div className="space-y-1">
                  {isOwner && (
                    <DropdownMenuItem 
                        className='flex items-center gap-3 px-2 py-2 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all border border-transparent'
                        onSelect={handleInvite}
                    >
                      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/50'>
                        <Copy className='size-3.5' />
                      </div>
                      <div className='font-bold text-xs tracking-tight uppercase'>Inviter un collaborateur</div>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem 
                      className='flex items-center gap-3 px-2 py-2 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all border border-transparent'
                      onSelect={() => {
                        setIsOpen(false)
                        setShowCreateModal(true)
                      }}
                  >
                    <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/30'>
                      <Plus className='size-4' />
                    </div>
                    <div className='font-medium text-xs tracking-tight uppercase'>Créer un espace</div>
                  </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px] border-border bg-popover shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleCreateTeam}>
            <DialogHeader>
              <DialogTitle className="font-bebas text-2xl tracking-widest uppercase">Nouvel espace de travail</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-tight text-muted-foreground/60">
                Créez un espace séparé pour vos nouveaux projets ou clients.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-muted-foreground">Nom de l'espace</Label>
                <Input
                  id="name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Ex: Projet Client X, Production..."
                  className="bg-muted/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isCreating || !newTeamName.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest py-6"
              >
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Créer l'espace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <UpgradeModal 
        open={isUpgradeModalOpen} 
        onOpenChange={setIsUpgradeModalOpen} 
      />
    </>
  )
}
