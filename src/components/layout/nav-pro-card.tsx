import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'

import { useAuthStore } from '@/stores/auth-store'

export function NavProCard() {
  const { state } = useSidebar()
  const { user } = useAuthStore((state) => state.auth)
  const isCollapsed = state === 'collapsed'
  const plan = user?.current_team?.plan || 'starter'

  if (isCollapsed || plan !== 'starter') return null

  return (
    <SidebarMenu className='px-2 py-2'>
      <SidebarMenuItem>
        <div className='relative overflow-hidden rounded-lg border bg-card p-3 shadow-sm'>
          {/* Subtle background glow */}
          <div className='absolute -right-4 -top-4 h-12 w-12 bg-primary/5 blur-xl' />
          
          <div className='relative space-y-2.5'>
            <div className='flex items-center gap-1.5 text-primary'>
              <Sparkles size={13} />
              <span className='text-[10px] font-bold uppercase tracking-widest opacity-80'>Starter</span>
            </div>
            
            <div className='space-y-0.5'>
              {/* <p className='text-xs font-bold leading-tight'>Passez à VPSly PRO</p> */}
              <p className='text-[10px] leading-tight text-muted-foreground'>
               Base de données et sauvegardes
              </p>
            </div>

            <Button 
                asChild
                size='sm' 
                className='h-7 w-full rounded-md bg-primary text-[13px]  font-bold'
            >
              <Link to='/pricing'>Passez à PRO</Link>
            </Button>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
