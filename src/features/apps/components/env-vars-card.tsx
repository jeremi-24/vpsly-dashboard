import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
    Plus, 
    Trash2, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    AlertCircle,
    Loader2,
    Copy,
    Check,
    X,
    FileUp,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

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
    
    // Pro features states
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState('')
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
    const [bulkMode, setBulkMode] = useState(false)
    const [bulkContent, setBulkContent] = useState('')
    const [processingBulk, setProcessingBulk] = useState(false)
    
    const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

    const handleCopy = (text: string, label: string) => {
        if (text === '••••••••') {
            toast.error('Veuillez d’abord révéler la valeur pour la copier')
            return
        }
        navigator.clipboard.writeText(text)
        toast.success(`${label} copié dans le presse-papier`)
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
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
            toast.success('Variable ajoutée')
            setNewVar({ key: '', value: '' })
            fetchVars()
        } catch (error) {
            toast.error('Erreur lors de l’ajout')
        } finally {
            setAdding(false)
        }
    }

    const handleInlineDelete = (id: number) => {
        if (deleteConfirmId === id) {
            // Second click: perform delete
            executeDelete(id)
        } else {
            // First click: show confirmation
            setDeleteConfirmId(id)
            if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current)
            deleteTimeoutRef.current = setTimeout(() => {
                setDeleteConfirmId(null)
            }, 3000)
        }
    }

    const executeDelete = async (id: number) => {
        try {
            await apiFetch(`/applications/${appId}/env-vars/${id}`, {
                method: 'DELETE'
            })
            toast.success('Variable supprimée')
            setDeleteConfirmId(null)
            fetchVars()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const handleReveal = async (id: number) => {
        if (showValues[id]) {
            setShowValues(prev => ({ ...prev, [id]: false }))
            return
        }
        try {
            const data = await apiFetch(`/applications/${appId}/env-vars/${id}/reveal`)
            setVars(prev => prev.map(v => v.id === id ? { ...v, value: data.value } : v))
            setShowValues(prev => ({ ...prev, [id]: true }))
        } catch (error) {
            toast.error('Erreur lors de la révélation')
        }
    }

    const startEditing = (v: EnvVar) => {
        setEditingId(v.id)
        // Securité: on ne pré-remplit pas si c'est un secret non révélé
        setEditValue(showValues[v.id] ? v.value : '')
    }

    const saveEdit = async (id: number) => {
        if (!editValue && !confirm('La valeur est vide. Continuer ?')) return
        
        try {
            const v = vars.find(x => x.id === id)
            if (!v) return

            await apiFetch(`/applications/${appId}/env-vars`, {
                method: 'POST',
                body: JSON.stringify({ key: v.key, value: editValue })
            })
            toast.success('Valeur mise à jour')
            setEditingId(null)
            fetchVars()
        } catch (error) {
            toast.error('Erreur lors de la mise à jour')
        }
    }

    const handleBulkImport = async () => {
        const lines = bulkContent.split('\n')
        const variables: { key: string, value: string }[] = []

        lines.forEach(line => {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('#')) return

            // Handle KEY="val" or KEY=val or KEY=val#comment
            const match = trimmed.match(/^([^=]+)=(.*)$/)
            if (match) {
                let key = match[1].trim()
                let value = match[2].split('#')[0].trim()

                // Strip quotes
                if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1)
                else if (value.startsWith("'") && value.endsWith("'")) value = value.substring(1, value.length - 1)

                if (/^[A-Z0-9_]+$/.test(key)) {
                    variables.push({ key, value })
                }
            }
        })

        if (variables.length === 0) {
            toast.error('Aucune variable valide trouvée dans le texte')
            return
        }

        try {
            setProcessingBulk(true)
            await apiFetch(`/applications/${appId}/env-vars/bulk`, {
                method: 'POST',
                body: JSON.stringify({ variables })
            })
            toast.success(`${variables.length} variables importées`)
            setBulkMode(false)
            setBulkContent('')
            fetchVars()
        } catch (error) {
            toast.error('Erreur lors de l’import bulk')
        } finally {
            setProcessingBulk(false)
        }
    }

    return (
        <Collapsible className="rounded-xl border bg-card/50 overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Environnement</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-4 opacity-50">{vars.length} vars</Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="p-4 pt-0">
                <div className="flex items-center justify-between mb-6 pt-4 border-t border-white/5">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Gestion des variables</div>
                    <div className='flex items-center gap-2'>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold uppercase tracking-tight"
                            onClick={(e) => {
                                e.stopPropagation(); // Éviter de fermer le collapsible
                                setBulkMode(!bulkMode);
                            }}
                        >
                            {bulkMode ? <ChevronUp className="h-3 w-3 mr-1" /> : <FileUp className="h-3 w-3 mr-1" />}
                            {bulkMode ? 'Annuler' : 'Import .env'}
                        </Button>
                    </div>
                </div>

            {bulkMode && (
                <div className="mb-6 space-y-3 p-3 rounded-lg bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-[10px] uppercase font-bold text-primary/70 ml-1">Copier-coller votre fichier .env</Label>
                    <Textarea 
                        placeholder="KEY=VALUE&#10;# Commentaire&#10;DATABASE_URL=postgres://..."
                        className="min-h-[120px] text-xs font-mono bg-background/50"
                        value={bulkContent}
                        onChange={e => setBulkContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            className="flex-1 h-8 text-xs" 
                            onClick={handleBulkImport}
                            disabled={processingBulk || !bulkContent.trim()}
                        >
                            {processingBulk ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Check className="h-3 w-3 mr-2" />}
                            Importer {bulkContent.split('\n').filter(l => l.includes('=')).length} variables
                        </Button>
                    </div>
                </div>
            )}

            {!bulkMode && (
                <form onSubmit={handleAdd} className="grid grid-cols-12 gap-2 mb-6">
                    <div className="col-span-5">
                        <Input 
                            placeholder="CLÉ"
                            value={newVar.key}
                            onChange={e => setNewVar({ ...newVar, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                            className="h-8 text-xs font-mono"
                            required
                        />
                    </div>
                    <div className="col-span-5">
                        <Input 
                            type="password"
                            placeholder="Valeur"
                            value={newVar.value}
                            onChange={e => setNewVar({ ...newVar, value: e.target.value })}
                            className="h-8 text-xs font-mono"
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <Button type="submit" size="icon" className="w-full h-8" disabled={adding}>
                            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        </Button>
                    </div>
                </form>
            )}

            <div className="space-y-1">
                {loading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : vars.length === 0 ? (
                    <div className="py-8 text-center border rounded-lg border-dashed opacity-40">
                        <p className="text-xs">Aucune variable.</p>
                    </div>
                ) : (
                    vars.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group">
                            <div className="flex flex-col flex-1 min-w-0 pr-4">
                                <div className='flex items-center gap-2'>
                                    <span 
                                        className="text-xs font-mono font-bold truncate cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => handleCopy(v.key, 'Clé')}
                                    >
                                        {v.key}
                                    </span>
                                    <Badge variant="secondary" className="text-[8px] h-3 px-1 leading-none opacity-40 group-hover:opacity-100">v{v.version}</Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    {editingId === v.id ? (
                                        <div className='flex items-center gap-1 w-full'>
                                            <Input 
                                                autoFocus
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onBlur={() => editingId === v.id && saveEdit(v.id)}
                                                onKeyDown={e => e.key === 'Enter' && saveEdit(v.id)}
                                                placeholder={showValues[v.id] ? '' : '••••••••'}
                                                className="h-6 text-[10px] font-mono py-0 px-2"
                                            />
                                        </div>
                                    ) : (
                                        <span 
                                            className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px] cursor-text hover:bg-primary/5 rounded px-1 -ml-1 transition-colors"
                                            onClick={() => startEditing(v)}
                                        >
                                            {showValues[v.id] ? v.value : '••••••••'}
                                        </span>
                                    )}
                                    
                                    {!editingId && showValues[v.id] && (
                                        <Copy 
                                            className='h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary opacity-0 group-hover:opacity-100' 
                                            onClick={() => handleCopy(v.value, 'Valeur')}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className='flex items-center gap-1 shrink-0'>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleReveal(v.id)}
                                    className={`h-7 w-7 transition-colors ${showValues[v.id] ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    {showValues[v.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                                
                                <div className='relative'>
                                    {deleteConfirmId === v.id ? (
                                        <div className='flex items-center gap-1 animate-in zoom-in-95 duration-200'>
                                            <Button 
                                                variant="destructive" 
                                                size="sm" 
                                                className="h-7 px-2 text-[9px] font-bold"
                                                onClick={() => executeDelete(v.id)}
                                            >
                                                CONFIRMER
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className='h-7 w-7'
                                                onClick={() => setDeleteConfirmId(null)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleInlineDelete(v.id)}
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive transition-opacity"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-dashed">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 opacity-60">
                    <AlertCircle className="h-3 w-3" />
                    Modifications effectives au prochain déploiement.
                </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
    )
}
