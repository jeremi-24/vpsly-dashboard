import { Check, Copy, ExternalLink, ShieldCheck, Database as DbIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DatabaseConnectionModalProps {
  database: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DatabaseConnectionModal({ database, open, onOpenChange }: DatabaseConnectionModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  if (!database) return null

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success('Copié !')
    setTimeout(() => setCopied(null), 2000)
  }

  // URLs provenant du backend (Accessors Laravel)
  const internalUrl = database.internal_db_url || `postgres://postgres:password@${database.uuid}:5432/postgres`
  const externalUrl = database.external_db_url

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                <DbIcon size={18} />
             </div>
             <DialogTitle className="text-lg">Connexion à {database.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          
          {/* SECTION RÉSEAU INTERNE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <Label className="text-[11px] uppercase tracking-wider font-bold">Réseau Interne (vpsly_network)</Label>
                </div>
                <span className="text-[10px] text-green-500 font-semibold italic">Recommandé</span>
            </div>
            <div className="flex gap-2">
                <Input 
                    readOnly 
                    value={internalUrl}
                    className="font-mono text-xs h-9 bg-muted/30 border-none shadow-none"
                />
                <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-9 w-9 flex-none"
                    onClick={() => handleCopy(internalUrl, 'internal')}
                >
                    {copied === 'internal' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
            </div>
          </div>

          {/* SECTION ACCÈS PUBLIC */}
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-muted-foreground">
                 <ExternalLink className="h-3.5 w-3.5" />
                 <Label className="text-[11px] uppercase tracking-wider font-bold">Accès Public</Label>
             </div>

             {externalUrl ? (
                <div className="flex gap-2">
                    <Input 
                        readOnly 
                        value={externalUrl}
                        className="font-mono text-xs h-9 bg-muted/30 border-none shadow-none"
                    />
                    <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-9 w-9 flex-none"
                        onClick={() => handleCopy(externalUrl, 'external')}
                    >
                        {copied === 'external' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                </div>
             ) : (
                <div className="h-9 flex items-center justify-between px-3 rounded-md bg-muted/10 border border-dashed text-[11px] text-muted-foreground italic">
                   <span>L'accès public est désactivé pour cette instance.</span>
                   <button 
                     onClick={() => {
                        onOpenChange(false)
                        // TODO: Rediriger vers l'onglet Détails/Paramètres une fois implémenté
                        toast.info("Redirection", { description: "Ouverture des paramètres de l'instance..." })
                     }}
                     className="text-indigo-600 dark:text-indigo-400 font-bold not-italic hover:underline ml-2"
                   >
                      Activer ici
                   </button>
                </div>
             )}
          </div>
        </div>

        <div className="bg-muted/30 p-4 border-t flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
             Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
