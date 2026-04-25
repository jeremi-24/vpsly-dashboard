import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Globe, Server as ServerIcon, FolderGitIcon, Loader2, ChevronLeft, ExternalLink, RefreshCw, ChevronDown, Trash2, Activity, Lock, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DeploymentTerminal } from './deployment-terminal'
import { Badge } from '@/components/ui/badge'
import { echo } from '@/lib/echo'
import { EnvVarCard } from './env-vars-card'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RuntimeLogsTerminal } from './runtime-logs-terminal'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Database } from 'lucide-react'
import { AppVolumesCard } from './app-volumes-card'
import { AppCronCard } from './app-cron-card'
import { Zap } from 'lucide-react'
import { LinkedDatabasesCard } from './linked-databases-card'
import { AppBackupsCard } from './app-backups-card'
import { Skeleton } from '@/components/ui/skeleton'

export function AppDetail() {
  const { appId } = useParams({ from: '/_authenticated/apps/$appId' })
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDeployingLocal, setIsDeployingLocal] = useState(false)
  const [activeTab, setActiveTab] = useState('build')

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
      .listen('DeploymentStatusUpdatedEvent', (e: { status: string, isDeploying: boolean }) => {
        setApp((prev: any) => prev ? { 
          ...prev, 
          status: e.status,
          is_deploying: e.isDeploying 
        } : prev)
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

  const navItems = [
    { id: 'build', title: 'Console de Build', icon: <RefreshCw size={16} /> },
    { id: 'runtime', title: 'Logs de l\'app', icon: <Activity size={16} /> },
    { id: 'resources', title: 'Bases de données', icon: <Database size={16} /> },
    { id: 'env', title: 'Environnement', icon: <Lock size={16} /> },
    { id: 'storage', title: 'Stockage', icon: <HardDrive size={16} /> },
    { id: 'backups', title: 'Sauvegardes', icon: <HardDrive size={16} className="text-blue-400" /> },
    { id: 'automations', title: 'Crons', icon: <Zap size={16} /> },
    { id: 'networking', title: 'Réseau & Domaine', icon: <Globe size={16} /> },
    { id: 'danger', title: 'Zone de Danger', icon: <Trash2 size={16} />, className: 'text-red-500 hover:text-red-600' },
  ]

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
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium">{app.name}</span>
            </div>
        </div>
      </Header>

      <Main fixed>
        <div className="flex flex-col h-full">
            {/* HEADER SIMPLIFIÉ */}
            <div className="flex items-start justify-between mb-6 flex-none">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{app.name}</h1>
                        <Badge 
                            variant="outline" 
                            className={`uppercase px-2 py-0.5 text-[10px] font-bold border ${currentStatus.color} ${currentStatus.pulse ? 'animate-pulse' : ''}`}
                        >
                            {currentStatus.label}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><ServerIcon size={12} /> {app.server?.name}</span>
                        <Separator orientation="vertical" className="h-3 hidden sm:block" />
                        <a href={app.repo_url} target="_blank" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                            <FolderGitIcon size={12} /> {app.repo_url}
                        </a>
                        <Separator orientation="vertical" className="h-3 hidden sm:block" />
                        <Badge variant="outline" className="text-[10px] h-4 font-mono px-1.5">{app.branch}</Badge>
                        <Separator orientation="vertical" className="h-3 hidden sm:block" />
                        <span className="text-[10px] opacity-70 italic">Dernier build il y a 2h</span>
                        <Separator orientation="vertical" className="h-3 hidden sm:block" />
                         <a 
                            href={`http://${app.domain || `${app.name}.${app.server?.ip}.sslip.io`}`} 
                            target="_blank" 
                            className="hover:underline flex items-center gap-1 text-indigo-400 font-medium"
                        >
                           <Globe size={12} /> {app.domain || `${app.name}.${app.server?.ip}.sslip.io`}
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant="default" 
                        size="sm" 
                        disabled={app.is_deploying || isDeployingLocal}
                        onClick={async () => {
                            try {
                                setIsDeployingLocal(true);
                                await apiFetch('/deployments', {
                                    method: 'POST',
                                    body: JSON.stringify({ application_id: app.id })
                                });
                                toast.success('Déploiement lancé !');
                                fetchApp();
                            } catch (error) {
                                toast.error('Échec du lancement du déploiement');
                            } finally {
                                setIsDeployingLocal(false);
                            }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-bold"
                    >
                        {(app.is_deploying || isDeployingLocal) ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
                        Redéployer
                    </Button>
                </div>
            </div>

            <Separator className="mb-6" />

            <div className="flex flex-1 gap-12 overflow-hidden">
                {/* SIDEBAR NAVIGATION */}
                <aside className="w-64 flex-none overflow-y-auto custom-scrollbar pr-2 h-full">
                    <nav className="flex flex-col space-y-0.5">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                                    activeTab === item.id 
                                        ? "bg-muted text-foreground" 
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                    item.className
                                )}
                            >
                                <span className="opacity-70">{item.icon}</span>
                                {item.title}
                                {(item.id === 'build' && app.is_deploying) && (
                                    <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* CONTENT AREA */}
                <div className={cn(
                    "flex-1 pr-4 custom-scrollbar",
                    activeTab === 'build' || activeTab === 'runtime' ? "overflow-hidden" : "overflow-y-auto"
                )}>
                    {activeTab === 'build' && (
                        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 min-h-0 border rounded-lg overflow-hidden border-white/5 bg-[#0a0a0a]">
                                {latestDeployment ? (
                                    <DeploymentTerminal 
                                        deploymentId={latestDeployment.id} 
                                        initialLogs={latestDeployment.logs || []} 
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center border border-dashed rounded-lg bg-muted/30 text-muted-foreground p-8 text-center">
                                        <p className="text-sm">Aucun déploiement récent trouvé sur ce serveur.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'runtime' && (
                        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 min-h-0">
                                <RuntimeLogsTerminal appId={appId} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'env' && (
                        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-bold mb-6">Variables d'environnement</h2>
                            <EnvVarCard appId={appId} />
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-bold mb-6">Bases de données liées</h2>
                            <LinkedDatabasesCard 
                                appId={appId} 
                                serverId={app.server_id} 
                                onUpdate={fetchApp}
                            />
                        </div>
                    )}

                    {activeTab === 'storage' && (
                        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-bold mb-6">Stockage persistant (Volumes)</h2>
                            <AppVolumesCard appId={appId} />
                        </div>
                    )}

                    {activeTab === 'backups' && (
                        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-bold mb-6">Sauvegardes</h2>
                            <AppBackupsCard 
                                appId={Number(appId)} 
                                databases={app.databases || []} 
                            />
                        </div>
                    )}

                    {activeTab === 'automations' && (
                        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-bold mb-6">Tâches Planifiées</h2>
                            <AppCronCard appId={Number(appId)} />
                        </div>
                    )}

                    {activeTab === 'networking' && (
                        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-bold">Domaine</h2>
                            
                            <div className="space-y-6">
                                <div className="p-6 rounded-xl border bg-card/30 space-y-4">
                                    <h4 className="text-sm font-bold">URL active</h4>
                                    <div className="flex gap-2">
                                        <div className="flex-1 h-9 bg-muted/50 rounded-lg border border-white/5 flex items-center px-3 font-mono text-xs">
                                            {app.domain || `${app.name}.${app.server?.ip}.sslip.io`}
                                        </div>
                                        <Button variant="outline" size="sm" disabled>Modifier</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === 'danger' && (
                        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-bold text-red-500">Danger</h2>
                            
                            <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold">Supprimer l'application</h4>
                                        <p className="text-xs text-muted-foreground">Stoppe les containers et supprime toutes les données.</p>
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => {
                                            if (confirm('Êtes-vous sûr de vouloir supprimer cette application ? Cette action est irréversible.')) {
                                                alert('Action de suppression à implémenter');
                                            }
                                        }}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </Main>
    </>
  )
}
