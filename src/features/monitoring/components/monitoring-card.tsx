import { useEffect, useState } from 'react'
import { Activity, Cpu, HardDrive } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { echo } from '@/lib/echo'

interface MonitoringData {
  server_id?: number
  cpu_usage: number
  mem_percent: number
  disk_percent: number
  mem_total: number
  mem_used: number
  uuid?: string
  container?: {
    id: string
    name: string
    memory: number
    memory_limit: number
  }
}

export function MonitoringCard({ type, id }: { type: 'applications' | 'databases', id: string }) {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    try {
      const endpoint = `/${type}/${id}/metrics`
      const res = await apiFetch<any>(endpoint)
      
      const formattedData = {
        server_id: res.server_id,
        cpu_usage: res.system.cpu_usage,
        mem_percent: res.system.mem_percent,
        disk_percent: res.system.disk_percent || 0,
        mem_total: 0,
        mem_used: 0,
        container: res.container
      }
      setData(formattedData)
    } catch (err) {
      console.error('Failed to fetch metrics', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    if (data?.server_id) {
       const channel = echo.private(`server.${data.server_id}`)
          .listen('.ServerStatsUpdated', (e: { stats: any }) => {
             setData((prev) => {
                if (!prev) return prev;
                return {
                   ...prev,
                   cpu_usage: e.stats.cpu_usage,
                   mem_percent: e.stats.mem_percent,
                   disk_percent: e.stats.disk_percent || prev.disk_percent,
                }
             })
          })
       
       return () => {
          echo.leaveChannel(`server.${data.server_id}`)
       }
    }
  }, [data?.server_id])

  if (loading && !data) {
    return <Card className="bg-card/50"><CardContent className="p-6 text-center text-xs text-muted-foreground animate-pulse">Initialisation des métriques...</CardContent></Card>
  }

  if (!data) return null

  const cpuValue = data.cpu_usage || 0
  const memValue = data.container ? (data.container.memory / data.container.memory_limit) * 100 : data.mem_percent
  const diskValue = data.disk_percent || 0

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-background/50 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 text-muted-foreground">
          <Activity size={14} className="text-primary" />
          Live Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* CPU */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <Cpu size={12} className="text-blue-500" /> CPU
            </span>
            <span className={cpuValue > 80 ? 'text-red-500' : ''}>{cpuValue.toFixed(1)}%</span>
          </div>
          <Progress value={cpuValue} className="h-1 bg-muted" indicatorClassName={cpuValue > 85 ? 'bg-red-500' : 'bg-blue-500'} />
        </div>

        {/* RAM */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-500" /> RAM
            </span>
            <span className={memValue > 80 ? 'text-red-500' : ''}>{memValue.toFixed(1)}%</span>
          </div>
          <Progress value={memValue} className="h-1 bg-muted" indicatorClassName={memValue > 85 ? 'bg-red-500' : 'bg-emerald-500'} />
        </div>

        {/* DISK */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <HardDrive size={12} className="text-amber-500" /> DISQUE
            </span>
            <span className={diskValue > 90 ? 'text-red-500' : ''}>{diskValue.toFixed(1)}%</span>
          </div>
          <Progress value={diskValue} className="h-1 bg-muted" indicatorClassName={diskValue > 90 ? 'bg-red-500' : 'bg-amber-500'} />
        </div>
        
        {data.container && (
           <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground uppercase font-bold">Container Usage</span>
              <span className="text-[9px] font-mono bg-muted px-1 rounded text-foreground">
                 {(data.container.memory / 1024 / 1024).toFixed(1)} MB
              </span>
           </div>
        )}
      </CardContent>
    </Card>
  )
}
