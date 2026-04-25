import { useState, useEffect } from 'react'
import { HardDrive, Download, Trash2, RefreshCw, Loader2, Database, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiFetch, getApiUrl } from '@/lib/api'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Backup {
  id: number
  name: string
  type: string
  status: string
  size: number
  created_at: string
  notes: string | null
}

export function AppBackupsCard({ appId, databases = [] }: { appId: number, databases?: any[] }) {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const res = await apiFetch(`/applications/${appId}/backups`)
      setBackups(res)
    } catch (err) {
      toast.error('Échec de la récupération des sauvegardes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [appId])

  const createBackup = async (databaseId?: number) => {
    try {
      setActionLoading(true)
      await apiFetch(`/applications/${appId}/backups`, {
        method: 'POST',
        body: JSON.stringify({ database_id: databaseId })
      })
      toast.success('Sauvegarde lancée en arrière-plan')
      // On rafraîchit après un petit délai pour voir le statut "pending"
      setTimeout(fetchBackups, 2000)
    } catch (err) {
      toast.error('Erreur lors du lancement de la sauvegarde')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteBackup = async (id: number) => {
    if (!confirm('Supprimer cette entrée de sauvegarde ?')) return

    try {
      setActionLoading(true)
      await apiFetch(`/applications/${appId}/backups/${id}`, {
        method: 'DELETE'
      })
      setBackups(backups.filter(b => b.id !== id))
      toast.success('Sauvegarde supprimée')
    } catch (err) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadBackup = async (backup: Backup) => {
    try {
      setActionLoading(true)
      const token = localStorage.getItem('vpsly_auth_token')
      const res = await fetch(`${getApiUrl()}/applications/${appId}/backups/${backup.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      })

      if (!res.ok) throw new Error('Échec du téléchargement')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = backup.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Téléchargement démarré')
    } catch (err) {
      toast.error('Erreur lors du téléchargement du fichier')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Sauvegardes manuelles</CardTitle>
            <CardDescription className="text-xs">
              Créez une copie de sécurité immédiate de vos données.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchBackups} disabled={loading} className="h-8">
            <RefreshCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {databases.length > 0 ? (
                databases.map(db => (
                    <div key={db.id} className="p-4 border rounded-xl bg-card/30 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                <Database size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{db.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Base de données</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            onClick={() => createBackup(db.id)} 
                            disabled={actionLoading}
                            className="h-8 text-[10px] font-bold"
                        >
                            Sauvegarder
                        </Button>
                    </div>
                ))
            ) : (
                <div className="col-span-2 p-8 border border-dashed rounded-xl text-center text-muted-foreground">
                    <p className="text-xs">Aucune base de données liée trouvée pour cette application.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des sauvegardes</CardTitle>
          <CardDescription className="text-xs">
            Liste de vos sauvegardes stockées sur le serveur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.length > 0 ? (
              backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-2 rounded-lg",
                        backup.status === 'success' ? "bg-green-500/10 text-green-500" : 
                        backup.status === 'failed' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500 animate-pulse"
                    )}>
                        {backup.status === 'success' ? <CheckCircle2 size={16} /> : 
                         backup.status === 'failed' ? <AlertCircle size={16} /> : <Loader2 size={16} className="animate-spin" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold font-mono">{backup.name}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{new Date(backup.created_at).toLocaleString()}</span>
                        <Separator orientation="vertical" className="h-2" />
                        <span>{formatSize(backup.size)}</span>
                        <Separator orientation="vertical" className="h-2" />
                        <Badge variant="outline" className="text-[9px] h-4 px-1 opacity-70 uppercase tracking-tighter">
                            {backup.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {backup.status === 'success' && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => downloadBackup(backup)}
                            disabled={actionLoading}
                            className="h-8 w-8 text-indigo-400 hover:text-indigo-500 hover:bg-indigo-500/10"
                        >
                            <Download size={14} />
                        </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteBackup(backup.id)} 
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-14 w-14" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg opacity-50">
                <p className="text-[10px] font-bold uppercase tracking-widest">Aucun backup trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

