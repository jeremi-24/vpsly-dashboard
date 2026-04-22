import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Globe, Server as ServerIcon, FolderGitIcon, Loader2, ChevronLeft, ExternalLink, RefreshCw } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DeploymentTerminal } from './deployment-terminal'
import { Badge } from '@/components/ui/badge'
import { echo } from '@/lib/echo'


export function AppDetail() {
  const { appId } = useParams({ from: '/_authenticated/apps/$appId' })
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchApp = async () => {
    try {
      setLoading(true)
      const data = await apiFetch(`/applications/${appId}`)
      setApp(data)
    } catch (error) {
      console.error('Failed to fetch app details', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApp()

    // Écoute du canal WebSocket pour les mises à jour de statut
    const channel = echo.channel(`application.${appId}`)
      .listen('DeploymentStatusUpdatedEvent', (e: { status: string }) => {
        setApp((prev: any) => prev ? { ...prev, status: e.status } : prev)
      })

    return () => {
      echo.leaveChannel(`application.${appId}`)
    }
  }, [appId])


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <h1 className="text-xl font-bold">Application non trouvée</h1>
        <Button variant="link" asChild className="mt-4">
          <Link to="/apps">Retour aux applications</Link>
        </Button>
      </div>
    )
  }

  const latestDeployment = app.deployments?.[0]

  const statusConfig: Record<string, { label: string, color: string, pulse?: boolean }> = {
    pending: { label: 'En attente', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
    preparing: { label: 'Préparation', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20', pulse: true },
    cloning: { label: 'Clonage Git', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', pulse: true },
    building: { label: 'Build Docker', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', pulse: true },
    deploying: { label: 'Déploiement', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', pulse: true },
    running: { label: 'En ligne', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    success: { label: 'Succès', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    failed: { label: 'Échec', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  }

  const currentStatus = statusConfig[app.status] || { label: app.status, color: 'bg-muted text-muted-foreground' }

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link to="/apps" search={{ type: 'all' }}>
                    <ChevronLeft className="h-4 w-4" />
                </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium">{app.name}</span>
        </div>
      </Header>

      <Main fixed>
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-start justify-between flex-none">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
                        <Badge 
                            variant="outline" 
                            className={`uppercase px-3 py-1 text-xs font-bold border ${currentStatus.color} ${currentStatus.pulse ? 'animate-pulse' : ''}`}
                        >
                            {currentStatus.label}
                        </Badge>

                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Globe size={14} />
                            <a 
                                href={`http://${app.domain || `${app.name}.${app.server?.ip}.sslip.io`}`} 
                                target="_blank" 
                                className="hover:underline flex items-center gap-1"
                            >
                                {app.domain || `${app.name}.${app.server?.ip}.sslip.io`} <ExternalLink size={12} />
                            </a>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <ServerIcon size={14} />
                            <span>{app.server?.name} ({app.server?.ip})</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchApp}>
                        <RefreshCw size={14} className="mr-2" /> Actualiser
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="md:col-span-2 flex flex-col min-h-0 h-full">
                    <div className="flex items-center justify-between mb-2 flex-none">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">Console de déploiement</h3>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-lg overflow-hidden border-white/5">
                        {latestDeployment ? (
                            <DeploymentTerminal 
                                deploymentId={latestDeployment.id} 
                                initialLogs={latestDeployment.logs || []} 
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center border border-dashed rounded-lg bg-muted/30">
                                <p className="text-sm text-muted-foreground">Aucun déploiement en cours.</p>
                            </div>
                        )}
                    </div>
                </div>


                <div className="space-y-6">
                    <div className="p-4 rounded-xl border bg-card/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Dépôt Source</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FolderGitIcon className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium leading-none">{app.repo_url.split('/').pop()?.replace('.git', '')}</p>
                                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{app.repo_url}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-t">
                                <span className="text-muted-foreground">Branche</span>
                                <Badge variant="outline" className="font-mono">{app.branch}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-card/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Informations Serveur</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Nom</span>
                                <span className="font-medium">{app.server?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">IP</span>
                                <span className="font-mono">{app.server?.ip}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    <span>Connecté</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </Main>
    </>
  )
}
