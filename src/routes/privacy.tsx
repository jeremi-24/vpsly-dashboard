import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Phone, MessageCircle, Mail } from 'lucide-react'
import logoWhiteBg from '@/assets/logo/logo_white_bg.png'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

const styles = `
  .privacy-page {
    background: #F5F4F0;
    color: #0A0A0A;
    min-height: 100vh;
    font-family: 'Manrope', sans-serif;
    padding-bottom: 5rem;
  }
  .privacy-nav {
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
  .privacy-container {
    max-width: 800px;
    margin: 4rem auto;
    padding: 0 1.5rem;
  }
  .privacy-header {
    margin-bottom: 4rem;
    border-bottom: 2px solid #0A0A0A;
    padding-bottom: 2rem;
  }
  .privacy-h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 6vw, 80px);
    line-height: 0.9;
    margin-bottom: 1rem;
  }
  .last-update {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #378ADD;
    font-weight: 600;
  }
  .privacy-content {
    line-height: 1.8;
    font-size: 16px;
  }
  .privacy-content h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    margin: 3rem 0 1.5rem;
    color: #0A0A0A;
    letter-spacing: 0.02em;
  }
  .privacy-content h3 {
    font-size: 18px;
    font-weight: 800;
    margin: 2rem 0 1rem;
  }
  .privacy-content p {
    margin-bottom: 1.5rem;
    color: #333;
  }
  .privacy-content ul {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  .privacy-content li {
    margin-bottom: 0.5rem;
  }
  .privacy-content blockquote {
    border-left: 4px solid #378ADD;
    padding: 1rem 1.5rem;
    background: #EFEFEC;
    margin: 2rem 0;
    font-weight: 500;
  }
  .privacy-table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-size: 14px;
  }
  .privacy-table th, .privacy-table td {
    border: 1px solid #0A0A0A;
    padding: 12px;
    text-align: left;
  }
  .privacy-table th {
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

function PrivacyPage() {
  return (
    <div className="privacy-page">
      <style>{styles}</style>
      
      <nav className="privacy-nav">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px' }}>
          <img src={logoWhiteBg} alt="Logo" style={{ width: 28, height: 28, borderRadius: 4 }} />
          VPSly
        </div>
      </nav>

      <div className="privacy-container">
        <header className="privacy-header">
          <h1 className="privacy-h1">Politique de Confidentialité</h1>
          <p className="last-update">Dernière mise à jour : 28 avril 2026</p>
        </header>

        <div className="privacy-content">
          <h2>1. Présentation</h2>
          <p>
            VPSly est un service d'automatisation de déploiement et de gestion d'infrastructure cloud édité par <strong>l'équipe VPSly</strong>, basée à Lomé, Togo.
          </p>
          <p>
            La présente politique de confidentialité décrit quelles données nous collectons, pourquoi nous les collectons, comment nous les utilisons et quels droits vous exercez sur vos données.
          </p>
          <p>
            En utilisant VPSly, vous acceptez les pratiques décrites dans ce document.
          </p>

          <h2>2. Données collectées</h2>
          <h3>2.1 Données de compte</h3>
          <ul>
            <li>Adresse e-mail</li>
            <li>Nom et prénom (optionnel)</li>
            <li>Mot de passe (stocké sous forme hachée — nous n'y avons jamais accès en clair)</li>
          </ul>

          <h3>2.2 Données de paiement</h3>
          <p>
            Les paiements sont traités via des prestataires tiers (Mobile Money, Flooz, T-Money). Nous ne stockons <strong>aucune donnée bancaire ou numéro de portefeuille mobile</strong> sur nos serveurs. Seuls sont conservés :
          </p>
          <ul>
            <li>Le montant et la date de la transaction</li>
            <li>Le statut du paiement (validé / annulé / en attente)</li>
            <li>Une référence de transaction fournie par le prestataire</li>
          </ul>

          <h3>2.3 Données d'infrastructure</h3>
          <p>
            Lors de la connexion de votre serveur à VPSly, nous traitons :
          </p>
          <ul>
            <li>L'adresse IP du serveur connecté</li>
            <li>Les métadonnées de déploiement (nom d'application, branche, durée, statut)</li>
            <li>Les métriques système agrégées (CPU, RAM, disque) — affichées dans votre dashboard</li>
            <li>Les logs applicatifs générés par vos déploiements</li>
          </ul>
          <blockquote>
            <strong>Important :</strong> VPSly n'accède pas au contenu de vos applications ni aux données de vos utilisateurs finaux. Vos données restent sur votre propre serveur.
          </blockquote>

          <h3>2.4 Données techniques collectées automatiquement</h3>
          <ul>
            <li>Adresse IP de connexion au dashboard</li>
            <li>Type de navigateur et système d'exploitation</li>
            <li>Pages visitées et actions effectuées dans le dashboard (à des fins de débogage)</li>
            <li>Cookies de session nécessaires au fonctionnement du service</li>
          </ul>

          <h2>3. Finalités du traitement</h2>
          <table className="privacy-table">
            <thead>
              <tr>
                <th>Donnée</th>
                <th>Finalité</th>
                <th>Base légale</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>E-mail</td>
                <td>Authentification, notifications, support</td>
                <td>Exécution du contrat</td>
              </tr>
              <tr>
                <td>Données de paiement</td>
                <td>Facturation, historique comptable</td>
                <td>Obligation légale / Contrat</td>
              </tr>
              <tr>
                <td>Données d'infrastructure</td>
                <td>Fourniture du service, monitoring</td>
                <td>Exécution du contrat</td>
              </tr>
              <tr>
                <td>Logs applicatifs</td>
                <td>Débogage, support technique</td>
                <td>Intérêt légitime</td>
              </tr>
              <tr>
                <td>Données de navigation</td>
                <td>Amélioration du produit</td>
                <td>Intérêt légitime</td>
              </tr>
            </tbody>
          </table>
          <p>Nous ne traitons aucune donnée à des fins publicitaires. VPSly ne revend aucune donnée à des tiers.</p>

          <h2>4. Conservation des données</h2>
          <table className="privacy-table">
            <thead>
              <tr>
                <th>Type de donnée</th>
                <th>Durée de conservation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Données de compte</td>
                <td>Durée de vie du compte + 30 jours après suppression</td>
              </tr>
              <tr>
                <td>Historique de paiement</td>
                <td>5 ans (obligation comptable)</td>
              </tr>
              <tr>
                <td>Logs de déploiement</td>
                <td>90 jours glissants</td>
              </tr>
              <tr>
                <td>Métriques serveur</td>
                <td>30 jours glissants</td>
              </tr>
              <tr>
                <td>Logs de connexion</td>
                <td>30 jours</td>
              </tr>
            </tbody>
          </table>

          <h2>5. Partage des données</h2>
          <p>Nous ne partageons vos données qu'avec les catégories de tiers suivantes, dans la stricte mesure nécessaire :</p>
          <ul>
            <li><strong>Prestataires de paiement Mobile Money</strong> — pour le traitement des transactions</li>
            <li><strong>Hébergeur de l'infrastructure VPSly</strong> — pour la disponibilité du dashboard</li>
            <li><strong>Service d'envoi d'e-mails transactionnels</strong> — pour les notifications</li>
          </ul>

          <h2>6. Sécurité</h2>
          <p>Nous mettons en œuvre les mesures suivantes pour protéger vos données :</p>
          <ul>
            <li>Chiffrement des communications via HTTPS/TLS</li>
            <li>Mots de passe stockés avec hachage bcrypt</li>
            <li>Accès aux données de production restreint et journalisé</li>
            <li>Authentification SSH par clé uniquement pour l'agent VPSly</li>
          </ul>

          <h2>7. Vos droits</h2>
          <p>Vous disposez des droits suivants : accès, rectification, effacement, portabilité et opposition.</p>
          <p>Pour exercer ces droits, contacte-nous à : <strong>privacy@vpsly.io</strong></p>

          <h2>8. Cookies</h2>
          <p>VPSly utilise uniquement des cookies strictement nécessaires au fonctionnement du service (session, CSRF).</p>

          <h2>9. Données des utilisateurs finaux</h2>
          <p>VPSly agit en qualité de sous-traitant technique. Vos données utilisateurs restent sur votre serveur.</p>

          <h2>10. Modifications</h2>
          <p>Nous nous réservons le droit de modifier cette politique. Vous serez notifié en cas de changement substantiel.</p>

          <h2>11. Contact</h2>
          <p>
            <strong>L'équipe VPSly</strong><br />
            Lomé, Togo<br />
            <a href="mailto:privacy@vpsly.io" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Mail size={14} color="#378ADD" /> privacy@vpsly.io
            </a>
            <a href="https://wa.me/22879012470" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <MessageCircle size={14} color="#378ADD" /> WhatsApp : +228 79012470
            </a>
            <a href="tel:+22879012470" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Phone size={14} color="#378ADD" /> Appel : +228 79012470
            </a>
          </p>
        </div>

        <div className="footer-mini">
          Conçu et opéré depuis Lomé, Togo 🇹🇬
        </div>
      </div>
    </div>
  )
}
