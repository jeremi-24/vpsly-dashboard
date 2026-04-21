import { useState, useEffect } from 'react'
import { Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConnectServerDrawer } from './components/connect-server-drawer'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export interface ServerInfo {
  id: number
  name: string
  ip: string
  status: 'connected' | 'pending' | 'failed'
  ssh_user: string
  ssh_port: number
}

export function Servers() {
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchServers = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<ServerInfo[]>('/servers')
      setServers(data)
    } catch (error: any) {
      toast.error('Error', {
        description: error.message || 'Failed to fetch servers',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Servers</h1>
            <p className='text-muted-foreground'>
              Connect and manage your VPS instances.
            </p>
          </div>
          <Button onClick={() => setDrawerOpen(true)}>
            Connect a server
          </Button>
        </div>

        <div className='flex-1 content-center'>
          {loading ? (
            <div className='flex h-64 items-center justify-center'>
              <p>Loading servers...</p>
            </div>
          ) : servers.length === 0 ? (
            <div className='flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center p-8 grow'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
                <Server className='h-10 w-10 text-primary' />
              </div>
              <h3 className='mt-4 text-lg font-semibold'>No servers connected yet</h3>
              <p className='mt-2 text-sm text-muted-foreground max-w-sm'>
                Add your first VPS by running the security script and providing your connection details.
              </p>
              <Button 
                variant='outline' 
                className='mt-6'
                onClick={() => setDrawerOpen(true)}
              >
                Connect my first server
              </Button>
            </div>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {servers.map((server) => (
                 <div key={server.id} className='rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md'>
                    <div className='flex items-center justify-between mb-4'>
                       <div className='flex h-10 w-10 items-center justify-center rounded bg-primary/10'>
                          <Server className='h-6 w-6 text-primary' />
                       </div>
                       <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                         server.status === 'connected' ? 'bg-green-100 text-green-800' : 
                         server.status === 'failed' ? 'bg-red-100 text-red-800' : 
                         'bg-yellow-100 text-yellow-800'
                       }`}>
                         {server.status.toUpperCase()}
                       </span>
                    </div>
                    <h3 className='font-semibold text-lg'>{server.name}</h3>
                    <p className='text-sm text-muted-foreground mt-1'>{server.ip}</p>
                    <div className='mt-6 flex gap-2'>
                        <Button variant='outline' size='sm' className='flex-1'>Manage</Button>
                        <Button variant='ghost' size='sm' className='text-destructive hover:bg-destructive/10'>Delete</Button>
                    </div>
                 </div>
              ))}
            </div>
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
