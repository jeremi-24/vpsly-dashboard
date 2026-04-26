import { Link, useSearch } from '@tanstack/react-router'
import { Logo } from '@/assets/logo'
import { cn } from '@/lib/utils'
import dashboardDark from './assets/dashboard-dark.png'
import dashboardLight from './assets/dashboard-light.png'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn2() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo className='me-2' />
            <h1 className='text-3xl font-bold text-primary tracking-tighter'>VPSLY</h1>
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>Connexion</h2>
            <p className='text-sm text-muted-foreground'>
              Entrez votre email et mot de passe pour accéder à{" "}
              <br className='max-sm:hidden' /> votre compte. Pas encore de compte ?{" "}
              <Link
                to='/sign-up'
                className='text-nowrap underline underline-offset-4 hover:text-primary'
              >
                S'inscrire
              </Link>
            </p>
          </div>
          <UserAuthForm redirectTo={redirect} />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            En cliquant sur connexion, vous acceptez nos{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Conditions d'Utilisation
            </a>{' '}
            et notre{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Politique de Confidentialité
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className={cn(
          'relative h-full overflow-hidden bg-muted max-lg:hidden',
          '[&>img]:absolute [&>img]:top-[15%] [&>img]:left-20 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none'
        )}
      >
        <img
          src={dashboardLight}
          className='dark:hidden'
          width={1024}
          height={1151}
          alt='VPSLY Dashboard'
        />
        <img
          src={dashboardDark}
          className='hidden dark:block'
          width={1024}
          height={1138}
          alt='VPSLY Dashboard'
        />
      </div>
    </div>
  )
}
