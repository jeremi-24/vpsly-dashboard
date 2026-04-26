import { useEffect, useState, useRef } from 'react'
import { Terminal, Loader, Trash2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { echo } from '@/lib/echo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface DatabaseLogsTerminalProps {
  databaseId: string | number
  status?: string
}

export function DatabaseLogsTerminal({ databaseId, status }: DatabaseLogsTerminalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const lastStatusRef = useRef<string | undefined>(status)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // 1. Charger l'historique initial
  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await apiFetch(`/databases/${databaseId}/logs`)
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch database engine logs', error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Lancer le stream sur le backend
  const startStream = async () => {
    try {
      await apiFetch(`/databases/${databaseId}/logs/stream`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to start database log stream', error)
    }
  }

  useEffect(() => {
    fetchHistory()
    startStream()

    // 3. Écoute WebSocket spécifique aux bases de données
    const channelName = `database.${databaseId}.runtime-logs`
    const channel = echo.channel(channelName)
      .listen('.runtime.log', (e: { message: string }) => {
        setLogs((prev) => [...prev.slice(-499), e.message]) // Garde les 500 dernières lignes
      })

    return () => {
      echo.leaveChannel(channelName)
    }
  }, [databaseId])

  // Relancer si le statut change (ex: après un redeploy)
  useEffect(() => {
    if (status && lastStatusRef.current !== status) {
      if (status === 'deploying' || status === 'running') {
        console.log('Status change detected, restarting log stream...', status)
        startStream()
        // On attend un tout petit peu pour laisser le temps au container de démarrer avant de fetch history
        setTimeout(fetchHistory, 1000)
      }
      lastStatusRef.current = status
    }
  }, [status])

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-lg border border-white/5 overflow-hidden">
      {/* Header du Terminal */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-muted-foreground" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Flux d'activité du moteur SQL</span>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px] h-4">
            EN DIRECT
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-white"
            onClick={() => setLogs([])}
            title="Effacer la console"
          >
            <Trash2 size={12} />
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Défilement Auto</span>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`w-8 h-4 rounded-full transition-colors relative ${autoScroll ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${autoScroll ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Zone des Logs */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed custom-scrollbar"
      >
        {loading && logs.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-3 w-8 bg-white/5" />
                <Skeleton className={`h-3 bg-white/5 ${i % 3 === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-1/2' : 'w-2/3'}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5 text-slate-300">
            {logs.length === 0 && (
              <div className="text-muted-foreground italic opacity-50">Aucun log récent. En attente de données...</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 group hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                <span className="text-white/20 select-none w-8 text-right shrink-0">{i + 1}</span>
                <span className="break-all whitespace-pre-wrap">{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
