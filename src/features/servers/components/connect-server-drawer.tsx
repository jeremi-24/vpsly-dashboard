import { useState, useEffect } from 'react'
import { Copy, Check, Info, Server as ServerIcon, Loader, ChevronRight, Box, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { PlanLock } from '@/components/shared/plan-lock'
import { cn } from '@/lib/utils'

interface ConnectServerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  server?: any
}

interface ServerResponse {
  server: {
    id: number
    name: string
    ip: string
    status: string
  }
  setup_command: string
}

export function ConnectServerDrawer({ open, onOpenChange, onSuccess, server }: ConnectServerDrawerProps) {
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0)
  const [isCopied, setIsCopied] = useState(false)
  const [isExecuted, setIsExecuted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    ssh_user: 'root',
    ssh_port: '22',
    infrastructure_type: 'clean' as 'clean' | 'legacy'
  })

  useEffect(() => {
    if (open && server) {
      setFormData({
        name: server.name || '',
        ip: server.ip || '',
        ssh_user: server.ssh_user || 'root',
        ssh_port: server.ssh_port?.toString() || '22',
        infrastructure_type: server.infrastructure_type || 'clean'
      })
      setActiveStep(1) // Start at form if editing
    } else if (open) {
      handleReset()
    }
  }, [open, server])

  const [setupData, setSetupData] = useState<ServerResponse | null>(null)

  const handleCopy = () => {
    if (!setupData) return
    navigator.clipboard.writeText(setupData.setup_command)
    setIsCopied(true)
    toast('Copié dans le presse-papier', {
      description: 'La commande est prête à être collée dans votre terminal.',
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSaveServer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const isEditing = !!server
      toast.info(isEditing ? 'Mise à jour du serveur...' : 'Enregistrement du serveur...')
      
      const endpoint = isEditing ? `/servers/${server.id}` : '/servers'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await apiFetch<ServerResponse>(endpoint, {
        method,
        body: JSON.stringify({
          ...formData,
          ssh_port: parseInt(formData.ssh_port),
        }),
      })

      if (isEditing) {
          toast.success('Serveur mis à jour')
          onSuccess()
          handleReset()
      } else {
          setSetupData(response)
          setActiveStep(2)
          toast.success('Serveur ajouté avec succès', {
            description: 'Le serveur a été enregistré. Configurez maintenant l\'accès SSH.',
          })
      }
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible d\'enregistrer le serveur.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Test the SSH connection
  const handleVerifyConnection = async () => {
    if (!setupData) return
    if (!isExecuted) {
      toast.error('Action requise', {
        description: 'Veuillez confirmer l\'exécution de la commande sur le VPS.',
      })
      return
    }

    setLoading(true)
    try {
      toast.info('Vérification de la connexion SSH...')
      await apiFetch(`/servers/${setupData.server.id}/test-connection`, {
        method: 'POST',
      })

      toast.success('Connexion SSH réussie !', {
        description: 'Votre serveur est prêt pour les déploiements.',
      })

      // Cleanup and close
      handleReset()
      onSuccess()
    } catch (error: any) {
      toast.error('Échec de la connexion', {
        description: error.message || 'Impossible de joindre le serveur. Vérifiez la commande sur le VPS.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ name: '', ip: '', ssh_user: 'root', ssh_port: '22', infrastructure_type: 'clean' })
    setActiveStep(0)
    setSetupData(null)
    setIsExecuted(false)
  }

  return (
    <Sheet open={open} onOpenChange={(val) => {
      if (!val) handleReset()
      onOpenChange(val)
    }}>
      <SheetContent className='sm:max-w-md overflow-y-auto px-0'>
        <PlanLock 
          checkQuota="servers" 
          featureName="Connecter un VPS" 
          isLocked={server ? false : undefined}
          className="flex flex-col h-full"
        >
          <SheetHeader className='px-6'>
            <SheetTitle className='flex items-center gap-2 text-xl'>
              <ServerIcon className='h-5 w-5 text-primary' />
              {activeStep === 0 ? 'Type de serveur' : activeStep === 2 ? 'Configuration SSH' : (server ? 'Modifier le serveur' : 'Connexion serveur')}
            </SheetTitle>
            <SheetDescription>
              {activeStep === 0
                ? 'Choisissez comment VPSly va gérer votre serveur.'
                : activeStep === 1
                ? (server ? 'Modifiez les informations de votre instance.' : 'Renseignez les informations de votre serveur VPS.')
                : `Finalisation de l'accès pour ${setupData?.server.name}`}
            </SheetDescription>
          </SheetHeader>

          <div className='mt-8 px-6 flex-1 overflow-y-auto'>
              {activeStep === 0 ? (
                /* STEP 0: INFRASTRUCTURE TYPE */
                <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300'>
                  <div className='grid grid-cols-2 gap-4'>
                    <button
                      onClick={() => {
                        setFormData({ ...formData, infrastructure_type: 'clean' })
                        setActiveStep(1)
                      }}
                      className={cn(
                        'flex flex-col gap-3 p-5 rounded-2xl border text-left transition-all hover:border-primary group bg-card hover:bg-primary/5',
                        formData.infrastructure_type === 'clean' && 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      )}
                    >
                      <div className='h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform'>
                        <Box className='h-6 w-6' />
                      </div>
                      <div className='space-y-1.5'>
                        <h4 className='font-bold text-sm leading-tight'>Serveur vierge</h4>
                        <p className='text-[10px] text-muted-foreground leading-relaxed'>
                          VPSly installera tous les outils nécessaires sur votre serveur.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setFormData({ ...formData, infrastructure_type: 'legacy' })
                        setActiveStep(1)
                      }}
                      className={cn(
                        'flex flex-col gap-3 p-5 rounded-2xl border text-left transition-all hover:border-amber-500 group bg-card hover:bg-amber-500/5',
                        formData.infrastructure_type === 'legacy' && 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20'
                      )}
                    >
                      <div className='h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform'>
                        <Terminal className='h-6 w-6' />
                      </div>
                      <div className='space-y-1.5'>
                        <h4 className='font-bold text-sm leading-tight'>Serveur existant</h4>
                        <p className='text-[10px] text-muted-foreground leading-relaxed'>
                          VPSly s'adaptera à la configuration déjà existante.
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className='p-4 rounded-xl bg-muted/30 border border-dashed flex gap-3'>
                    <Info className='h-4 w-4 text-primary shrink-0 mt-0.5' />
                    <p className='text-[11px] leading-relaxed text-muted-foreground italic'>
                      Ce choix définit les fonctionnalités disponibles pour ce serveur et ne peut pas être modifié après création.
                    </p>
                  </div>
                </div>
              ) : activeStep === 1 ? (
              /* STEP 1 FORM */
              <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-300'>
                <div className='grid gap-4'>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='name'>Nom d'affichage</Label>
                    <Input
                      id='name'
                      placeholder='ex: Production VPS'
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <p className='text-[10px] text-muted-foreground'>Libellé utilisé dans l'interface de gestion.</p>
                  </div>

                  <div className='grid grid-cols-3 gap-4'>
                    <div className='grid gap-1.5 col-span-2'>
                      <Label htmlFor='ip'>Adresse IP</Label>
                      <Input
                        id='ip'
                        placeholder='0.0.0.0'
                        value={formData.ip}
                        onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                      />
                    </div>
                    <div className='grid gap-1.5'>
                      <Label htmlFor='port'>Port SSH</Label>
                      <Input
                        id='port'
                        placeholder='22'
                        value={formData.ssh_port}
                        onChange={(e) => setFormData({ ...formData, ssh_port: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className='grid gap-1.5'>
                    <Label htmlFor='user'>Utilisateur SSH</Label>
                    <Input
                      id='user'
                      placeholder='root'
                      value={formData.ssh_user}
                      onChange={(e) => setFormData({ ...formData, ssh_user: e.target.value })}
                    />
                    <p className='text-[10px] text-muted-foreground'>Utilisateur système disposant de tout les droits.</p>
                  </div>
                </div>

                <div className='flex gap-3'>
                   {!server && (
                     <Button variant='outline' className='flex-1' onClick={() => setActiveStep(0)}>
                       Retour
                     </Button>
                   )}
                   <Button
                    className='flex-[2]'
                    onClick={handleSaveServer}
                    disabled={loading || !formData.name || !formData.ip}
                  >
                    {loading ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
                    {server ? 'Mettre à jour' : 'Suivant'}
                    {!server && <ChevronRight className='ml-2 h-4 w-4' />}
                  </Button>
                </div>
              </div>
            ) : (
              /* STEP 2 SETUP */
              <div className='space-y-8 animate-in fade-in slide-in-from-right-4 duration-300'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
                      1
                    </span>
                    <h3 className='font-semibold'>Autorisation SSH</h3>
                  </div>

                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    Ajoutez la clé publique de déploiement au serveur cible pour autoriser l'accès distant.
                  </p>

                  <div className='relative group'>
                    <div className='flex h-24 w-full items-start rounded-md border border-input bg-muted/50 px-3 py-2 text-xs font-mono overflow-y-auto no-scrollbar pr-10 whitespace-pre-wrap break-all leading-normal'>
                      {setupData?.setup_command}
                    </div>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='absolute right-2 top-2 h-8 w-8 opacity-70 hover:opacity-100 bg-background/50'
                      onClick={handleCopy}
                    >
                      {isCopied ? <Check className='h-4 w-4 text-green-500' /> : <Copy className='h-4 w-4' />}
                    </Button>
                  </div>

                  <div className='flex items-start space-x-3 rounded-lg border border-primary/20 bg-primary/5 p-4'>
                    <Checkbox
                      id='executed'
                      checked={isExecuted}
                      onCheckedChange={(checked) => setIsExecuted(checked === true)}
                      className='mt-1'
                    />
                    <div className='grid gap-1.5 leading-none'>
                      <Label
                        htmlFor='executed'
                        className='text-sm font-semibold leading-none cursor-pointer'
                      >
                        J'ai exécuté la commande sur le VPS
                      </Label>

                    </div>
                  </div>
                </div>

                <div className='pt-4 border-t'>
                  <div className='flex items-center gap-2 mb-4'>
                    <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
                      2
                    </span>
                    <h3 className='font-semibold'>Validation connectivité</h3>
                  </div>

                  <Button
                    className='w-full mb-2'
                    onClick={handleVerifyConnection}
                    disabled={!isExecuted || loading}
                    variant={isExecuted ? 'default' : 'outline'}
                  >
                    {loading ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
                    {loading ? 'Test SSH en cours...' : 'Vérifier la connexion'}
                  </Button>

                  <p className='text-[10px] text-center text-muted-foreground'>
                    Un handshake SSH sera effectué pour valider l'accès.
                  </p>
                </div>
              </div>
            )}
          </div>
        </PlanLock>
      </SheetContent>
    </Sheet>
  )
}
