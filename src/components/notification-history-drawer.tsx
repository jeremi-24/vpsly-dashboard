import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { apiFetch } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, CheckCircle2, AlertCircle, Info, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Notification {
  id: string
  data: {
    title: string
    message: string
    level: string
    icon: string
    action_url?: string
  }
  read_at: string | null
  created_at: string
}

interface NotificationHistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationHistoryDrawer({ open, onOpenChange }: NotificationHistoryDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/notifications')
      
      const data = response.data || response
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch history', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchHistory()
    }
  }, [open])

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/mark-as-read`, { method: 'POST' })
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      )
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Failed to delete notification', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-as-read', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    } catch (error) {
      console.error('Failed to mark all as read', error)
    }
  }

  const getIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md border-l-2 border-black dark:border-white p-0 flex flex-col">
        <SheetHeader className="p-6 border-b-2 border-black dark:border-white bg-secondary/30">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-bebas text-3xl tracking-wider">Historique</SheetTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              className="border-2 border-black dark:border-white font-bebas tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Tout lire
            </Button>
          </div>
          <SheetDescription className="font-manrope">
            Consultez toutes vos notifications système passées.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {loading && notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-black dark:border-white border-t-transparent rounded-full mx-auto mb-4" />
                <p className="font-manrope text-sm text-muted-foreground uppercase tracking-widest">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center opacity-50">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-manrope text-sm uppercase tracking-widest">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 transition-colors group relative",
                    !notification.read_at ? "bg-secondary/20" : "bg-transparent"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">
                      {getIcon(notification.data.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "font-manrope text-sm font-bold leading-none mb-1",
                          !notification.read_at && "text-blue-600 dark:text-blue-400"
                        )}>
                          {notification.data.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <p className="font-manrope text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.data.message}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read_at && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
