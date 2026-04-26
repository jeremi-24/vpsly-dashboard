import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/context/theme-provider'

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast !rounded-md !border !px-4 !py-3 !shadow-none !gap-3',
          title: '!text-sm !font-medium',
          description: '!text-xs !opacity-70',
          actionButton: '!rounded-md !text-xs !font-medium',
          cancelButton: '!rounded-md !text-xs',
          success:
            '!bg-green-50 !border-green-200 !text-green-900 dark:!bg-green-950 dark:!border-green-800 dark:!text-green-100',
          error:
            '!bg-red-50 !border-red-200 !text-red-900 dark:!bg-red-950 dark:!border-red-800 dark:!text-red-100',
          info:
            '!bg-amber-50 !border-amber-200 !text-amber-900 dark:!bg-amber-950 dark:!border-amber-800 dark:!text-amber-100',
          warning:
            '!bg-amber-50 !border-amber-200 !text-amber-900 dark:!bg-amber-950 dark:!border-amber-800 dark:!text-amber-100',
        },
      }}
      icons={{
        success: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-green-500 text-white text-xs">
            ✓
          </span>
        ),
        error: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500 text-white text-xs">
            !
          </span>
        ),
        info: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500 text-white text-xs">
            i
          </span>
        ),
        warning: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500 text-white text-xs">
            ▲
          </span>
        ),
      }}
      {...props}
    />
  )
}