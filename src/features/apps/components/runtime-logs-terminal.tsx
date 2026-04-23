import { useEffect, useState, useRef } from 'react'
import { Terminal, Loader2, PlayCircle, StopCircle, Trash2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { echo } from '@/lib/echo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RuntimeLogsTerminalProps {
  appId: string | number
}

export function RuntimeLogsTerminal({ appId }: RuntimeLogsTerminalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // 1. Charger l'historique initial
  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await apiFetch(`/applications/${appId}/logs`)
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch runtime logs', error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Lancer le stream sur le backend
  const startStream = async () => {
    try {
      setIsStreaming(true)
      await apiFetch(`/applications/${appId}/logs/stream`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to start log stream', error)
      setIsStreaming(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    startStream()

    // 3. Écoute WebSocket via Reverb
    const channel = echo.channel(`application.${appId}.runtime-logs`)
      .listen('.runtime.log', (e: { message: string }) => {
        setLogs((prev) => [...prev.slice(-499), e.message]) // Garde les 500 dernières lignes
      })

    return () => {
      echo.leaveChannel(`application.${appId}.runtime-logs`)
    }
  }, [appId])

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
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Autoscroll</span>
                <button 
                   onClick={() => setAutoScroll(!autoScroll)}
                   className={`w-8 h-4 rounded-full transition-colors relative ${autoScroll ? 'bg-primary' : 'bg-white/10'}`}
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
          <div className="flex items-center gap-2 text-muted-foreground italic">
            <Loader2 size={14} className="animate-spin" /> Chargement de l'historique...
          </div>
        ) : (
          <div className="space-y-0.5">
            {logs.length === 0 && (
                <div className="text-muted-foreground italic opacity-50">En attente de logs en provenance du conteneur...</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 group hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                <span className="text-white/20 select-none w-8 text-right shrink-0">{i + 1}</span>
                <span className="text-slate-300 break-all whitespace-pre-wrap">{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
