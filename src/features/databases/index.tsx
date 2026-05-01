import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, Database, Server as ServerIcon, ExternalLink, Shield, Link as LinkIcon, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { apiFetch } from '@/lib/api'
import { CreateDatabaseDrawer } from '@/features/databases/components/create-database-drawer'
import { DatabaseConnectionModal } from '@/features/databases/components/database-connection-modal'
import { Skeleton } from '@/components/ui/skeleton'

export interface DatabaseInfo {
  id: number
  uuid: string
  name: string
  image: string
  type: string
  status: string
  db_user: string
  db_name: string
  is_public: boolean
  has_adminer: boolean
  adminer_url?: string
  public_port: number | null
  server: {
    id: number
    name: string
    ip: string
  }
}

function EngineLogo({ image, size = 24 }: { image: string, size?: number }) {
  const img = image.toLowerCase()
  let logoUrl = ''
  
  if (img.includes('postgres')) {
    logoUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'
  } else if (img.includes('mysql')) {
    logoUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
  } else if (img.includes('redis')) {
    logoUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg'
  }

  if (logoUrl) {
    return <img src={logoUrl} alt={image} style={{ width: size, height: size }} className="object-contain" />
  }

  return <Database size={size} />
}

export function Databases() {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDb, setSelectedDb] = useState<DatabaseInfo | null>(null)
  const [connectionModalOpen, setConnectionModalOpen] = useState(false)

  const fetchDatabases = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<DatabaseInfo[]>('/databases')
      setDatabases(data)
    } catch (error) {
      console.error('Failed to fetch databases', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDatabases()
  }, [])

  const filteredDatabases = databases.filter((db) =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Bases de données</span>
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
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>Gérez vos Bases de données</h1>
          </div>
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            <span>Nouvelle base de données</span>
          </Button>
        </div>

        <div className='my-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Input
              placeholder='Filtrer les bases de données...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center gap-2 text-sm font-medium'>
             <span className='flex h-2 w-2 rounded-full bg-green-500 animate-pulse' />
             <span className='text-foreground'>{databases.filter(db => db.status === 'running' || db.status === 'success').length}</span>
             <span className='text-muted-foreground uppercase text-[10px] tracking-wider'>En ligne</span>
          </div>
        </div>

        <Separator className='shadow-sm' />

        <div className='faded-bottom no-scrollbar flex-1 overflow-auto pt-4 pb-16'>
          {loading ? (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='overflow-hidden rounded-xl border bg-card shadow-sm p-4 space-y-4'>
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
          ) : filteredDatabases.length === 0 ? (
            <div className='flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center p-8'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
                <Database className='h-10 w-10 text-primary' />
              </div>
              <h3 className='mt-4 text-lg font-semibold'>Aucune base de données</h3>
              <p className='mt-2 text-sm text-muted-foreground max-w-sm'>
                Commencez par créer votre première instance de base de données managée.
              </p>
              <Button variant='outline' className='mt-6' onClick={() => setDrawerOpen(true)}>
                Créer ma première base
              </Button>
            </div>
          ) : (
            <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredDatabases.map((db) => (
                <li key={db.id} className='overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md flex flex-col'>
                  <div className='flex items-center justify-between p-4 pb-0'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-muted p-2 border border-2 border-border/50 shadow-sm'>
                        <EngineLogo image={db.image} size={24} />
                    </div>
                    <div className='flex items-center gap-2'>
                       {db.is_public && (
                          <div title="Accès public activé" className='p-1 rounded bg-amber-500/10 text-amber-500'>
                             <ExternalLink size={14} />
                          </div>
                       )}
                       <BadgeStatus status={db.status} />
                    </div>
                  </div>

                  <div className='p-4 pt-4 flex-1'>
                    <h2 className='text-lg font-bold tracking-tight text-foreground truncate'>{db.name}</h2>
                    <div className='mt-2 space-y-1.5'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Shield size={14} className='text-indigo-400' />
                        <span className='truncate'>{db.image}</span>
                      </div>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <ServerIcon size={14} />
                        <span className='truncate'>{db.server.name} ({db.server.ip})</span>
                      </div>
                      
                      <div className='mt-3 flex flex-wrap gap-2'>
                          <code className='px-2 py-0.5 bg-muted rounded text-[10px] text-muted-foreground border'>
                             db: {db.db_name}
                          </code>
                          <code className='px-2 py-0.5 bg-muted rounded text-[10px] text-muted-foreground border'>
                             user: {db.db_user}
                          </code>
                          {db.has_adminer && (
                             <div className='px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[10px] font-bold border border-indigo-500/20'>
                                Adminer
                             </div>
                          )}
                      </div>
                    </div>
                  </div>

                   <div className='flex border-t bg-muted/5'>
                    <Button 
                      variant='ghost'
                      className='flex-1 py-3 h-auto text-xs text-center font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground rounded-none border-r'
                      onClick={() => {
                        setSelectedDb(db)
                        setConnectionModalOpen(true)
                      }}
                    >
                      <LinkIcon className='mr-2 h-3.5 w-3.5' />
                      Connexion
                    </Button>
                    
                    {db.has_adminer && db.adminer_url && (
                      <a 
                        href={`http://${db.adminer_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='flex-1 py-3 h-auto text-xs text-center font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border-r flex items-center justify-center gap-2'
                      >
                        <ExternalLink className='h-3.5 w-3.5' />
                        Adminer
                      </a>
                    )}

                    <Link 
                        to="/databases/$databaseId" 
                        params={{ databaseId: db.id.toString() }}
                        className='flex-1 py-3 text-xs text-center font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    >
                        <div className="flex items-center justify-center gap-2">
                           <LayoutDashboard className='h-3.5 w-3.5' />
                           Détails
                        </div>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <CreateDatabaseDrawer 
          open={drawerOpen} 
          onOpenChange={setDrawerOpen}
          onSuccess={() => {
            fetchDatabases()
          }}
        />

        <DatabaseConnectionModal
          database={selectedDb}
          open={connectionModalOpen}
          onOpenChange={setConnectionModalOpen}
        />
      </Main>
    </>
  )
}

function BadgeStatus({ status }: { status: string }) {
    const isRunning = status === 'running' || status === 'success'
    const isFailed = status === 'failed' || status === 'error'
    const isDeploying = status === 'deploying'
    
    return (
        <div className={`h-7 px-2 flex items-center rounded text-[10px] uppercase font-bold border
            ${isRunning ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              isFailed ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              isDeploying ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
              'bg-slate-500/10 text-slate-500 border-slate-500/20'}
        `}>
            {isRunning ? 'En ligne' : isDeploying ? 'Installation...' : status}
        </div>
    )
}
