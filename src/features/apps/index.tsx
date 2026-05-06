import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { NotificationBell } from '@/components/notification-bell'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { UpgradeModal } from '@/components/shared/upgrade-modal'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getPlanById } from '@/config/plans'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Globe, Lock, Plus, Server as ServerIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface ApplicationInfo {
  id: number
  name: string
  repo_url: string
  branch: string
  status: 'pending' | 'preparing' | 'cloning' | 'building' | 'deploying' | 'running' | 'success' | 'failed'
  server: {
    id: number
    name: string
    ip: string
  }
}

const statusText = new Map([
  ['all', 'Tous les statuts'],
  ['running', 'En ligne'],
  ['pending', 'En attente'],
  ['failed', 'Échec'],
])

import { CreateAppDrawer } from './components/create-app-drawer'

export function Apps() {
  const [apps, setApps] = useState<ApplicationInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<any>(null)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  const user = useAuthStore((state) => state.auth.user)
  const team = user?.current_team
  const plan = team ? getPlanById(team.plan) : null
  const currentAppsCount = team?.applications_count || 0
  const isLocked = plan ? (plan.maxApps !== -1 && currentAppsCount >= plan.maxApps) : false

  const search = useSearch({ from: '/_authenticated/apps/' }) as any
  const navigate = useNavigate()

  const fetchApps = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<ApplicationInfo[]>('/applications')
      setApps(data)
    } catch (error) {
      console.error('Failed to fetch apps', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
    
    // Auto-redirect to create page if requested
    if (search.action === 'create-app') {
       setIsDrawerOpen(true)
       setEditingApp(null)
    }
  }, [search.action])

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEdit = (app: any) => {
    setEditingApp(app)
    setIsDrawerOpen(true)
  }

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Applications</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <NotificationBell />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='flex items-center justify-between mb-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Déployez vos applications</h1>
           
          </div>
          {isLocked ? (
            <Button 
              onClick={() => setIsUpgradeModalOpen(true)}
              className="relative overflow-hidden shimmer-effect group"
            >
              <div className="premium-lock-overlay" />
              <Lock className='mr-2 h-4 w-4 text-white z-20' />
              <span className="z-20">Déployer une application</span>
            </Button>
          ) : (
            <Link to='/apps/create'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                <span>Déployer une application</span>
              </Button>
            </Link>
          )}
        </div>

        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='Filtrer les applications...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue>{statusText.get(statusFilter)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tous les statuts</SelectItem>
                <SelectItem value='running'>En ligne</SelectItem>
                <SelectItem value='pending'>En attente</SelectItem>
                <SelectItem value='failed'>Échec</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className='shadow-sm' />

        <div className='faded-bottom no-scrollbar flex-1 overflow-auto'>
          {loading ? (
             <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='overflow-hidden rounded-lg border bg-card shadow-sm p-4 space-y-4'>
                        <div className='flex items-center justify-between'>
                            <Skeleton className='h-10 w-10 rounded-lg' />
                            <Skeleton className='h-7 w-20 rounded' />
                        </div>
                        <div className='space-y-2'>
                            <Skeleton className='h-6 w-3/4' />
                            <Skeleton className='h-4 w-full' />
                            <Skeleton className='h-4 w-2/3' />
                        </div>
                        <div className='flex gap-2 pt-2'>
                            <Skeleton className='h-10 flex-1' />
                            <Skeleton className='h-10 flex-1' />
                        </div>
                    </div>
                ))}
             </div>
          ) : filteredApps.length === 0 ? (
            <div className='flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
                <Globe className='h-8 w-8 text-primary' />
              </div>
              <h3 className='mt-4 text-lg font-semibold'>Aucune application</h3>
              <p className='mt-2 text-sm text-muted-foreground max-w-sm'>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucun résultat pour votre recherche.' 
                  : 'Commencez par déployer votre premier projet GitHub sur vos serveurs.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  variant={isLocked ? 'outline' : 'link'} 
                  className={`mt-6 ${isLocked ? 'relative overflow-hidden shimmer-effect' : ''}`}
                  onClick={() => { 
                    if (isLocked) {
                      setIsUpgradeModalOpen(true)
                    } else {
                      setEditingApp(null); 
                      setIsDrawerOpen(true); 
                    }
                  }}
                >
                  {isLocked && <div className="premium-lock-overlay" />}
                  {isLocked && <Lock className="mr-2 h-4 w-4 z-20" />}
                  <span className="z-20">Lancer mon premier déploiement</span>
                </Button>
              )}
            </div>
          ) : (
            <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredApps.map((app) => (
                <li key={app.id} className='overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md'>
                  <div className='flex items-center justify-between p-4 pb-0'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-muted p-2'>
                        <Globe className='h-6 w-6 text-foreground' />
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className={`h-8 px-3 text-xs uppercase font-bold border
                        ${app.status === 'running' || app.status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        ${app.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                        ${['cloning', 'building', 'preparing'].includes(app.status) ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' : ''}
                        ${app.status === 'pending' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' : ''}
                        ${app.status === 'deploying' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse' : ''}
                      `}
                    >
                      {app.status === 'running' ? 'En ligne' : app.status}
                    </Button>


                  </div>

                  <div className='p-4 pt-4'>
                    <h2 className='text-lg font-bold tracking-tight text-foreground'>{app.name}</h2>
                    <div className='mt-2 space-y-1.5'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <ServerIcon size={14} />
                        <span>{app.server.name} ({app.server.ip})</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex border-t bg-muted/5'>
                    <button 
                      onClick={() => handleEdit(app)}
                      className='flex-1 py-3 text-xs text-center font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border-r'
                    >
                      Modifier
                    </button>
                    <Link 
                      to='/apps/$appId' 
                      params={{ appId: app.id.toString() }}
                      className='flex-1 py-3 text-xs text-center font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    >
                      Détails
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <CreateAppDrawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen} 
          onSuccess={fetchApps}
          appToEdit={editingApp}
        />

        <UpgradeModal 
          open={isUpgradeModalOpen} 
          onOpenChange={setIsUpgradeModalOpen}
          reason={`Vous avez atteint votre limite de ${plan?.maxApps} application${plan?.maxApps && plan.maxApps > 1 ? 's' : ''} avec le plan ${plan?.name}.`}
        />
      </Main>
    </>
  )
}

