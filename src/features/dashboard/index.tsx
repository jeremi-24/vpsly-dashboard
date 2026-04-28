import { useState, useEffect } from 'react'
import { LayoutDashboard, Server, Globe, Database, Zap, Clock, ExternalLink, ChevronRight } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Dashboard() {
  const { auth } = useAuthStore()
  const user = auth.user
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const result = await apiFetch('/dashboard')
      setData(result)
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const StatCard = ({ title, value, icon: Icon, loading }: any) => (
    <Card className='border-border rounded-none bg-card transition-transform hover:-translate-y-0.5'>
      <CardContent className='p-4 flex items-center gap-4'>
        <div className='p-2 rounded-lg bg-primary/10 text-primary'>
          <Icon size={18} />
        </div>
        <div>
          <p className='text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground'>{title}</p>
          {loading ? (
            <Skeleton className='h-6 w-12 mt-1' />
          ) : (
            <p className='text-3xl font-bebas tracking-wide text-primary'>{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-70">Infrastructure</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-500">
          
          {/* BIENVENUE */}
          <div className='space-y-1 border-b-border pb-4'>
            <h1 className='text-4xl font-bebas tracking-wide uppercase'>
              {new Date().getHours() >= 18 || new Date().getHours() < 5 ? 'Bonsoir' : 'Bonjour'} {user?.name}
            </h1>
            <p className='text-xs font-mono font-medium text-muted-foreground'>/ ACTIVITÉ RÉCENTE ET INFRASTRUCTURE</p>
          </div>

          {/* STATS GRID */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <StatCard 
              title="Serveurs" 
              value={data?.servers_count || 0} 
              icon={Server} 
              loading={loading}
            />
            <StatCard 
              title="Applications actives" 
              value={data?.stats?.applications || 0} 
              icon={Globe} 
              loading={loading}
            />
            <StatCard 
              title="Bases de données" 
              value={data?.stats?.databases || 0} 
              icon={Database} 
              loading={loading}
            />
            <StatCard 
              title="Déploiements (24h)" 
              value={data?.stats?.deployments_today || 0} 
              icon={Zap} 
              loading={loading}
            />
          </div>

          <div className='flex flex-col gap-8'>
            
            {/* SECTION SERVEURS (PLEINE LARGEUR) */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between mb-2'>
                <h2 className='text-xl font-bebas tracking-wide uppercase'>État de vos serveurs</h2>
                <Button variant='outline' size='sm' asChild className='h-7 border-border rounded-none font-bebas tracking-widest uppercase'>
                  <Link to='/servers'>Gérer →</Link>
                </Button>
              </div>
              
              {loading ? (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {[1, 2, 3].map(i => <Skeleton key={i} className='h-[110px] w-full border-border rounded-none' />)}
                </div>
              ) : (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                 {data?.top_servers?.map((server: any) => (
                  <Card key={server.id} className='border-border rounded-none bg-card overflow-hidden'>
                    {/* Header */}
                    <div className='px-4 py-3 flex items-center justify-between border-b border-border'>
                      <div className='flex items-center gap-2.5'>
                        <div className={cn(
                          'h-2 w-2 rounded-full shrink-0',
                          server.status === 'connected'
                            ? 'bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]'
                            : 'bg-red-500'
                        )} />
                        <span className='text-[13px] font-bold truncate max-w-[120px]'>{server.name}</span>
                        <span className='text-[11px] font-mono text-muted-foreground'>{server.ip}</span>
                      </div>
                      <Badge variant='outline' className={cn(
                        'text-[10px] h-5 rounded-full',
                        server.status === 'connected' ? 'text-green-600 border-green-200' : 'text-red-500 border-red-200'
                      )}>
                        {server.status === 'connected' ? 'En ligne' : 'Hors ligne'}
                      </Badge>
                    </div>

                    {/* Métriques */}
                    <div className={cn('grid grid-cols-3 divide-x divide-border', server.status !== 'connected' && 'opacity-40')}>
                      {[
                        { label: 'CPU', value: server.cpu_usage, color: 'bg-green-500' },
                        { label: 'Mémoire', value: server.mem_percent, color: 'bg-indigo-500' },
                        { label: 'Stockage', value: server.disk_percent, color: 'bg-slate-500' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className='px-4 py-3.5'>
                          <div className='flex justify-between items-baseline mb-2'>
                            <span className='text-[10px] uppercase tracking-wider font-bold text-muted-foreground'>{label}</span>
                            <span className='text-lg font-mono font-medium'>
                              {server.status === 'connected' ? `${Number(value || 0).toFixed(1)}%` : '—'}
                            </span>
                          </div>
                          <div className='h-1 w-full bg-muted rounded-full overflow-hidden'>
                            {server.status === 'connected' && (
                              <div className={cn('h-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
                  {(!loading && (!data?.top_servers || data.top_servers.length === 0)) && (
                    <div className='p-12 border border-dashed border-border rounded-none text-center col-span-full'>
                       <p className='text-xs text-muted-foreground'>Aucun serveur à afficher.</p>
                       <Button size='sm' className='mt-4 h-8 text-xs' asChild><Link to='/servers'>Connecter un VPS</Link></Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION DÉPLOIEMENTS (DESSOUS) */}
            <div className='space-y-4'>
              <h2 className='text-xl font-bebas tracking-wide uppercase'>Derniers déploiements</h2>
              <Card className='border-border rounded-none bg-card'>
                <CardContent className='p-0'>
                  {loading ? (
                    <div className='p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className='h-12 w-full rounded-lg' />)}
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-border border-b border-r border-border'>
                      {data?.recent_deployments?.length > 0 ? (
                        data.recent_deployments.map((dep: any) => (
                          <div key={dep.id} className='p-4 hover:bg-muted/20 transition-colors group flex items-start gap-3 border-l border-t border-border'>
                            <div className={cn(
                              'mt-1 h-2 w-2 rounded-full shrink-0',
                              dep.status === 'success' || dep.status === 'running' ? 'bg-green-500' : (dep.status === 'failed' ? 'bg-red-500' : 'bg-amber-500 animate-pulse')
                            )} />
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-bold truncate'>{dep.app_name}</p>
                              <div className='flex items-center gap-2 mt-1'>
                                <Badge variant='outline' className='text-[10px] h-4 px-1.5 leading-none opacity-50 font-mono'>{dep.branch}</Badge>
                                <span className='text-[10px] text-muted-foreground'>{dep.time_ago}</span>
                              </div>
                            </div>
                            <Button variant='ghost' size='icon' className='h-7 w-7 opacity-0 group-hover:opacity-100' asChild>
                               <Link to='/apps/$appId' params={{ appId: (dep.application_id || '').toString() }}><ChevronRight size={16} /></Link>
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className='p-12 text-center text-[10px] text-muted-foreground italic col-span-full'>
                          Aucun mouvement récent.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>

        </div>
      </Main>
    </>
  )
}
