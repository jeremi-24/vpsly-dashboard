import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { 
  Server as ServerIcon, 
  Loader2, 
  ChevronLeft, 
  ExternalLink, 
  RefreshCw, 
  ChevronDown, 
  Trash2,
  Database as DbIcon,
  Shield,
  Copy,
  Check,
  HardDrive,
  Settings,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { DatabaseLogsTerminal } from './database-logs-terminal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [isDeploying, setIsDeploying] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('logs')

  const fetchDatabase = async () => {
    try {
      setLoading(true)
      const data = await apiFetch(`/databases/${databaseId}`)
      setDatabase(data)
    } catch (error) {
      console.error('Failed to fetch database details', error)
      toast.error('Impossible de charger les détails de la base de données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDatabase()
  }, [databaseId])

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success('Copié !')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRedeploy = async () => {
    try {
      setIsDeploying(true)
      await apiFetch(`/databases/${databaseId}/deploy`, { method: 'POST' })
      toast.success('Déploiement relancé !')
      fetchDatabase()
    } catch (error) {
      toast.error('Échec du redéploiement')
    } finally {
      setIsDeploying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!database) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <h1 className="text-xl font-bold">Base de données non trouvée</h1>
        <Button variant="link" asChild className="mt-4 text-indigo-500">
          <Link to="/databases">Retour à la liste</Link>
        </Button>
      </div>
    )
  }

  const isRunning = database.status === 'running' || database.status === 'success'

  const navItems = [
    { id: 'logs', title: 'Console de Logs', icon: <RefreshCw size={16} /> },
    { id: 'config', title: 'Configuration', icon: <Settings size={16} /> },
    { id: 'storage', title: 'Stockage', icon: <HardDrive size={16} /> },
    { id: 'danger', title: 'Zone de Danger', icon: <Trash2 size={16} />, className: 'text-red-500 hover:text-red-600' },
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
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
               <EngineLogo image={database.image} size={16} />
               <span className="text-sm font-medium">{database.name}</span>
            </div>
        </div>
      </Header>

      <Main fixed>
        <div className="flex flex-col h-full">
            {/* HEADER SIMPLIFIÉ DANS LE MAIN */}
            <div className="flex items-start justify-between mb-6 flex-none">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{database.name}</h1>
                        <Badge 
                            variant="outline" 
                            className={`uppercase px-2 py-0.5 text-[10px] font-bold border 
                             ${isRunning ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}
                            `}
                        >
                            {isRunning ? 'En ligne' : database.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><ServerIcon size={12} /> {database.server?.name}</span>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="flex items-center gap-1"><Shield size={12} /> {database.image}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant="default" 
                        size="sm" 
                        disabled={isDeploying}
                        onClick={handleRedeploy}
                        className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"
                    >
                        {isDeploying ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
                        Redéployer
                    </Button>
                </div>
            </div>

            <Separator className="mb-6" />

            <div className="flex flex-1 gap-12 overflow-hidden">
                {/* SIDEBAR NAVIGATION */}
                <aside className="w-64 flex-none">
                    <nav className="flex flex-col space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    activeTab === item.id 
                                        ? "bg-muted text-foreground" 
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                    item.className
                                )}
                            >
                                {item.icon}
                                {item.title}
                                {item.id === 'logs' && (
                                    <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* CONTENT AREA */}
                <div className={cn(
                    "flex-1 pr-4 custom-scrollbar",
                    activeTab !== 'logs' ? "overflow-y-auto" : "overflow-hidden"
                )}>
                    {activeTab === 'logs' && (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4 flex-none">
                                <h2 className="text-lg font-bold">Console en temps réel</h2>
                                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px]">
                                    CONNECTED
                                </Badge>
                            </div>
                            <div className="flex-1 min-h-0">
                                <DatabaseLogsTerminal databaseId={databaseId} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'config' && (
                        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold">Paramètres de connexion</h2>
                                    <p className="text-sm text-muted-foreground">Informations d'identification et URLs pour se connecter.</p>
                                </div>
                                
                                <div className="space-y-4 rounded-xl border bg-card/50 p-6">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase opacity-60">URL Interne (DNS Docker)</Label>
                                            <div className="flex gap-2">
                                                <Input readOnly value={database.internal_db_url} className="h-9 font-mono text-xs bg-muted/30 border-none shadow-none" />
                                                <Button variant="secondary" size="icon" className="h-9 w-9 flex-none" onClick={() => handleCopy(database.internal_db_url, 'int')}>
                                                    {copied === 'int' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </Button>
                                            </div>
                                        </div>

                                        {database.is_public && (
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase opacity-60">URL Externe (Accès Public)</Label>
                                                <div className="flex gap-2">
                                                    <Input readOnly value={database.external_db_url} className="h-9 font-mono text-xs bg-muted/30 border-none shadow-none" />
                                                    <Button variant="secondary" size="icon" className="h-9 w-9 flex-none" onClick={() => handleCopy(database.external_db_url, 'ext')}>
                                                        {copied === 'ext' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold">Réseau & Visibilité</h2>
                                    <p className="text-sm text-muted-foreground">Contrôlez l'exposition de votre base sur Internet.</p>
                                </div>
                                <div className="flex items-center justify-between p-6 rounded-xl border bg-muted/10">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold">Exposition Publique</p>
                                        <p className="text-xs text-muted-foreground max-w-md">Activer cela permet de se connecter depuis votre PC local sans tunnel SSH.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={database.is_public ? "default" : "secondary"}>
                                            {database.is_public ? 'Activé' : 'Désactivé'}
                                        </Badge>
                                        <Button variant="outline" size="sm" disabled>Modifier</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'storage' && (
                        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-lg font-bold">Stockage persistant</h2>
                                <p className="text-sm text-muted-foreground">Volumes Docker attachés pour la persistance des données.</p>
                            </div>
                            
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
                                                    <p className="text-xs font-mono text-muted-foreground">{vol.mount_path}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="text-[10px]">READ/WRITE</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 border border-dashed rounded-xl text-center">
                                        <p className="text-sm text-muted-foreground italic">Aucun volume de stockage configuré.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-lg font-bold text-red-500">Zone de Danger</h2>
                                <p className="text-sm text-muted-foreground">Actions irréversibles sur cette instance.</p>
                            </div>

                            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold">Détruire l'instance SQL</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Cela stoppera et supprimera le conteneur Docker. Par sécurité, les volumes de données ne sont pas effacés du disque.
                                    </p>
                                </div>
                                <Button 
                                    variant="destructive" 
                                    className="font-bold gap-2"
                                    onClick={() => alert("Action de suppression à venir !")}
                                >
                                    <Trash2 size={16} />
                                    Supprimer définitivement
                                </Button>
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
