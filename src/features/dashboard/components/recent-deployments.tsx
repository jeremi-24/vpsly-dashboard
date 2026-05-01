import { GitBranch, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Deployment {
  id: number
  app_name: string
  branch: string
  status: string
  time_ago: string
}

export function RecentDeployments({ deployments }: { deployments?: Deployment[] }) {
  if (!deployments || deployments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground italic text-[10px]">
        No recent activity logs.
      </div>
    )
  }

  const statusConfig: Record<string, { color: string, label: string, dot: string }> = {
    success: { color: 'text-emerald-600 dark:text-emerald-400', label: 'SUCCESS', dot: 'bg-emerald-500' },
    running: { color: 'text-emerald-600 dark:text-emerald-400', label: 'RUNNING', dot: 'bg-emerald-500' },
    failed: { color: 'text-red-600 dark:text-red-400', label: 'FAILED', dot: 'bg-red-500' },
    pending: { color: 'text-slate-500 dark:text-slate-400', label: 'PENDING', dot: 'bg-slate-500' },
    building: { color: 'text-amber-600 dark:text-amber-400', label: 'BUILDING', dot: 'bg-amber-500' },
    deploying: { color: 'text-blue-600 dark:text-blue-400', label: 'DEPLOYING', dot: 'bg-blue-500' },
  }

  return (
    <div className='font-mono text-[10px] space-y-0.5'>
      {deployments.map((d) => {
        const config = statusConfig[d.status] || { color: 'text-slate-500', label: d.status.toUpperCase(), dot: 'bg-slate-500' }

        return (
          <div key={d.id} className='flex items-center gap-3 px-2 py-2 hover:bg-muted/50 transition-colors group border-b border-border/50 last:border-0'>
            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot, (d.status === 'building' || d.status === 'deploying') && "animate-pulse")} />
            
            <div className='flex-1 min-w-0'>
              <div className="flex items-center gap-2">
                <span className='font-bold text-foreground truncate'>{d.app_name}</span>
                <span className='opacity-30 shrink-0 text-[8px]'>/</span>
                <span className='opacity-60 truncate text-[9px] flex items-center gap-1'>
                  <GitBranch size={8} />
                  {d.branch}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-3 shrink-0 text-right'>
              <span className={cn("font-bold tracking-tight w-14", config.color)}>
                {config.label}
              </span>
              <span className='text-muted-foreground opacity-50 w-16 text-[9px]'>
                {d.time_ago?.replace('il y a ', '').replace(' ago', '') || 'now'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
