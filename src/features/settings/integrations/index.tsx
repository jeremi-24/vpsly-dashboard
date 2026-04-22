import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FolderGitIcon, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export function SettingsIntegrations() {
  const [githubUser, setGithubUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<any>('/github/user')
      if (data && !data.error && data.login) {
        setGithubUser(data)
      }
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
      
      // Gestion du retour vers le flux de création d'app
      const pendingAction = localStorage.getItem('vpsly_pending_action')
      if (pendingAction === 'create_app') {
        localStorage.removeItem('vpsly_pending_action')
        // Redirection différée pour laisser le temps au toast d'être lu
        setTimeout(() => {
            navigate({ to: '/apps', search: { action: 'create-app' } })
        }, 1500)
      }

      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (params.get('error')) {
      toast.error(`Erreur : ${params.get('error')}`)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    fetchStatus()
  }, [])

  const handleConnect = async () => {
    try {
      toast.loading('Préparation de la connexion GitHub...')
      const data = await apiFetch<any>('/github/auth/redirect')
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erreur lors de la préparation de la connexion.')
    }
  }

  return (
    <div className='grow space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Intégrations</h3>
        <p className='text-sm text-muted-foreground'>
          Gérez vos connexions aux services tiers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white'>
                <FolderGitIcon size={24} />
              </div>
              <div>
                <CardTitle>GitHub</CardTitle>
                <CardDescription>
                  Accédez à vos dépôts pour déployer vos applications.
                </CardDescription>
              </div>
            </div>
            {githubUser ? (
               <div className='flex items-center gap-2 text-green-600 font-medium text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200 dark:bg-green-950/20 dark:border-green-900'>
                 <CheckCircle2 size={16} />
                 Connecté
               </div>
            ) : (
                <div className='flex items-center gap-2 text-muted-foreground font-medium text-sm bg-muted px-3 py-1 rounded-full border border-border'>
                  <XCircle size={16} />
                  Non connecté
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {githubUser ? (
            <div className='flex items-center justify-between p-4 border rounded-lg bg-muted/5'>
              <div className='flex items-center gap-3'>
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.name} 
                  className='h-10 w-10 rounded-full border'
                />
                <div>
                  <p className='font-medium'>{githubUser.name || githubUser.login}</p>
                  <p className='text-sm text-muted-foreground'>@{githubUser.login}</p>
                </div>
              </div>
              <Button variant='outline' size='sm' onClick={handleConnect}>
                Reconnecter
              </Button>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-6 text-center'>
               <p className='text-sm text-muted-foreground mb-4'>
                 Liez votre compte GitHub pour importer vos projets en un clic.
               </p>
               <Button onClick={handleConnect} className='gap-2'>
                 <FolderGitIcon size={18} />
                 Connecter GitHub
                 <ExternalLink size={14} />
               </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
