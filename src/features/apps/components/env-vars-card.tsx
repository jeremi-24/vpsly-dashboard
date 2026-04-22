import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
    Plus, 
    Trash2, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    AlertCircle,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface EnvVar {
    id: number
    key: string
    value: string
    is_secret: boolean
    version: number
}

interface EnvVarCardProps {
    appId: string
}

export function EnvVarCard({ appId }: EnvVarCardProps) {
    const [vars, setVars] = useState<EnvVar[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [newVar, setNewVar] = useState({ key: '', value: '' })
    const [showValues, setShowValues] = useState<Record<number, boolean>>({})

    const fetchVars = async () => {
        try {
            setLoading(true)
            const data = await apiFetch(`/applications/${appId}/env-vars`)
            setVars(data)
        } catch (error) {
            toast.error('Erreur lors du chargement des variables')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVars()
    }, [appId])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validation SNAKE_CASE
        if (!/^[A-Z0-9_]+$/.test(newVar.key)) {
            toast.error('La clé doit être en MAJUSCULES_SNAKE_CASE')
            return
        }

        try {
            setAdding(true)
            await apiFetch(`/applications/${appId}/env-vars`, {
                method: 'POST',
                body: JSON.stringify(newVar)
            })
            toast.success('Variable ajoutée avec succès')
            setNewVar({ key: '', value: '' })
            fetchVars()
        } catch (error) {
            toast.error('Erreur lors de l’ajout')
        } finally {
            setAdding(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer cette variable ?')) return

        try {
            await apiFetch(`/applications/${appId}/env-vars/${id}`, {
                method: 'DELETE'
            })
            toast.success('Variable supprimée')
            fetchVars()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    return (
        <div className="p-4 rounded-xl border bg-card/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Paramètres d'environnement</h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono opacity-60">DÉPLOIEMENT REQUIS</Badge>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 mb-6 p-3 rounded-lg bg-muted/30 border border-dashed">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="key" className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Clé</Label>
                        <Input 
                            id="key"
                            placeholder="EX: API_KEY"
                            value={newVar.key}
                            onChange={e => setNewVar({ ...newVar, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                            className="h-8 text-xs font-mono"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="value" className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Valeur</Label>
                        <Input 
                            id="value"
                            type="password"
                            placeholder="••••••••"
                            value={newVar.value}
                            onChange={e => setNewVar({ ...newVar, value: e.target.value })}
                            className="h-8 text-xs font-mono"
                            required
                        />
                    </div>
                </div>
                <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={adding}>
                    {adding ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                    Ajouter la variable
                </Button>
            </form>

            <div className="space-y-1">
                {loading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : vars.length === 0 ? (
                    <div className="py-8 text-center border rounded-lg border-dashed">
                        <AlertCircle className="h-4 w-4 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-xs text-muted-foreground">Aucune variable configurée.</p>
                    </div>
                ) : (
                    vars.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group">
                            <div className="flex flex-col">
                                <span className="text-xs font-mono font-bold">{v.key}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-mono text-muted-foreground opacity-60">
                                        {v.value}
                                    </span>
                                    <Badge variant="secondary" className="text-[8px] h-3 px-1 leading-none">v{v.version}</Badge>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(v.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-dashed">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    Toute modification nécessite un redéploiement pour être effective.
                </p>
            </div>
        </div>
    )
}
