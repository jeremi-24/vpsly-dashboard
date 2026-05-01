import { useEffect, useState, useRef } from 'react'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/invitations/$token')({
  component: InvitationPage,
})

function InvitationPage() {
  const { token } = useParams({ from: '/_authenticated/invitations/$token' })
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [teamName, setTeamName] = useState('')

  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const acceptInvitation = async () => {
      try {
        const res = await apiFetch<any>(`/teams/invitations/${token}/accept`, { method: 'POST' })
        setTeamName(res.team.name)
        setStatus('success')
        toast.success(`Vous avez rejoint l'équipe ${res.team.name}`)
      } catch (error) {
        setStatus('error')
        toast.error('Invitation invalide ou expirée')
      }
    }
    acceptInvitation()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-2xl border-indigo-500/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />}
            {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {status === 'loading' && "Traitement de l'invitation..."}
            {status === 'success' && "Félicitations !"}
            {status === 'error' && "Oups !"}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && "Nous vérifions vos accès."}
            {status === 'success' && `Vous faites maintenant partie de l'équipe ${teamName}.`}
            {status === 'error' && "Ce lien d'invitation est invalide, a déjà été utilisé ou a expiré."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {status === 'success' && "Vous allez être redirigé vers votre nouveau dashboard."}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status !== 'loading' && (
            <Button 
                onClick={() => window.location.href = '/'}
                className={status === 'success' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
                Accéder au Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
