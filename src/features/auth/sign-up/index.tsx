import { Link } from '@tanstack/react-router'
import { Logo } from '@/assets/logo'
import { cn } from '@/lib/utils'
import dashboardDark from '../sign-in/assets/dashboard-dark.png'
import dashboardLight from '../sign-in/assets/dashboard-light.png'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
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
            <h2 className='text-lg font-semibold tracking-tight'>Créer un compte</h2>
            <p className='text-sm text-muted-foreground'>
              Entrez vos informations ci-dessous pour créer votre compte. <br />
              Vous avez déjà un compte ?{' '}
              <Link
                to='/sign-in'
                className='underline underline-offset-4 hover:text-primary'
              >
                Se connecter
              </Link>
            </p>
          </div>
          <SignUpForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            En créant un compte, vous acceptez nos{' '}
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
