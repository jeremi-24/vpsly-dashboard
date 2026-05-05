import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react'
import logoWhiteBg from '@/assets/logo/logo_white_bg.png'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

const styles = `
  .terms-page {
    background: #F5F4F0;
    color: #0A0A0A;
    min-height: 100vh;
    font-family: 'Manrope', sans-serif;
    padding-bottom: 5rem;
  }
  .terms-nav {
    border-bottom: 2px solid #0A0A0A;
    padding: 1rem clamp(1rem, 4vw, 4rem);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F5F4F0;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .back-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #0A0A0A;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .terms-container {
    max-width: 800px;
    margin: 4rem auto;
    padding: 0 1.5rem;
  }
  .terms-header {
    margin-bottom: 4rem;
    border-bottom: 2px solid #0A0A0A;
    padding-bottom: 2rem;
  }
  .terms-h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 6vw, 80px);
    line-height: 0.9;
    margin-bottom: 1rem;
  }
  .version-tag {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #378ADD;
    font-weight: 600;
  }
  .terms-content {
    line-height: 1.8;
    font-size: 16px;
  }
  .terms-content h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    margin: 3rem 0 1.5rem;
    color: #0A0A0A;
    letter-spacing: 0.02em;
  }
  .terms-content h3 {
    font-size: 18px;
    font-weight: 800;
    margin: 2rem 0 1rem;
  }
  .terms-content p {
    margin-bottom: 1.5rem;
    color: #333;
  }
  .terms-content ul {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  .terms-content li {
    margin-bottom: 0.5rem;
  }
  .terms-table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-size: 14px;
  }
  .terms-table th, .terms-table td {
    border: 1px solid #0A0A0A;
    padding: 12px;
    text-align: left;
  }
  .terms-table th {
    background: #0A0A0A;
    color: #F5F4F0;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.1em;
  }
  .footer-mini {
    margin-top: 5rem;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #8A8A8A;
    text-transform: uppercase;
  }
`

function TermsPage() {
  return (
    <div className="terms-page">
      <style>{styles}</style>
      
      <nav className="terms-nav">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px' }}>
          <img src={logoWhiteBg} alt="Logo" style={{ width: 28, height: 28, borderRadius: 4 }} />
          VPSly
        </div>
      </nav>

      <div className="terms-container">
        <header className="terms-header">
          <h1 className="terms-h1">Conditions Générales d'Utilisation</h1>
          <p className="version-tag">Version 1.0 — Dernière mise à jour : 3 mai 2026</p>
        </header>

        <div className="terms-content">
          <h2>1. Objet et champ d'application</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation du service VPSly (ci-après « le Service ») édité par <strong>l'équipe VPSly</strong>, basée à Lomé, Togo.
          </p>
          <p>
            Le Service désigne l'ensemble des fonctionnalités accessibles via le dashboard en ligne, l'agent VPSly installé sur le serveur de l'utilisateur, ainsi que toute documentation associée.
          </p>
          <p>
            En créant un compte ou en utilisant le Service, vous acceptez sans réserve les présentes CGU. Si vous utilisez VPSly pour le compte d'une organisation, vous déclarez avoir l'autorité pour engager cette organisation.
          </p>

          <h2>2. Définitions</h2>
          <ul>
            <li><strong>Utilisateur</strong> : toute personne physique ou morale ayant créé un compte VPSly.</li>
            <li><strong>Agent VPSly</strong> : le logiciel installé sur le serveur de l'Utilisateur.</li>
            <li><strong>Application</strong> : tout projet logiciel déployé via le Service.</li>
            <li><strong>Plan</strong> : l'offre d'abonnement souscrit (Starter, Solo ou Pro).</li>
          </ul>

          <h2>3. Accès au service</h2>
          <h3>3.1 Création de compte</h3>
          <p>L'accès au Service nécessite la création d'un compte avec une adresse e-mail valide. Un seul compte par personne ou organisation est autorisé.</p>
          <h3>3.2 Sécurité</h3>
          <p>L'Utilisateur est seul responsable de la confidentialité de ses identifiants. En cas de compromission, contacte-nous à contact@vpsly.tech.</p>


          <h2>4. Remboursements</h2>
          <p>Aucun remboursement n'est accordé pour une période mensuelle entamée. Pour les plans annuels, une demande de remboursement au prorata peut être faite sous 14 jours.</p>

          <h2>5. Utilisation acceptable</h2>
          <p>L'Utilisateur s'engage à ne pas utiliser VPSly pour des activités illégales, frauduleuses, des attaques DDoS, ou l'envoi de spams.</p>

          <h2>6. Propriété intellectuelle</h2>
          <p>VPSly reste propriétaire exclusif du Service. L'Utilisateur conserve l'intégralité des droits sur son code source et ses données.</p>

          <h2>7. Agent VPSly et accès au serveur</h2>
          <p>L'Utilisateur reste seul propriétaire et administrateur de son serveur. L'Agent VPSly peut être désinstallé à tout moment via la commande <code>vpsly uninstall</code>. La désinstallation dissocie le serveur de votre compte sans supprimer les applications déjà déployées.</p>

          <h2>8. Disponibilité</h2>
          <p>Nous visons une disponibilité du dashboard de 99% par mois. L'état du service est consultable sur status.vpsly.tech.</p>

          <h2>9. Responsabilité</h2>
          <p>La responsabilité de VPSly est limitée au montant des sommes versées au cours des 3 derniers mois. Nous ne sommes pas responsables des défaillances de votre propre serveur.</p>

          <h2>10. Résiliation</h2>
          <p>L'Utilisateur peut résilier à tout moment. VPSly peut résilier un compte en cas de violation des CGU ou non-paiement.</p>

          <h2>11. Droit applicable</h2>
          <p>Les présentes CGU sont régies par le <strong>droit togolais</strong>. En cas de litige, les tribunaux de Lomé sont compétents.</p>

          <h2>12. Contact</h2>
          <p>
            <strong>L'équipe VPSly</strong><br />
            Lomé, Togo<br />
            <a href="mailto:contact@vpsly.tech" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Mail size={14} color="#378ADD" /> contact@vpsly.tech
            </a>
            <a href="mailto:support@vpsly.tech" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Mail size={14} color="#378ADD" /> support@vpsly.tech
            </a>
            <a href="https://wa.me/22879012470" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <MessageCircle size={14} color="#378ADD" /> WhatsApp : +228 79012470
            </a>
          </p>
        </div>

        <div className="footer-mini">
          VPSly.tech — Lomé, Togo 🇹🇬
        </div>
      </div>
    </div>
  )
}
