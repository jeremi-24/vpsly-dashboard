import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { echo } from '@/lib/echo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Terminal as TerminalIcon, AlertCircle, CheckCircle2, ClipboardCopy, Check, Copy, Loader } from 'lucide-react'

interface LogEntry {
  type: 'info' | 'success' | 'error' | 'debug'
  message: string
  timestamp?: string
}

interface DeploymentTerminalProps {
  deploymentId: number
  initialLogs?: LogEntry[]
}

export function DeploymentTerminal({ deploymentId, initialLogs = [] }: DeploymentTerminalProps) {
  // On s'assure que initialLogs est bien un tableau dès le départ
  const [logs, setLogs] = useState<LogEntry[]>(Array.isArray(initialLogs) ? initialLogs : [])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 1. Fetch historical logs
    const fetchHistoricalLogs = async () => {
      try {
        setLoading(true)
        const data = await apiFetch(`/deployments/${deploymentId}/logs`)
        if (data.logs) {
          setLogs(Array.isArray(data.logs) ? data.logs : [])
        } else {
          setLogs([])
        }
      } catch (error) {
        console.error('Failed to fetch historical logs', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalLogs()

    // 2. Listen for real-time logs
    const channel = echo.private(`deployment.${deploymentId}`)
      .listen('DeploymentLogEvent', (e: any) => {
        const newLogs = Array.isArray(e.logs) ? e.logs : (e.message ? [e] : [])
        setLogs((prev) => [...(Array.isArray(prev) ? prev : []), ...newLogs])
      })

    return () => {
      echo.leaveChannel(`deployment.${deploymentId}`)
    }
  }, [deploymentId])


  // Auto-scroll robuste avec bottomRef
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' })
    }
  }, [logs, autoScroll])

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'debug': return 'text-gray-400 font-mono italic'
      default: return 'text-blue-400'
    }
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={12} className="text-green-500 mt-0.5" />
      case 'error': return <AlertCircle size={12} className="text-red-500 mt-0.5" />
      case 'info': return <TerminalIcon size={12} className="text-blue-500 mt-0.5" />
      default: return null
    }
  }

  // Sécurité supplémentaire avant le rendu
  const safeLogs = Array.isArray(logs) ? logs : []

  return (
    <div className='flex flex-col h-full bg-[#0a0a0a] rounded-lg border border-white/10 shadow-2xl overflow-hidden font-mono text-[11px] leading-relaxed'>
      {/* Header Terminal style SaaS */}
      <div className='flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 flex-none'>
        <div className='flex items-center gap-2'>
          <div className='flex gap-1.5'>
            <div className='w-2.5 h-2.5 rounded-full bg-red-500/50' />
            <div className='w-2.5 h-2.5 rounded-full bg-yellow-500/50' />
            <div className='w-2.5 h-2.5 rounded-full bg-green-500/50' />
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            {autoScroll && <div className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />}
            <span className='text-[10px] text-white/40'>{autoScroll ? 'EN DIRECT' : 'EN PAUSE'}</span>
          </div>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-[10px] transition-colors font-bold ${autoScroll ? 'text-primary' : 'text-white/20 hover:text-white/40'}`}
          >
            {autoScroll ? 'DÉFILEMENT AUTO' : 'DÉFILEMENT MANUEL'}
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(safeLogs.map(l => `[${l.type}] ${l.message}`).join('\n'))
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="text-white/20 hover:text-blue-400 transition-colors ml-2"
            title="Copier les logs de build"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Zone de logs */}
      <ScrollArea className='flex-1 min-h-0 bg-transparent'>
        <div className='p-4 space-y-1'>

          {loading && (
            <div className='flex items-center gap-2 text-white/20 italic animate-pulse'>
              <Loader className="h-3 w-3 animate-spin" />
              Chargement des archives...
            </div>
          )}
          {!loading && safeLogs.length === 0 && (
            <div className='text-white/10 italic'>Initialisation de la session de log...</div>
          )}
          {!loading && safeLogs.map((log, i) => (
            <div key={i} className='flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-1 duration-300'>
              <span className='text-white/5 select-none w-6 text-right shrink-0 mt-0.5'>{i + 1}</span>
              <div className='shrink-0'>{getLogIcon(log.type)}</div>
              <span className={`${getLogColor(log.type)} break-all whitespace-pre-wrap`}>
                {log.message}
              </span>
            </div>
          ))}
          {/* Element d'ancrage pour l'autoscroll */}
          <div ref={bottomRef} className="h-4 w-full" />
        </div>
      </ScrollArea>

      {/* Footer info tactile */}
      <div className='px-4 py-1.5 bg-white/5 border-t border-white/10 flex items-center justify-between flex-none'>
        <span className='text-[9px] text-white/20 uppercase tracking-tight'>Vpsly Orchestrator v1.0</span>
        <span className='text-[9px] text-white/20'>ID: {deploymentId} | Logs: {safeLogs.length}</span>
      </div>
    </div>
  )
}
