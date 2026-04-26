import { useEffect, useState, useRef } from 'react'
import { Terminal as TerminalIcon, Loader2, Copy, Check } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { echo } from '@/lib/echo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface RuntimeLogsTerminalProps {
  appId: string | number
}

export function RuntimeLogsTerminal({ appId }: RuntimeLogsTerminalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)

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

    const channel = echo.channel(`application.${appId}.runtime-logs`)
      .listen('.runtime.log', (e: { message: string }) => {
        setLogs((prev) => [...prev.slice(-499), e.message])
      })

    return () => {
      echo.leaveChannel(`application.${appId}.runtime-logs`)
    }
  }, [appId])

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' })
    }
  }, [logs, autoScroll])

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
                    <span className='text-[10px] text-white/40'>{autoScroll ? 'LIVE' : 'PAUSED'}</span>
                </div>
                
                <div className='flex items-center gap-2'>
                    <button 
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`text-[10px] transition-colors font-bold ${autoScroll ? 'text-primary' : 'text-white/20 hover:text-white/40'}`}
                    >
                        {autoScroll ? 'AUTOSCROLL ON' : 'AUTOSCROLL OFF'}
                    </button>
                    
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(logs.join('\n'))
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                        }}
                        className="text-white/20 hover:text-blue-400 transition-colors ml-2"
                        title="Copier les logs"
                    >
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                </div>
            </div>
        </div>
        
        {/* Zone de logs */}
        <ScrollArea className='flex-1 min-h-0 bg-transparent'>
            <div className='p-4 space-y-1'>
                {loading && logs.length === 0 ? (
                  <div className="space-y-1.5 opacity-40">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-2 w-6 bg-white/5" />
                            <Skeleton className={`h-2 bg-white/5 ${i % 3 === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-1/2' : 'w-2/3'}`} />
                        </div>
                    ))}
                  </div>
                ) : logs.length === 0 ? (
                    <div className='text-white/10 italic'>En attente de logs en provenance du conteneur...</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className='flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-1 duration-300'>
                            <span className='text-white/5 select-none w-6 text-right shrink-0 mt-0.5'>{i + 1}</span>
                            <div className='shrink-0'><TerminalIcon size={12} className="text-blue-500 mt-0.5 opacity-50" /></div>
                            <span className="text-slate-300 break-all whitespace-pre-wrap">
                                {log}
                            </span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} className="h-4 w-full" />
            </div>
        </ScrollArea>
        
        {/* Footer info tactile */}
        <div className='px-4 py-1.5 bg-white/5 border-t border-white/10 flex items-center justify-between flex-none'>
           <span className='text-[9px] text-white/20 uppercase tracking-tight'>Vpsly Runtime v1.0</span>
           <span className='text-[9px] text-white/20'>AppID: {appId} | Buffer: {logs.length} lines</span>
        </div>
    </div>
  )
}
