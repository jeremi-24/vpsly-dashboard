import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Eye, EyeOff, AlertCircle, Loader, Copy, X, FileUp } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface EnvVar {
    id: number
    key: string
    value: string
    is_secret: boolean
    version: number
}

export function EnvVarCard({ appId }: { appId: string }) {
    const [vars, setVars] = useState<EnvVar[]>([])
    const [loading, setLoading] = useState(true)
    const [newVar, setNewVar] = useState({ key: '', value: '' })
    const [adding, setAdding] = useState(false)
    const [showValues, setShowValues] = useState<Record<number, boolean>>({})
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState('')
    const [savingId, setSavingId] = useState<number | null>(null)
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
        } catch {
            toast.error('Erreur lors du chargement des variables')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchVars() }, [appId])

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
        } catch {
            toast.error('Erreur lors de l\'ajout')
        } finally {
            setAdding(false)
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
        } catch {
            toast.error('Erreur lors de la révélation')
        }
    }

    const handleDelete = (id: number) => {
        if (deleteConfirmId === id) {
            executeDelete(id)
        } else {
            setDeleteConfirmId(id)
            if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current)
            deleteTimeoutRef.current = setTimeout(() => setDeleteConfirmId(null), 3000)
        }
    }

    const executeDelete = async (id: number) => {
        try {
            await apiFetch(`/applications/${appId}/env-vars/${id}`, { method: 'DELETE' })
            toast.success('Variable supprimée')
            setDeleteConfirmId(null)
            fetchVars()
        } catch {
            toast.error('Erreur lors de la suppression')
        }
    }

    const saveEdit = async (id: number) => {
        if (!editValue.trim()) { setEditingId(null); return }
        try {
            setSavingId(id)
            const v = vars.find(x => x.id === id)
            if (!v || editValue === v.value) { setEditingId(null); return }
            await apiFetch(`/applications/${appId}/env-vars`, {
                method: 'POST',
                body: JSON.stringify({ key: v.key, value: editValue })
            })
            toast.success('Valeur mise à jour')
            setEditingId(null)
            fetchVars()
        } catch {
            toast.error('Erreur lors de la mise à jour')
        } finally {
            setSavingId(null)
        }
    }

    const handleBulkImport = async () => {
        const variables: { key: string, value: string }[] = []
        bulkContent.split('\n').forEach(line => {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('#')) return
            const match = trimmed.match(/^([^=]+)=(.*)$/)
            if (match) {
                let key = match[1].trim()
                let value = match[2].split('#')[0].trim()
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
                else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
                if (/^[A-Z0-9_]+$/.test(key)) variables.push({ key, value })
            }
        })
        if (!variables.length) { toast.error('Aucune variable valide trouvée'); return }
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
        } catch {
            toast.error('Erreur lors de l\'import')
        } finally {
            setProcessingBulk(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Variables d'environnement</h2>
                <button
                    className={cn(
                        "text-[10px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all border",
                        bulkMode
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-white/5 text-muted-foreground hover:text-foreground border-white/5 hover:border-white/10"
                    )}
                    onClick={() => setBulkMode(!bulkMode)}
                >
                    {bulkMode ? <X className="h-3 w-3" /> : <FileUp className="h-3 w-3" />}
                    {bulkMode ? 'Fermer l\'import' : 'Import .env'}
                </button>
            </div>

            <div className="rounded-xl border bg-card/30 overflow-hidden">
                {/* Barre d'ajout */}
                <div className="p-4 border-b border-white/5">
                    {bulkMode ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground">Collez votre fichier .env ci-dessous</p>
                            </div>
                            <Textarea
                                placeholder={"KEY=VALUE\n# Commentaire\nDATABASE_URL=postgres://..."}
                                className="min-h-[150px] text-xs font-mono bg-background/50 resize-none border-white/5 focus-visible:ring-indigo-500/30"
                                value={bulkContent}
                                onChange={e => setBulkContent(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" className="flex-1 h-9 text-xs bg-indigo-600 hover:bg-indigo-500" onClick={handleBulkImport} disabled={processingBulk || !bulkContent.trim()}>
                                    {processingBulk && <Loader className="h-3 w-3 animate-spin mr-2" />}
                                    Importer les variables
                                </Button>
                                <Button size="sm" variant="ghost" className="h-9 text-xs" onClick={() => setBulkMode(false)}>Annuler</Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleAdd} className="flex gap-2">
                            <Input
                                placeholder="NOM_VARIABLE"
                                value={newVar.key}
                                onChange={e => setNewVar({ ...newVar, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                className="h-9 text-xs font-mono flex-1 bg-white/5 border-white/5 focus-visible:ring-indigo-500/30"
                                required
                            />
                            <Input
                                type="password"
                                placeholder="valeur"
                                value={newVar.value}
                                onChange={e => setNewVar({ ...newVar, value: e.target.value })}
                                className="h-9 text-xs font-mono flex-1 bg-white/5 border-white/5 focus-visible:ring-indigo-500/30"
                                required
                            />
                            <Button type="submit" size="icon" className="h-9 w-9 shrink-0 bg-indigo-600 hover:bg-indigo-500" disabled={adding}>
                                {adding ? <Loader className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                            </Button>
                        </form>
                    )}
                </div>

                {/* Liste */}
                <div className="divide-y divide-white/[0.04]">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3.5 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-md" />
                            </div>
                        ))
                    ) : vars.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <p className="text-xs">Aucune variable d'environnement.</p>
                        </div>
                    ) : vars.map(v => (
                        <div key={v.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] group transition-colors">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-xs font-mono font-medium text-foreground">{v.key}</p>
                                {editingId === v.id ? (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Input
                                            autoFocus
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            onBlur={() => saveEdit(v.id)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') saveEdit(v.id)
                                                if (e.key === 'Escape') setEditingId(null)
                                            }}
                                            className="h-6 text-[10px] font-mono py-0 px-2 w-48 bg-white/5 border-white/10"
                                            disabled={savingId === v.id}
                                        />
                                        {savingId === v.id && <Loader className="h-3 w-3 animate-spin text-muted-foreground" />}
                                    </div>
                                ) : (
                                    <p
                                        className="text-[10px] font-mono text-muted-foreground mt-0.5 cursor-text hover:text-foreground transition-colors"
                                        onClick={() => { setEditingId(v.id); setEditValue(showValues[v.id] ? v.value : '') }}
                                    >
                                        {showValues[v.id] ? v.value : '••••••••'}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {showValues[v.id] && (
                                    <button
                                        className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                                        onClick={() => { navigator.clipboard.writeText(v.value); toast.success('Copié') }}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </button>
                                )}
                                <button
                                    className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-colors hover:bg-white/5", showValues[v.id] ? "text-indigo-400" : "text-muted-foreground hover:text-foreground")}
                                    onClick={() => handleReveal(v.id)}
                                >
                                    {showValues[v.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                                {deleteConfirmId === v.id ? (
                                    <div className="flex items-center gap-1">
                                        <button className="h-7 px-2 rounded-md text-[10px] font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" onClick={() => executeDelete(v.id)}>
                                            Confirmer
                                        </button>
                                        <button className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-white/5" onClick={() => setDeleteConfirmId(null)}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        onClick={() => handleDelete(v.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3" />
                        Modifications effectives au prochain déploiement
                    </p>
                </div>
            </div>
        </div>
    )
}