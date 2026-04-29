import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const GithubLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

export function SettingsIntegrations() {
  const [githubUser, setGithubUser] = useState<any>(null)
  const [backupSettings, setBackupSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchStatus = async () => {
    try {
      setLoading(true)
      // GitHub
      const ghData = await apiFetch<any>('/github/user').catch(() => null)
      if (ghData && !ghData.error && ghData.login) {
        setGithubUser(ghData)
      }

      // Google Drive
      const backupData = await apiFetch<any>('/settings/backups').catch(() => null)
      setBackupSettings(backupData)
      
    } catch (error) {
      // Not connected or error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'github') {
      toast.success('GitHub connecté avec succès !')
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (params.get('success') === 'google_drive') {
      toast.success('Google Drive connecté avec succès !')
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (params.get('error')) {
      toast.error(`Erreur : ${params.get('error')}`)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    fetchStatus()
  }, [])

  const handleConnectGithub = async () => {
    try {
      toast.loading('Préparation de la connexion GitHub...')
      const data = await apiFetch<any>('/github/auth/redirect')
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erreur lors de la préparation de la connexion GitHub.')
    }
  }

  const handleConnectDrive = async () => {
    try {
      toast.loading('Préparation de la connexion Google Drive...')
      const data = await apiFetch<any>('/auth/google/drive/redirect')
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erreur lors de la préparation de la connexion Google Drive.')
    }
  }

  const handleDisconnectDrive = async () => {
    try {
      await apiFetch('/settings/backups/google-drive/disconnect', { method: 'POST' })
      toast.success('Google Drive déconnecté.')
      fetchStatus()
    } catch (error) {
      toast.error('Erreur lors de la déconnexion.')
    }
  }

  const isDriveConnected = backupSettings?.storage_destination === 'google_drive' && backupSettings?.storage_credentials?.access_token

  return (
    <div className='grow space-y-3'>
      <div>
        <h3 className='text-lg font-medium'>Intégrations</h3>
        <p className='text-sm text-muted-foreground'>
          Gérez vos connexions aux services tiers pour le déploiement et les sauvegardes.
        </p>
      </div>

      <div className='grid grid-cols-1 max-w-4xl'>
        {/* GitHub Card */}
        <Card className='overflow-hidden border-none shadow-sm bg-muted/20'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white p-2.5 shadow-lg shadow-black/10'>
                  <GithubLogo className='h-full w-full' />
                </div>
                <div>
                  <CardTitle className='text-lg'>GitHub</CardTitle>
                  <CardDescription>
                    Déploiement automatique depuis vos dépôts.
                  </CardDescription>
                </div>
              </div>
              {!loading && (
                  githubUser ? (
                      <div className='flex items-center gap-2 text-green-600 font-medium text-xs bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20'>
                          <CheckCircle2 size={14} />
                          Connecté
                      </div>
                  ) : (
                      <div className='flex items-center gap-2 text-muted-foreground font-medium text-xs bg-muted px-3 py-1.5 rounded-full border border-border'>
                          <XCircle size={14} />
                          Non configuré
                      </div>
                  )
              )}
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            {loading ? (
              <Skeleton className='h-20 w-full rounded-xl' />
            ) : githubUser ? (
              <div className='flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50'>
                <div className='flex items-center gap-4'>
                  <img 
                    src={githubUser.avatar_url} 
                    alt={githubUser.name} 
                    className='h-12 w-12 rounded-full border-2 border-background shadow-sm'
                  />
                  <div>
                    <p className='font-semibold text-sm'>{githubUser.name || githubUser.login}</p>
                    <p className='text-xs text-muted-foreground'>@{githubUser.login}</p>
                  </div>
                </div>
                <Button variant='outline' size='sm' onClick={handleConnectGithub} className='rounded-lg hover:bg-muted'>
                  Changer de compte
                </Button>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-6 text-center bg-background/30 rounded-xl border border-dashed border-border'>
                 <p className='text-sm text-muted-foreground mb-4 max-w-[300px]'>
                   Liez votre compte GitHub pour importer vos projets en un clic.
                 </p>
                 <Button onClick={handleConnectGithub} className='gap-2 rounded-lg px-6'>
                   <GithubLogo className='h-4 w-4' />
                   Connecter GitHub
                 </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Drive Card */}
        <Card className='overflow-hidden border-none shadow-sm bg-muted/20'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg shadow-blue-500/5 border border-blue-500/10 dark:bg-slate-900 overflow-hidden'>
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" 
                    alt="Google Drive" 
                    className="h-7 w-7"
                  />
                </div>
                <div>
                  <CardTitle className='text-lg'>Google Drive</CardTitle>
                  <CardDescription>
                    Sauvegardes automatiques sécurisées.
                  </CardDescription>
                </div>
              </div>
              {!loading && (
                  isDriveConnected ? (
                      <div className='flex items-center gap-2 text-blue-600 font-medium text-xs bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20'>
                          <CheckCircle2 size={14} />
                          Actif
                      </div>
                  ) : (
                      <div className='flex items-center gap-2 text-muted-foreground font-medium text-xs bg-muted px-3 py-1.5 rounded-full border border-border'>
                          <XCircle size={14} />
                          Non configuré
                      </div>
                  )
              )}
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            {loading ? (
              <Skeleton className='h-20 w-full rounded-xl' />
            ) : isDriveConnected ? (
              <div className='flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-500/20 shadow-inner overflow-hidden'>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" 
                      alt="Google Drive" 
                      className="h-6 w-6"
                    />
                  </div>
                  <div>
                    <p className='font-semibold text-sm'>Google Drive connecté</p>
                    <p className='text-xs text-muted-foreground'>{backupSettings.storage_credentials.email}</p>
                  </div>
                </div>
                <Button variant='ghost' size='sm' onClick={handleDisconnectDrive} className='text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg'>
                  Déconnecter
                </Button>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-6 text-center bg-background/30 rounded-xl border border-dashed border-border'>
                 <p className='text-sm text-muted-foreground mb-4 max-w-[300px]'>
                   Stockez vos bases de données et volumes sur votre cloud personnel.
                 </p>
                 <Button onClick={handleConnectDrive} variant='outline' className='gap-2 rounded-lg border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-600 transition-all'>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M18.74 15L12.15 3.5h-6.85L12 14z" />
                    </svg>
                   Connecter Google Drive
                 </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
