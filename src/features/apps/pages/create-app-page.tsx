import { useState, useEffect, useMemo } from 'react'
import { FolderGitIcon, Server as ServerIcon, Settings, Check, Loader, ChevronRight, ChevronLeft, Globe, Plus, Search, AlertCircle, X, Terminal, Box } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CreateAppPage() {
  const [step, setStep] = useState(-1)
  const [deploymentMode, setDeploymentMode] = useState<'docker' | 'legacy_existing' | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
  const [deployScript, setDeployScript] = useState('git pull origin main\nnpm install\nnpm run build\npm2 restart app')
  const [logCommand, setLogCommand] = useState('pm2 logs --lines 100')
  const [searchQuery, setSearchQuery] = useState('')

  const presets = [
    {
      id: 'generic',
      name: 'Web Application',
      isRecommended: true,
      icon: <div className="flex items-center justify-center h-10 w-10 bg-primary/10 rounded-xl text-primary shadow-inner"><Globe size={22} /></div>,
      desc: 'Tout framework, détection automatique'
    },
    {
      id: 'laravel',
      name: 'Laravel + MySQL',
      icon: (
        <div className="flex items-center gap-1.5">
          <div className="h-10 w-10 rounded-xl bg-white p-2 shadow-sm border border-border flex items-center justify-center">
            <img src="https://laravel.com/img/logomark.min.svg" className="h-6 w-6" alt="Laravel" />
          </div>
          <span className="text-muted-foreground font-bold text-xs">+</span>
          <div className="h-10 w-10 rounded-xl bg-[#00758f] p-1.5 shadow-sm border border-border flex items-center justify-center">
            <img src="https://www.mysql.com/common/logos/logo-mysql-170x115.png" className="h-6 w-6 invert brightness-0" alt="MySQL" />
          </div>
        </div>
      ),
      desc: ''
    },
    {
      id: 'nestjs',
      name: 'NestJS + Postgres',
      icon: (
        <div className="flex items-center gap-1.5">
          <div className="h-10 w-10 rounded-xl bg-white p-2 shadow-sm border border-border flex items-center justify-center">
            <img src="https://nestjs.com/img/logo-small.svg" className="h-6 w-6" alt="NestJS" />
          </div>
          <span className="text-muted-foreground font-bold text-xs">+</span>
          <div className="h-10 w-10 rounded-xl bg-[#336791] p-1.5 shadow-sm border border-border flex items-center justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" className="h-6 w-6" alt="Postgres" />
          </div>
        </div>
      ),
      desc: ''
    },
  ]

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

  useEffect(() => {
    if (step === 2 && servers.length === 0) {
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
    }
  }, [step, servers.length])

  const handleCreate = async () => {
    if (!appName || (deploymentMode !== 'legacy_existing' && !selectedRepo) || !selectedServer) {
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

      toast.success('Application créée', { description: 'Déploiement en cours...' })

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
      case -1: return "Choix du mode de déploiement"
      case 0: return "Type d'application"
      case 1: return "Dépôt GitHub"
      case 2: return "Serveur de destination"
      case 3: return "Configuration finale"
      default: return "Créer une application"
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-background/50">
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
             {[-1, 0, 1, 2, 3].map((s) => {
               // Filter steps based on mode
               if (deploymentMode === 'legacy_existing' && (s === 0 || s === 1)) return null;

               return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step === s ? 'bg-primary text-white ring-4 ring-primary/10' : step > s ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {step > s ? <Check size={12} /> : s === -1 ? '0' : s + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${step === s ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                    {s === -1 ? 'Mode' : s === 0 ? 'Type' : s === 1 ? 'Source' : s === 2 ? 'Serveur' : 'Config'}
                  </span>
                  {s < 3 && <ChevronRight size={12} className="text-muted-foreground/30 mx-1 last:hidden" />}
                </div>
               )
             })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-12 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          
          {/* STEP -1: MODE */}
          {step === -1 && (
             <div className='grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                <div className="text-center mb-6">
                   <h2 className="text-2xl font-bold tracking-tight mb-2">Comment voulez-vous déployer ?</h2>
                   <p className="text-muted-foreground">Choisissez la méthode qui correspond le mieux à votre projet.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                 {/* 1. DOCKER */}
<button
  onClick={() => { setDeploymentMode('docker'); setStep(0); }}
  className="flex items-center gap-5 p-6 rounded-2xl border text-left transition-all hover:border-primary group bg-card hover:bg-primary/5 shadow-sm hover:shadow-lg duration-300"
>
  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
    <Box size={24} />
  </div>
  <div className="flex-1">
    <h4 className="font-bold text-base">Nouveau Déploiement</h4>
    <p className="text-sm text-muted-foreground mt-1">
      Déployez votre app, base de données et SSL en quelques clics. Zéro configuration serveur.
    </p>
  </div>
  <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-all shrink-0" />
</button>

{/* 2. LEGACY EXISTING */}
<button
  onClick={() => { setDeploymentMode('legacy_existing'); setStep(2); }}
  className="flex items-center gap-5 p-6 rounded-2xl border text-left transition-all hover:border-amber-500 group bg-card hover:bg-amber-500/5 shadow-sm hover:shadow-lg duration-300"
>
  <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
    <Terminal size={24} />
  </div>
  <div className="flex-1">
    <h4 className="font-bold text-base">J'ai déjà mon app sur le serveur</h4>
    <p className="text-sm text-muted-foreground mt-1">
      Pointez vers votre dossier existant. Automatisez vos commandes pull, build et pm2 sans toucher à votre stack.
    </p>
  </div>
  <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-all shrink-0" />
</button>
                </div>
             </div>
          )}

          {/* STEP 0: PRESETS (Docker only) */}
          {step === 0 && (
             <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-500'>
                <div className="grid grid-cols-1 gap-3">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPreset(p.id); setStep(1); }}
                      className={`flex items-center gap-6 p-6 rounded-2xl border text-left transition-all hover:border-primary group bg-card ${selectedPreset === p.id ? 'border-primary ring-1 ring-primary shadow-md' : 'hover:bg-muted/5'}`}
                    >
                      {p.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base">{p.name}</h4>
                          {p.isRecommended && <Badge className="text-[9px] h-4 bg-primary/10 text-primary">RECOMMANDÉ</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                      </div>
                      <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
             </div>
          )}

          {/* STEP 1: SOURCE (Docker & Legacy New) */}
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
                   <ScrollArea className="h-[400px]">
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
                                onClick={() => { setSelectedRepo(repo); if (!appName) setAppName(repo.name); }}
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

          {/* STEP 2: SERVER */}
          {step === 2 && (
            <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-500'>
               <div className="grid grid-cols-1 gap-3">
                  {servers.length === 0 ? (
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
                        onClick={() => setSelectedServer(server)}
                        className={`flex items-center gap-6 p-6 rounded-2xl border text-left transition-all hover:border-primary group bg-card ${selectedServer?.id === server.id ? 'border-primary ring-1 ring-primary shadow-md' : 'hover:bg-muted/5'}`}
                      >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${selectedServer?.id === server.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/10'}`}>
                          <ServerIcon size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-base">{server.name}</h4>
                          <p className="text-xs font-mono opacity-50 mt-0.5">{server.ip}</p>
                        </div>
                        {selectedServer?.id === server.id && <Check size={20} className="text-primary" />}
                      </button>
                    ))
                  )}
               </div>
            </div>
          )}

          {/* STEP 3: FINAL CONFIG */}
          {step === 3 && (
            <div className='space-y-8 animate-in fade-in slide-in-from-right-4 duration-500'>
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Nom de l'application</Label>
                    <Input id="appName" value={appName} onChange={e => setAppName(e.target.value)} placeholder="mon-projet" className="h-12 rounded-xl" />
                  </div>

                  {deploymentMode === 'docker' && (
                    <div className="space-y-2">
                      <Label htmlFor="domain">Nom de domaine (Optionnel)</Label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input id="domain" value={domain} onChange={e => setDomain(e.target.value)} placeholder="app.mondomaine.com" className="pl-11 h-12 rounded-xl" />
                      </div>
                    </div>
                  )}

                  {deploymentMode !== 'docker' && (
                    <div className="space-y-6 pt-6 border-t">
                       <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <FolderGitIcon size={16} /> Chemin du dossier sur le serveur
                          </Label>
                          <Input value={targetPath} onChange={e => setTargetPath(e.target.value)} placeholder={deploymentMode === 'legacy_existing' ? '/var/www/mon-app' : '/var/www/nouvelle-app'} className="h-12 font-mono text-sm rounded-xl" />
                       </div>

                       <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-indigo-500 font-bold">
                            <Terminal size={16} /> Workflow (Script de déploiement)
                          </Label>
                          <Textarea 
                            value={deployScript} 
                            onChange={e => setDeployScript(e.target.value)} 
                            className="h-32 font-mono text-sm bg-zinc-950 text-emerald-400 p-4 border-zinc-800 rounded-2xl shadow-2xl"
                          />
                       </div>

                       <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-primary font-bold">
                            <Terminal size={16} /> Commande de logs (SSH)
                          </Label>
                          <Input
                            placeholder="ex: pm2 logs portfolio --lines 100"
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
        <footer className=" bg-card/80 backdrop-blur-md sticky bottom-0 py-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
          <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
            <Button
              variant='ghost'
              size="lg"
              className="rounded-xl px-8"
              onClick={() => {
                if (deploymentMode === 'legacy_existing' && step === 2) setStep(-1)
                else if (deploymentMode === 'docker' && step === 0) setStep(-1)
                else setStep(step - 1)
              }}
            >
              Précédent
            </Button>

            {step < 3 ? (
               <Button
                size="lg"
                className="rounded-xl px-12 gap-2 shadow-lg shadow-primary/20"
                disabled={ (step === 1 && !selectedRepo) || (step === 2 && !selectedServer) }
                onClick={() => setStep(step + 1)}
               >
                 Suivant
                 <ChevronRight size={18} />
               </Button>
            ) : (
              <Button
                size="lg"
                disabled={loading || !appName}
                onClick={handleCreate}
                className="rounded-xl px-12 gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25"
              >
                {loading ? <Loader className='h-5 w-5 animate-spin' /> : <Globe className='h-5 w-5' />}
                Lancer le déploiement
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
