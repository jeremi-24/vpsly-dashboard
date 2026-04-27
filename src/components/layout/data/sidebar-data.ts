import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  Server,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FolderGitIcon,
  Database,
  Crown,
} from 'lucide-react'
import { Logo } from '@/assets/logo'

export const sidebarData: SidebarData = {
  user: {
    name: '',
    email: '',
    avatar: '',
  },
  teams: [
    {
      name: 'VPSly',
      logo: Logo,
      plan: 'VPS simplified',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Applications',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Serveurs',
          url: '/servers',
          icon: Server,
        },
        {
          title: 'Bases de données',
          url: '/databases',
          icon: Database,
        },
      ],
    },
    {
      title: 'Autre',
      items: [
        {
          title: 'Paramètres',
          icon: Settings,
          items: [
            {
              title: 'Mon Compte',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Intégrations',
              url: '/settings/integrations',
              icon: FolderGitIcon,
            },
            {
              title: 'Facturation',
              url: '/settings/billing',
              icon: Crown,
            },
          ],
        },
        {
          title: "Centre d'aide",
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
