import { useEffect, useState } from 'react'
import { Bell, Check, Trash2, Info, AlertTriangle, XCircle, CheckCircle2, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api'
import { echo } from '@/lib/echo'
import { useAuthStore } from '@/stores/auth-store'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { NotificationHistoryDrawer } from './notification-history-drawer'

interface Notification {
  id: string
  data: {
    title: string
    message: string
    level: 'success' | 'info' | 'warning' | 'error'
    icon: string
    action_url?: string
  }
  read_at: string | null
  created_at: string
}

export function NotificationBell() {
  const user = useAuthStore(state => state.auth.user)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/notifications')
      setNotifications(data.data)
      const countRes = await apiFetch('/notifications/unread-count')
      setUnreadCount(countRes.count)
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    // Listen for real-time notifications
    const channel = echo.private(`App.Models.User.${user.id}`)
      .notification((notification: any) => {
        // Normalisation : On s'assure que le format match celui de la DB (avec .data)
        const normalizedNotification: Notification = {
          id: notification.id || Math.random().toString(36).substr(2, 9),
          data: {
            title: notification.title,
            message: notification.message,
            level: notification.level || 'info',
            icon: notification.icon || 'bell',
            action_url: notification.action_url
          },
          read_at: null,
          created_at: notification.created_at || new Date().toISOString()
        }

        setNotifications(prev => [normalizedNotification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Optionnel : Un toast pour le feedback immédiat
        toast(notification.title, {
          description: notification.message,
        })
      })

    return () => {
      echo.leave(`App.Models.User.${user.id}`)
    }
  }, [user])

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/mark-as-read`, { method: 'POST' })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Erreur lors du marquage')
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-as-read', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
      setUnreadCount(0)
      toast.success('Tout a été marqué comme lu')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
      // Update count if it was unread
      const deleted = notifications.find(n => n.id === id)
      if (deleted && !deleted.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
            <Bell className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                <Check className="mr-1 h-3 w-3" />
                Tout lire
              </Button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative flex items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/50",
                      !notification.read_at && "bg-blue-500/5"
                    )}
                  >
                    <div className="mt-1 shrink-0">
                      {getLevelIcon(notification.data.level)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className={cn("text-xs font-semibold leading-none", !notification.read_at && "text-blue-600 dark:text-blue-400")}>
                        {notification.data.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {notification.data.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="rounded p-1 hover:bg-blue-500/10 text-blue-500"
                          title="Marquer comme lu"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="rounded p-1 hover:bg-red-500/10 text-red-400"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <div className="mb-3 rounded-full bg-muted p-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium">Aucune notification</p>
                <p className="text-[11px] text-muted-foreground">Tout est sous contrôle !</p>
              </div>
            )}
          </div>
          <div className="border-t p-2 text-center">
            <Button 
              variant="ghost" 
              className="w-full h-8 text-[11px] text-muted-foreground"
              onClick={() => setHistoryOpen(true)}
            >
              Voir tout l'historique
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <NotificationHistoryDrawer 
        open={historyOpen} 
        onOpenChange={setHistoryOpen} 
      />
    </>
  )
}
