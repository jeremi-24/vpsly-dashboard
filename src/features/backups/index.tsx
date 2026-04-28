import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  ShieldCheck, 
  Search, 
  MoreVertical, 
  Download, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  HardDrive,
  FileCode,
  AlertCircle,
  Plus,
  RefreshCw,
  Loader
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface GlobalBackup {
  id: number
  name: string
  type: string
  status: string
  size: number
  created_at: string
  application?: {
    id: number
    name: string
  }
  server?: {
    id: number
    name: string
  }
  location?: string // Chemin sur le VPS
}

export function Backups() {
  const [backups, setBackups] = useState<GlobalBackup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [serverFilter, setServerFilter] = useState('all')

  const fetchBackups = async () => {
    try {
      setLoading(true)
      // Note: On suppose l'existence d'un endpoint global /backups
      // Si non disponible, on pourra adapter pour boucler sur les serveurs
      const data = await apiFetch<GlobalBackup[]>('/backups')
      setBackups(data)
    } catch (error) {
      // Pour le moment on garde les mocks si l'API n'est pas encore prête
      console.warn('Global /backups endpoint not found, using mocks.')
      setBackups(MOCK_FALLBACK)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
  }

  const handleDelete = async (backup: GlobalBackup) => {
    if (!confirm('Supprimer définitivement ce fichier ?')) return
    try {
        await apiFetch(`/applications/${backup.application?.id}/backups/${backup.id}`, { method: 'DELETE' })
        setBackups(prev => prev.filter(b => b.id !== backup.id))
        toast.success('Sauvegarde supprimée')
    } catch {
        toast.error('Échec de la suppression')
    }
  }

  const handleDownload = async (backup: GlobalBackup) => {
    try {
      const token = localStorage.getItem('vpsly_auth_token')
      const res = await fetch(`${getApiUrl()}/applications/${backup.application?.id}/backups/${backup.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.body.appendChild(document.createElement('a'))
      a.href = url; a.download = backup.name; a.click()
      window.URL.revokeObjectURL(url); a.remove()
    } catch {
      toast.error('Erreur de téléchargement')
    }
  }

  const filteredBackups = backups.filter(bkp => {
    const matchesSearch = bkp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bkp.application?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesServer = serverFilter === 'all' || bkp.server?.name === serverFilter
    return matchesSearch && matchesServer
  })

  return (
    <>
      <Header />

      <Main fixed>
        <div className="flex flex-col gap-6 py-4 animate-in fade-in duration-500">
          
          {/* HEADER SECTION */}
          <div className='flex items-center justify-between mb-2'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Sauvegardes</h1>
              <p className='text-muted-foreground'>
                Historique global de la résilience de vos infrastructures.
              </p>
            </div>
            <div className='flex items-center gap-2'>
               <Button variant="outline" size="sm" onClick={fetchBackups} disabled={loading}>
                 <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                 Actualiser
               </Button>
               <Button size="sm">
                 <Plus className='mr-2 h-4 w-4' />
                 <span>Nouvelle sauvegarde</span>
               </Button>
            </div>
          </div>

          {/* FILTERS AREA */}
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder='Rechercher un fichier ou une app...'
                    className='h-9 pl-9'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={serverFilter} onValueChange={setServerFilter}>
              <SelectTrigger className='h-9 w-full sm:w-48'>
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

          <Separator className='shadow-sm' />

          {/* DATATABLE */}
          <Card className='overflow-hidden rounded-lg border shadow-sm'>
            <Table>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead className='h-10 text-[11px] font-medium uppercase tracking-wider'>Fichier & Source</TableHead>
                  <TableHead className='h-10 text-[11px] font-medium uppercase tracking-wider'>Type</TableHead>
                  <TableHead className='h-10 text-[11px] font-medium uppercase tracking-wider text-right'>Taille</TableHead>
                  <TableHead className='h-10 text-[11px] font-medium uppercase tracking-wider text-center'>Statut</TableHead>
                  <TableHead className='h-10 text-[11px] font-medium uppercase tracking-wider text-right'>Date</TableHead>
                  <TableHead className='w-[50px]'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                            <Loader className="h-6 w-6 animate-spin mx-auto text-primary" />
                            <p className="text-xs text-muted-foreground mt-2 font-mono uppercase tracking-widest">Récupération des données...</p>
                        </TableCell>
                    </TableRow>
                ) : filteredBackups.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm italic">
                            Aucune sauvegarde trouvée.
                        </TableCell>
                    </TableRow>
                ) : filteredBackups.map((bkp) => (
                  <TableRow key={bkp.id} className='group border-b last:border-0'>
                    <TableCell className='py-4'>
                      <div className='flex flex-col max-w-[300px]'>
                        <div className='flex items-center gap-2'>
                          <span className='font-mono text-[11px] font-regular truncate' title={bkp.name}>{bkp.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                             <Link to={`/apps/${bkp.application?.id}`} className="text-[10px] font-medium text-primary hover:underline flex items-center gap-1">
                                <FileCode size={10} /> {bkp.application?.name}
                             </Link>
                             <span className="text-muted-foreground opacity-30">|</span>
                             <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <HardDrive size={10} /> {bkp.server?.name}
                             </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none text-[9px] font-medium uppercase px-1.5 border-black/10">
                        {bkp.type === 'volume' ? 'Fichiers' : 'Database'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right font-mono text-xs font-semibold'>
                      {formatSize(bkp.size)}
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-center'>
                        <Badge 
                          variant={bkp.status === 'success' ? 'outline' : 'destructive'}
                          className={cn(
                            'rounded-full text-[9px] font-medium uppercase tracking-wider h-5',
                            bkp.status === 'success' && 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                          )}
                        >
                          {bkp.status === 'success' ? 'Valide' : bkp.status === 'pending' ? 'En cours' : 'Erreur'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-[11px] font-medium text-muted-foreground">
                        {format(new Date(bkp.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-muted'>
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48'>
                          <DropdownMenuLabel className='text-[10px] font-medium uppercase opacity-50'>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='gap-2 py-2 cursor-pointer' onClick={() => handleDownload(bkp)}>
                            <Download size={14} className='text-primary' />
                            <span className='text-sm'>Télécharger</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className='gap-2 py-2 cursor-pointer text-orange-600 focus:text-orange-600' disabled>
                            <RotateCcw size={14} />
                            <span className='text-sm'>Restaurer</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='gap-2 py-2 cursor-pointer text-red-600 focus:text-red-600' onClick={() => handleDelete(bkp)}>
                            <Trash2 size={14} />
                            <span className='text-sm'>Supprimer</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* NOTE DE SÉCURITÉ */}
          <div className='bg-muted/30 border rounded-lg p-4 flex gap-4 items-start border-dashed'>
            <AlertCircle className='text-muted-foreground shrink-0 mt-0.5' size={18} />
            <div className='space-y-1'>
              <h4 className='text-sm font-medium uppercase tracking-wide opacity-80'>Conseil de résilience</h4>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                Les sauvegardes sont stockées par défaut sur votre serveur VPS. 
                Pour une sécurité maximale, configurez une exportation automatique vers <strong>Amazon S3</strong> ou <strong>DigitalOcean Spaces</strong>.
              </p>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

const MOCK_FALLBACK: GlobalBackup[] = [
  {
    id: 1,
    name: 'ecommerce_db_2024-04-28.sql',
    type: 'database',
    status: 'success',
    size: 134217728,
    created_at: '2024-04-28T02:00:00Z',
    application: { id: 10, name: 'E-commerce App' },
    server: { id: 1, name: 'Prod-Lomé-01' }
  }
]


