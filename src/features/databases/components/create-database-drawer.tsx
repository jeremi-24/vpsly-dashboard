import { useState, useEffect } from 'react'
import { Database, Server as ServerIcon, Check, Loader2, ChevronRight, Settings, Shield, Key, Boxes } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

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
import { Separator } from '@/components/ui/separator'

interface CreateDatabaseDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ENGINES = [
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    image: 'postgres:15-alpine',
    defaultPort: '5432',
    color: 'border-indigo-500 bg-indigo-500/5',
    iconColor: 'text-indigo-500',
    description: 'Robuste, ACID, idéal pour la prod.',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'
  },
  {
    id: 'mysql',
    name: 'MySQL',
    image: 'mysql:8.0',
    defaultPort: '3306',
    color: 'border-orange-500 bg-orange-500/5',
    iconColor: 'text-orange-500',
    description: 'Populaire, simple et performant.',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
  },
  {
    id: 'redis',
    name: 'Redis',
    image: 'redis:7-alpine',
    defaultPort: '6379',
    color: 'border-red-500 bg-red-500/5',
    iconColor: 'text-red-500',
    description: 'Cache In-Memory ultra-rapide.',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg'
  }
]

export function CreateDatabaseDrawer({ open, onOpenChange, onSuccess }: CreateDatabaseDrawerProps) {
  const [step, setStep] = useState(1) // 1: Engine, 2: Server, 3: Config
  const [loading, setLoading] = useState(false)
  
  // Data for selection
  const [servers, setServers] = useState<any[]>([])

  // Selection state
  const [selectedEngine, setSelectedEngine] = useState<any>(ENGINES[0])
  const [selectedServer, setSelectedServer] = useState<any>(null)
  
  const [dbName, setDbName] = useState('')
  const [image, setImage] = useState(ENGINES[0].image)
  const [dbUser, setDbUser] = useState('postgres')
  const [dbPassword, setDbPassword] = useState('')
  const [dbDatabase, setDbDatabase] = useState('postgres')

  // Effect pour adapter les défauts selon le moteur
  useEffect(() => {
    if (selectedEngine) {
       setImage(selectedEngine.image)
       if (selectedEngine.id === 'mysql') {
          setDbUser('root')
          setDbDatabase('laravel')
       } else if (selectedEngine.id === 'redis') {
          setDbUser('default')
          setDbDatabase('0')
       } else {
          setDbUser('postgres')
          setDbDatabase('postgres')
       }
    }
  }, [selectedEngine])

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

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setStep(1)
      setDbPassword(Math.random().toString(36).slice(-12))
    }
  }, [open])

  const handleCreate = async () => {
    if (!dbName || !selectedServer) {
        toast.error('Champs manquants', { description: 'Veuillez sélectionner un serveur et donner un nom.' })
        return
    }

    try {
      setLoading(true)
      const database = await apiFetch<any>('/databases', {
        method: 'POST',
        body: JSON.stringify({
          name: dbName,
          server_id: selectedServer.id,
          image: image,
          postgres_user: dbUser,
          postgres_password: dbPassword,
          postgres_db: dbDatabase,
        })
      })

      toast.success('Service créé', { description: 'Lancement du déploiement Docker...' })
      await apiFetch(`/databases/${database.id}/deploy`, { method: 'POST' })
      toast.success('Déploiement réussi')
      
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Erreur', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-xl px-0 py-0 flex flex-col h-full overflow-hidden'>
        
        {/* HEADER FIXED */}
        <SheetHeader className='px-6 pt-6 pb-2 flex-none'>
            <SheetTitle className='flex items-center gap-2 text-indigo-600'>
              <div className='h-8 w-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600'>
                 {step === 1 ? <Boxes size={18} /> : <Database size={18} />}
              </div>
              <span className='text-sm font-bold uppercase tracking-wider'>
                {step === 1 ? 'Moteur' : step === 2 ? 'Destination' : 'Configuration'}
              </span>
            </SheetTitle>
            <SheetDescription>
               Installez un service géré sur votre infrastructure.
            </SheetDescription>

            {/* Stepper Visual Inside Header */}
            <div className='flex items-center gap-3 mt-4 flex-none'>
               {[1, 2, 3].map((s) => (
                 <div key={s} className='flex items-center gap-1.5'>
                   <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${step >= s ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {step > s ? <Check className='h-3 w-3' /> : s}
                   </div>
                   {s < 3 && <div className={`h-px w-6 ${step > s ? 'bg-indigo-600' : 'bg-muted'}`} />}
                 </div>
               ))}
            </div>
        </SheetHeader>

        {/* BODY SCROLLABLE */}
        <div className='flex-1 min-h-0 relative px-6'>
           <ScrollArea className='h-full py-2'>
              <div className='pr-4 pb-4'>
                {/* STEP 1: ENGINE SELECTION */}
                {step === 1 && (
                   <div className='space-y-4 animate-in fade-in duration-500'>
                      <Label className='text-muted-foreground'>Quel moteur souhaitez-vous déployer ?</Label>
                      <div className='grid grid-cols-1 gap-3'>
                        {ENGINES.map((engine) => (
                           <button
                              key={engine.id}
                              onClick={() => setSelectedEngine(engine)}
                              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                                ${selectedEngine?.id === engine.id ? `${engine.color} ring-2 ring-indigo-500/20 shadow-sm` : 'border-border hover:border-indigo-200 bg-background'}
                              `}
                           >
                              <div className='h-12 w-12 flex-none p-2 rounded-lg bg-white shadow-sm border'>
                                 <img src={engine.logo} alt={engine.name} className='h-full w-full object-contain' />
                              </div>
                              <div className='flex-1'>
                                 <div className='flex items-center justify-between'>
                                    <h3 className='font-bold text-sm text-foreground'>{engine.name}</h3>
                                    {selectedEngine?.id === engine.id && <Check className={`h-4 w-4 ${engine.iconColor}`} />}
                                 </div>
                                 <p className='text-[10px] text-muted-foreground mt-0.5 leading-relaxed'>{engine.description}</p>
                              </div>
                           </button>
                        ))}
                        
                        <div className='p-4 border border-dashed rounded-xl flex items-center gap-4 opacity-40 grayscale'>
                            <div className='h-12 w-12 flex-none p-2 rounded-lg bg-white border flex items-center justify-center'>
                               <Boxes size={24} className='text-muted-foreground' />
                            </div>
                            <div className='flex-1'>
                                <h3 className='font-bold text-xs uppercase tracking-tighter'>Plus de moteurs...</h3>
                                <p className='text-[10px]'>MongoDB, MariaDB, Meilisearch.</p>
                            </div>
                        </div>
                      </div>
                   </div>
                )}

                {/* STEP 2: SERVER */}
                {step === 2 && (
                  <div className='space-y-4 animate-in slide-in-from-right-4 duration-300'>
                     <Label className='text-muted-foreground'>Déployer sur quel serveur ?</Label>
                     <div className='space-y-2'>
                        {loading && servers.length === 0 ? (
                            <div className='space-y-2'>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className='flex items-center gap-4 p-4 border rounded-xl'>
                                        <Skeleton className='h-10 w-10 rounded' />
                                        <div className='space-y-2 flex-1'>
                                            <Skeleton className='h-4 w-1/4' />
                                            <Skeleton className='h-3 w-1/3 opacity-50' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : servers.length === 0 ? (
                            <div className='p-12 text-center text-muted-foreground italic text-sm'>
                                Aucun serveur connecté trouvé.
                            </div>
                        ) : (
                            servers.map(server => (
                                <button
                                    key={server.id}
                                    onClick={() => setSelectedServer(server)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:border-indigo-600 group ${selectedServer?.id === server.id ? 'bg-indigo-600/5 border-indigo-600 ring-2 ring-indigo-500/20' : 'border-border bg-background'}`}
                                >
                                    <div className='flex items-center gap-4'>
                                        <div className={`h-10 w-10 rounded flex items-center justify-center transition-colors ${selectedServer?.id === server.id ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground group-hover:bg-indigo-600/10'}`}>
                                            <ServerIcon className='h-5 w-5' />
                                        </div>
                                        <div className='text-left'>
                                            <p className='font-bold text-sm leading-none mb-1'>{server.name}</p>
                                            <p className='text-xs font-mono opacity-60'>{server.ip}</p>
                                        </div>
                                    </div>
                                    {selectedServer?.id === server.id && <Check className='h-5 w-5 text-indigo-600' />}
                                </button>
                            ))
                        )}
                     </div>
                  </div>
                )}

                {/* STEP 3: CONFIG */}
                {step === 3 && (
                  <div className='space-y-4 animate-in slide-in-from-right-4 duration-300'>
                     <div className='grid gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='dbName'>Nom du service</Label>
                            <div className='relative'>
                                <Settings className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input 
                                    id='dbName' 
                                    value={dbName} 
                                    onChange={(e) => setDbName(e.target.value)} 
                                    placeholder='ma-db-production' 
                                    className='pl-9 h-9'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='image' className='text-[11px] uppercase tracking-wider opacity-60'>Version Docker</Label>
                                <Input id='image' value={image} onChange={(e) => setImage(e.target.value)} className='h-9 text-xs font-mono' />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='port' className='text-[11px] uppercase tracking-wider opacity-60'>Port Interne</Label>
                                <Input id='port' disabled value={selectedEngine.defaultPort} className='h-9 text-xs bg-muted/30' />
                            </div>
                        </div>

                        <Separator className='my-2' />
                        
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='dbUser' className='text-[10px] font-bold uppercase opacity-70'>Utilisateur (Admin)</Label>
                                <Input id='dbUser' value={dbUser} onChange={(e) => setDbUser(e.target.value)} placeholder="ex: admin" className='h-9 text-xs' />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='dbDatabase' className='text-[10px] font-bold uppercase opacity-70'>Nom de la Base</Label>
                                <Input id='dbDatabase' value={dbDatabase} onChange={(e) => setDbDatabase(e.target.value)} placeholder="ex: my_app_db" className='h-9 text-xs' />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='dbPassword' className='text-[10px] font-bold uppercase opacity-70'>Mot de passe</Label>
                            <div className='relative'>
                                <Key className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input id='dbPassword' value={dbPassword} onChange={(e) => setDbPassword(e.target.value)} className='pl-9 h-9 font-mono text-xs' />
                            </div>
                            <Button variant="link" className="p-0 h-auto text-[10px]" onClick={() => setDbPassword(Math.random().toString(36).slice(-12))}>
                                Générer un mot de passe aléatoire
                            </Button>
                        </div>
                     </div>

                     <div className='mt-6 p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white text-indigo-800 dark:from-indigo-950/30 dark:to-background dark:border-indigo-900/50 shadow-sm'>
                        <div className='flex gap-3'>
                            <Shield className='h-5 w-5 flex-none text-indigo-400' />
                            <div>
                                <p className='font-bold text-xs mb-1'>Sécurité Enterprise</p>
                                <p className='text-[10px] leading-relaxed opacity-80'>
                                   Credentials isolés et chiffrement natif activé.
                                </p>
                            </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
           </ScrollArea>
        </div>

        {/* FOOTER FIXED */}
        <div className='flex-none p-6 flex items-center justify-between border-t bg-background'>
          <Button
              variant='ghost'
              size='sm'
              onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
          >
              {step === 1 ? 'Annuler' : 'Précédent'}
          </Button>
          
          <div className='flex gap-2'>
          {step < 3 ? (
              <Button 
                  disabled={step === 2 && !selectedServer}
                  onClick={() => setStep(step + 1)}
                  size='sm'
                  className='gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all font-bold px-6 shadow-indigo-200 dark:shadow-none shadow-md'
              >
                  Continuer
                  <ChevronRight className='h-4 w-4' />
              </Button>
          ) : (
              <Button 
                  disabled={loading || !dbName}
                  onClick={handleCreate}
                  size='sm'
                  className='gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-bold px-6 shadow-indigo-200 dark:shadow-none shadow-sm'
              >
                  {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Database className='h-4 w-4' />}
                  Déployer l'instance
              </Button>
          )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
