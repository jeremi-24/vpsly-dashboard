import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
    Server as ServerIcon,
    Loader,
    ChevronLeft,
    RefreshCw,
    Trash2,
    Database as DbIcon,
    Shield,
    Copy,
    HardDrive,
    Globe,
    Eye,
    EyeOff,
    Activity,
    Lock,
    Check,
    ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api'
import { echo } from '@/lib/echo'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatabaseLogsTerminal } from './database-logs-terminal'
import { MonitoringCard } from '@/features/monitoring/components/monitoring-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'

function EngineLogo({ image, size = 24 }: { image: string, size?: number }) {
    const img = image.toLowerCase()
    let logoUrl = ''

    if (img.includes('postgres')) {
        logoUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'
    } else if (img.includes('mysql')) {
        logoUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
    } else if (img.includes('redis')) {
        logoUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg'
    }

    if (logoUrl) {
        return <img src={logoUrl} alt={image} style={{ width: size, height: size }} className="object-contain" />
    }

    return <DbIcon size={size} />
}

export function DatabaseDetail() {
    const { databaseId } = useParams({ from: '/_authenticated/databases/$databaseId' })
    const search = useSearch({ from: '/_authenticated/databases/$databaseId' }) as any
    const [database, setDatabase] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState(search.tab || 'logs')
    const [showPassword, setShowPassword] = useState(false)
    const [isActionInProgress, setIsActionInProgress] = useState(false)
    const [integrityStatus, setIntegrityStatus] = useState<'idle' | 'checking' | 'intact' | 'missing'>('idle')
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const navigate = useNavigate()

    const handleDelete = async () => {
        try {
            setIsActionInProgress(true)
            await apiFetch(`/databases/${databaseId}`, { method: 'DELETE' })
            toast.success('Base de données supprimée')
            setIsConfirmOpen(false)
            navigate({ to: '/databases' })
        } catch (error) {
            toast.error('Échec de la suppression')
            setIsActionInProgress(false)
        }
    }

    const handleVerifyIntegrity = async () => {
        try {
            setIntegrityStatus('checking')
            toast.info('Vérification du volume sur le VPS...')
            const res = await apiFetch(`/databases/${databaseId}/verify`, { method: 'POST' })
            if (res.is_intact) {
                setIntegrityStatus('intact')
                toast.success(res.message)
            } else {
                setIntegrityStatus('missing')
                toast.error(res.message)
            }
        } catch (error) {
            setIntegrityStatus('idle')
            toast.error('Échec de la vérification')
        }
    }

    const fetchDatabase = async () => {
        try {
            setLoading(true)
            const data = await apiFetch(`/databases/${databaseId}`)
            setDatabase(data)
        } catch (error) {
            toast.error('Impossible de charger les détails')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDatabase()

        const channel = echo.channel(`database.${databaseId}`)
            .listen('DatabaseStatusUpdatedEvent', (e: any) => {
                setDatabase((prev: any) => {
                    if (e.database.status === 'running' && (prev?.status === 'deploying' || prev?.status === 'creating')) {
                        toast.success('Instance prête et en ligne !', {
                            icon: <Check size={16} />,
                            style: { backgroundColor: '#10b981', color: '#fff' }
                        })
                        setIsActionInProgress(false)
                    }
                    if (e.database.status === 'failed') {
                        toast.error('Le déploiement a échoué.')
                        setIsActionInProgress(false)
                    }
                    return { ...prev, ...e.database }
                })
            })

        return () => {
            echo.leaveChannel(`database.${databaseId}`)
        }
    }, [databaseId])

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copié !')
    }

    const handleRedeploy = async () => {
        try {
            setIsActionInProgress(true)
            await apiFetch(`/databases/${databaseId}/deploy`, { method: 'POST' })
            toast.info('Redéploiement initié...')
        } catch (error) {
            toast.error('Échec du lancement')
            setIsActionInProgress(false)
        }
    }

    const handleStop = async () => {
        try {
            setIsActionInProgress(true)
            await apiFetch(`/databases/${databaseId}/stop`, { method: 'POST' })
            toast.success('Instance arrêtée')
            setDatabase((prev: any) => ({ ...prev, status: 'exited' }))
        } catch (error) {
            toast.error('Échec de l\'arrêt')
        } finally {
            setIsActionInProgress(false)
        }
    }

    const handleStart = async () => {
        try {
            setIsActionInProgress(true)
            await apiFetch(`/databases/${databaseId}/start`, { method: 'POST' })
            toast.success('Instance démarrée')
            setDatabase((prev: any) => ({ ...prev, status: 'running' }))
        } catch (error) {
            toast.error('Échec du démarrage')
        } finally {
            setIsActionInProgress(false)
        }
    }

    const handleTogglePublic = async () => {
        try {
            setIsActionInProgress(true)
            await apiFetch(`/databases/${databaseId}/toggle-public`, { method: 'PATCH' })
            toast.info(database.is_public ? 'Fermeture de l\'accès public...' : 'Ouverture de l\'accès public...')
        } catch (error) {
            toast.error('Erreur lors du changement de visibilité')
            setIsActionInProgress(false)
        }
    }

    const isDeploying = database?.status === 'deploying' || database?.status === 'creating' || isActionInProgress

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    if (!database) {
        return (
            <div className="flex flex-col h-screen items-center justify-center text-center p-8">
                <h1 className="text-xl font-bold">Instance non trouvée</h1>
                <Button variant="link" asChild className="mt-4 text-indigo-500">
                    <Link to="/databases">Retour aux bases de données</Link>
                </Button>
            </div>
        )
    }

    const isRunning = database.status === 'running' || database.status === 'success'

    const navItems = [
        { id: 'logs', title: 'Logs & Activité', icon: <Activity size={16} /> },
        { id: 'config', title: 'Connexion', icon: <Lock size={16} /> },
        { id: 'storage', title: 'Stockage', icon: <HardDrive size={16} /> },
        { id: 'danger', title: 'Danger', icon: <Trash2 size={16} />, className: 'text-red-500 hover:text-red-600' },
    ]

    return (
        <>
            <Header>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/databases">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Separator orientation="vertical" className="h-4 sm:block hidden" />
                    <div className="flex items-center gap-2">
                        <EngineLogo image={database.image} size={16} />
                        <span className="text-sm font-medium">{database.name}</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "uppercase px-1.5 py-0 text-[9px] font-bold",
                                isRunning ? "bg-green-500/10 text-green-500 border-green-500/10" : "bg-slate-500/10 text-slate-500 border-slate-500/10"
                            )}
                        >
                            {isRunning ? 'Online' : (isDeploying ? 'Deploying...' : database.status)}
                        </Badge>
                    </div>
                </div>
            </Header>

            <Main fixed>
                {/* HEADER SIMPLIFIÉ */}
                <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4 flex-none">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight truncate max-w-[250px] sm:max-w-none">{database.name}</h1>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "uppercase px-1.5 py-0 text-[9px] font-bold",
                                    isRunning ? "bg-green-500/10 text-green-500 border-green-500/10" : "bg-slate-500/10 text-slate-500 border-slate-500/10"
                                )}
                            >
                                {isRunning ? 'Online' : (isDeploying ? 'Deploying...' : database.status)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><ServerIcon size={12} /> {database.server?.name}</span>
                            <Separator orientation="vertical" className="h-3 hidden sm:block" />
                            <span className="flex items-center gap-1 font-mono opacity-70 tracking-tighter"><Shield size={12} /> {database.image}</span>
                            <Separator orientation="vertical" className="h-3 hidden sm:block" />
                            <span className="text-indigo-400 font-medium">Instance Active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {database.has_adminer && database.adminer_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 text-xs font-bold w-full sm:w-auto border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
                            >
                                <a href={`http://${database.adminer_url}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink size={14} className="mr-2" />
                                    Ouvrir Adminer
                                </a>
                            </Button>
                        )}
                        {isRunning ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isDeploying}
                                onClick={handleStop}
                                className="h-8 text-xs font-bold w-full sm:w-auto text-red-500 border-red-500/20 hover:bg-red-500/10"
                            >
                                {isDeploying ? <Loader size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2 rotate-180" />}
                                STOP
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isDeploying}
                                onClick={handleStart}
                                className="h-8 text-xs font-bold w-full sm:w-auto text-green-500 border-green-500/20 hover:bg-green-500/10"
                            >
                                {isDeploying ? <Loader size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
                                START
                            </Button>
                        )}
                        <Button
                            variant="default"
                            size="sm"
                            disabled={isDeploying}
                            onClick={handleRedeploy}
                            className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-bold w-full sm:w-auto"
                        >
                            {isDeploying ? <Loader size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
                            Redémarrer
                        </Button>
                    </div>
                </div>

                <Separator className="mb-6" />

                <div className="flex flex-col md:flex-row flex-1 gap-6 md:gap-12 overflow-hidden">
                    <aside className="w-full md:w-60 flex-none overflow-x-auto md:overflow-y-auto custom-scrollbar md:pr-2">
                        {/* <div className="mb-4 px-1 hidden md:block">
                            <MonitoringCard type="databases" id={databaseId} />
                        </div> */}
                        <nav className="flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-1 min-w-max md:min-w-0 pb-2 md:pb-0">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 md:py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap",
                                        activeTab === item.id
                                            ? "bg-muted text-foreground font-bold"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                        item.className
                                    )}
                                >
                                    <span className="opacity-70">{item.icon}</span>
                                    {item.title}
                                    {(item.id === 'logs' && isDeploying) && (
                                        <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* CONTENT AREA */}
                    <div className={cn(
                        "flex-1 min-w-0 pb-6 md:pr-4 custom-scrollbar",
                        activeTab === 'logs' ? "overflow-hidden" : "overflow-y-auto"
                    )}>
                        {activeTab === 'logs' && (
                            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex-1 min-h-0">
                                    <DatabaseLogsTerminal databaseId={databaseId} status={database.status} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'config' && (
                            <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section className="space-y-6">
                                    <h2 className="text-lg font-bold">Connexion</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 p-4 rounded-xl border bg-card/30">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">DB_HOST (Interne)</Label>
                                            <div className="flex items-center gap-2 group">
                                                <code className="text-xs font-mono text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded truncate flex-1">{database.uuid}</code>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(database.uuid)}>
                                                    <Copy size={12} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "space-y-2 p-4 rounded-xl border transition-all",
                                            database.is_public ? "bg-card/30" : "bg-muted/20 opacity-40 grayscale"
                                        )}>
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">DB_HOST (Public)</Label>
                                            {database.is_public ? (
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs font-mono text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded truncate flex-1">{database.server?.ip}</code>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(database.server?.ip)}>
                                                        <Copy size={12} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-xs italic text-muted-foreground mt-1">Désactivé</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2 p-4 rounded-xl border bg-card/30">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">DB_NAME</Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono font-bold truncate">{database.db_name}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => handleCopy(database.db_name)}>
                                                    <Copy size={10} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 p-4 rounded-xl border bg-card/30">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">DB_PORT</Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono font-bold">{database.public_port || (database.type === 'mysql' || database.type === 'mariadb' ? 3306 : (database.type === 'redis' ? 6379 : 5432))}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 p-4 rounded-xl border bg-card/30">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">DB_USER</Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono font-bold truncate">{database.db_user}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => handleCopy(database.db_user)}>
                                                    <Copy size={10} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 p-4 rounded-xl border bg-card/30">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">DB_PASSWORD</Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono font-bold truncate tracking-tighter">
                                                    {showPassword ? database.db_password : '••••••••••••••••'}
                                                </span>
                                                <div className="flex items-center gap-1 ml-auto">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(database.db_password)}>
                                                        <Copy size={12} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 p-4 rounded-xl border bg-card/30">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">URL Complète (Interne)</Label>
                                        <div className="flex items-center gap-2">
                                            <code className="text-[10px] font-mono text-muted-foreground truncate flex-1">{database.internal_db_url}</code>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(database.internal_db_url)}>
                                                <Copy size={12} />
                                            </Button>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h2 className="text-lg font-bold">Réseau</h2>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold">Accès Public</h4>
                                            <p className="text-xs text-muted-foreground">Expose la base sur le port {database.public_port || 5432} du VPS.</p>
                                        </div>
                                        <Button
                                            variant={database.is_public ? "default" : "outline"}
                                            size="sm"
                                            disabled={isDeploying}
                                            onClick={handleTogglePublic}
                                            className={cn(
                                                "h-8 font-bold w-full sm:w-auto",
                                                database.is_public ? "bg-indigo-600 hover:bg-indigo-700" : ""
                                            )}
                                        >
                                            {isDeploying ? <Loader size={14} className="animate-spin mr-2" /> : (database.is_public ? <Globe size={14} className="mr-2" /> : <Lock size={14} className="mr-2" />)}
                                            {database.is_public ? 'Désactiver' : 'Activer'}
                                        </Button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'storage' && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-lg font-bold">Volumes</h2>
                                <div className="grid gap-3">
                                    {database.persistent_storages?.length > 0 ? (
                                        database.persistent_storages.map((vol: any) => (
                                            <div key={vol.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-card/30 gap-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                                        <HardDrive size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{vol.name}</p>
                                                        <code className="text-[10px] font-mono text-muted-foreground">{vol.mount_path}</code>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] opacity-60">READ/WRITE</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 border border-dashed rounded-xl text-center bg-muted/5 opacity-40">
                                            <p className="text-sm italic">Aucun volume configuré</p>
                                        </div>
                                    )}

                                    <div className="mt-8 p-6 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-indigo-400" />
                                                    Intégrité des données
                                                </h4>
                                                <p className="text-xs text-muted-foreground">Vérifie physiquement la présence du volume sur le VPS.</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={integrityStatus === 'checking'}
                                                onClick={handleVerifyIntegrity}
                                                className="h-8 font-bold w-full sm:w-auto"
                                            >
                                                {integrityStatus === 'checking' ? <Loader className="h-3 w-3 animate-spin mr-2" /> : <Check className="h-3 w-3 mr-2" />}
                                                Vérifier
                                            </Button>
                                        </div>
                                        {integrityStatus !== 'idle' && (
                                            <div className={cn(
                                                "p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-300",
                                                integrityStatus === 'intact' ? "bg-green-500/10 text-green-500 border border-green-500/20" : 
                                                integrityStatus === 'checking' ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                                                "bg-red-500/10 text-red-500 border border-red-500/20"
                                            )}>
                                                {integrityStatus === 'checking' ? <Loader className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
                                                {integrityStatus === 'intact' ? "Système de fichiers intègre et monté" : 
                                                 integrityStatus === 'checking' ? "Analyse du stockage en cours..." :
                                                 "ALERTE : Volume manquant sur l'hôte"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'danger' && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-lg font-bold text-red-500">Danger</h2>
                                <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 space-y-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold">Supprimer l'instance</h4>
                                            <p className="text-xs text-muted-foreground">Stoppe le container. Les données restent sur le disque.</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            onClick={() => setIsConfirmOpen(true)}
                                            disabled={isDeploying}
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Main>

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Supprimer la base de données ?"
                destructive
                isLoading={isActionInProgress}
                handleConfirm={handleDelete}
                confirmText="Supprimer définitivement"
                desc={
                    <div className="space-y-3">
                        <p>
                            Cette action va stopper le container <code className="text-indigo-400">{database.uuid}</code> sur le serveur.
                        </p>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                            <strong>Note :</strong> Les volumes de données ne seront pas supprimés pour éviter toute perte accidentelle. Vous devrez les supprimer manuellement sur le VPS si nécessaire.
                        </div>
                    </div>
                }
            />
        </>
    )
}
