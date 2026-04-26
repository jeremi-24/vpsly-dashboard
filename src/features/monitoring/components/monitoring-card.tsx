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
  mem_total: number
  mem_used: number
  uuid?: string // UUID de la ressource pour filtrer le websocket
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
    // On garde un polling large (30s) en fallback, mais le websocket fera le gros du travail
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    if (data?.server_id) {
       const channel = echo.private(`server.${data.server_id}`)
          .listen('.ServerStatsUpdated', (e: { stats: any }) => {
             // Mise à jour temps réel depuis le websocket
             setData((prev) => {
                if (!prev) return prev;
                // On retrouve notre container dans la liste envoyée par le serveur
                // Note: l'agent envoie une liste de containers. On doit trouver celui qui nous intéresse.
                // Pour l'instant on met à jour les stats système globales
                return {
                   ...prev,
                   cpu_usage: e.stats.cpu_usage,
                   mem_percent: e.stats.mem_percent,
                   // Si on avait l'ID du container ou l'UUID on pourrait mettre à jour le container aussi
                }
             })
          })
       
       return () => {
          echo.leaveChannel(`server.${data.server_id}`)
       }
    }
  }, [data?.server_id])

  if (loading && !data) {
    return <Card className="bg-card/50"><CardContent className="p-6">Chargement des métriques...</CardContent></Card>
  }

  if (!data) return null

  // Pour l'app, on affiche les stats du container si dispos, sinon du système
  const cpuValue = data.cpu_usage || 0
  const memValue = data.container ? (data.container.memory / data.container.memory_limit) * 100 : data.mem_percent

  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity size={16} className="text-indigo-500" />
          Monitoring Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Cpu size={12} /> CPU
            </span>
            <span className={cpuValue > 80 ? 'text-red-500' : 'text-foreground'}>
              {cpuValue.toFixed(1)}%
            </span>
          </div>
          <Progress value={cpuValue} className="h-1.5 bg-muted" indicatorClassName={cpuValue > 80 ? 'bg-red-500' : 'bg-indigo-500'} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <HardDrive size={12} /> RAM
            </span>
            <span className={memValue > 80 ? 'text-red-500' : 'text-foreground'}>
              {memValue.toFixed(1)}%
            </span>
          </div>
          <Progress value={memValue} className="h-1.5 bg-muted" indicatorClassName={memValue > 80 ? 'bg-red-500' : 'bg-indigo-500'} />
        </div>
        
        {data.container && (
           <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Container Usage</span>
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                 {(data.container.memory / 1024 / 1024).toFixed(1)} MB
              </span>
           </div>
        )}
      </CardContent>
    </Card>
  )
}
