import { useState, useEffect, useMemo } from 'react'
import { FolderGitIcon, Server as ServerIcon, Settings, Check, Loader2, ChevronRight, ChevronLeft, Globe, Plus, Search, AlertCircle, X } from 'lucide-react'


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


interface CreateAppDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateAppDrawer({ open, onOpenChange, onSuccess }: CreateAppDrawerProps) {
  const [step, setStep] = useState(0) // Start at step 0 for presets
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


  // Filter repos with useMemo for performance
  const filteredRepos = useMemo(() => {
    if (!searchQuery) return repos
    const query = searchQuery.toLowerCase()
    return repos.filter(repo => 
      repo.name.toLowerCase().includes(query) || 
      repo.full_name.toLowerCase().includes(query)
    )
  }, [repos, searchQuery])

  // Fetch repositories
  useEffect(() => {
    if (open && step === 1 && (repos.length === 0 || githubConnected === false)) {
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
  }, [open, step, repos.length, githubConnected])

  // Fetch branches when repo is selected
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

  // Fetch servers
  useEffect(() => {
    if (open && step === 2 && servers.length === 0) {
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
  }, [open, step, servers.length])

  const handleCreate = async () => {
    if (!appName || !selectedRepo || !selectedServer) {
        toast.error('Champs manquants', { description: 'Veuillez remplir tous les champs.' })
        return
    }

    try {
      setLoading(true)
      const result = await apiFetch<any>('/applications', {
        method: 'POST',
        body: JSON.stringify({
          name: appName,
          repo_url: selectedRepo.html_url,
          branch: selectedBranch,
          server_id: selectedServer.id,
          domain: domain || null,
          preset: selectedPreset // On envoie le preset choisi !
        })
      })

      toast.success('Stack atomique créée', { description: 'Redirection vers votre dashboard...' })

      // Redirection immédiate
      if (result.application?.id) {
          navigate({ 
            to: '/apps/$appId',
            params: { appId: result.application.id.toString() }
          })
          onSuccess()
          onOpenChange(false)
      }
    } catch (error: any) {
      toast.error('Erreur', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 0: return "Quel type d'application voulez-vous déployer ?"
      case 1: return "Sélectionnez votre dépôt GitHub"
      case 2: return "Choisissez un serveur de destination"
      case 3: return "Configuration de votre stack"
      default: return "Déployer une application"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-2xl px-6 py-4 flex flex-col h-full'>
        <div className='w-full flex flex-col h-full min-h-0'>
          <SheetHeader className='px-0 flex-none mb-4'>
            <SheetTitle className='flex items-center gap-3 text-foreground mb-1'>
              <div className='h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                 {step === 0 ? <Plus size={20} /> : step === 1 ? <FolderGitIcon size={20} /> : step === 2 ? <ServerIcon size={20} /> : <Settings size={20} />}
              </div>
              <span className='text-lg font-medium   tracking-tight'>
                {getStepTitle()}
              </span>
            </SheetTitle>
          </SheetHeader>

          {/* Stepper Visual */}
          <div className='flex items-center justify-between mb-8 px-4 flex-none'>
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className='flex items-center gap-2'>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium transition-all ${step === s ? 'bg-primary text-white ring-4 ring-primary/10' : step > s ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                   {step > s ? <Check className='h-3.5 w-3.5' /> : s + 1}
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider ${step === s ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                    {s === 0 ? 'Type' : s === 1 ? 'Source' : s === 2 ? 'Serveur' : 'Config'}
                </span>
                {s < 3 && <div className='h-px w-6 bg-muted mx-1 hidden sm:block' />}
              </div>
            ))}
          </div>

          <div className='flex-1 min-h-0 relative'>
            {/* STEP 0: PRESET SELECTION */}
            {step === 0 && (
                <div className='space-y-4 animate-in slide-in-from-right-4 duration-300'>
                    <div className='grid grid-cols-1 gap-3'>
                        {presets.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setSelectedPreset(p.id)
                                    setStep(1)
                                }}
                                className={`flex items-center gap-6 p-5 rounded-2xl border text-left transition-all hover:border-primary group relative overflow-hidden ${selectedPreset === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' : 'border-border bg-card/40 hover:bg-card'}`}
                            >
                                <div className='transition-transform group-hover:scale-105 duration-300'>
                                    {p.icon}
                                </div>
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <h4 className='font-medium text-sm'>{p.name}</h4>
                                        {p.isRecommended && (
                                            <Badge variant="outline" className="text-[9px] h-4 bg-primary/10 text-primary border-primary/20 uppercase font-medium tracking-tighter">Universel</Badge>
                                        )}
                                    </div>
                                    <p className='text-xs text-muted-foreground mt-0.5'>{p.desc}</p>
                                </div>
                                <ChevronRight className='ml-auto h-4 w-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all' />
                            </button>
                        ))}

                    </div>
                </div>
            )}

            {/* STEP 1: SOURCE */}
            {step === 1 && (
              <div className='space-y-4 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col min-h-0'>
                <Label className='flex-none'>Sélectionner un dépôt</Label>
                <div className='relative flex-none'>
                   <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                   <Input 
                      placeholder='Rechercher un dépôt...' 
                      className='pl-9' 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                
                <ScrollArea className='flex-1 border rounded-lg min-h-0 bg-muted/5'>
                  {githubConnected === false ? (
                     <div className='p-8 h-full flex flex-col items-center justify-center text-center space-y-4'>
                        <div className='h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                           <FolderGitIcon size={32} />
                        </div>
                        <div className='space-y-1'>
                           <p className='text-sm font-bold uppercase tracking-wider'>Compte GitHub non lié</p>
                           <p className='text-xs text-muted-foreground'>
                               Connectez votre compte GitHub pour importer vos dépôts et lancer vos déploiements en quelques secondes.
                           </p>
                        </div>
                        <Button 
                           size='sm' 
                           className='gap-2'
                           onClick={() => {
                              localStorage.setItem('vpsly_pending_action', 'create_app')
                              navigate({ to: '/settings/integrations' })
                           }}
                        >
                           <ExternalLink size={14} />
                           Lier mon compte GitHub
                        </Button>
                     </div>
                  ) : repos.length === 0 ? (
                    <div className='p-2 space-y-2'>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className='flex items-center gap-3 p-3'>
                                <Skeleton className='h-4 w-4 rounded-full' />
                                <div className='space-y-1.5 flex-1'>
                                    <Skeleton className='h-3 w-1/3' />
                                    <Skeleton className='h-2 w-1/2 opacity-50' />
                                </div>
                            </div>
                        ))}
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className='p-12 text-center text-muted-foreground'>
                        <AlertCircle className='h-8 w-8 mx-auto mb-3 opacity-20' />
                        <p className='text-sm font-medium'>Aucun dépôt trouvé</p>
                        <p className='text-xs opacity-60'>Essayez un autre mot-clé.</p>
                    </div>
                  ) : (
                    <div className='p-2 space-y-1'>
                      {filteredRepos.map(repo => (
                        <button
                          key={repo.id}
                          onClick={() => {
                              setSelectedRepo(repo)
                              if (!appName) setAppName(repo.name)
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-md text-sm transition-all hover:bg-muted group ${selectedRepo?.id === repo.id ? 'bg-primary/10 border-primary text-primary' : 'border-transparent'}`}
                        >
                          <div className='flex items-center gap-3'>
                            <FolderGitIcon className={`h-4 w-4 ${selectedRepo?.id === repo.id ? 'text-primary' : 'opacity-40 group-hover:opacity-70'}`} />
                            <div className='text-left underline-offset-4 group-hover:underline'>
                                <p className='font-medium leading-none mb-1'>{repo.name}</p>
                                <p className='text-xs opacity-60 font-mono'>{repo.full_name}</p>
                            </div>
                          </div>
                          {selectedRepo?.id === repo.id && <Check className='h-4 w-4' />}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {selectedRepo && (
                    <div className='animate-in fade-in pt-4'>
                        <Label>Branche</Label>
                        {branches.length > 0 ? (
                            <select 
                                className='w-full mt-2 p-2 border rounded-md text-sm bg-background'
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                                {branches.map(b => (
                                    <option key={b.name} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className='text-xs text-muted-foreground mt-1'>Chargement des branches...</div>
                        )}
                    </div>
                )}
              </div>
            )}

            {/* STEP 2: SERVER */}
            {step === 2 && (
              <div className='space-y-4 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col min-h-0'>
                 <Label className='flex-none'>Choix du serveur VPS</Label>
                 <ScrollArea className='flex-1 border rounded-lg min-h-0 bg-muted/5'>
                    {servers.length === 0 ? (
                        <div className='p-2 space-y-2'>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className='flex items-center gap-4 p-4 border rounded-lg'>
                                        <Skeleton className='h-10 w-10 rounded' />
                                        <div className='space-y-2 flex-1'>
                                            <Skeleton className='h-4 w-1/4' />
                                            <Skeleton className='h-3 w-1/3 opacity-50' />
                                        </div>
                                    </div>
                                ))
                            ) : "Aucun serveur connecté trouvé."}
                        </div>
                    ) : (
                        <div className='p-2 space-y-2'>
                            {servers.map(server => (
                                <button
                                    key={server.id}
                                    onClick={() => setSelectedServer(server)}
                                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all hover:border-primary group ${selectedServer?.id === server.id ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'border-border bg-background'}`}
                                >
                                    <div className='flex items-center gap-4'>
                                        <div className={`h-10 w-10 rounded flex items-center justify-center transition-colors ${selectedServer?.id === server.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/10'}`}>
                                            <ServerIcon className='h-5 w-5' />
                                        </div>
                                        <div className='text-left'>
                                            <p className='font-bold leading-none mb-1'>{server.name}</p>
                                            <p className='text-xs font-mono opacity-60'>{server.ip}</p>
                                        </div>
                                    </div>
                                    {selectedServer?.id === server.id && <Check className='h-5 w-5 text-primary' />}
                                </button>
                            ))}
                        </div>
                    )}
                 </ScrollArea>
              </div>
            )}

            {/* STEP 3: CONFIG */}
            {step === 3 && (
              <div className='space-y-6 animate-in slide-in-from-right-4 duration-300'>
                 <div className='space-y-2'>
                    <Label htmlFor='appName'>Nom de l'application</Label>
                    <div className='relative'>
                        <Settings className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input 
                            id='appName' 
                            value={appName} 
                            onChange={(e) => setAppName(e.target.value)} 
                            placeholder='mon-super-projet' 
                            className='pl-9'
                        />
                    </div>
                 </div>

                 <div className='space-y-2'>
                    <Label htmlFor='domain'>Nom de domaine (Optionnel)</Label>
                    <div className='relative'>
                        <Globe className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input 
                            id='domain' 
                            value={domain} 
                            onChange={(e) => setDomain(e.target.value)} 
                            placeholder='app.mondomaine.com' 
                            className='pl-9'
                        />
                    </div>
                    <p className='text-xs text-muted-foreground'>
                        Par défaut : <span className='font-mono'>{appName.toLowerCase() || 'app'}.{selectedServer?.ip || 'IP'}.sslip.io</span>
                    </p>
                 </div>

                 <Card className='bg-muted/30 border-dashed'>
                    <CardHeader className='p-4 pb-2'>
                        <CardTitle className='text-sm flex items-center gap-2'>
                            <Check className='h-4 w-4 text-green-500' />
                            Résumé du déploiement atomique
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 pt-0 text-sm space-y-1.5'>
                        <div className='flex justify-between'><span className='opacity-60'>Stack :</span> <span className='capitalize font-medium text-primary'>{selectedPreset}</span></div>
                        <div className='flex justify-between'><span className='opacity-60'>Source :</span> <span>{selectedRepo?.full_name} ({selectedBranch})</span></div>
                        <div className='flex justify-between'><span className='opacity-60'>Serveur :</span> <span>{selectedServer?.name}</span></div>
                        {selectedPreset !== 'generic' && (
                            <div className='flex items-center gap-2 text-[10px] bg-green-500/10 text-green-500 p-2 rounded mt-2 border border-green-500/20'>
                                <AlertCircle size={12} />
                                <span>Une base de données <b>{selectedPreset === 'laravel' ? 'MySQL' : 'Postgres'}</b> sera créée et liée automatiquement.</span>
                            </div>
                        )}
                    </CardContent>
                 </Card>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className='flex-none pt-6 mt-6 flex items-center justify-between border-t'>
            <Button
                variant='ghost'
                onClick={() => step > 0 ? setStep(step - 1) : onOpenChange(false)}
            >
                {step === 0 ? 'Annuler' : 'Précédent'}
            </Button>
            
            {step < 3 ? (
                step === 0 ? null : ( // Hide "Next" on step 0 because preset buttons advance step
                <Button 
                    disabled={step === 1 ? !selectedRepo : !selectedServer}
                    onClick={() => setStep(step + 1)}
                    className='gap-2'
                >
                    Suivant
                    <ChevronRight className='h-4 w-4' />
                </Button>
                )
            ) : (
                <Button 
                    disabled={loading || !appName}
                    onClick={handleCreate}
                    className='gap-2 bg-primary hover:bg-primary/90 text-white font-bold'
                >
                    {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Globe className='h-4 w-4' />}
                    Lancer le déploiement
                </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}


// Small helper component to keep the file clean
function Card({ children, className }: any) {
    return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
}
function CardHeader({ children, className }: any) {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
}
function CardTitle({ children, className }: any) {
    return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}
function CardContent({ children, className }: any) {
    return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}
