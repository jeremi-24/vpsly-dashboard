import { useState, useEffect, useMemo } from 'react'
import { FolderGitIcon, Server as ServerIcon, Settings, Check, Loader2, ChevronRight, ChevronLeft, Globe, Plus, Search, AlertCircle } from 'lucide-react'
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

interface CreateAppDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateAppDrawer({ open, onOpenChange, onSuccess }: CreateAppDrawerProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Data for selection
  const [repos, setRepos] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [servers, setServers] = useState<any[]>([])

  // Selection state
  const [selectedRepo, setSelectedRepo] = useState<any>(null)
  const [selectedBranch, setSelectedBranch] = useState('main')
  const [selectedServer, setSelectedServer] = useState<any>(null)
  const [appName, setAppName] = useState('')
  const [domain, setDomain] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

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
    if (open && step === 1 && repos.length === 0) {
      const fetchRepos = async () => {
        try {
          const data = await apiFetch<any[]>('/github/repositories')
          setRepos(data)
        } catch (error) {
          console.error(error)
        }
      }
      fetchRepos()
    }
  }, [open, step, repos.length])

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
          const data = await apiFetch<any[]>('/servers')
          setServers(data.filter(s => s.status === 'connected'))
        } catch (error) {
          console.error(error)
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
          domain: domain || `${appName.toLowerCase()}.sslip.io`
        })
      })

      toast.success('Application créée', { description: 'Le déploiement va commencer.' })
      onSuccess()
    } catch (error: any) {
      toast.error('Erreur', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-2xl px-6 py-4 flex flex-col h-full'>
        <div className='w-full flex flex-col h-full min-h-0'>
          <SheetHeader className='px-0 flex-none'>
            <div className='flex items-center gap-2 text-primary mb-4'>
              <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                 <Plus size={18} />
              </div>
              <span className='text-sm font-bold uppercase tracking-wider'>Déployer une application</span>
            </div>
          </SheetHeader>

          {/* Stepper Visual */}
          <div className='flex items-center justify-between my-6 px-4 flex-none'>
            {[1, 2, 3].map((s) => (
              <div key={s} className='flex items-center gap-2'>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                   {step > s ? <Check className='h-4 w-4' /> : s}
                </div>
                <span className={`text-xs font-medium ${step === s ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s === 1 ? 'Source' : s === 2 ? 'Serveur' : 'Configuration'}
                </span>
                {s < 3 && <div className='h-px w-12 bg-muted mx-2 hidden sm:block' />}
              </div>
            ))}
          </div>

          <div className='flex-1 min-h-0 relative'>
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
                  {repos.length === 0 ? (
                    <div className='p-12 text-center text-muted-foreground'>
                        <Loader2 className='h-8 w-8 animate-spin mx-auto mb-3 opacity-20' />
                        <p className='text-sm'>Chargement de vos dépôts GitHub...</p>
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
                        <div className='p-12 text-center text-muted-foreground'>
                            {loading ? (
                                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-3 opacity-20' />
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
                        Par défaut : <span className='font-mono'>{appName.toLowerCase() || 'app'}.sslip.io</span>
                    </p>
                 </div>

                 <Card className='bg-muted/30 border-dashed'>
                    <CardHeader className='p-4 pb-2'>
                        <CardTitle className='text-sm flex items-center gap-2'>
                            <Check className='h-4 w-4 text-green-500' />
                            Résumé du déploiement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 pt-0 text-sm space-y-1.5'>
                        <div className='flex justify-between'><span className='opacity-60'>Source :</span> <span>{selectedRepo?.full_name} ({selectedBranch})</span></div>
                        <div className='flex justify-between'><span className='opacity-60'>Serveur :</span> <span>{selectedServer?.name} ({selectedServer?.ip})</span></div>
                        <div className='flex justify-between'><span className='opacity-60'>Domaine :</span> <span>{domain || `${appName.toLowerCase()}.sslip.io`}</span></div>
                    </CardContent>
                 </Card>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className='flex-none pt-6 mt-6 flex items-center justify-between border-t'>
            <Button
                variant='ghost'
                onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
            >
                {step === 1 ? 'Annuler' : 'Précédent'}
            </Button>
            
            {step < 3 ? (
                <Button 
                    disabled={step === 1 ? !selectedRepo : !selectedServer}
                    onClick={() => setStep(step + 1)}
                    className='gap-2'
                >
                    Suivant
                    <ChevronRight className='h-4 w-4' />
                </Button>
            ) : (
                <Button 
                    disabled={loading || !appName}
                    onClick={handleCreate}
                    className='gap-2 bg-green-600 hover:bg-green-700 text-white'
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
