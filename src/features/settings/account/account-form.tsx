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

const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Veuillez entrer votre nom.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(30, 'Le nom ne doit pas dépasser 30 caractères.'),
  // language: z.string('Veuillez sélectionner une langue.'),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function AccountForm() {
  const { auth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: auth.user?.name || '',
      // language: 'fr',
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

        {/* 
        <FormField
          control={form.control}
          name='language'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Langue</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[200px] justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : 'Sélectionner une langue'}
                      <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Rechercher une langue...' />
                    <CommandEmpty>Aucune langue trouvée.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {languages.map((language) => (
                          <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                              form.setValue('language', language.value)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'size-4',
                                language.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                                )}
                            />
                            {language.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                C'est la langue qui sera utilisée dans le tableau de bord.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> 
        */}
        <Button type='submit' disabled={loading}>
          {loading ? 'Mise à jour...' : 'Mettre à jour le compte'}
        </Button>
      </form>
    </Form>
  )
}
