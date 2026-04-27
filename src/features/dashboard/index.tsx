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
    <Card className='border-white/5 bg-card/30 backdrop-blur-sm'>
      <CardContent className='p-4 flex items-center gap-4'>
        <div className='p-2 rounded-lg bg-primary/10 text-primary'>
          <Icon size={18} />
        </div>
        <div>
          <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60'>{title}</p>
          {loading ? (
            <Skeleton className='h-6 w-12 mt-1' />
          ) : (
            <p className='text-xl font-bold'>{value}</p>
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
          <div className='space-y-1'>
            <h1 className='text-xl font-bold tracking-tight'>Bonjour {user?.name}</h1>
            <p className='text-xs text-muted-foreground'>Voici un aperçu de votre activité aujourd’hui.</p>
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

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            
            {/* COLONNE GAUCHE: SERVEURS (2/3) */}
            <div className='lg:col-span-2 space-y-4'>
              <div className='flex items-center justify-between mb-2'>
                <h2 className='text-[10px] font-bold  tracking-widest text-muted-foreground'>État de vos serveurs</h2>
                <Button variant='outline' size='sm' asChild className='h-6 text-[10px]'>
                  <Link to='/servers'>Gérer</Link>
                </Button>
              </div>
              
              {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className='h-[110px] w-full rounded-xl' />)
              ) : (
                <div className='space-y-4'>
                  {data?.top_servers?.map((server: any) => (
                    <Card key={server.id} className='border-white/5 bg-card/30 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all'>
                      <div className='flex flex-col sm:flex-row h-full'>
                        {/* Infos de base */}
                        <div className='p-4 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-white/5 bg-white/[0.01]'>
                          <div className='flex items-center gap-2 mb-1'>
                            <div className={cn(
                              'h-2 w-2 rounded-full',
                              server.status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'
                            )} />
                            <span className='text-xs font-bold truncate'>{server.name}</span>
                          </div>
                          <p className='text-[10px] font-mono opacity-40'>{server.ip}</p>
                          <Badge variant='outline' className='mt-3 text-[8px] h-4  opacity-50'>
                            {server.status === 'connected' ? 'En ligne' : 'Hors ligne'}
                          </Badge>
                        </div>

                        {/* Jauges */}
                        <div className='p-4 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center'>
                          <div className='space-y-1.5'>
                            <div className='flex justify-between text-[12px] font-medium  tracking-tighter opacity-60'>
                              <span>CPU</span>
                              <span>{Number(server.cpu_usage || 0).toFixed(1)}%</span>
                            </div>
                            <div className='h-1 w-full bg-white/5 rounded-full overflow-hidden'>
                              <div 
                                className={cn(
                                  'h-full transition-all duration-500',
                                  server.cpu_usage > 80 ? 'bg-red-500' : (server.cpu_usage > 50 ? 'bg-amber-500' : 'bg-primary')
                                )}
                                style={{ width: `${server.cpu_usage}%` }} 
                              />
                            </div>
                          </div>

                          <div className='space-y-1.5'>
                            <div className='flex justify-between text-[12px] font-medium  tracking-tighter opacity-60'>
                              <span>Mémoire</span>
                              <span>{Number(server.mem_percent || 0).toFixed(1)}%</span>
                            </div>
                            <div className='h-1 w-full bg-white/5 rounded-full overflow-hidden'>
                              <div 
                                className={cn(
                                  'h-full transition-all duration-500',
                                  server.mem_percent > 90 ? 'bg-red-500' : (server.mem_percent > 70 ? 'bg-amber-500' : 'bg-indigo-500')
                                )}
                                style={{ width: `${server.mem_percent}%` }} 
                              />
                            </div>
                          </div>

                          <div className='space-y-1.5'>
                            <div className='flex justify-between text-[12px] font-medium   tracking-tighter opacity-60'>
                              <span>Stockage</span>
                              <span>{Number(server.disk_percent || 0).toFixed(1)}%</span>
                            </div>
                            <div className='h-1 w-full bg-white/5 rounded-full overflow-hidden'>
                              <div 
                                className='h-full bg-slate-500 transition-all duration-500'
                                style={{ width: `${server.disk_percent}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {(!loading && (!data?.top_servers || data.top_servers.length === 0)) && (
                    <div className='p-12 border border-dashed border-white/5 rounded-xl text-center'>
                       <p className='text-xs text-muted-foreground'>Aucun serveur à afficher.</p>
                       <Button size='sm' className='mt-4 h-8 text-xs' asChild><Link to='/servers'>Connecter un VPS</Link></Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLONNE DROITE: ACTIVITÉ (1/3) */}
            <div className='space-y-4'>
              <h2 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2'>Dernier déploiement</h2>
              <Card className='border-white/5 bg-card/30 overflow-hidden'>
                <CardContent className='p-0'>
                  {loading ? (
                    <div className='p-4 space-y-4'>
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className='h-12 w-full rounded-lg' />)}
                    </div>
                  ) : (
                    <div className='divide-y divide-white/5'>
                      {data?.recent_deployments?.length > 0 ? (
                        data.recent_deployments.map((dep: any) => (
                          <div key={dep.id} className='p-3 hover:bg-white/5 transition-colors group flex items-start gap-3'>
                            <div className={cn(
                              'mt-1 h-2 w-2 rounded-full shrink-0',
                              dep.status === 'success' || dep.status === 'running' ? 'bg-green-500' : (dep.status === 'failed' ? 'bg-red-500' : 'bg-amber-500 animate-pulse')
                            )} />
                            <div className='flex-1 min-w-0'>
                              <p className='text-xs font-bold truncate'>{dep.app_name}</p>
                              <div className='flex items-center gap-2 mt-0.5'>
                                <Badge variant='outline' className='text-[8px] h-3.5 px-1 leading-none opacity-40 font-mono'>{dep.branch}</Badge>
                                <span className='text-[9px] text-muted-foreground opacity-60'>{dep.time_ago}</span>
                              </div>
                            </div>
                            <Button variant='ghost' size='icon' className='h-6 w-6 opacity-0 group-hover:opacity-100' asChild>
                               <Link to='/apps/$appId' params={{ appId: (dep.application_id || '').toString() }}><ChevronRight size={14} /></Link>
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className='p-12 text-center text-[10px] text-muted-foreground italic'>
                          Aucun mouvement.
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
