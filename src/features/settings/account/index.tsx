import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Mon Compte'
      desc='Mettez à jour vos paramètres de compte. Définissez votre langue préférée et votre fuseau horaire.'
    >
      <AccountForm />
    </ContentSection>
  )
}
