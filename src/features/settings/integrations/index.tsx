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
      
      const pendingAction = localStorage.getItem('vpsly_pending_action')
      if (pendingAction === 'create_app') {
        localStorage.removeItem('vpsly_pending_action')
        setTimeout(() => {
            navigate({ to: '/apps', search: { action: 'create-app' } })
        }, 1500)
      }

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
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white p-2'>
                <GithubLogo className='h-full w-full' />
              </div>
              <div>
                <CardTitle>GitHub</CardTitle>
                <CardDescription>
                  Accédez à vos dépôts pour déployer vos applications.
                </CardDescription>
              </div>
            </div>
            {!loading && (
                githubUser ? (
                    <div className='flex items-center gap-2 text-green-600 font-medium text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200 dark:bg-green-950/20 dark:border-green-900'>
                        <CheckCircle2 size={16} />
                        Connecté
                    </div>
                ) : (
                    <div className='flex items-center gap-2 text-muted-foreground font-medium text-sm bg-muted px-3 py-1 rounded-full border border-border'>
                        <XCircle size={16} />
                        Non connecté
                    </div>
                )
            )}
            {loading && <Skeleton className='h-7 w-24 rounded-full' />}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-between p-4 border rounded-lg bg-muted/5'>
                <div className='flex items-center gap-3'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <div className='space-y-2'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-3 w-24' />
                    </div>
                </div>
                <Skeleton className='h-8 w-24' />
            </div>
          ) : githubUser ? (
            <div className='flex items-center justify-between p-4 border rounded-lg bg-muted/5 animate-in fade-in duration-500'>
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
            <div className='flex flex-col items-center justify-center py-6 text-center animate-in fade-in duration-500'>
               <p className='text-sm text-muted-foreground mb-4'>
                 Liez votre compte GitHub pour importer vos projets en un clic.
               </p>
               <Button onClick={handleConnect} className='gap-2'>
                 <GithubLogo className='h-4 w-4' />
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
