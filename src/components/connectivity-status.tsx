import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ConnectivityStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isVisible, setIsVisible] = useState(!navigator.onLine)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setTimeout(() => setIsVisible(false), 2000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setIsVisible(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setIsRetrying(true)
    window.location.reload()
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      'sticky top-0 left-0 z-[100] w-full h-8 flex items-center justify-between px-4 transition-all duration-300',
      isOnline
        ? 'bg-green-950 border-b border-green-900'
        : 'bg-red-950 border-b border-red-900'
    )}>
      <div className='flex items-center gap-2'>
        <div className={cn(
          'h-1.5 w-1.5 rounded-full shrink-0',
          isOnline ? 'bg-green-400' : 'bg-red-400 animate-ping'
        )} />
        <span className={cn(
          'text-[11px] font-mono tracking-wide',
          isOnline ? 'text-green-200' : 'text-red-200'
        )}>
          {isOnline
            ? 'Connexion rétablie — synchronisation en cours'
            : 'Connexion interrompue — les métriques en temps réel sont indisponibles'}
        </span>
      </div>

      {!isOnline && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className='flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-red-300 bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded-sm'
        >
          <RefreshCw size={10} className={cn(isRetrying && 'animate-spin')} />
          Réessayer
        </button>
      )}

      {isOnline && (
        <span className='text-[10px] font-mono text-green-400 uppercase tracking-widest opacity-70'>
          ✓ Ok
        </span>
      )}
    </div>
  )
}