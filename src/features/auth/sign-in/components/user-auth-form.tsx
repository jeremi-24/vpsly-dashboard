import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
import { sleep, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide.'),
  password: z
    .string()
    .min(1, 'Veuillez entrer votre mot de passe.')
    .min(7, 'Le mot de passe doit contenir au moins 7 caractères.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      // Set user and access token
      auth.setUser(response.user)
      auth.setAccessToken(response.access_token)

      toast.success(`Bon retour, ${response.user.name} !`)

      // Redirect to the stored location or default to dashboard
      const targetPath = redirectTo || '/dashboard'
      navigate({ to: targetPath, replace: true })
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Identifiants incorrects.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='nom@exemple.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Mot de passe oublié ?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader className='animate-spin' /> : <LogIn />}
          Se connecter
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Ou continuer avec
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          {/* <Button
            variant='outline'
            type='button'
            disabled={isLoading}
            onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/github`}
          >
            <IconGithub className='h-4 w-4' /> GitHub
          </Button> */}
          <Button
            variant='outline'
            type='button'
            disabled={isLoading}
            onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`}
          >
            {/* Google Icon can be imported or used from a library, keeping it simple for now */}
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className='h-4 w-4 fill-current'>
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.47-1.92 4.64-1.2 1.2-3.08 2.5-6.64 2.5-6.39 0-11.39-4.82-11.39-11.22s5-11.22 11.39-11.22c3.81 0 6.64 1.44 8.74 3.39l2.45-2.45C20.44 1.44 16.92 0 12.48 0 5.61 0 0 5.61 0 12.48s5.61 12.48 12.48 12.48c3.75 0 6.6-1.23 9.12-3.78 2.61-2.61 3.45-6.27 3.45-9.15 0-.87-.06-1.71-.21-2.49h-12.36z" />
            </svg> Google
          </Button>
        </div>
      </form>
    </Form>
  )
}
