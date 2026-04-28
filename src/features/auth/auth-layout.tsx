import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center bg-background'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:p-8'>
        <div className='mb-6 flex flex-col items-center justify-center gap-2'>
          <Logo className='size-12' />
          <h1 className='text-4xl font-bebas tracking-wider text-primary'>VPSLY</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
