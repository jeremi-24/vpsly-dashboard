import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, Database, Server as ServerIcon, ExternalLink, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiFetch } from '@/lib/api'
import { CreateDatabaseDrawer } from '@/features/databases/components/create-database-drawer'

export interface DatabaseInfo {
  id: number
  uuid: string
  name: string
  image: string
  status: string
  postgres_user: string
  postgres_db: string
  is_public: boolean
  public_port: number | null
  server: {
    id: number
    name: string
    ip: string
  }
}

export function Databases() {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

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
        <div className='me-auto'>
           {/* Search component placeholder */}
        </div>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='flex items-center justify-between mb-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Bases de données</h1>
            <p className='text-muted-foreground'>
              Gérez vos instances PostgreSQL, MySQL et Redis.
            </p>
          </div>
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            <span>Nouvelle base de données</span>
          </Button>
        </div>

        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='Filtrer les bases de données...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Separator className='shadow-sm' />

        <div className='faded-bottom no-scrollbar flex-1 overflow-auto pt-4 pb-16'>
          {loading ? (
            <div className='flex h-64 items-center justify-center text-muted-foreground animate-pulse'>
              Chargement des bases de données...
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
                <li key={db.id} className='overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md'>
                  <div className='flex items-center justify-between p-4 pb-0'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 p-2'>
                        <Database className='h-6 w-6 text-indigo-500' />
                    </div>
                    <div className='flex items-center gap-2'>
                       {db.is_public && (
                          <div title="Accès public activé" className='p-1 rounded bg-amber-500/10 text-amber-500'>
                             <ExternalLink size={14} />
                          </div>
                       )}
                       <Button
                        variant='outline'
                        size='sm'
                        className={`h-7 px-2 text-[10px] uppercase font-bold border
                          ${db.status === 'running' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}
                        `}
                      >
                        {db.status === 'running' ? 'En ligne' : db.status}
                      </Button>
                    </div>
                  </div>

                  <div className='p-4 pt-4'>
                    <h2 className='text-lg font-bold tracking-tight text-foreground'>{db.name}</h2>
                    <div className='mt-2 space-y-1.5'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Shield size={14} className='text-indigo-400' />
                        <span>{db.image}</span>
                      </div>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <ServerIcon size={14} />
                        <span>{db.server.name} ({db.server.ip})</span>
                      </div>
                      <div className='mt-3 flex flex-wrap gap-2'>
                          <code className='px-2 py-1 bg-muted rounded text-[10px] text-muted-foreground'>
                             db: {db.postgres_db}
                          </code>
                          <code className='px-2 py-1 bg-muted rounded text-[10px] text-muted-foreground'>
                             user: {db.postgres_user}
                          </code>
                      </div>
                    </div>
                  </div>

                  <div className='flex border-t bg-muted/5'>
                    <Button 
                      variant='ghost'
                      className='flex-1 py-3 h-auto text-xs text-center font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border-r rounded-none'
                    >
                      Connexion
                    </Button>
                    <Button 
                      variant='ghost'
                      className='flex-1 py-3 h-auto text-xs text-center font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground rounded-none'
                    >
                      Détails
                    </Button>
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
      </Main>
    </>
  )
}
