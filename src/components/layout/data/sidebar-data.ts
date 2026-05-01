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
  CloudDownload,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FolderGitIcon,
  Database,
  CreditCard,
} from 'lucide-react'
import { Logo } from '@/assets/logo'
import { type SidebarData } from '../types'

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
      plan: 'Déployer sur votre VPS',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
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
        {
          title: 'Sauvegardes',
          url: '/backups',
          icon: CloudDownload,
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
              icon: CreditCard,
            },
            {
              title: 'Sauvegardes',
              url: '/settings/backups',
              icon: CloudDownload,
            },
          ],
        },
      ],
    },
  ],
}
