import { useState, useEffect } from 'react'
import { Server, Search as SearchIcon, SlidersHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConnectServerDrawer } from './components/connect-server-drawer'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface ServerInfo {
  id: number
  name: string
  ip: string
  status: 'connected' | 'pending' | 'failed'
  ssh_user: string
  ssh_port: number
}

const statusText = new Map([
  ['all', 'Tous les statuts'],
  ['connected', 'Connecté'],
  ['pending', 'En attente'],
  ['failed', 'Échec'],
])

export function Servers() {
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchServers = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<ServerInfo[]>('/servers')
      setServers(data)
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Échec de la récupération des serveurs',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  const filteredServers = servers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.ip.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || server.status === statusFilter

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
            <h1 className='text-2xl font-bold tracking-tight'>Serveurs</h1>
            <p className='text-muted-foreground'>
              Connectez et gérez vos instances VPS pour le déploiement.
            </p>
          </div>
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            <span>Connecter un serveur</span>
          </Button>
        </div>

        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='Filtrer les serveurs...'
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
                <SelectItem value='connected'>Connecté</SelectItem>
                <SelectItem value='pending'>En attente</SelectItem>
                <SelectItem value='failed'>Échec</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className='shadow-sm' />

        <div className='faded-bottom no-scrollbar flex-1 overflow-auto pt-4 pb-16'>
          {loading ? (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='overflow-hidden rounded-lg border bg-card shadow-sm p-4 space-y-4'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-10 w-10 rounded-lg' />
                    <Skeleton className='h-7 w-20 rounded' />
                  </div>
                  <div className='space-y-2'>
                    <Skeleton className='h-6 w-3/4' />
                    <Skeleton className='h-4 w-1/3' />
                  </div>
                  <div className='flex gap-2 pt-2'>
                    <Skeleton className='h-10 flex-1' />
                    <Skeleton className='h-10 flex-1' />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredServers.length === 0 ? (
            <div className='flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center p-8 grow animate-in fade-in duration-500'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
                <Server className='h-10 w-10 text-primary' />
              </div>
              <h3 className='mt-4 text-lg font-semibold'>
                {searchTerm || statusFilter !== 'all' ? 'No matching servers' : 'No servers connected yet'}
              </h3>
              <p className='mt-2 text-sm text-muted-foreground max-w-sm'>
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Add your first VPS to start deploying your applications.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  variant='outline'
                  className='mt-6'
                  onClick={() => setDrawerOpen(true)}
                >
                  Connect my first server
                </Button>
              )}
            </div>
          ) : (
            <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredServers.map((server) => (
                <li key={server.id} className='overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md'>
                  {/* Part 1: Header */}
                  <div className='flex items-center justify-between p-4 pb-0'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-muted p-2'>
                      <Server className='h-6 w-6 text-foreground' />
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className={`h-7 px-2 text-[10px] uppercase font-bold
                        ${server.status === 'connected' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400' : ''}
                        ${server.status === 'failed' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400' : ''}
                        ${server.status === 'pending' ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-950/50 dark:text-yellow-400' : ''}
                      `}
                    >
                      {server.status}
                    </Button>
                  </div>

                  <div className='p-4 pt-4'>
                    <h2 className='text-lg font-bold tracking-tight text-foreground'>{server.name}</h2>
                    <span className='font-mono text-[10px] text-muted-foreground opacity-60'>{server.ip}</span>
                  </div>

                  {/* Part 3: Footer */}
                  <div className='flex border-t bg-muted/5'>
                    <button
                      className='flex-1 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border-r'
                      onClick={() => toast.info('Feature coming soon')}
                    >
                      Détails
                    </button>
                    <button
                      className='flex-1 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                      onClick={() => toast.info('Feature coming soon')}
                    >
                      Modifier
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ConnectServerDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSuccess={() => {
            setDrawerOpen(false)
            fetchServers()
          }}
        />
      </Main>
    </>
  )
}

function Loader(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
