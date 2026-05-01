import { useState, useEffect, useMemo } from 'react'
import { FolderGitIcon, Server as ServerIcon, Settings, Check, Loader, ChevronRight, ChevronLeft, Globe, Plus, Search, AlertCircle, X, Terminal, Box } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'


import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNavigate, Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


interface CreateAppDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  appToEdit?: any 
}

export function CreateAppDrawer({ open, onOpenChange, onSuccess, appToEdit }: CreateAppDrawerProps) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // State du formulaire (calqué sur l'étape 3 de CreateAppPage)
  const [deploymentMode, setDeploymentMode] = useState<'docker' | 'legacy_existing'>(appToEdit?.deployment_mode || 'docker')
  const [appName, setAppName] = useState(appToEdit?.name || '')
  const [domain, setDomain] = useState(appToEdit?.domain || '')
  const [targetPath, setTargetPath] = useState(appToEdit?.target_path || '')
  const [deployScript, setDeployScript] = useState(appToEdit?.deploy_script || '')
  const [logCommand, setLogCommand] = useState(appToEdit?.log_command || 'pm2 logs --lines 100')
  
  // Ces états restent pour la création initiale si on devait l'utiliser, 
  // mais ici on se concentre sur l'UI "Étape 3" demandée.
  const [selectedServer, setSelectedServer] = useState<any>(appToEdit?.server || null)
  const [selectedRepo, setSelectedRepo] = useState<any>(appToEdit?.repo_url ? { html_url: appToEdit.repo_url } : null)
  const [selectedBranch, setSelectedBranch] = useState(appToEdit?.branch || 'main')

  // Synchronisation si appToEdit change
  useEffect(() => {
    if (appToEdit && open) {
      setDeploymentMode(appToEdit.deployment_mode)
      setAppName(appToEdit.name)
      setDomain(appToEdit.domain || '')
      setTargetPath(appToEdit.target_path || '')
      setDeployScript(appToEdit.deploy_script || '')
      setLogCommand(appToEdit.log_command || 'pm2 logs --lines 100')
      setSelectedServer(appToEdit.server)
      setSelectedRepo(appToEdit.repo_url ? { html_url: appToEdit.repo_url } : null)
      setSelectedBranch(appToEdit.branch || 'main')
    }
  }, [appToEdit, open])

  const handleSave = async () => {
    if (!appName) {
      toast.error('Le nom est obligatoire')
      return
    }

    try {
      setLoading(true)
      const url = appToEdit ? `/applications/${appToEdit.id}` : '/applications'
      const method = appToEdit ? 'PUT' : 'POST'

      await apiFetch<any>(url, {
        method,
        body: JSON.stringify({
          name: appName,
          repo_url: selectedRepo?.html_url || null,
          branch: selectedBranch,
          server_id: selectedServer?.id,
          domain: domain || null,
          preset: appToEdit?.preset || 'generic',
          target_path: targetPath,
          deploy_script: deployScript,
          log_command: logCommand,
          deployment_mode: deploymentMode
        })
      })

      toast.success(appToEdit ? 'Configuration mise à jour' : 'Déploiement lancé')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-xl px-0 py-0 flex flex-col h-full border-l bg-background/95 backdrop-blur-md'>
        
        {/* Header - Style Premium (Fixe) */}
        <div className='flex-none p-6 border-b flex items-center justify-between bg-card/30'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
              {appToEdit ? <Settings size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <SheetTitle className='text-lg font-bold tracking-tight'>
                {appToEdit ? 'Configuration finale' : 'Nouveau déploiement'}
              </SheetTitle>
              <SheetDescription className='text-xs'>
                {appToEdit ? `Paramètres de ${appToEdit.name}` : 'Ajustez les réglages avant de lancer'}
              </SheetDescription>
            </div>
          </div>
          <Button variant='ghost' size='icon' onClick={() => onOpenChange(false)} className='rounded-full'>
            <X size={18} />
          </Button>
        </div>

        {/* Zone défilante (Flexible) */}
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='p-6 space-y-8 pb-10'>
            
            {/* Résumé du mode (Badge) */}
            <div className='flex items-center gap-2 mb-2'>
               <Badge variant="outline" className={`h-6 text-[10px] uppercase font-bold tracking-wider ${
                 deploymentMode === 'docker' ? 'text-primary border-primary/20 bg-primary/5' : 
                 'text-amber-500 border-amber-500/20 bg-amber-500/5'
               }`}>
                 {deploymentMode?.replace('_', ' ')}
               </Badge>
               {selectedServer && (
                 <Badge variant="secondary" className="h-6 text-[10px] uppercase font-bold tracking-wider bg-muted/50 border-none">
                   {selectedServer.name}
                 </Badge>
               )}
            </div>

            {/* CHAMPS DE CONFIGURATION - Copiés de l'étape 3 de CreateAppPage */}
            <div className="grid grid-cols-1 gap-6">
              
              <div className="space-y-2">
                <Label htmlFor="appName" className="text-sm font-medium">Nom de l'application</Label>
                <Input 
                  id="appName" 
                  value={appName} 
                  onChange={e => setAppName(e.target.value)} 
                  placeholder="mon-projet" 
                  className="h-11 rounded-xl bg-muted/20 border-border/50 focus:ring-primary/20" 
                />
              </div>

              {deploymentMode === 'docker' && (
                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-sm font-medium">Nom de domaine (Optionnel)</Label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="domain" 
                      value={domain} 
                      onChange={e => setDomain(e.target.value)} 
                      placeholder="app.mondomaine.com" 
                      className="pl-11 h-11 rounded-xl bg-muted/20 border-border/50 focus:ring-primary/20" 
                    />
                  </div>
                </div>
              )}

              {deploymentMode !== 'docker' && (
                <div className="space-y-6 pt-2">
                   <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <FolderGitIcon size={14} className="text-muted-foreground" /> 
                        Chemin du dossier sur le serveur
                      </Label>
                      <Input 
                        value={targetPath} 
                        onChange={e => setTargetPath(e.target.value)} 
                        placeholder={deploymentMode === 'legacy_existing' ? '/var/www/mon-app' : '/var/www/nouvelle-app'} 
                        className="h-11 font-mono text-xs rounded-xl bg-muted/20 border-border/50 focus:ring-primary/20" 
                      />
                   </div>

                   <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-bold text-indigo-500">
                        <Terminal size={14} /> Workflow (Script de déploiement)
                      </Label>
                      <Textarea 
                        value={deployScript} 
                        onChange={e => setDeployScript(e.target.value)} 
                        placeholder="# Commandes à exécuter..."
                        className="h-40 font-mono text-xs bg-zinc-950 text-emerald-400 p-4 border-zinc-800 rounded-2xl shadow-inner resize-none focus:ring-indigo-500/20" 
                      />
                      <p className='text-[10px] text-muted-foreground italic px-1'>Ex: git pull origin main && npm install && npm run build</p>
                   </div>

                   <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Terminal size={14} /> Commande de logs (SSH)
                      </Label>
                      <Input
                        placeholder="ex: pm2 logs portfolio --lines 100"
                        value={logCommand}
                        onChange={(e) => setLogCommand(e.target.value)}
                        className="h-11 bg-muted/20 border-border/50 font-mono text-xs rounded-xl focus:ring-primary/20"
                      />
                      <p className='text-[10px] text-muted-foreground italic px-1'>Utilisé pour le monitoring en direct.</p>
                    </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className='p-4 rounded-2xl border bg-primary/5 border-primary/10 flex items-start gap-3'>
              <AlertCircle className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div className='space-y-1'>
                <p className='text-xs font-bold text-primary uppercase tracking-tight'>Mode {deploymentMode === 'docker' ? 'Cloud Native' : 'Legacy SSH'}</p>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  {deploymentMode === 'docker' 
                    ? "Les modifications seront appliquées lors du prochain redémarrage du conteneur."
                    : "Assurez-vous que le script de déploiement est valide pour éviter toute interruption."}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer - Style Premium */}
        <div className='p-6 border-t bg-card/50 flex items-center justify-between gap-4'>
          <Button variant='ghost' onClick={() => onOpenChange(false)} className='rounded-xl px-6'>
            Annuler
          </Button>
          <Button 
            disabled={loading || !appName} 
            onClick={handleSave}
            className='flex-1 h-12 rounded-xl gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95'
          >
            {loading ? <Loader className='h-5 w-5 animate-spin' /> : (appToEdit ? <Check className='h-5 w-5' /> : <Globe className='h-5 w-5' />)}
            {appToEdit ? 'Enregistrer les modifications' : 'Lancer le déploiement'}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  )
}
