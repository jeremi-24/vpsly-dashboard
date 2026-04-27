import { cn } from '@/lib/utils'
import logoLight from './logo/logo_white_bg.png'
import logoDark from './logo/logo_black_bg.png'

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  variant?: 'light' | 'dark' | 'auto'
}

export function Logo({ className, variant = 'auto', ...props }: LogoProps) {
  const isDark = variant === 'dark'
  const isLight = variant === 'light'

  return (
    <>
      <img
        src={logoLight}
        alt='VPSly Logo'
        className={cn(
          'size-8 object-contain',
          variant === 'auto' ? 'dark:hidden' : (isDark ? 'hidden' : 'block'),
          className
        )}
        {...props}
      />
      <img
        src={logoDark}
        alt='VPSly Logo'
        className={cn(
          'size-8 object-contain',
          variant === 'auto' ? 'hidden dark:block' : (isLight ? 'hidden' : 'block'),
          className
        )}
        {...props}
      />
    </>
  )
}
