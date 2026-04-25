import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    Database, 
    Plus, 
    Trash2, 
    HardDrive,
    AlertCircle,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Volume {
    id: number
    name: string
    mount_path: string
    host_path: string | null
}

interface AppVolumesCardProps {
    appId: string
}

export function AppVolumesCard({ appId }: AppVolumesCardProps) {
    const [volumes, setVolumes] = useState<Volume[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [newVolume, setNewVolume] = useState({ mount_path: '' })

    const fetchVolumes = async () => {
        try {
            setLoading(true)
            const data = await apiFetch(`/applications/${appId}/volumes`)
            setVolumes(data)
        } catch (error) {
            toast.error('Erreur lors du chargement des volumes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVolumes()
    }, [appId])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newVolume.mount_path.startsWith('/')) {
            toast.error('Le chemin de montage doit être absolu (commencer par /)')
            return
        }

        try {
            setAdding(true)
            await apiFetch(`/applications/${appId}/volumes`, {
                method: 'POST',
                body: JSON.stringify(newVolume)
            })
            toast.success('Volume ajouté')
            setNewVolume({ mount_path: '' })
            fetchVolumes()
        } catch (error) {
            toast.error('Erreur lors de l’ajout du volume')
        } finally {
            setAdding(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await apiFetch(`/applications/${appId}/volumes/${id}`, {
                method: 'DELETE'
            })
            toast.success('Volume détaché')
            fetchVolumes()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    return (
        <Card className="border-white/5 bg-card/30 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 py-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <HardDrive className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Volumes Persistants</CardTitle>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Stockage persistant pour vos fichiers et bases SQLite</p>
                    </div>
                </div>
                <Badge variant="outline" className="text-[10px] h-5 opacity-50">{volumes.length}</Badge>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4 bg-muted/20 border-b border-white/5">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <div className="flex-1">
                            <Input 
                                placeholder="Chemin dans le conteneur (ex: /app/storage)" 
                                value={newVolume.mount_path}
                                onChange={e => setNewVolume({ mount_path: e.target.value })}
                                className="h-8 text-xs bg-background/50 border-white/10"
                            />
                        </div>
                        <Button type="submit" size="sm" className="h-8 text-[10px] px-3 font-bold uppercase" disabled={adding}>
                            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
                            Ajouter
                        </Button>
                    </form>
                </div>

                <div className="divide-y divide-white/5">
                    {loading ? (
                        <div className="p-3 space-y-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : volumes.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                            <Database className="h-8 w-8 opacity-10" />
                            <p className="text-[10px] font-bold uppercase tracking-tighter">Aucun volume configuré</p>
                        </div>
                    ) : (
                        volumes.map((vol) => (
                            <div key={vol.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs font-mono font-bold text-primary">{vol.mount_path}</code>
                                        <Badge variant="secondary" className="text-[8px] h-3 px-1 leading-none opacity-40">Docker Volume</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-60">
                                        <span className="font-mono">ID: {vol.name}</span>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => handleDelete(vol.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-primary/5 border-t border-white/5">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                        <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
                            Les volumes permettent de conserver les données entre les déploiements. 
                            <strong> Attention :</strong> Les modifications prennent effet au prochain déploiement de l'application.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
