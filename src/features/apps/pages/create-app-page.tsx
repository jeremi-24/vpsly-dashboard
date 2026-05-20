import { useState, useEffect, useMemo } from 'react'
import { FolderGitIcon, Server as ServerIcon, Settings, Check, Loader, Loader2, ChevronRight, ChevronLeft, Globe, Plus, Search, AlertCircle, X, Terminal, Box, Lock, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
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
import { PlanLock } from '@/components/shared/plan-lock'
import { useAuthStore } from '@/stores/auth-store'
import { getPlanById } from '@/config/plans'
import { UpgradeModal } from '@/components/shared/upgrade-modal'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CreateAppPage() {
  const [step, setStep] = useState(0) // 0: Server, 1: Source, 2: Config
  const [deploymentMode, setDeploymentMode] = useState<'docker' | 'legacy_existing' | 'legacy_new' | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  const user = useAuthStore((state) => state.auth.user)
  const team = user?.current_team
  const plan = team ? getPlanById(team.plan) : null
  const currentAppsCount = team?.applications_count || 0
  const isLocked = plan ? (plan.maxApps !== -1 && currentAppsCount >= plan.maxApps) : false
  const isDomainLocked = team?.plan === 'starter'

  // Data for selection
  const [repos, setRepos] = useState<any[]>([])
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [servers, setServers] = useState<any[]>([])

  // Selection state
  const [selectedPreset, setSelectedPreset] = useState('generic')
  const [selectedRepo, setSelectedRepo] = useState<any>(null)
  const [selectedBranch, setSelectedBranch] = useState('main')
  const [selectedServer, setSelectedServer] = useState<any>(null)
  const [appName, setAppName] = useState('')
  const [domain, setDomain] = useState('')
  const [targetPath, setTargetPath] = useState('')
  const [deployScript, setDeployScript] = useState('')
  const [logCommand, setLogCommand] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Watch for server selection to auto-set mode and defaults
  useEffect(() => {
    if (selectedServer) {
        const isLegacy = selectedServer.infrastructure_type === 'legacy';
        
        // Only auto-set if mode is not set or if switching between docker/legacy
        if (!deploymentMode || (isLegacy && deploymentMode === 'docker') || (!isLegacy && deploymentMode !== 'docker')) {
            const mode = isLegacy ? 'legacy_existing' : 'docker';
            setDeploymentMode(mode);
        }
        
        // Auto-fill defaults for legacy if empty
        if (isLegacy) {
            // logCommand and deployScript are now handled via placeholders
        }
    }
  }, [selectedServer]);

  // Force targetPath to stay in sync with appName for legacy
  useEffect(() => {
    if (selectedServer?.infrastructure_type === 'legacy' && appName) {
        setTargetPath(`/var/www/${appName}`);
    }
  }, [appName, selectedServer]);

  // Load servers on mount
  useEffect(() => {
    const fetchServers = async () => {
        try {
          setLoading(true)
          const data = await apiFetch<any[]>('/servers')
          setServers(data.filter(s => s.status === 'connected'))
        } catch (error) {
          console.error(error)
        } finally {
          setLoading(false)
        }
      }
      fetchServers()
  }, [])

  const filteredRepos = useMemo(() => {
    if (!searchQuery) return repos
    const query = searchQuery.toLowerCase()
    return repos.filter(repo =>
      repo.name.toLowerCase().includes(query) ||
      repo.full_name.toLowerCase().includes(query)
    )
  }, [repos, searchQuery])

  useEffect(() => {
    if (step === 1 && (repos.length === 0 || githubConnected === false)) {
      const fetchRepos = async () => {
        try {
          setLoading(true)
          const data = await apiFetch<any[]>('/github/repositories')
          setRepos(data)
          setGithubConnected(true)
        } catch (error: any) {
          if (error.status === 428) {
            setGithubConnected(false)
          } else {
            console.error(error)
          }
        } finally {
          setLoading(false)
        }
      }
      fetchRepos()
    }
  }, [step, repos.length, githubConnected])

  useEffect(() => {
    if (selectedRepo) {
      const fetchBranches = async () => {
        try {
          const [owner, repo] = selectedRepo.full_name.split('/')
          const data = await apiFetch<any[]>(`/github/branches?owner=${owner}&repo=${repo}`)
          setBranches(data)
          setSelectedBranch(selectedRepo.default_branch || 'main')
        } catch (error) {
          console.error(error)
        }
      }
      fetchBranches()
    }
  }, [selectedRepo])

  const handleCreate = async () => {
    if (!appName || (deploymentMode === 'docker' && !selectedRepo) || (deploymentMode === 'legacy_new' && !selectedRepo) || !selectedServer) {
      toast.error('Champs manquants', { description: 'Veuillez remplir tous les champs obligatoires.' })
      return
    }

    try {
      setLoading(true)
      const result = await apiFetch<any>('/applications', {
        method: 'POST',
        body: JSON.stringify({
          name: appName,
          repo_url: selectedRepo?.html_url || null,
          branch: selectedBranch,
          server_id: selectedServer.id,
          domain: domain || null,
          preset: selectedPreset,
          deployment_mode: deploymentMode,
          target_path: targetPath,
          deploy_script: deployScript,
          log_command: logCommand
        })
      })

      toast.info('Déploiement en cours....')

      if (result.application?.id) {
        navigate({
          to: '/apps/$appId',
          params: { appId: result.application.id.toString() }
        })
      }
    } catch (error: any) {
      toast.error('Erreur', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 0: return "Serveur de destination"
      case 1: return "Dépôt GitHub"
      case 2: return "Configuration finale"
      default: return "Créer une application"
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background/50">
      {/* Header Wizard */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/apps' })}>
              <X size={20} />
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <h1 className="font-bold text-lg tracking-tight">{getStepTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            {[0, 1, 2].map((s, idx) => {
              const label = s === 0 ? 'Serveur' : s === 1 ? 'Source' : 'Config';
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step === s ? 'bg-primary text-white ring-4 ring-primary/10' : (step > s) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {(step > s) ? <Check size={12} /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${step === s ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                    {label}
                  </span>
                  {idx < 2 && <ChevronRight size={12} className="text-muted-foreground/30 mx-1" />}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-8 pb-6">
        <div className="max-w-3xl mx-auto px-6">

          {/* STEP 0: SERVER */}
          {step === 0 && (
            <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-500'>
              <div className="grid grid-cols-1 gap-3">
                {loading && step === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground animate-pulse">Récupération des serveurs...</p>
                  </div>
                ) : servers.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed rounded-3xl flex flex-col items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground opacity-30">
                      <ServerIcon size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">Aucun serveur trouvé</h3>
                      <p className="text-muted-foreground">Connectez un serveur VPS pour continuer.</p>
                    </div>
                    <Button variant="outline" size="lg" onClick={() => navigate({ to: '/servers' })}>Ajouter un serveur</Button>
                  </div>
                ) : (
                  servers.map(server => (
                    <button
                      key={server.id}
                      onClick={() => { setSelectedServer(server); setStep(1); }}
                      className={`flex items-center gap-6 p-6 rounded-2xl border text-left transition-all hover:border-primary group bg-card ${selectedServer?.id === server.id ? 'border-primary ring-1 ring-primary shadow-md' : 'hover:bg-muted/5'}`}
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${selectedServer?.id === server.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/10'}`}>
                        <ServerIcon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base">{server.name}</h4>
                            <Badge variant="outline" className={`text-[9px] h-4 uppercase ${server.infrastructure_type === 'legacy' ? 'text-amber-500 border-amber-500/20' : 'text-blue-500 border-blue-500/20'}`}>
                                {server.infrastructure_type}
                            </Badge>
                        </div>
                        <p className="text-xs font-mono opacity-50 mt-0.5">{server.ip}</p>
                      </div>
                      {selectedServer?.id === server.id && <Check size={20} className="text-primary" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 1: SOURCE */}
          {step === 1 && (
            <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-500'>
              <div className='relative'>
                <Search className='absolute left-4 top-3.5 h-5 w-5 text-muted-foreground' />
                <Input
                  placeholder='Rechercher un dépôt GitHub...'
                  className='pl-11 h-12 text-base rounded-xl'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
                <ScrollArea className="h-[min(400px,calc(100vh-360px))]">
                  {githubConnected === false ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-6">
                      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                        <FolderGitIcon size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-xl text-foreground">GitHub non connecté</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">Reliez votre compte pour importer vos projets en un clic.</p>
                      </div>
                      <Button size="lg" onClick={() => navigate({ to: '/settings/integrations' })}>Lier mon compte</Button>
                    </div>
                  ) : repos.length === 0 ? (
                    <div className="p-6 space-y-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredRepos.map(repo => (
                        <button
                          key={repo.id}
                          onClick={() => { 
                            const isNewRepo = selectedRepo?.id !== repo.id
                            setSelectedRepo(repo)
                            if (isNewRepo) {
                              setAppName(repo.name)
                              setBranches([]) // Clear old branches
                              setSelectedBranch('') // Reset branch
                            }
                          }}
                          className={`w-full flex items-center justify-between p-5 text-left transition-all hover:bg-muted/30 ${selectedRepo?.id === repo.id ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${selectedRepo?.id === repo.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                              <FolderGitIcon size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-sm leading-none mb-1">{repo.name}</p>
                              <p className="text-xs opacity-50 font-mono tracking-tighter">{repo.full_name}</p>
                            </div>
                          </div>
                          {selectedRepo?.id === repo.id && <Check className="text-primary h-5 w-5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {selectedRepo && (
                <div className="p-6 rounded-2xl border bg-card animate-in fade-in zoom-in-95">
                  <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Branche à déployer</Label>
                  <div className="mt-3">
                    {branches.length > 0 ? (
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Choisir une branche" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map(b => (
                            <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground italic"><Loader className="animate-spin h-3 w-3" /> Chargement...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: FINAL CONFIG */}
          {step === 2 && (
            <div className='space-y-8 animate-in fade-in slide-in-from-right-4 duration-500'>
              <div className="grid grid-cols-1 gap-6">
                {/* COMMON FIELDS: NAME & DOMAIN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Nom de l'application</Label>
                    <Input id="appName" value={appName} onChange={e => setAppName(e.target.value)} placeholder="mon-projet" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain" className={cn(isDomainLocked && "opacity-50")}>Nom de domaine (Optionnel)</Label>
                    <div
                      className={cn("relative", isDomainLocked && "group cursor-not-allowed")}
                      onClick={() => isDomainLocked && setIsUpgradeModalOpen(true)}
                    >
                      <Globe className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <Input
                        id="domain"
                        value={domain}
                        disabled={isDomainLocked}
                        onChange={e => setDomain(e.target.value)}
                        placeholder={isDomainLocked ? "Verrouillé sur le plan Starter" : "app.mondomaine.com"}
                        className={cn(
                          "pl-11 h-12 rounded-xl transition-all",
                          isDomainLocked && "bg-muted/50 cursor-not-allowed opacity-60"
                        )}
                      />
                      {isDomainLocked && (
                        <div className="absolute right-4 top-3.5 text-muted-foreground">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedServer?.infrastructure_type === 'legacy' && (
                  <div className="space-y-4 pt-4 animate-in fade-in zoom-in-95">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Stratégie de déploiement</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDeploymentMode('legacy_existing')}
                        className={cn(
                          "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all hover:bg-muted/50",
                          deploymentMode === 'legacy_existing' ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                        )}
                      >
                        <div className="flex items-center justify-center relative min-h-[40px]">
                          <div className="font-bold text-sm text-foreground text-center">L'application existe déjà</div>
                          {deploymentMode === 'legacy_existing' && <Check size={14} className="text-primary absolute right-0" />}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeploymentMode('legacy_new')}
                        className={cn(
                          "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all hover:bg-muted/50",
                          deploymentMode === 'legacy_new' ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                        )}
                      >
                        <div className="flex items-center justify-center relative min-h-[40px]">
                          <div className="font-bold text-sm text-primary text-center">L'application n'existe pas encore</div>
                          {deploymentMode === 'legacy_new' && <Check size={14} className="text-primary absolute right-0" />}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {(deploymentMode === 'legacy_existing' || deploymentMode === 'legacy_new') && (
                  <div className="space-y-6 pt-6 border-t animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FolderGitIcon size={16} /> Chemin du dossier sur le serveur
                      </Label>
                      <Input value={targetPath} onChange={e => setTargetPath(e.target.value)} placeholder="/var/www/mon-app" className="h-12 font-mono text-sm rounded-xl" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-indigo-500 font-bold">
                          <Terminal size={16} /> Workflow (Script de déploiement)
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-indigo-500">
                                <Info size={14} className='text-orange-400' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="w-80 p-4 bg-zinc-900 border-zinc-800 text-zinc-300">
                              <div className="space-y-4">
                                <p className="text-xs font-bold text-white border-b border-white/10 pb-1">Exemples de scripts</p>
                                
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-indigo-400">Laravel</p>
                                  <code className="block text-[9px] bg-black/50 p-2 rounded border border-white/5 leading-relaxed">
                                    composer install --no-dev --optimize-autoloader<br/>
                                    php artisan migrate --force<br/>
                                    php artisan config:cache
                                  </code>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-emerald-400">Node.js / Next.js</p>
                                  <code className="block text-[9px] bg-black/50 p-2 rounded border border-white/5 leading-relaxed">
                                    npm install<br/>
                                    npm run build<br/>
                                    pm2 reload app || pm2 start npm --name "app" -- start
                                  </code>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-amber-400">Python</p>
                                  <code className="block text-[9px] bg-black/50 p-2 rounded border border-white/5 leading-relaxed">
                                    pip install -r requirements.txt<br/>
                                    systemctl restart myapp
                                  </code>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        value={deployScript}
                        onChange={e => setDeployScript(e.target.value)}
                        placeholder="Ex: npm install && npm run build && pm2 reload app"
                        className="h-32 font-mono text-sm bg-zinc-950 text-emerald-400 p-4 border-zinc-800 rounded-2xl shadow-2xl"
                      />
                      <p className="text-[10px] text-muted-foreground italic">Ce script sera exécuté à chaque déploiement via SSH.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-primary font-bold">
                        <Terminal size={16} /> Commande de logs (SSH)
                      </Label>
                      <Input
                        placeholder="Ex: pm2 logs portfolio --lines 100"
                        value={logCommand}
                        onChange={(e) => setLogCommand(e.target.value)}
                        className="h-12 bg-background border-border font-mono text-sm rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Navigation */}
      {step !== -1 && (
        <footer className="border-t bg-card/80 backdrop-blur-md py-4">
          <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
            <Button
              variant='ghost'
              size="lg"
              className="rounded-xl px-8"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              Précédent
            </Button>

            {step < 2 ? (
              <Button
                size="lg"
                className="rounded-xl px-12 gap-2 shadow-lg shadow-primary/20"
                disabled={
                  loading || 
                  (step === 0 && !selectedServer) || 
                  (step === 1 && deploymentMode !== 'legacy_existing' && (!selectedRepo || !selectedBranch))
                }
                onClick={() => {
                  setStep(step + 1);
                }}
              >
                {step === 1 && !selectedRepo && deploymentMode === 'legacy_existing' ? 'Passer l\'étape' : 'Suivant'}
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={loading || !appName}
                onClick={() => {
                  if (isLocked) {
                    setIsUpgradeModalOpen(true);
                    return;
                  }
                  handleCreate();
                }}
                className={`relative overflow-hidden rounded-xl px-12 gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 ${isLocked ? 'shimmer-effect' : ''}`}
              >
                {isLocked && <Lock size={16} className="mr-1" />}
                {loading ? <Loader className='h-5 w-5 animate-spin' /> : <Globe className='h-5 w-5' />}
                Lancer le déploiement
              </Button>
            )}
          </div>
        </footer>
      )}

      <UpgradeModal
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
      />
    </div>
  )
}
