import { useState, useEffect } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function Dashboard() {
  const { auth } = useAuthStore()
  const user = auth.user
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const result = await apiFetch('/dashboard')
      setData(result)
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const EmptyState = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-full border border-dashed border-border/60 rounded-xl bg-muted/5 p-8 opacity-40">
       <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
       <span className="text-[9px] mt-1 italic">Prochainement disponible</span>
    </div>
  )

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
           <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
           <span className="text-[11px] font-bold uppercase tracking-widest opacity-70">Infrastructure</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className="flex flex-col h-full gap-6 py-4">
          
          {/* SECTION 1: HAUT */}
          <div className="h-[120px] flex flex-col">
             <EmptyState title="Indicateurs de santé" />
          </div>

          {/* SECTION 2: MILIEU */}
          <div className="h-[250px] flex flex-col">
             <EmptyState title="Activité & Déploiements" />
          </div>

          {/* SECTION 3: BAS */}
          <div className="flex-1 flex flex-col">
             <EmptyState title="Serveurs & Ressources" />
          </div>

        </div>
      </Main>
    </>
  )
}
