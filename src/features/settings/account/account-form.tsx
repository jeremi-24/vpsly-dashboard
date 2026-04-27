import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth-store'
import { apiFetch } from '@/lib/api'
import { useState } from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Veuillez entrer votre nom.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(30, 'Le nom ne doit pas dépasser 30 caractères.'),
  phone: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function AccountForm() {
  const { auth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: auth.user?.name || '',
      phone: auth.user?.phone || '',
    },
  })

  async function onSubmit(data: AccountFormValues) {
    try {
      setLoading(true)
      const updatedUser = await apiFetch<any>('/user', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      
      auth.setUser(updatedUser)
      toast.success('Profil mis à jour avec succès !')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder='Votre nom' {...field} />
              </FormControl>
              <FormDescription>
                C'est le nom qui sera affiché sur votre profil et dans les
                e-mails.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem className='flex flex-col items-start'>
              <FormLabel>Numéro de téléphone</FormLabel>
              <FormControl className='w-full'>
                <PhoneInput
                    placeholder="Entrez votre numéro"
                    {...field}
                    defaultCountry="TG"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormDescription>
                Votre numéro de téléphone pour les notifications importantes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={loading}>
          {loading ? 'Mise à jour...' : 'Mettre à jour le compte'}
        </Button>
      </form>
    </Form>
  )
}
