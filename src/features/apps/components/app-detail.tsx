import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Globe, Server as ServerIcon, FolderGitIcon, Loader, ChevronLeft, ExternalLink, RefreshCw, ChevronDown, Trash2, Activity, Lock, HardDrive } from 'lucide-react'
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
import { Maximize2, Minimize2, History } from 'lucide-react'
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
import { AppDeploymentsCard } from './app-deployments-card'

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function AppDetail() {
    const { appId } = useParams({ from: '/_authenticated/apps/$appId' })
    const [app, setApp] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isDeployingLocal, setIsDeployingLocal] = useState(false)
    const [activeTab, setActiveTab] = useState('console')
    const [currentDeploymentId, setCurrentDeploymentId] = useState<number | null>(null)
    const [expandedConsole, setExpandedConsole] = useState<'build' | 'runtime' | 'none'>('runtime')

    const fetchApp = async () => {
        try {
            setLoading(true)
            const data = await apiFetch(`/applications/${appId}`)
            setApp(data)
            // Initialiser le deploymentId courant depuis la DB si pas encore set par WS
            setCurrentDeploymentId(prev => prev ?? data.deployments?.[0]?.id ?? null)
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
            .listen('DeploymentStatusUpdatedEvent', (e: {
                status: string,
                isDeploying: boolean,
                deploymentId: number,
                lastDeployedAt?: string
            }) => {
                setApp((prev: any) => prev ? {
                    ...prev,
                    status: e.status,
                    is_deploying: e.isDeploying,
                    last_deployed_at: e.lastDeployedAt || prev.last_deployed_at
                } : prev)

                // Bascule sur le nouveau déploiement
                setCurrentDeploymentId(e.deploymentId)

                if (e.isDeploying) {
                    setExpandedConsole('build')
                } else if (e.status === 'success' || e.status === 'running') {
                    setExpandedConsole('runtime')
                    setIsDeployingLocal(false)
                } else {
                    setIsDeployingLocal(false)
                }
            })

        return () => {
            echo.leaveChannel(`application.${appId}`)
        }
    }, [appId])


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-primary" />
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
        { id: 'console', title: 'Console', icon: <Activity size={16} /> },
        { id: 'deployments', title: 'Déploiements', icon: <History size={16} /> },
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
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4 flex-none">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight truncate max-w-[200px] sm:max-w-none">{app.name}</h1>
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
                                <a href={app.repo_url} target="_blank" className="flex items-center gap-1 hover:text-indigo-400 transition-colors truncate max-w-[150px] sm:max-w-none">
                                    <FolderGitIcon size={12} /> {app.repo_url.replace('https://github.com/', '')}
                                </a>
                                <Separator orientation="vertical" className="h-3 hidden sm:block" />
                                <Badge variant="outline" className="text-[10px] h-4 font-mono px-1.5">{app.branch}</Badge>
                                <Separator orientation="vertical" className="h-3 hidden sm:block" />
                                <span className="text-[10px] opacity-70 italic whitespace-nowrap">
                                    {app.last_deployed_at
                                        ? `${formatDistanceToNow(new Date(app.last_deployed_at), { addSuffix: true, locale: fr })}`
                                        : 'Jamais déployé'}
                                </span>
                                <Separator orientation="vertical" className="h-3 hidden sm:block" />
                                <a
                                    href={`http://${app.domain || `${app.name}.${app.server?.ip}.sslip.io`}`}
                                    target="_blank"
                                    className="hover:underline flex items-center gap-1 text-indigo-400 font-medium truncate max-w-[150px] sm:max-w-none"
                                >
                                    <Globe size={12} /> {app.domain || `${app.name}.${app.server?.ip}.sslip.io`}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
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
                                    } catch (error) {
                                        toast.error('Échec du lancement du déploiement');
                                        setIsDeployingLocal(false);
                                    }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-bold w-full sm:w-auto"
                            >
                                {(app.is_deploying || isDeployingLocal) ? <Loader size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
                                Redéployer
                            </Button>
                        </div>
                    </div>

                    <Separator className="mb-6" />

                    <div className="flex flex-col md:flex-row flex-1 gap-6 md:gap-12 overflow-hidden">
                        {/* SIDEBAR NAVIGATION */}
                        <aside className="w-full md:w-64 flex-none overflow-x-auto md:overflow-y-auto custom-scrollbar md:pr-2">
                            <nav className="flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-0.5 min-w-max md:min-w-0 pb-2 md:pb-0">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 md:py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap",
                                            activeTab === item.id
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                            item.className
                                        )}
                                    >
                                        <span className="opacity-70">{item.icon}</span>
                                        {item.title}
                                        {(item.id === 'console' && app.is_deploying) && (
                                            <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* CONTENT AREA */}
                        <div className={cn(
                            "flex-1 min-w-0 pb-6 md:pr-4 custom-scrollbar",
                            activeTab === 'console' ? "overflow-hidden" : "overflow-y-auto"
                        )}>
                            {activeTab === 'console' && (
                                <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* BUILD CONSOLE */}
                                    <div className={cn(
                                        "min-h-0 flex flex-col transition-all duration-500 ease-in-out",
                                        expandedConsole === 'build' ? "flex-[2]" : (expandedConsole === 'runtime' ? "flex-[0.5] opacity-50" : "flex-1")
                                    )}>
                                        <div className="flex items-center justify-between mb-2 flex-none">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    Console de Build
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 hover:bg-white/5"
                                                    onClick={() => setExpandedConsole(expandedConsole === 'build' ? 'none' : 'build')}
                                                >
                                                    {expandedConsole === 'build' ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                                                </Button>
                                            </div>
                                            {app.is_deploying && (
                                                <Badge variant="outline" className="text-[8px] h-4 bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">
                                                    En cours...
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex-1 min-h-0 border rounded-lg overflow-hidden border-white/5 bg-[#0a0a0a]">
                                            {currentDeploymentId ? (
                                                <DeploymentTerminal
                                                    key={currentDeploymentId}
                                                    deploymentId={currentDeploymentId}
                                                    initialLogs={currentDeploymentId === latestDeployment?.id ? (latestDeployment.logs || []) : []}
                                                />
                                            ) : (
                                                <div className="h-full flex items-center justify-center bg-muted/5 text-muted-foreground p-4 text-center">
                                                    <p className="text-xs italic">Aucun log de build disponible.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* RUNTIME CONSOLE */}
                                    <div className={cn(
                                        "min-h-0 flex flex-col transition-all duration-500 ease-in-out",
                                        expandedConsole === 'runtime' ? "flex-[2]" : (expandedConsole === 'build' ? "flex-[0.5] opacity-50" : "flex-1")
                                    )}>
                                        <div className="flex items-center justify-between mb-2 flex-none">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    Logs de l'application
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 hover:bg-white/5"
                                                    onClick={() => setExpandedConsole(expandedConsole === 'runtime' ? 'none' : 'runtime')}
                                                >
                                                    {expandedConsole === 'runtime' ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-0">
                                            <RuntimeLogsTerminal appId={appId} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'deployments' && (
                                <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <AppDeploymentsCard
                                        appId={appId}
                                        appBranch={app.branch}
                                        currentDeploymentId={currentDeploymentId}
                                        onViewLogs={(id) => {
                                            setCurrentDeploymentId(id)
                                            setActiveTab('console')
                                            setExpandedConsole('build')
                                        }}
                                    />
                                </div>
                            )}

                            {activeTab === 'env' && (
                                <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                        volumes={app.persistent_volumes || []}
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
                                <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
                                    {/* URL active */}
                                    <div className="rounded-xl border bg-card/30 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">URL active</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Domaine public de l'application</p>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-medium px-2 py-0.5 rounded border",
                                                app.status === 'success' || app.status === 'running'
                                                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                                                    : "bg-muted text-muted-foreground border-border"
                                            )}>
                                                {app.status === 'success' || app.status === 'running' ? 'En ligne' : app.status}
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-9 bg-background/50 rounded-lg border border-white/5 flex items-center gap-2 px-3">
                                                    <Globe className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                    <span className="text-xs font-mono truncate">
                                                        {app.domain || `${app.name}.${app.server?.ip}.sslip.io`}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 text-xs shrink-0"
                                                    onClick={() => window.open(`https://${app.domain || `${app.name}.${app.server?.ip}.sslip.io`}`, '_blank')}
                                                >
                                                    Ouvrir
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-9 text-xs shrink-0" disabled>
                                                    Modifier
                                                </Button>
                                            </div>

                                            {/* Infos réseau */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {[
                                                    { label: 'Port conteneur', value: app.container_port || '3000', icon: <Lock className="h-3.5 w-3.5 text-muted-foreground" /> },
                                                    { label: 'Reverse proxy', value: 'Traefik v3', icon: <Globe className="h-3.5 w-3.5 text-muted-foreground" /> },
                                                    { label: 'SSL / HTTPS', value: 'Auto (sslip.io)', icon: <Lock className="h-3.5 w-3.5 text-green-500" /> },
                                                    { label: 'Réseau Docker', value: 'vpsly', icon: <ServerIcon className="h-3.5 w-3.5 text-muted-foreground" /> },
                                                ].map(item => (
                                                    <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                                                        <div className="flex items-center gap-2">
                                                            {item.icon}
                                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                                        </div>
                                                        <span className="text-xs font-mono">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {activeTab === 'danger' && (
                                <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
                                        Actions irréversibles
                                    </p>

                                    <div className="space-y-3">
                                        {/* PRUNE */}
                                        <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 2L14 13H2L8 2Z" stroke="#BA7517" strokeWidth="1.2" strokeLinejoin="round" />
                                                        <path d="M8 6.5V9" stroke="#BA7517" strokeWidth="1.2" strokeLinecap="round" />
                                                        <circle cx="8" cy="11" r="0.6" fill="#BA7517" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Nettoyer le serveur</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Supprime containers arrêtés, images orphelines et volumes inutilisés.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 text-xs"
                                                onClick={async () => {
                                                    if (confirm('Lancer un nettoyage complet du serveur Docker ?')) {
                                                        try {
                                                            const res = await apiFetch(`/servers/${app.server_id}/prune`, { method: 'POST' })
                                                            toast.success(res.message)
                                                        } catch {
                                                            toast.error('Échec du nettoyage')
                                                        }
                                                    }
                                                }}
                                            >
                                                Lancer le nettoyage
                                            </Button>
                                        </div>

                                        {/* DELETE */}
                                        <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-red-500/20 bg-red-500/[0.04]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <rect x="2" y="4" width="12" height="1.2" rx="0.6" fill="#E24B4A" />
                                                        <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="#E24B4A" strokeWidth="1.2" />
                                                        <path d="M6.5 7v4M9.5 7v4" stroke="#E24B4A" strokeWidth="1.2" strokeLinecap="round" />
                                                        <rect x="3.5" y="5.2" width="9" height="8" rx="1" stroke="#E24B4A" strokeWidth="1.2" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Supprimer l'application</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Arrête les containers, efface les fichiers sur le VPS et supprime l'entrée du dashboard.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="shrink-0 border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs"
                                                onClick={async () => {
                                                    if (confirm(`Supprimer "${app.name}" ? Cette action est irréversible.`)) {
                                                        try {
                                                            await apiFetch(`/applications/${appId}`, { method: 'DELETE' })
                                                            toast.success('Application supprimée.')
                                                            window.location.href = '/apps'
                                                        } catch {
                                                            toast.error('Échec de la suppression')
                                                        }
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
