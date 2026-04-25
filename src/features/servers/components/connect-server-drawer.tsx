import { useState } from 'react'
import { Copy, Check, Info, Server as ServerIcon, Loader2, ChevronRight } from 'lucide-react'
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

interface ConnectServerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
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

export function ConnectServerDrawer({ open, onOpenChange, onSuccess }: ConnectServerDrawerProps) {
  const [activeStep, setActiveStep] = useState<1 | 2>(1)
  const [isCopied, setIsCopied] = useState(false)
  const [isExecuted, setIsExecuted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    ssh_user: 'root',
    ssh_port: '22',
  })

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

  // Step 1: Create the server in pending state
  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await apiFetch<ServerResponse>('/servers', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          ssh_port: parseInt(formData.ssh_port),
        }),
      })

      setSetupData(response)
      setActiveStep(2)
      toast.success('Serveur ajouté', {
        description: 'Le serveur a été enregistré. Configurez maintenant l\'accès SSH.',
      })
    } catch (error: any) {
      toast.error('Erreur lors de l\'ajout', {
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
      await apiFetch(`/servers/${setupData.server.id}/test-connection`, {
        method: 'POST',
      })

      toast.success('Connexion réussie !', {
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
    setFormData({ name: '', ip: '', ssh_user: 'root', ssh_port: '22' })
    setActiveStep(1)
    setSetupData(null)
    setIsExecuted(false)
  }

  return (
    <Sheet open={open} onOpenChange={(val) => {
       if (!val) handleReset()
       onOpenChange(val)
    }}>
      <SheetContent className='sm:max-w-md overflow-y-auto px-6'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2 text-xl'>
            <ServerIcon className='h-5 w-5 text-primary' />
            {activeStep === 1 ? 'Connexion serveur' : 'Configuration SSH'}
          </SheetTitle>
          <SheetDescription>
            {activeStep === 1 
              ? 'Renseignez les informations de votre serveur VPS.'
              : `Finalisation de l'accès pour ${setupData?.server.name}`}
          </SheetDescription>
        </SheetHeader>

        <div className='mt-8'>
          {activeStep === 1 ? (
            /* STEP 1 FORM */
            <div className='space-y-6'>
              <div className='grid gap-4'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='name'>Nom d'affichage</Label>
                  <Input 
                    id='name' 
                    placeholder='ex: Production VPS'
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                        onChange={(e) => setFormData({...formData, ip: e.target.value})}
                      />
                   </div>
                   <div className='grid gap-1.5'>
                      <Label htmlFor='port'>Port SSH</Label>
                      <Input 
                        id='port' 
                        placeholder='22'
                        value={formData.ssh_port}
                        onChange={(e) => setFormData({...formData, ssh_port: e.target.value})}
                      />
                   </div>
                </div>

                <div className='grid gap-1.5'>
                  <Label htmlFor='user'>Utilisateur SSH</Label>
                  <Input 
                    id='user' 
                    placeholder='root'
                    value={formData.ssh_user}
                    onChange={(e) => setFormData({...formData, ssh_user: e.target.value})}
                  />
                  <p className='text-[10px] text-muted-foreground'>Utilisateur système disposant des droits Docker.</p>
                </div>
              </div>
              
              <Button 
                className='w-full' 
                onClick={handleCreateServer}
                disabled={loading || !formData.name || !formData.ip}
              >
                {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                Enregistrer le serveur 
                <ChevronRight className='ml-2 h-4 w-4' />
              </Button>
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
                  {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  {loading ? 'Test SSH en cours...' : 'Vérifier la connexion'}
                </Button>
                
                <p className='text-[10px] text-center text-muted-foreground'>
                  Un handshake SSH sera effectué pour valider l'accès.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
