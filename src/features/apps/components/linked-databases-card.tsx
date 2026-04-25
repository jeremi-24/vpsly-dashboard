import { useState, useEffect } from 'react'
import { HardDrive, Plus, Unlink, ExternalLink, Loader2, Database, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface LinkedDatabasesCardProps {
  appId: string
  serverId: number
  onUpdate?: () => void
}

export function LinkedDatabasesCard({ appId, serverId, onUpdate }: LinkedDatabasesCardProps) {
  const [databases, setDatabases] = useState<any[]>([])
  const [allDatabases, setAllDatabases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [selectedDb, setSelectedDb] = useState<string>('')

  const fetchData = async () => {
    try {
      setLoading(true)
      // Charger toutes les bases pour le sélecteur
      const allDbs = await apiFetch('/databases')
      setAllDatabases(allDbs)

      // Filtrer les bases liées à cette app
      const linked = allDbs.filter((db: any) => db.application_id === parseInt(appId))
      setDatabases(linked)
    } catch (error) {
      console.error('Failed to fetch databases', error)
      toast.error('Erreur lors du chargement des bases de données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [appId])

  const handleLink = async () => {
    if (!selectedDb) return
    try {
      setLinking(true)
      await apiFetch(`/databases/${selectedDb}/link`, {
        method: 'POST',
        body: JSON.stringify({ application_id: appId })
      })
      toast.success('Base de données liée avec succès')
      setSelectedDb('')
      fetchData()
      onUpdate?.()
    } catch (error) {
      toast.error('Échec du lien')
    } finally {
      setLinking(false)
    }
  }

  const handleUnlink = async (dbId: number) => {
    try {
      await apiFetch(`/databases/${dbId}/unlink`, { method: 'POST' })
      toast.success('Base de données détachée')
      fetchData()
      onUpdate?.()
    } catch (error) {
      toast.error('Échec de la dissociation')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl border bg-card/30 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
        <div className="space-y-3">
            <Skeleton className="h-4 w-40 ml-1" />
            <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Filtrer les bases disponibles (non liées à une app et sur le même serveur idéalement)
  const availableDatabases = allDatabases.filter((db: any) => !db.application_id)

  return (
    <div className="space-y-6">
      {/* SECTION LINKING */}
      <div className="p-6 rounded-xl border bg-card/30 space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <Plus size={16} className="text-indigo-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider opacity-70">Connecter une base</h4>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedDb} onValueChange={setSelectedDb}>
            <SelectTrigger className="flex-1 h-10">
              <SelectValue placeholder="Choisir une base de données disponible..." />
            </SelectTrigger>
            <SelectContent>
              {availableDatabases.length === 0 ? (
                <div className="p-2 text-xs text-center text-muted-foreground">Aucune base disponible</div>
              ) : (
                availableDatabases.map((db: any) => (
                    <SelectItem key={db.id} value={db.id.toString()}>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{db.name}</span>
                            <span className="text-[10px] opacity-50">({db.image})</span>
                            {db.server_id !== serverId && (
                                <Badge variant="outline" className="text-[8px] h-3 px-1 ml-1 text-amber-500 border-amber-500/20">Serveur différent</Badge>
                            )}
                        </div>
                    </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleLink} 
            disabled={!selectedDb || linking}
            className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 font-bold"
          >
            {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lier"}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
            Les informations de connexion seront injectées automatiquement lors du prochain déploiement.
        </p>
      </div>

      {/* LISTING LINKED */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2 px-1">
            <HardDrive size={16} className="text-indigo-400" />
            Bases connectées ({databases.length})
        </h3>
        
        {databases.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center bg-muted/10">
            <p className="text-sm text-muted-foreground mb-1">Aucune base de données liée.</p>
            <p className="text-[10px] opacity-50">Les bases liées partagent leur réseau Docker avec l'application.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {databases.map((db) => (
              <div key={db.id} className="group p-4 rounded-xl border bg-card/50 hover:border-indigo-500/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Database size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{db.name}</span>
                        <Badge variant="secondary" className="text-[9px] h-4 py-0 uppercase">{db.status}</Badge>
                        {db.server_id !== serverId && !db.is_public && (
                            <Badge variant="destructive" className="text-[8px] h-4 bg-red-500/10 text-red-500 border-red-500/20">Accès Public Requis</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-medium">
                        <span>{db.image}</span>
                        <span>•</span>
                        <span>{db.server_id === serverId ? `Interne: ${db.uuid}` : `Externe: ${db.server?.ip}`}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] uppercase font-bold">
                    <a href={`/databases/${db.id}`} target="_blank">
                        Ouvrir <ExternalLink size={12} className="ml-1.5" />
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUnlink(db.id)}
                    className="h-8 text-red-500 border-red-500/20 hover:bg-red-500/10 text-[10px] uppercase font-bold"
                  >
                    <Unlink size={12} className="mr-1.5" /> Détacher
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {databases.some(db => db.server_id !== serverId) && (
        <Alert variant="destructive" className="bg-amber-500/5 border-amber-500/20 text-amber-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold uppercase tracking-wide">Attention Réseau</AlertTitle>
          <AlertDescription className="text-[10px]">
            Certaines bases sont sur des serveurs physiques différents. La liaison interne Docker ne fonctionnera pas ; l'application devra utiliser l'accès public de la base.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
