import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2, RefreshCw, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
  const [newTask, setNewTask] = useState({ command: '', frequency: '* * * * *', description: '' })

  const fetchCrons = async () => {
    try {
      setLoading(true)
      const res = await apiFetch(`/applications/${appId}/crons`)
      setData(res)
    } catch (err) {
      toast.error('Failed to fetch cron tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCrons()
  }, [appId])

  const toggleLaravel = async (active: boolean) => {
    try {
      setSyncing(true)
      const res = await apiFetch(`/applications/${appId}/crons/toggle-laravel`, {
        method: 'PUT',
        body: JSON.stringify({ active })
      })
      setData(res)
      toast.success(active ? 'Laravel Scheduler activé' : 'Laravel Scheduler désactivé')
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du scheduler')
    } finally {
      setSyncing(false)
    }
  }

  const addTask = async () => {
    try {
      setSyncing(true)
      const res = await apiFetch(`/applications/${appId}/crons`, {
        method: 'POST',
        body: JSON.stringify(newTask)
      })
      setData(res)
      setAddingTask(false)
      setNewTask({ command: '', frequency: '* * * * *', description: '' })
      toast.success('Tâche ajoutée avec succès')
    } catch (err) {
      toast.error('Erreur lors de l\'ajout de la tâche')
    } finally {
      setSyncing(false)
    }
  }

  const deleteTask = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche planifiée ? La modification sera appliquée immédiatement sur le serveur.')) {
      return
    }

    try {
      setSyncing(true)
      const res = await apiFetch(`/applications/${appId}/crons/${id}`, {
        method: 'DELETE'
      })
      setData(res)
      toast.success('Tâche supprimée')
    } catch (err) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setSyncing(false)
    }
  }

  const manualSync = async () => {
    try {
      setSyncing(true)
      const res = await apiFetch(`/applications/${appId}/crons/sync`, {
        method: 'POST'
      })
      setData(res)
      toast.success('Synchronisation VPS réussie')
    } catch (err) {
      toast.error('Échec de la synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const isLaravel = data?.build_pack?.toLowerCase().includes('laravel') || data?.build_pack === 'php'

  return (
    <div className="space-y-6">
      {/* 1. LARAVEL SCHEDULER (Conditionnel) */}
      {isLaravel && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  Laravel Scheduler
                </CardTitle>
                <CardDescription className="text-xs">
                  Exécute <code>php artisan schedule:run</code> toutes les minutes dans votre conteneur.
                </CardDescription>
              </div>
              <Switch 
                checked={data?.has_laravel_scheduler} 
                onCheckedChange={toggleLaravel}
                disabled={syncing}
              />
            </div>
          </CardHeader>
        </Card>
      )}

      {/* 2. CUSTOM CRON JOBS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Tâches personnalisées</CardTitle>
            <CardDescription className="text-xs">
              Exécutez des commandes spécifiques à intervalles fixes sur le VPS hôte.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={manualSync} disabled={syncing} className="h-8 text-[10px]">
                {syncing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                Forcer Sync
             </Button>
             <Button size="sm" onClick={() => setAddingTask(true)} disabled={addingTask || syncing} className="h-8 text-[10px] font-bold">
                <Plus className="h-3 w-3 mr-2" />
                Ajouter
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          {addingTask && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Commande</Label>
                  <Input 
                    placeholder="ex: php artisan backup:run" 
                    value={newTask.command} 
                    onChange={(e) => setNewTask({...newTask, command: e.target.value})}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Fréquence (Cron)</Label>
                    <a href="https://crontab.guru" target="_blank" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1">
                      Aide <ExternalLink size={10} />
                    </a>
                  </div>
                  <Input 
                    placeholder="* * * * *" 
                    value={newTask.frequency} 
                    onChange={(e) => setNewTask({...newTask, frequency: e.target.value})}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description (Optionnel)</Label>
                <Input 
                  placeholder="ex: Sauvegarde quotidienne" 
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAddingTask(false)} className="h-7 text-[10px]">Annuler</Button>
                <Button size="sm" onClick={addTask} disabled={!newTask.command || syncing} className="h-7 text-[10px]">
                   {syncing && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                   Enregistrer
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {data?.tasks && data.tasks.length > 0 ? (
              data.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-indigo-500/20">
                        {task.frequency}
                      </code>
                      <span className="text-xs font-bold font-mono">{task.command}</span>
                    </div>
                    {task.description && <p className="text-[10px] text-muted-foreground opacity-70">{task.description}</p>}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteTask(task.id)} 
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            ) : !addingTask && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg opacity-50">
                <p className="text-[10px] font-bold uppercase tracking-widest">Aucune tâche personnalisée</p>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* 3. SYNC STATUS & ERRORS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground bg-muted/20 p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase opacity-50">Sync Status:</span>
                    {data?.last_cron_sync_error ? (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] px-1.5 h-4">
                           <AlertCircle size={10} className="mr-1" /> Echec
                        </Badge>
                    ) : data?.last_cron_synced_at ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] px-1.5 h-4">
                           <CheckCircle2 size={10} className="mr-1" /> OK
                        </Badge>
                    ) : (
                        <span className="opacity-40 italic">Pas encore synchronisé</span>
                    )}
                    </div>
                    {data?.last_cron_synced_at && (
                    <span className="opacity-60 italic">Dernière synchro : {new Date(data.last_cron_synced_at).toLocaleString()}</span>
                    )}
                </div>
            </div>

            {data?.last_cron_sync_error && (
               <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">
                     <AlertCircle size={12} /> Détails de l'erreur
                  </div>
                  <pre className="text-[10px] font-mono text-red-400/80 overflow-x-auto max-h-32 custom-scrollbar whitespace-pre-wrap p-2 bg-black/20 rounded">
                     {data.last_cron_sync_error}
                  </pre>
               </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
