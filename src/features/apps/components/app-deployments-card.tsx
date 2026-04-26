import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Terminal,
  ExternalLink,
  GitBranch,
  Loader
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'

interface Deployment {
  id: number
  status: string
  branch?: string
  commit_hash?: string
  commit_message?: string
  started_at: string
  finished_at?: string
  duration?: number
  created_at: string
}

interface AppDeploymentsCardProps {
  appId: string | number
  appBranch?: string
  onViewLogs: (deploymentId: number) => void
  currentDeploymentId?: number | null
}

export function AppDeploymentsCard({ appId, appBranch, onViewLogs, currentDeploymentId }: AppDeploymentsCardProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeployments = async () => {
    try {
      setLoading(true)
      const data = await apiFetch(`/applications/${appId}/deployments`)
      setDeployments(data.data || [])
    } catch (error) {
      console.error('Failed to fetch deployments', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
  }, [appId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Succès</Badge>
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Échec</Badge>
      case 'pending':
      case 'deploying':
      case 'building':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse hover:bg-amber-500/20">En cours</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-amber-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Historique des déploiements</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchDeployments} className="h-8 text-[11px] gap-2">
          <Loader className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </Button>
      </div>

      {loading && deployments.length === 0 ? (
        <div className="rounded-xl border bg-card/30 overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16 opacity-20" />
                  <Skeleton className="h-4 w-24 opacity-10" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full opacity-10" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-card/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Source</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deployments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                        Aucun déploiement trouvé.
                      </td>
                    </tr>
                  ) : (
                    deployments.map((deployment) => (
                      <tr
                        key={deployment.id}
                        className={`group transition-colors hover:bg-white/[0.02] ${currentDeploymentId === deployment.id ? 'bg-indigo-500/5' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(deployment.status)}
                            {getStatusBadge(deployment.status)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <GitBranch className="h-3 w-3 text-muted-foreground" />
                              {deployment.branch || appBranch || 'main'}
                            </div>
                            {deployment.commit_hash && (
                              <span className="text-[10px] font-mono text-muted-foreground opacity-50">
                                #{deployment.commit_hash.substring(0, 7)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium">
                              {formatDistanceToNow(new Date(deployment.started_at || deployment.created_at), { addSuffix: true, locale: fr })}
                            </span>
                            <span className="text-[10px] text-muted-foreground opacity-50">
                              {format(new Date(deployment.started_at || deployment.created_at), 'HH:mm:ss')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewLogs(deployment.id)}
                            className={`h-8 w-8 p-0 hover:bg-indigo-500/10 hover:text-indigo-400 ${currentDeploymentId === deployment.id ? 'text-indigo-400 bg-indigo-500/5' : ''}`}
                          >
                            <Terminal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {deployments.length > 0 && (
            <p className="text-[10px] text-center text-muted-foreground opacity-30 italic">
              Affichage des 20 derniers déploiements
            </p>
          )}
        </>
      )}
    </div>
  )
}