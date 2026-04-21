import { useState, useEffect } from 'react'
import { Plus, Search as SearchIcon, SlidersHorizontal, Globe, FolderGitIcon, Server as ServerIcon } from 'lucide-react'
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiFetch } from '@/lib/api'
import { CreateAppDrawer } from '@/features/apps/components/create-app-drawer'

export interface ApplicationInfo {
  id: number
  name: string
  repo_url: string
  branch: string
  status: 'pending' | 'cloning' | 'building' | 'running' | 'success' | 'failed'
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

export function Apps() {
  const [apps, setApps] = useState<ApplicationInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)

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
  }, [])

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='flex items-center justify-between mb-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Applications</h1>
            <p className='text-muted-foreground'>
              Gérez vos déploiements et applications en temps réel.
            </p>
          </div>
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            <span>Créer une application</span>
          </Button>
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

        <div className='faded-bottom no-scrollbar flex-1 overflow-auto pt-4 pb-16'>
          {loading ? (
             <div className='flex h-64 items-center justify-center text-muted-foreground animate-pulse'>
               Chargement des applications...
             </div>
          ) : filteredApps.length === 0 ? (
            <div className='flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center p-8'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
                <Globe className='h-10 w-10 text-primary' />
              </div>
              <h3 className='mt-4 text-lg font-semibold'>Aucune application</h3>
              <p className='mt-2 text-sm text-muted-foreground max-w-sm'>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucun résultat pour votre recherche.' 
                  : 'Commencez par déployer votre premier projet GitHub sur vos serveurs.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button variant='outline' className='mt-6' onClick={() => setDrawerOpen(true)}>
                  Lancer mon premier déploiement
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
                      className={`h-7 px-2 text-[10px] uppercase font-bold
                        ${app.status === 'running' || app.status === 'success' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400' : ''}
                        ${app.status === 'failed' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400' : ''}
                        ${['cloning', 'building', 'pending'].includes(app.status) ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-950/50 dark:text-yellow-400' : ''}
                      `}
                    >
                      {app.status}
                    </Button>
                  </div>

                  <div className='p-4 pt-4'>
                    <h2 className='text-lg font-bold tracking-tight text-foreground'>{app.name}</h2>
                    <div className='mt-2 space-y-1.5'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <FolderGitIcon size={14} />
                        <span className='truncate'>{app.repo_url.replace('https://github.com/', '')}</span>
                      </div>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <ServerIcon size={14} />
                        <span>{app.server.name} ({app.server.ip})</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex border-t bg-muted/5'>
                    <button className='flex-1 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border-r'>
                      Logs
                    </button>
                    <button className='flex-1 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'>
                      Paramètres
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <CreateAppDrawer 
          open={drawerOpen} 
          onOpenChange={setDrawerOpen}
          onSuccess={() => {
            setDrawerOpen(false)
            fetchApps()
          }}
        />
      </Main>
    </>
  )
}

