import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { getPlanById } from '@/config/plans'
import { AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { setUser } = useAuthStore(state => state.auth)

  useEffect(() => {
    const syncUser = async () => {
      try {
        const user = await apiFetch<any>('/user')
        setUser(user)
      } catch (e) {
        console.error('Failed to sync user', e)
      }
    }
    syncUser()
  }, [])

  const { user } = useAuthStore(state => state.auth)
  const currentTeam = user?.current_team
  const plan = currentTeam ? getPlanById(currentTeam.plan) : null
  
  const isOverQuota = plan && currentTeam && (
    (plan.maxApps !== -1 && (currentTeam.applications_count || 0) > plan.maxApps) ||
    (plan.maxServers !== -1 && (currentTeam.servers_count || 0) > plan.maxServers)
  )

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              '@container/content',
              'flex flex-col',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {isOverQuota && (
              <div className='flex-none bg-red-600 px-4 py-2 text-white flex items-center justify-between gap-4 z-50'>
                <div className='flex items-center gap-3'>
                  <AlertTriangle size={18} className='shrink-0' />
                  <p className='text-xs font-bold'>
                    Attention : Quotas dépassés ({plan?.name}). 
                    Libérez des ressources ou passez au plan supérieur.
                  </p>
                </div>
                <Button size='sm' variant='secondary' className='h-7 rounded-lg text-[10px] font-bold shrink-0' asChild>
                  <Link to='/pricing'>Upgrader</Link>
                </Button>
              </div>
            )}
            <div className='flex-1 overflow-y-auto min-h-0'>
              {children ?? <Outlet />}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
