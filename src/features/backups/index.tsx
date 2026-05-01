import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  CloudDownload, 
  Search as SearchIcon, 
  Download, 
  RotateCcw, 
  Trash2, 
  HardDrive,
  Database,
  AlertCircle,
  Plus,
  RefreshCw,
  Loader,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch, getApiUrl } from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { echo } from '@/lib/echo'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'

interface GlobalBackup {
  id: number
  name: string
  type: string
  status: string
  size: number
  created_at: string
  notes: string | null
  application?: {
    id: number
    name: string
  }
  server?: {
    id: number
    name: string
  }
}

interface Application {
  id: number
  name: string
  server: {
    id: number
    name: string
  }
  databases: any[]
  persistent_volumes: any[]
}

export function Backups() {
  const user = useAuthStore(state => state.auth.user)
  const [backups, setBackups] = useState<GlobalBackup[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [serverFilter, setServerFilter] = useState('all')
  const [appFilter, setAppFilter] = useState('all')
  const [confirmRestore, setConfirmRestore] = useState<GlobalBackup | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Create Backup Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [apps, setApps] = useState<Application[]>([])
  const [selectedAppId, setSelectedAppId] = useState<string>('')
  const [backupType, setBackupType] = useState<'database' | 'volume'>('database')
  const [resourceId, setResourceId] = useState<string>('')

  const fetchBackups = async (page = 1) => {
    try {
      setLoading(true)
      const res = await apiFetch<any>(`/backups?page=${page}`)
      setBackups(res.data)
      setCurrentPage(res.current_page)
      setLastPage(res.last_page)
    } catch (error) {
      toast.error('Erreur lors du chargement des sauvegardes')
    } finally {
      setLoading(false)
    }
  }

  const fetchApps = async () => {
    try {
      const data = await apiFetch<Application[]>('/applications')
      setApps(data)
    } catch (error) {
      console.error('Failed to fetch apps', error)
    }
  }

  useEffect(() => {
    fetchBackups(currentPage)
    fetchApps()
    
    // Scroll to top when page changes
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (user?.id) {
        const channel = echo.private(`user.${user.id}`)
            .listen('.BackupUpdatedEvent', (e: { backup: GlobalBackup }) => {
                setBackups(prev => {
                    const existing = prev.find(b => b.id === e.backup.id)
                    const wasRestoring = existing?.status === 'restoring'

                    // Notifications
                    if (e.backup.status === 'success' && existing && existing.status !== 'success') {
                        if (wasRestoring) {
                            toast.success(`Restauration réussie : ${e.backup.name}`)
                        } else {
                            toast.success(`Sauvegarde terminée : ${e.backup.name}`)
                        }
                    }
                    if (e.backup.status === 'failed' && existing && existing.status !== 'failed') {
                        toast.error(`Échec : ${e.backup.name}`)
                    }

                    if (existing) {
                        const newBackups = [...prev]
                        const index = prev.findIndex(b => b.id === e.backup.id)
                        newBackups[index] = e.backup
                        return newBackups
                    }

                    if (currentPage === 1) {
                        return [e.backup, ...prev].slice(0, 10)
                    }
                    return prev
                })
            })

        return () => {
            echo.leaveChannel(`user.${user.id}`)
        }
    }
  }, [user?.id, currentPage])

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  const handleDelete = async (id: number) => {
    try {
      setActionLoading(true)
      setDeletingId(id)
      const backup = backups.find(b => b.id === id)
      if (!backup) return

      await apiFetch(`/applications/${backup.application?.id}/backups/${id}`, { method: 'DELETE' })
      setBackups(prev => prev.filter(b => b.id !== id))
      toast.success('Sauvegarde supprimée avec succès')
      setDeleteId(null)
    } catch {
      toast.error('Échec de la suppression')
    } finally {
      setActionLoading(false)
      setDeletingId(null)
    }
  }

  const handleDownload = async (backup: GlobalBackup) => {
    try {
      setDownloadingId(backup.id)
      setActionLoading(true)
      const token = localStorage.getItem('vpsly_auth_token')
      const res = await fetch(`${getApiUrl()}/applications/${backup.application?.id}/backups/${backup.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      })

      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.body.appendChild(document.createElement('a'))
      a.href = url
      a.download = backup.name
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      
      toast.success('Téléchargement lancé')
    } catch (error) {
      toast.error('Erreur de téléchargement')
    } finally {
      setDownloadingId(null)
      setActionLoading(false)
    }
  }

  const handleRestore = async (backup: GlobalBackup) => {
    try {
      setRestoringId(backup.id)
      setActionLoading(true)
      await apiFetch(`/applications/${backup.application?.id}/backups/${backup.id}/restore`, {
        method: 'POST'
      })
      
      toast.info('Restauration lancée', {
        description: 'L\'application est en cours de rollback.'
      })
    } catch (error) {
      toast.error('Échec du lancement de la restauration')
    } finally {
      setRestoringId(null)
      setActionLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    if (!selectedAppId || !resourceId) {
        toast.error('Veuillez sélectionner une application et une ressource')
        return
    }

    try {
        setActionLoading(true)
        const payload = backupType === 'database' 
            ? { database_id: parseInt(resourceId) }
            : { volume_id: parseInt(resourceId) }

        const pendingBackup = await apiFetch(`/applications/${selectedAppId}/backups`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        setBackups(prev => [pendingBackup, ...prev])
        setShowCreateModal(false)
        toast.info('Sauvegarde mise en file d\'attente')
        
        // Reset modal state
        setSelectedAppId('')
        setResourceId('')
    } catch (error) {
        toast.error('Échec du lancement de la sauvegarde')
    } finally {
        setActionLoading(false)
    }
  }

  const filteredBackups = backups.filter(bkp => {
    const matchesSearch = bkp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bkp.application?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesServer = serverFilter === 'all' || bkp.server?.name === serverFilter
    const matchesApp = appFilter === 'all' || bkp.application?.name === appFilter
    return matchesSearch && matchesServer && matchesApp
  })

  const statusPill = (status: string) => {
    const map: Record<string, string> = {
      success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      restoring: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    }
    const labels: Record<string, string> = { 
        success: 'succès', 
        failed: 'échec', 
        pending: 'en cours',
        restoring: 'restauration'
    }
    const Icon = status === 'success' ? CheckCircle2 : status === 'failed' ? XCircle : Loader
    
    return (
      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1", map[status] || map.pending)}>
        <Icon size={10} className={cn(status === 'pending' || status === 'restoring' ? "animate-spin" : "")} />
        {labels[status] || status}
      </span>
    )
  }

  const selectedApp = useMemo(() => apps.find(a => a.id.toString() === selectedAppId), [apps, selectedAppId])

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
            <CloudDownload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sauvegardes</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <NotificationBell />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed className='overflow-hidden'>
        <div className="flex flex-col gap-3 py-3 animate-in fade-in duration-500 h-full">
          
          {/* HEADER SECTION */}
          <div className='flex items-center justify-between flex-none'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Voir et créer des sauvegardes</h1>
             
            </div>
            <div className='flex items-center gap-2'>
               <Button variant="outline" size="sm" onClick={() => fetchBackups()} disabled={loading} className="h-8 text-xs">
                 <RefreshCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
                 Actualiser
               </Button>
               <Button 
                 size="sm" 
                 onClick={() => setShowCreateModal(true)}
                 className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
               >
                 <Plus className='mr-1.5 h-3.5 w-3.5' />
                 <span>Nouvelle sauvegarde</span>
               </Button>
            </div>
          </div>

          {/* FILTERS AREA */}
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center flex-none'>
            <div className="relative flex-1 max-w-[400px]">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder='Rechercher un fichier ou une app...'
                    className='h-9 pl-9 bg-card/50 border-border focus:ring-indigo-500/20'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={appFilter} onValueChange={setAppFilter}>
              <SelectTrigger className='h-9 w-full sm:w-48 bg-card/50 border-border'>
                <SelectValue placeholder="Filtrer par application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les applications</SelectItem>
                {[...new Set(backups.map(b => b.application?.name).filter(Boolean))].map(app => (
                    <SelectItem key={app} value={app!}>{app}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={serverFilter} onValueChange={setServerFilter}>
              <SelectTrigger className='h-9 w-full sm:w-48 bg-card/50 border-border'>
                <SelectValue placeholder="Filtrer par serveur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les serveurs</SelectItem>
                {[...new Set(backups.map(b => b.server?.name).filter(Boolean))].map(srv => (
                    <SelectItem key={srv} value={srv!}>{srv}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DATATABLE STYLE REPLACED BY PREMIUM LIST */}
          <Card className='flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-card/30 flex flex-col shadow-sm backdrop-blur-sm'>
            <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between flex-none">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Archives de sauvegarde</span>
              <span className="text-[10px] text-muted-foreground/40 font-mono tracking-tighter">{filteredBackups.length} OBJETS</span>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto divide-y divide-border/40 custom-scrollbar"
            >
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-4">
                            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-1/4 opacity-50" />
                            </div>
                        </div>
                    ))
                ) : filteredBackups.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/5">
                            <CloudDownload size={40} className="text-indigo-500/40" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-white/80 mb-2">Aucune sauvegarde trouvée</h3>
                        <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed mb-8">
                            {searchTerm || serverFilter !== 'all' || appFilter !== 'all' 
                                ? "Aucun archive ne correspond à vos filtres actuels. Essayez d'ajuster vos critères." 
                                : "Votre historique est vide. Commencez par créer une sauvegarde pour sécuriser vos applications."}
                        </p>
                        {!searchTerm && serverFilter === 'all' && appFilter === 'all' && (
                            <Button 
                                onClick={() => setShowCreateModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Créer ma première sauvegarde
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredBackups.map((bkp) => (
                        <div key={bkp.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] group transition-all duration-200">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg",
                                    bkp.status === 'success' 
                                        ? (bkp.type === 'volume' ? "bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:shadow-blue-500/10" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover:shadow-indigo-500/10") 
                                        : bkp.status === 'failed' ? "bg-red-500/10 border-red-500/20 text-red-400 group-hover:shadow-red-500/10" : "bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:shadow-amber-500/10"
                                )}>
                                    {bkp.status === 'pending' ? <Loader className="h-5 w-5 animate-spin" /> :
                                     bkp.status === 'restoring' ? <RotateCcw className="h-5 w-5 animate-spin text-orange-400" /> :
                                     bkp.status === 'failed' ? <AlertCircle className="h-5 w-5" /> :
                                     bkp.type === 'volume' ? <HardDrive className="h-5 w-5" /> :
                                     <Database className="h-5 w-5" />}
                                </div>
                                
                                <div className="min-w-0 flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-mono font-medium truncate max-w-[400px] text-foreground/90 group-hover:text-foreground transition-colors">{bkp.name}</p>
                                        {statusPill(bkp.status)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                                        <Link 
                                            to='/apps/$appId' 
                                            params={{ appId: bkp.application?.id?.toString() || '0' }}
                                            className="text-indigo-400/80 hover:text-indigo-400 hover:underline font-medium transition-colors"
                                        >
                                            {bkp.application?.name}
                                        </Link>
                                        <span className="opacity-20">·</span>
                                        <span className="flex items-center gap-1"><HardDrive size={10} className="opacity-50" /> {bkp.server?.name}</span>
                                        <span className="opacity-20">·</span>
                                        <span className="font-mono">{formatSize(bkp.size)}</span>
                                        <span className="opacity-20">·</span>
                                        <span className="opacity-50 tracking-tighter uppercase">{format(new Date(bkp.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                {bkp.status === 'success' && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDownload(bkp)}
                                            disabled={actionLoading}
                                            className="h-8 w-8 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                            title="Télécharger"
                                        >
                                            {downloadingId === bkp.id ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setConfirmRestore(bkp)}
                                            disabled={actionLoading}
                                            className="h-8 w-8 text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                                            title="Restaurer"
                                        >
                                            {restoringId === bkp.id ? <Loader className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(bkp.id)}
                                    disabled={actionLoading}
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    {deletingId === bkp.id ? <Loader className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* PAGINATION FOOTER */}
            {backups.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border bg-muted/10 flex items-center justify-between flex-none mt-auto">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                        Page {currentPage} sur {lastPage}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="h-7 px-2 text-[10px] bg-muted/50 border-border hover:bg-muted disabled:opacity-30"
                        >
                            <ChevronLeft size={14} className="mr-1" /> Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === lastPage || loading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="h-7 px-2 text-[10px] bg-muted/50 border-border hover:bg-muted disabled:opacity-30"
                        >
                            Suivant <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </div>
            )}
          </Card>

        </div>
      </Main>

      {/* CREATE BACKUP DIALOG */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Plus className="text-indigo-500" />
                    Nouvelle sauvegarde
                </DialogTitle>
                <DialogDescription>
                    Sélectionnez l'application et la ressource à sauvegarder.
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Application</label>
                    <Select value={selectedAppId} onValueChange={(val) => {
                        setSelectedAppId(val)
                        setResourceId('')
                    }}>
                        <SelectTrigger className="w-full bg-muted/50 border-border h-10">
                            <SelectValue placeholder="Choisir une application..." />
                        </SelectTrigger>
                        <SelectContent>
                            {apps.map(app => (
                                <SelectItem key={app.id} value={app.id.toString()}>
                                    {app.name} ({app.server.name})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedApp && (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type de ressource</label>
                            <div className="flex gap-2">
                                <Button 
                                    variant={backupType === 'database' ? 'default' : 'outline'}
                                    className={cn("flex-1 h-10 gap-2", backupType === 'database' && "bg-indigo-600 hover:bg-indigo-700")}
                                    onClick={() => { setBackupType('database'); setResourceId(''); }}
                                >
                                    <Database size={16} /> Database
                                </Button>
                                <Button 
                                    variant={backupType === 'volume' ? 'default' : 'outline'}
                                    className={cn("flex-1 h-10 gap-2", backupType === 'volume' && "bg-blue-600 hover:bg-blue-700")}
                                    onClick={() => { setBackupType('volume'); setResourceId(''); }}
                                >
                                    <HardDrive size={16} /> Fichiers
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {backupType === 'database' ? 'Base de données' : 'Volume de fichiers'}
                            </label>
                            <Select value={resourceId} onValueChange={setResourceId}>
                                <SelectTrigger className="w-full bg-muted/50 border-border h-10">
                                    <SelectValue placeholder={`Sélectionner ${backupType === 'database' ? 'la DB' : 'le volume'}...`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {backupType === 'database' ? (
                                        selectedApp.databases?.length > 0 ? (
                                            selectedApp.databases.map(db => (
                                                <SelectItem key={db.id} value={db.id.toString()}>{db.name}</SelectItem>
                                            ))
                                        ) : <SelectItem value="none" disabled>Aucune DB trouvée</SelectItem>
                                    ) : (
                                        selectedApp.persistent_volumes?.length > 0 ? (
                                            selectedApp.persistent_volumes.map(vol => (
                                                <SelectItem key={vol.id} value={vol.id.toString()}>{vol.name} ({vol.mount_path})</SelectItem>
                                            ))
                                        ) : <SelectItem value="none" disabled>Aucun volume trouvé</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}
            </div>

            <DialogFooter>
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                <Button 
                    disabled={!resourceId || actionLoading} 
                    onClick={handleCreateBackup}
                    className="bg-indigo-600 hover:bg-indigo-700 gap-2 min-w-[140px]"
                >
                    {actionLoading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                    Lancer la sauvegarde
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RESTORE DIALOG */}
      <AlertDialog open={!!confirmRestore} onOpenChange={(open) => !open && setConfirmRestore(null)}>
        <AlertDialogContent className="border-orange-500/20 bg-orange-950/10 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-500 flex items-center gap-2 text-xl">
                <RotateCcw size={24} className="animate-spin-slow" />
                Restauration Critique
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p className="text-white/80 leading-relaxed">
                Vous êtes sur le point de restaurer l'archive <strong className="text-white">{confirmRestore?.name}</strong>. 
                L'application <strong className="text-white underline decoration-indigo-500">{confirmRestore?.application?.name}</strong> sera réinitialisée à cet état précis.
              </p>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-orange-200 text-sm flex gap-3 shadow-inner">
                <AlertCircle size={20} className="shrink-0 text-orange-500" />
                <p>
                    <strong>Action irréversible :</strong> Les données actuelles de production seront remplacées. Assurez-vous que l'activité utilisateur est suspendue si nécessaire.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-muted border-border hover:bg-muted/80">Annuler</AlertDialogCancel>
            <AlertDialogAction 
                className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 font-bold"
                onClick={() => {
                    if (confirmRestore) {
                        handleRestore(confirmRestore);
                        setConfirmRestore(null);
                    }
                }}
            >
                Confirmer le Rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
                <Trash2 size={20} />
                Suppression Définitive
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera physiquement le fichier de sauvegarde de <strong>Google Drive</strong> et du serveur. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault();
                    if (deleteId) handleDelete(deleteId);
                }} 
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 min-w-[120px]"
            >
                {actionLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Supprimer l'archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}



