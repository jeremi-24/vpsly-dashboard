import { useEffect, useState } from 'react'
import { HardDrive, Download, Trash2, RefreshCw, Loader, Database, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiFetch, getApiUrl } from '@/lib/api'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { echo } from '@/lib/echo'

interface Backup {
  id: number
  name: string
  type: string
  status: string
  size: number
  created_at: string
  notes: string | null
}

export function AppBackupsCard({ appId, databases = [], volumes = [] }: { appId: number, databases?: any[], volumes?: any[] }) {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const data = await apiFetch(`/applications/${appId}/backups`)
      setBackups(data)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchBackups() 

    // Écoute des mises à jour de backup en temps réel
    const channel = echo.private(`application.${appId}`)
      .listen('.BackupUpdatedEvent', (e: { backup: Backup }) => {
        setBackups(prev => {
          const index = prev.findIndex(b => b.id === e.backup.id)
          if (index !== -1) {
            const newBackups = [...prev]
            newBackups[index] = e.backup
            return newBackups
          }
          return [e.backup, ...prev]
        })
        
        if (e.backup.status === 'success') toast.success(`Sauvegarde terminée : ${e.backup.name}`)
        if (e.backup.status === 'failed') toast.error(`Échec de la sauvegarde : ${e.backup.name}`)
      })

    return () => {
        echo.leaveChannel(`application.${appId}`)
    }
  }, [appId])

  const createBackup = async (databaseId?: number, volumeId?: number) => {
    try {
      setActionLoading(true)
      toast.info('Initialisation de la sauvegarde...')
      const pendingBackup = await apiFetch(`/applications/${appId}/backups`, {
        method: 'POST',
        body: JSON.stringify({ database_id: databaseId, volume_id: volumeId })
      })
      
      // Mise à jour optimiste : on ajoute le record "pending" immédiatement
      setBackups(prev => [pendingBackup, ...prev])
      toast.info('Sauvegarde mise en file d\'attente')
    } catch {
      toast.error('Échec du lancement de la sauvegarde')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteBackup = async (id: number) => {
    try {
      setActionLoading(true)
      toast.info('Suppression du fichier de sauvegarde...')
      await apiFetch(`/applications/${appId}/backups/${id}`, { method: 'DELETE' })
      setBackups(b => b.filter(x => x.id !== id))
      toast.success('Sauvegarde supprimée avec succès')
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
      setDeleteId(null)
    }
  }

  const downloadBackup = async (backup: Backup) => {
    try {
      setActionLoading(true)
      const token = localStorage.getItem('vpsly_auth_token')
      const res = await fetch(`${getApiUrl()}/applications/${appId}/backups/${backup.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = backup.name
      document.body.appendChild(a); a.click()
      window.URL.revokeObjectURL(url); document.body.removeChild(a)
      toast.success('Téléchargement démarré')
    } catch {
      toast.error('Erreur de téléchargement')
    } finally {
      setActionLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  const statusPill = (status: string) => {
    const map: Record<string, string> = {
      success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    }
    const labels: Record<string, string> = { success: 'succès', failed: 'échec', pending: 'en cours' }
    return (
      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", map[status] || map.pending)}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      {/* Sources */}
      <div className="rounded-xl border bg-card/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-sm font-medium">Lancer une sauvegarde</p>
          <Button variant="ghost" size="sm" onClick={fetchBackups} disabled={loading} className="h-7 text-xs gap-1.5">
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            Actualiser
          </Button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
          ) : databases.length === 0 && volumes.length === 0 ? (
            <div className="py-6 text-center border border-dashed rounded-lg text-muted-foreground">
              <p className="text-xs">Aucune ressource à sauvegarder</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {databases.map(db => (
                <div key={`db-${db.id}`} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Database className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium truncate max-w-[100px]">{db.name}</p>
                      <p className="text-[10px] text-muted-foreground">Base de données</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => createBackup(db.id)} disabled={actionLoading} className="h-7 text-[10px]">
                    Backup
                  </Button>
                </div>
              ))}
              {volumes.map(vol => (
                <div key={`vol-${vol.id}`} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <HardDrive className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium truncate max-w-[100px]">{vol.mount_path}</p>
                      <p className="text-[10px] text-muted-foreground">Volume</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => createBackup(undefined, vol.id)} disabled={actionLoading} className="h-7 text-[10px]">
                    Backup
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historique */}
      <div className="rounded-xl border bg-card/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm font-medium">Historique</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {loading ? Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          )) : backups.length > 0 ? backups.map(backup => (
            <div key={backup.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] group transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  backup.status === 'success' ? (backup.type === 'volume' ? "bg-blue-500/10" : "bg-green-500/10") :
                    backup.status === 'failed' ? "bg-red-500/10" : "bg-amber-500/10"
                )}>
                  {backup.status === 'pending' ? <Loader className="h-4 w-4 text-amber-400 animate-spin" /> :
                    backup.status === 'failed' ? <AlertCircle className="h-4 w-4 text-red-400" /> :
                      backup.type === 'volume' ? <HardDrive className="h-4 w-4 text-blue-400" /> :
                        <Database className="h-4 w-4 text-green-400" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono font-medium truncate max-w-[280px]">{backup.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{new Date(backup.created_at).toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{formatSize(backup.size)}</span>
                    {statusPill(backup.status)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {backup.status === 'success' && (
                  <button
                    onClick={() => downloadBackup(backup)}
                    disabled={actionLoading}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setDeleteId(backup.id)}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-10 text-center text-muted-foreground">
              <p className="text-xs">Aucune sauvegarde</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la sauvegarde ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le fichier physique sur le serveur sera également supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteBackup(deleteId)} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}