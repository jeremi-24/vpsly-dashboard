import { Outlet } from '@tanstack/react-router'
import { Monitor, Wrench, UserCog, FolderGitIcon, CloudDownload, Users } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Mon Compte',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },


  {
    title: 'Intégrations',
    href: '/settings/integrations',
    icon: <FolderGitIcon size={18} />,
  },
  {
    title: 'Sauvegardes',
    href: '/settings/backups',
    icon: <CloudDownload size={18} />,
  },
  {
    title: 'Mon Équipe',
    href: '/settings/team',
    icon: <Users size={18} />,
  },
]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Paramètres
          </h1>
          <p className='text-muted-foreground'>
            Gérez les paramètres de votre compte et vos préférences.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12 h-[calc(100vh-180px)]'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-auto p-1 pr-4 custom-scrollbar'>
            <div className='w-full'>
              <Outlet />
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
