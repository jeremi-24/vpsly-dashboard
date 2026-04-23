import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { 
  Server as ServerIcon, 
  Loader2, 
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
  Check
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
  const [database, setDatabase] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('logs')
  const [showPassword, setShowPassword] = useState(false)
  const [isActionInProgress, setIsActionInProgress] = useState(false)

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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
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
        <div className="flex items-start justify-between mb-8">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{database.name}</h1>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ServerIcon size={12} /> {database.server?.name}</span>
                    <Separator orientation="vertical" className="h-3 sm:block hidden" />
                    <span className="flex items-center gap-1 font-mono opacity-70 tracking-tighter"><Shield size={12} /> {database.image}</span>
                    <Separator orientation="vertical" className="h-3 sm:block hidden" />
                    <span className="text-indigo-400 font-medium">Instance Active</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button 
                    variant="default" 
                    size="sm" 
                    disabled={isDeploying}
                    onClick={handleRedeploy}
                    className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-bold"
                >
                    {isDeploying ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
                    Reboot
                </Button>
            </div>
        </div>

        <div className="flex flex-1 gap-12 overflow-hidden h-[calc(100vh-200px)]">
            <aside className="w-60 flex-none h-full">
                <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                activeTab === item.id 
                                    ? "bg-muted text-foreground font-bold" 
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                item.className
                            )}
                        >
                            {item.icon}
                            {item.title}
                            {(item.id === 'logs' && isDeploying) && (
                                <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            <div className={cn(
                "flex-1 pr-2 custom-scrollbar",
                activeTab === 'logs' ? "overflow-hidden" : "overflow-y-auto"
            )}>
                {activeTab === 'logs' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex-1 min-h-0">
                            <DatabaseLogsTerminal databaseId={databaseId} />
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

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2 p-4 rounded-xl border bg-card/30">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">DB_PORT</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold">{database.public_port || 5432}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 p-4 rounded-xl border bg-card/30">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">DB_USER</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold truncate">{database.postgres_user}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => handleCopy(database.postgres_user)}>
                                            <Copy size={10} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2 p-4 rounded-xl border bg-card/30">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">DB_PASSWORD</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold truncate tracking-tighter">
                                            {showPassword ? database.postgres_password : '••••••••••••••••'}
                                        </span>
                                        <div className="flex items-center gap-1 ml-auto">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(database.postgres_password)}>
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
                            <div className="flex items-center justify-between p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
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
                                        "h-8 font-bold",
                                        database.is_public ? "bg-indigo-600 hover:bg-indigo-700" : ""
                                    )}
                                >
                                    {isDeploying ? <Loader2 size={14} className="animate-spin mr-2" /> : (database.is_public ? <Globe size={14} className="mr-2" /> : <Lock size={14} className="mr-2" />)}
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
                                    <div key={vol.id} className="flex items-center justify-between p-4 rounded-xl border bg-card/30">
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
                        </div>
                    </div>
                )}

                {activeTab === 'danger' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-lg font-bold text-red-500">Danger</h2>
                        <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold">Supprimer l'instance</h4>
                                    <p className="text-xs text-muted-foreground">Stoppe le container. Les données restent sur le disque.</p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => alert('Suppression à implémenter')}>
                                    Supprimer
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </Main>
    </>
  )
}
