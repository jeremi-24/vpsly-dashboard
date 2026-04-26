import { useState, useEffect } from 'react'
import { Activity, Database, LayoutDashboard, RefreshCw, Zap, Server, ChevronRight } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import { echo } from '@/lib/echo'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

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

    if (user) {
      const channel = echo.private(`user.${user.id}`)
        .listen('ServerStatsUpdated', (e: any) => {
          setData((prev: any) => {
            if (!prev) return prev
            return {
              ...prev,
              stats: {
                ...prev.stats,
                avg_cpu: e.stats.cpu_usage,
                avg_ram: e.stats.memory_usage
              }
            }
          })
        })

      return () => {
        echo.leaveChannel(`user.${user.id}`)
      }
    }
  }, [user?.id])

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

      <Main fixed>
        <div className="flex flex-col h-full space-y-8 py-4">
          
          {/* TOP BAR: STATS BRUTES SANS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Applications</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-medium leading-none">{data?.stats?.applications || 0}</span>
                <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1 rounded">ACTIVE</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Sur {data?.servers_count || 0} serveur(s)</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Databases</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-medium leading-none">{data?.stats?.databases || 0}</span>
                <span className="text-[10px] font-medium text-blue-500 bg-blue-500/10 px-1 rounded">ISOLATED</span>
              </div>
              <p className="text-[10px] text-muted-foreground">PostgreSQL Instances</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">CPU Avg</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-medium leading-none">{data?.stats?.avg_cpu || 0}%</span>
              </div>
              <div className="w-full h-1 bg-muted mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground transition-all duration-500" 
                  style={{ width: `${data?.stats?.avg_cpu || 0}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">RAM Avg</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-medium leading-none">{data?.stats?.avg_ram || 0}%</span>
              </div>
              <div className="w-full h-1 bg-muted mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground transition-all duration-500" 
                  style={{ width: `${data?.stats?.avg_ram || 0}%` }} 
                />
              </div>
            </div>
          </div>

          {/* ESPACE VIDE OU FUTUR CONTENU */}
          <div className="flex-1" />

          {/* QUICK LINKS / SERVERS STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-6">
            <div className="flex items-center justify-between p-3 rounded border border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
               <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[12px] font-medium tracking-tight">JEREMIE VPS TEST</span>
               </div>
               <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            {/* D'autres serveurs ici... */}
          </div>

        </div>
      </Main>
    </>
  )
}
