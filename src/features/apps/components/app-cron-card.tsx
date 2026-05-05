import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2, RefreshCw, Loader, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { UpgradeModal } from '@/components/shared/upgrade-modal'
import { Lock } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CronTask {
  id: number
  command: string
  frequency: string
  description: string
  is_active: boolean
}

interface CronData {
  build_pack: string
  has_laravel_scheduler: boolean
  last_cron_synced_at: string | null
  last_cron_sync_error: string | null
  tasks: CronTask[]
}

export function AppCronCard({ appId }: { appId: number }) {
  const [data, setData] = useState<CronData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [addingTask, setAddingTask] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [newTask, setNewTask] = useState({ command: '', frequency: '* * * * *', description: '' })

  const user = useAuthStore(state => state.auth.user)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const isLocked = user?.current_team?.plan === 'starter'

  const fetchCrons = async () => {
    try {
      setLoading(true)
      setData(await apiFetch(`/applications/${appId}/crons`))
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCrons() }, [appId])

  const toggleLaravel = async (active: boolean) => {
    try {
      setSyncing(true)
      setData(await apiFetch(`/applications/${appId}/crons/toggle-laravel`, {
        method: 'PUT',
        body: JSON.stringify({ active })
      }))
      toast.success(active ? 'Laravel Scheduler activé' : 'Désactivé')
    } catch {
      toast.error('Échec de la modification du Scheduler')
    } finally {
      setSyncing(false)
    }
  }

  const addTask = async () => {
    if (!newTask.command) return
    try {
      setSyncing(true)
      toast.info('Ajout de la tâche en cours...')
      setData(await apiFetch(`/applications/${appId}/crons`, {
        method: 'POST',
        body: JSON.stringify(newTask)
      }))
      setAddingTask(false)
      setNewTask({ command: '', frequency: '* * * * *', description: '' })
      toast.success('Tâche ajoutée avec succès')
    } catch {
      toast.error('Erreur lors de l\'ajout de la tâche')
    } finally {
      setSyncing(false)
    }
  }

  const deleteTask = async (id: number) => {
    try {
      setSyncing(true)
      toast.info('Suppression de la tâche...')
      setData(await apiFetch(`/applications/${appId}/crons/${id}`, { method: 'DELETE' }))
      toast.success('Tâche supprimée')
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setSyncing(false)
      setDeleteId(null)
    }
  }

  const manualSync = async () => {
    try {
      setSyncing(true)
      toast.info('Synchronisation avec le VPS lancée...')
      setData(await apiFetch(`/applications/${appId}/crons/sync`, { method: 'POST' }))
      toast.success('Configuration synchronisée sur le VPS')
    } catch {
      toast.error('Échec de la synchronisation VPS')
    } finally {
      setSyncing(false)
    }
  }

  const isLaravel = data?.build_pack?.toLowerCase().includes('laravel') || data?.build_pack === 'php'

  return (
    <div className="space-y-3">
      {/* Laravel Scheduler Skeleton or Content */}
      {loading && !data ? (
        <Skeleton className="h-16 w-full rounded-xl opacity-20" />
      ) : isLaravel && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Laravel Scheduler</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exécute <code className="text-[10px] bg-white/5 px-1 rounded">schedule:run</code> toutes les minutes
              </p>
            </div>
          </div>
          <Switch 
            checked={data?.has_laravel_scheduler} 
            onCheckedChange={(val) => isLocked ? setShowUpgradeModal(true) : toggleLaravel(val)} 
            disabled={syncing} 
          />
        </div>
      )}

      {/* Tâches personnalisées */}
      <div className="rounded-xl border bg-card/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-sm font-medium"></p>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => isLocked ? setShowUpgradeModal(true) : manualSync()} 
              disabled={syncing || loading} 
              className={cn(
                "h-7 text-xs gap-1.5 relative overflow-hidden",
                isLocked && "premium-lock-overlay group/btn"
              )}
            >
              {isLocked && <div className="shimmer-effect" />}
              {isLocked ? <Lock className="h-3 w-3" /> : <RefreshCw className={cn("h-3 w-3", (syncing || loading) && "animate-spin")} />}
              Sync VPS
            </Button>
            <Button 
              size="sm" 
              onClick={() => isLocked ? setShowUpgradeModal(true) : setAddingTask(true)} 
              disabled={addingTask || loading} 
              className={cn(
                "h-7 text-xs gap-1.5 relative overflow-hidden",
                isLocked && "premium-lock-overlay group/btn"
              )}
            >
              {isLocked && <div className="shimmer-effect" />}
              {isLocked ? <Lock className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              Ajouter
            </Button>
          </div>
        </div>

        {/* Formulaire ajout */}
        {addingTask && (
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Commande</Label>
                <Input
                  placeholder="php artisan backup:run"
                  value={newTask.command}
                  onChange={e => setNewTask({ ...newTask, command: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Fréquence</Label>
                  <a href="https://crontab.guru" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5">
                    Aide <ExternalLink size={9} />
                  </a>
                </div>
                <Input
                  placeholder="* * * * *"
                  value={newTask.frequency}
                  onChange={e => setNewTask({ ...newTask, frequency: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description (optionnel)</Label>
              <Input
                placeholder="Sauvegarde quotidienne"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAddingTask(false)} className="h-7 text-xs">Annuler</Button>
              <Button size="sm" onClick={addTask} disabled={!newTask.command || syncing} className="h-7 text-xs">
                {syncing && <Loader className="h-3 w-3 animate-spin mr-1" />}
                Enregistrer
              </Button>
            </div>
          </div>
        )}

        {/* Liste des tâches ou Skeleton */}
        <div className="divide-y divide-white/[0.04]">
          {loading && !data ? (
             <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full opacity-10" />
                <Skeleton className="h-10 w-full opacity-5" />
             </div>
          ) : data?.tasks && data.tasks.length > 0 ? data.tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] group transition-colors">
              <div className="flex items-center gap-3">
                <code className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0">
                  {task.frequency}
                </code>
                <div>
                  <p className="text-xs font-mono font-medium">{task.command}</p>
                  {task.description && <p className="text-[10px] text-muted-foreground mt-0.5">{task.description}</p>}
                </div>
              </div>
              <button
                onClick={() => setDeleteId(task.id)}
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )) : !addingTask && (
            <div className="py-10 text-center text-muted-foreground">
              <p className="text-xs">Aucune tâche personnalisée</p>
            </div>
          )}
        </div>

        {/* Status bar */}
        {!loading && (
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", data?.last_cron_sync_error ? "bg-red-500" : data?.last_cron_synced_at ? "bg-green-500" : "bg-muted-foreground/30")} />
                <span className="text-[10px] text-muted-foreground">
                    {data?.last_cron_sync_error ? 'Erreur de synchronisation' :
                    data?.last_cron_synced_at ? `Synchronisé le ${new Date(data.last_cron_synced_at).toLocaleString()}` :
                        'Pas encore synchronisé'}
                </span>
            </div>
        )}

        {/* Erreur détail */}
        {data?.last_cron_sync_error && (
          <div className="mx-4 mb-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
            <pre className="text-[10px] font-mono text-red-400/80 overflow-x-auto whitespace-pre-wrap">
              {data.last_cron_sync_error}
            </pre>
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette tâche ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La tâche sera définitivement supprimée du serveur lors de la prochaine synchronisation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteTask(deleteId)} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
        reason="La gestion des tâches planifiées (Cron) est réservée aux membres Solo et Pro."
      />
    </div>
  )
}