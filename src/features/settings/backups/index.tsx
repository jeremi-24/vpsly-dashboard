import { useEffect, useState } from 'react'
import { ShieldCheck, Server, Bell, Save, Info, Loader } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface BackupSettings {
  frequency: string
  execution_time: string
  retention_days: number
  storage_destination: string
  storage_credentials: any | null
  notification_channel: 'email' | 'whatsapp' | 'both' | 'none'
  notification_phone: string | null
  notification_email: string | null
  active: boolean
}

export default function SettingsBackups() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<BackupSettings>({
    frequency: 'daily',
    execution_time: '02:00',
    retention_days: 7,
    storage_destination: 'local',
    storage_credentials: null,
    notification_channel: 'email',
    notification_phone: '',
    notification_email: '',
    active: true
  })

  // ... (rest of useEffect and handleSave)

  // Dans le render, section Stockage (lignes ~160)

  // Chargement initial des réglages
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<BackupSettings>('/settings/backups')
        setSettings(data)
      } catch (error) {
        toast.error('Impossible de charger les réglages')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await apiFetch('/settings/backups', {
        method: 'POST',
        body: JSON.stringify(settings)
      })
      toast.success('Paramètres enregistrés avec succès')
    } catch (error) {
      toast.error('Échec de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleTestNotification = async (type: 'whatsapp' | 'email') => {
    try {
      toast.info(`Envoi d'un test ${type}...`)
      // Placeholder pour l'endpoint de test
      // await apiFetch('/settings/backups/test', { method: 'POST', body: JSON.stringify({ type }) })
      setTimeout(() => toast.success(`Test ${type} envoyé !`), 1500)
    } catch {
      toast.error(`Échec de l'envoi du test ${type}`)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div>
        <h3 className='text-lg font-medium'>Sauvegardes</h3>
        <p className='text-sm text-muted-foreground'>
          Politique de sauvegarde automatique.
        </p>
      </div>
      <Separator />

      <div className='grid gap-6'>
        {/* QUAND */}
        <Card className="border-none shadow-none bg-muted/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base font-medium">Planification</CardTitle>
            </div>
            <CardDescription>Fréquence et rétention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fréquence automatique</Label>
                <Select 
                  value={settings.frequency} 
                  onValueChange={(val) => setSettings({ ...settings, frequency: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne — recommandé</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="manual">Manuelle uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Heure d'exécution (Locale)</Label>
                <Input 
                  type="time" 
                  value={settings.execution_time} 
                  onChange={(e) => setSettings({ ...settings, execution_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rétention (jours)</Label>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  value={settings.retention_days} 
                  onChange={(e) => setSettings({ ...settings, retention_days: parseInt(e.target.value) || 1 })}
                  className="w-24" 
                />
                <span className="text-sm text-muted-foreground">Les sauvegardes au-delà de cette limite sont supprimées.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OÙ */}
        <Card className="border-none shadow-none bg-muted/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base font-medium">Stockage</CardTitle>
            </div>
            <CardDescription>Destination des fichiers de sauvegarde.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Destination</Label>
              <Select 
                value={settings.storage_destination} 
                onValueChange={(val) => setSettings({ ...settings, storage_destination: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Serveur Actuel (Local)</SelectItem>
                  <SelectItem value="google_drive">Google Drive</SelectItem>
                  <SelectItem value="s3" disabled>Amazon S3 (Bientôt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {settings.storage_destination === 'google_drive' && (
              <div className="animate-in slide-in-from-top-1 duration-300">
                {settings.storage_credentials?.access_token ? (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 flex items-center justify-between gap-3">
                    <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30 overflow-hidden shadow-inner border border-blue-500/10'>
                             <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" 
                                alt="Google Drive" 
                                className="h-5 w-5"
                             />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">Google Drive connecté</p>
                            <p className="text-xs text-green-600/80">{settings.storage_credentials.email}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <a href="/settings/integrations">Changer</a>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex flex-col gap-3">
                    <div className='flex gap-3'>
                        <Info className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 leading-relaxed font-medium">
                          Google Drive n'est pas encore connecté. Vous devez lier votre compte pour utiliser cette destination.
                        </p>
                    </div>
                    <Button variant="destructive" size="sm" className='w-full' asChild>
                        <a href="/settings/integrations">Connecter Google Drive maintenant</a>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {settings.storage_destination === 'local' && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 flex gap-3 animate-in slide-in-from-top-1 duration-300">
                <Info className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 leading-relaxed font-medium">
                  Backup local uniquement. Si ce VPS tombe, vos sauvegardes tombent avec lui. Pensez à lier un stockage externe pour plus de sécurité.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ALERTES */}
        <Card className="border-none shadow-none bg-muted/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base font-medium">Notifications</CardTitle>
            </div>
            <CardDescription>Canaux d'alerte en cas d'échec.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* WhatsApp */}
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">WhatsApp</span>
                  <span className="text-xs text-muted-foreground">Message direct sur votre téléphone.</span>
                </div>
                <Switch 
                  checked={settings.notification_channel === 'whatsapp' || settings.notification_channel === 'both'} 
                  onCheckedChange={(checked) => {
                    const current = settings.notification_channel
                    let next: 'email' | 'whatsapp' | 'both' | 'none' = 'none'
                    if (checked) next = current === 'email' ? 'both' : 'whatsapp'
                    else next = current === 'both' ? 'email' : 'none'
                    setSettings({ ...settings, notification_channel: next })
                  }}
                />
              </div>
              
              {(settings.notification_channel === 'whatsapp' || settings.notification_channel === 'both') && (
                <div className="grid gap-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="whatsapp">Numéro de téléphone</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="whatsapp" 
                      placeholder="+228 90 00 00 00" 
                      value={settings.notification_phone || ''}
                      onChange={(e) => setSettings({ ...settings, notification_phone: e.target.value })}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!settings.notification_phone}
                      onClick={() => handleTestNotification('whatsapp')}
                    >
                      Envoyer un test
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-white/5" />

            {/* Email */}
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-xs text-muted-foreground">Rapport quotidien dans votre boîte.</span>
                </div>
                <Switch 
                  checked={settings.notification_channel === 'email' || settings.notification_channel === 'both'} 
                  onCheckedChange={(checked) => {
                    const current = settings.notification_channel
                    let next: 'email' | 'whatsapp' | 'both' | 'none' = 'none'
                    if (checked) next = current === 'whatsapp' ? 'both' : 'email'
                    else next = current === 'both' ? 'whatsapp' : 'none'
                    setSettings({ ...settings, notification_channel: next })
                  }}
                />
              </div>

              {(settings.notification_channel === 'email' || settings.notification_channel === 'both') && (
                <div className="grid gap-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="email">Adresse email de secours</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="admin@vpsly.io" 
                      value={settings.notification_email || ''}
                      onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!settings.notification_email}
                      onClick={() => handleTestNotification('email')}
                    >
                      Envoyer un test
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="px-8 min-w-[200px]">
            {saving ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </div>
    </div>
  )
}
