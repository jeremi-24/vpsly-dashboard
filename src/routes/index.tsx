import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from "react"
import { useAuthStore } from '@/stores/auth-store'
import { Zap, CloudDownload, Activity, Database, MessageCircle, Layers, Phone } from 'lucide-react'
import { Logo } from '@/assets/logo'
import logoWhiteBg from '@/assets/logo/logo_white_bg.png'
import logoBlackBg from '@/assets/logo/logo_black_bg.png'
import dashboardDark from '@/features/auth/sign-in/assets/dashboard_landing.png'

export const Route = createFileRoute('/')({
  component: VPSlyConceptA,
})

const PRIMARY = "#378ADD"
const DARK = "#042C53"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Manrope:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --primary: #378ADD;
    --dark: #042C53;
    --black: #0A0A0A;
    --white: #F5F4F0;
    --gray: #8A8A8A;
    --light: #EFEFEC;
    --rule: 2px solid #0A0A0A;
  }

  body {
    font-family: 'Manrope', sans-serif;
    background: var(--white);
    color: var(--black);
    overflow-x: hidden;
  }

  .display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
  .mono { font-family: 'DM Mono', monospace; }

  /* NAV */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: var(--white);
    border-bottom: var(--rule);
    padding: 0 clamp(1rem, 4vw, 4rem);
    display: flex; align-items: center; justify-content: space-between;
    height: 56px;
  }
  .nav-logo { display: flex; align-items: center; gap: 0.5rem; font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.05em; color: var(--black); text-decoration: none; }
  .nav-links { display: flex; gap: 2rem; }
  .nav-links a { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--black); text-decoration: none; opacity: 0.45; transition: opacity 0.15s; }
  .nav-links a:hover { opacity: 1; }
  .nav-cta { background: var(--black); color: var(--white); font-family: 'DM Mono', monospace; font-size: 11px; padding: 9px 18px; border: none; cursor: pointer; letter-spacing: 0.08em; text-transform: uppercase; transition: background 0.15s; text-decoration: none; }
  .nav-cta:hover { background: var(--primary); }

  /* TICKER */
  .ticker {
    background: var(--primary);
    padding: 8px 0;
    overflow: hidden;
    border-bottom: var(--rule);
  }
  .ticker-inner {
    display: flex; gap: 4rem;
    animation: ticker 20s linear infinite;
    white-space: nowrap;
  }
  .ticker-item { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--white); text-transform: uppercase; letter-spacing: 0.1em; display: flex; align-items: center; gap: 1rem; }
  .ticker-dot { width: 6px; height: 6px; background: var(--white); border-radius: 50%; display: inline-block; }
  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* HERO */
  .hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 56px);
    border-bottom: var(--rule);
  }
  .hero-left {
    padding: clamp(2rem, 5vw, 5rem) clamp(1rem, 4vw, 4rem);
    border-right: var(--rule);
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .hero-eyebrow { font-family: 'DM Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); font-weight: 500; margin-bottom: 1.5rem; }
  .hero-h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(58px, 7vw, 103px);
    line-height: 0.92;
    letter-spacing: 0.01em;
    color: var(--black);
  }
  .hero-h1 .accent { color: var(--primary); }
  .hero-sub {
    font-size: 15px; font-weight: 500; line-height: 1.7;
    color: #444; max-width: 38ch;
    margin-top: 2.5rem;
  }
  .hero-actions { display: flex; gap: 1rem; margin-top: 3rem; flex-wrap: wrap; }
  .btn-primary { background: var(--black); color: var(--white); font-family: 'DM Mono', monospace; font-size: 12px; padding: 14px 28px; border: 2px solid var(--black); cursor: pointer; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; text-decoration: none; display: inline-block; }
  .btn-primary:hover { background: var(--primary); border-color: var(--primary); }
  .btn-ghost { background: transparent; color: var(--black); font-family: 'DM Mono', monospace; font-size: 12px; padding: 14px 28px; border: 2px solid var(--black); cursor: pointer; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; text-decoration: none; display: inline-block; }
  .btn-ghost:hover { background: var(--black); color: var(--white); }

  .hero-stats { display: flex; gap: 2.5rem; padding-top: 2.5rem; border-top: 1px solid #ddd; margin-top: auto; }
  .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 42px; letter-spacing: 0.03em; color: var(--black); }
  .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray); margin-top: -4px; }

  /* HERO RIGHT — TERMINAL */
  .hero-right {
    background: var(--black);
    padding: clamp(3rem, 6vw, 6rem) clamp(2rem, 4vw, 4rem);
    display: flex; flex-direction: column; justify-content: flex-start; gap: 2.5rem;
    position: relative; overflow: hidden;
  }
  .hero-right::before {
    content: 'VPSly';
    font-family: 'Bebas Neue', sans-serif;
    font-size: 300px; color: rgba(255,255,255,0.02);
    position: absolute; bottom: -60px; right: -20px;
    line-height: 1; pointer-events: none;
    letter-spacing: 0.02em;
  }
  .terminal {
    background: #111;
    border: 1px solid #222;
    padding: 0;
    overflow: hidden;
    position: relative; z-index: 1;
  }
  .terminal-bar { background: #1a1a1a; padding: 10px 14px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #222; }
  .t-dot { width: 10px; height: 10px; border-radius: 50%; }
  .terminal-title { font-family: 'DM Mono', monospace; font-size: 11px; color: #555; margin-left: 8px; }
  .terminal-body { padding: 20px; min-height: 200px; }
  .t-line { font-family: 'DM Mono', monospace; font-size: 12px; line-height: 2; display: block; }
  .t-prompt { color: #378ADD; }
  .t-cmd { color: #F5F4F0; }
  .t-output { color: #4CAF50; }
  .t-output.dim { color: #555; }
  .t-cursor { display: inline-block; width: 8px; height: 14px; background: #378ADD; animation: blink 1s step-end infinite; vertical-align: middle; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

  .badge.active { border-color: var(--primary); color: var(--primary); }

  .dashboard-peek-img {
    position: absolute;
    top: 2%;
    left: 1%;
    width: 300%;
    height: auto;
    border-radius: 12px;
    object-fit: cover;
    object-position: top left;
    z-index: 1;
    opacity: 0;
    transform: translateX(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }
  .dashboard-peek-img.visible {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }

  .hero-content-wrapper { position: relative; width: 100%; z-index: 2; transition: opacity 0.4s; }
  .fade-out { opacity: 0; pointer-events: none; }

  /* SECTION PROBLEM */
  .section-problem {
    display: grid; grid-template-columns: 1fr 1fr;
    border-bottom: var(--rule);
  }
  .sp-left { background: var(--black); color: var(--white); padding: clamp(3rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem); border-right: 2px solid #222; }
  .sp-right { padding: clamp(3rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem); background: var(--white); }
  .section-label { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: var(--gray); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; }
  .section-label::before { content: ''; display: inline-block; width: 24px; height: 1px; background: currentColor; }
  .big-num { font-family: 'Bebas Neue', sans-serif; font-size: clamp(60px, 8vw, 120px); line-height: 1; color: var(--primary); }

  .problem-list { margin-top: 2rem; display: flex; flex-direction: column; gap: 0; }
  .problem-item { padding: 1.25rem 0; border-bottom: 1px solid #222; display: flex; gap: 1rem; align-items: flex-start; }
  .problem-item:last-child { border-bottom: none; }
  .p-cross { font-family: 'DM Mono', monospace; font-size: 21px; color: #FF5F57; flex-shrink: 0; margin-top: 2px; }
  .p-text { font-size: 18px; font-weight: 700; color: #aaa; line-height: 1.5; }

  .solution-list { margin-top: 2rem; display: flex; flex-direction: column; gap: 0; }
  .solution-item { padding: 1.25rem 0; border-bottom: 1px solid #e5e5e5; display: flex; gap: 1rem; align-items: flex-start; }
  .solution-item:last-child { border-bottom: none; }
  .s-num { font-family: 'DM Mono', monospace; font-size: 21px; color: var(--primary); flex-shrink: 0; margin-top: 2px; }
  .s-title { font-size: 18px; font-weight: 700; color: var(--black); }
  .s-desc { font-size: 14px; color: var(--gray); margin-top: 4px; }

  /* FEATURES */
  .section-features { border-bottom: var(--rule); }
  .feat-header { padding: clamp(3rem, 5vw, 5rem) clamp(1rem, 4vw, 4rem); display: flex; align-items: flex-end; justify-content: space-between; border-bottom: var(--rule); flex-wrap: wrap; gap: 1.5rem; }
  .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
  .feat-item { padding: clamp(2rem, 3vw, 3rem) clamp(1rem, 3vw, 3rem); border-right: var(--rule); border-bottom: var(--rule); transition: background 0.2s; }
  .feat-item:nth-child(3n) { border-right: none; }
  .feat-item:nth-last-child(-n+3) { border-bottom: none; }
  .feat-item:hover { background: var(--black); }
  .feat-item:hover .feat-title { color: var(--white); }
  .feat-item:hover .feat-text { color: #aaa; }
  .feat-num { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--gray); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 1.5rem; }
  .feat-icon { margin-bottom: 1.5rem; }
  .feat-title { font-size: 20px; font-weight: 800; color: var(--black); margin-bottom: 0.75rem; transition: color 0.2s; }
  .feat-text { font-size: 18px; color: var(--gray); line-height: 1.6; transition: color 0.2s; }

  /* POUR QUI */
  .section-audience { display: grid; grid-template-columns: 1fr 1fr; border-bottom: var(--rule); }
  .aud-item { padding: clamp(3rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem); border-right: var(--rule); }
  .aud-item:last-child { border-right: none; }
  .aud-tag { display: inline-block; font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; padding: 5px 10px; border: 1px solid var(--black); color: var(--black); margin-bottom: 2rem; }
  .aud-h { font-family: 'Bebas Neue', sans-serif; font-size: clamp(42px, 5vw, 72px); line-height: 1; color: var(--black); margin-bottom: 1.5rem; }
  .aud-desc { font-size: 18px; color: var(--gray); line-height: 1.7; max-width: 36ch; }
  .aud-metrics { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ddd; display: flex; gap: 2.5rem; }
  .aud-metric-num { font-family: 'Bebas Neue', sans-serif; font-size: 52px; color: var(--primary); }
  .aud-metric-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); margin-top: -4px; }

  /* PRICING */
  .section-pricing { background: var(--black); border-bottom: var(--rule); }
  .pricing-header { padding: clamp(3rem, 5vw, 5rem) clamp(1rem, 4vw, 4rem); border-bottom: 2px solid #1a1a1a; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; }
  .pricing-header h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(60px, 8vw, 120px); line-height: 0.9; color: var(--white); }
  .toggle-row { display: flex; gap: 0; background: #111; border: 1px solid #222; }
  .toggle-btn { background: transparent; color: #555; font-family: 'DM Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; padding: 10px 20px; border: none; cursor: pointer; transition: all 0.15s; }
  .toggle-btn.active { background: var(--primary); color: var(--white); }

  .pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
  .plan-card { padding: clamp(2rem, 3vw, 3rem); border-right: 2px solid #111; border-bottom: 2px solid #111; display: flex; flex-direction: column; position: relative; transition: background 0.2s; }
  .plan-card:hover { background: #0d0d0d; }
  .plan-card.popular { background: var(--primary); border-color: var(--primary); }
  .plan-card.popular:hover { background: #2a78cc; }
  .plan-tag { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #555; margin-bottom: 2rem; }
  .plan-card.popular .plan-tag { color: rgba(255,255,255,0.6); }
  .plan-name { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: var(--white); letter-spacing: 0.03em; }
  .plan-card.popular .plan-name { color: var(--white); }
  .plan-price { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 1; color: var(--white); margin: 1.5rem 0 0.5rem; }
  .plan-period { font-family: 'DM Mono', monospace; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.1em; }
  .plan-card.popular .plan-period { color: rgba(255,255,255,0.6); }
  .plan-divider { height: 1px; background: #1a1a1a; margin: 2rem 0; }
  .plan-card.popular .plan-divider { background: rgba(255,255,255,0.2); }
  .plan-features { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem; margin-top: 1rem; }
  .plan-feat { display: flex; gap: 0.5rem; align-items: center; }
  .plan-feat-header { grid-column: 1 / -1; margin-top: 1rem !important; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.25rem; }
  .plan-card:not(.popular) .plan-feat-header { border-color: rgba(0,0,0,0.1); }
  .plan-feat-check { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--primary); flex-shrink: 0; }
  .plan-card.popular .plan-feat-check { color: var(--white); }
  .plan-feat-text { font-size: 15px; font-weight: 600; color: #888; }
  .plan-card.popular .plan-feat-text { color: rgba(255,255,255,0.85); }
  .plan-cta { margin-top: 2.5rem; display: block; text-align: center; padding: 14px; font-family: 'DM Mono', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; border: 2px solid #333; color: #888; text-decoration: none; transition: all 0.15s; }
  .plan-cta:hover { border-color: var(--primary); color: var(--primary); }
  .plan-card.popular .plan-cta { background: var(--white); color: var(--primary); border-color: transparent; }
  .plan-card.popular .plan-cta:hover { background: var(--dark); color: var(--white); }

  /* CTA BOTTOM */
  .section-cta {
    display: grid; grid-template-columns: 1fr 1fr;
    border-bottom: var(--rule);
  }
  .cta-left { padding: clamp(4rem, 7vw, 8rem) clamp(1rem, 4vw, 4rem); border-right: var(--rule); }
  .cta-left h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(64px, 8vw, 120px); line-height: 0.92; color: var(--black); }
  .cta-left h2 em { font-style: normal; color: var(--primary); }
  .cta-right { background: var(--black); padding: clamp(4rem, 7vw, 8rem) clamp(1rem, 4vw, 4rem); display: flex; flex-direction: column; justify-content: space-between; }
  .cta-desc { font-size: 15px; font-weight: 500; color: #888; line-height: 1.7; max-width: 36ch; }
  .cta-actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 3rem; }
  .btn-white { background: var(--white); color: var(--black); font-family: 'DM Mono', monospace; font-size: 12px; padding: 16px 28px; border: 2px solid var(--white); cursor: pointer; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; text-decoration: none; display: inline-block; text-align: center; }
  .btn-white:hover { background: var(--primary); border-color: var(--primary); color: var(--white); }
  .btn-outline-white { background: transparent; color: var(--white); font-family: 'DM Mono', monospace; font-size: 12px; padding: 16px 28px; border: 2px solid #333; cursor: pointer; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; text-decoration: none; display: inline-block; text-align: center; }
  .btn-outline-white:hover { border-color: var(--white); }
  .cta-note { font-family: 'DM Mono', monospace; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2rem; }

  /* FOOTER */
  footer { background: var(--white); padding: clamp(3rem, 5vw, 5rem) clamp(1rem, 4vw, 4rem); border-top: var(--rule); }
  .footer-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 3rem; flex-wrap: wrap; margin-bottom: 4rem; }
  .footer-brand { font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 0.05em; }
  .footer-tagline { font-size: 12px; color: var(--gray); margin-top: 0.5rem; max-width: 28ch; line-height: 1.6; }
  .footer-links { display: flex; gap: 5rem; }
  .footer-col h4 { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: var(--gray); margin-bottom: 1.5rem; }
  .footer-col a { display: block; font-size: 13px; font-weight: 600; color: var(--black); text-decoration: none; margin-bottom: 0.75rem; opacity: 0.5; transition: opacity 0.15s; }
  .footer-col a:hover { opacity: 1; }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid #ddd; flex-wrap: wrap; gap: 1rem; }
  .footer-copy { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--gray); text-transform: uppercase; letter-spacing: 0.1em; }
  .footer-status { display: flex; align-items: center; gap: 0.5rem; font-family: 'DM Mono', monospace; font-size: 10px; color: var(--gray); text-transform: uppercase; letter-spacing: 0.1em; }
  .status-dot { width: 6px; height: 6px; background: #4CAF50; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  @media (max-width: 900px) {
    .hero, .section-problem, .section-audience, .section-cta { grid-template-columns: 1fr; }
    .hero-left { border-right: none; border-bottom: var(--rule); }
    .sp-left { border-right: none; border-bottom: var(--rule); }
    .aud-item { border-right: none; border-bottom: var(--rule); }
    .aud-item:last-child { border-bottom: none; }
    .cta-left { border-right: none; border-bottom: var(--rule); }
    .feat-grid { grid-template-columns: 1fr 1fr; }
    .feat-item:nth-child(3n) { border-right: var(--rule); }
    .feat-item:nth-child(2n) { border-right: none; }
    .pricing-grid { grid-template-columns: 1fr; }
    .nav-links { display: none; }
    .footer-links { flex-direction: column; gap: 2.5rem; }
  }

  @media (max-width: 540px) {
    .feat-grid { grid-template-columns: 1fr; }
    .feat-item { border-right: none !important; }
  }
`

const TERMINAL_LINES = [
  { type: "prompt", text: "vpsly connect ssh://root@45.90.12.44" },
  { type: "output", text: "✓ Connexion établie" },
  { type: "output", text: "✓ Agent VPSly v1.2.0 détecté" },
  { type: "prompt", text: "vpsly deploy --app laravel-crm --branch main" },
  { type: "output", text: "→ Clonage du dépôt GitHub..." },
  { type: "output", text: "→ Installation des dépendances..." },
  { type: "output", text: "→ Génération SSL (Let's Encrypt)..." },
  { type: "output", text: "✓ Déployé sur https://crm.agence-lome.tg" },

]

function Terminal({ onComplete }: { onComplete?: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0)
  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) {
      if (onComplete) {
        const t = setTimeout(onComplete, 800)
        return () => clearTimeout(t)
      }
      return
    }
    const t = setTimeout(() => setVisibleLines(v => v + 1), visibleLines === 0 ? 300 : 420)
    return () => clearTimeout(t)
  }, [visibleLines, onComplete])
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <div className="t-dot" style={{ background: "#FF5F57" }} />
        <div className="t-dot" style={{ background: "#FEBC2E" }} />
        <div className="t-dot" style={{ background: "#28C840" }} />
        <span className="terminal-title">vpsly-cli — bash</span>
      </div>
      <div className="terminal-body">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <span key={i} className={`t-line ${line.type === "prompt" ? "" : line.type === "dim" ? "t-output dim" : "t-output"}`}>
            {line.type === "prompt" && <span className="t-prompt">$ </span>}
            <span className={line.type === "prompt" ? "t-cmd" : ""}>{line.text}</span>
          </span>
        ))}
        {visibleLines < TERMINAL_LINES.length && (
          <span className="t-line"><span className="t-prompt">$ </span><span className="t-cursor" /></span>
        )}
      </div>
    </div>
  )
}

export default function VPSlyConceptA() {
  const { auth } = useAuthStore()
  const isLoggedIn = !!auth.accessToken
  const [isAnnual, setIsAnnual] = useState(false)
  const [copied, setCopied] = useState(false)
  const [terminalFinished, setTerminalFinished] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText("curl -fsSL vpsly.io/install | bash")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const plans = [
    {
      id: "starter", tag: "01 / Starter", name: "Starter (Pour débuter)",
      price: "0", period: "",
      popular: false,
      features: [
        "1 serveur connecté",
        "Applications illimitées",
        "Pas de collaborateur",
        "Domaine auto (*.sslip.io)",
        "1 base de données",
        "Support par email"
      ],
    },
    {
      id: "pro", tag: "02 / Pro", name: "Pro (Agence & Freelances)",
      price: isAnnual ? "59 000" : "5 800",
      period: isAnnual ? "FCFA / an" : "FCFA / mois",
      popular: true,
      features: [
        "3 serveurs connectés",
        "Applications illimitées",
        "5 collaborateurs",
        "Domaines perso + HTTPS",
        "Backups auto",
        //"Rollback 1 clic", 
        //"Logs 90 jours",
        "Alertes WhatsApp",
        "Monitoring complet",
        "WhatsApp 24h"
      ],
    },
  ]

  const features = [
    { icon: <Zap size={32} color="var(--primary)" />, title: "Déploiement auto", text: "Ton app en ligne après chaque push GitHub. Zéro intervention manuelle." },
    { icon: <CloudDownload size={32} color="var(--primary)" />, title: "SSL intégré", text: "Certificats HTTPS générés et renouvelés automatiquement." },
    { icon: <Activity size={32} color="var(--primary)" />, title: "Monitoring live", text: "CPU, RAM, disque — visible en temps réel depuis ton dashboard." },
    { icon: <Database size={32} color="var(--primary)" />, title: "Backups", text: "Sauvegardes quotidiennes. Restauration en un seul clic." },
    { icon: <MessageCircle size={32} color="var(--primary)" />, title: "Alertes WhatsApp", text: "Notification immédiate en cas de crash ou problème critique." },
    { icon: <Layers size={32} color="var(--primary)" />, title: "Multi-client", text: "Plusieurs clients sur un seul VPS, totalement isolés." },
  ]

  const tickerItems = [
    "Déploiement automatique", "SSL gratuit", "Backups automatiques",
    "Sécurité", "Monitoring live", "Alertes WhatsApp",
    "Déploiement automatique", "SSL gratuit", "Backups automatiques",
    "Sécurité", "Monitoring live", "Alertes WhatsApp",
  ]

  return (
    <>
      <style>{styles}</style>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-inner">
          {tickerItems.map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <img src={logoWhiteBg} alt="Logo VPSly" style={{ width: 32, height: 32, borderRadius: 6 }} />
          VPSly
        </a>
        <div className="nav-links">
          <a href="#produit">Produit</a>
          <a href="#pour-qui">Pour qui</a>
          <a href="#tarifs">Tarifs</a>
        </div>
        <Link to="/dashboard" className="nav-cta">{isLoggedIn ? 'Aller au Dashboard →' : 'Connecter mon VPS →'}</Link>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div>
            <h1 className="hero-h1 display">
              Déployez<br />
              vos applications<br />
              <span className="accent">Sur</span><br />
              <span className="accent">votre VPS.</span>
            </h1>
            <p className="hero-sub">
              Connectez votre propre serveur (Hetzner, DigitalOcean, AWS...) et laissez VPSly gérer le déploiement, le SSL et le monitoring.
              <br /><br />
              <strong>Nous ne vendons pas de serveurs. Nous les rendons intelligents.</strong>
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn-primary">{isLoggedIn ? 'Aller au Dashboard' : 'Connecter mon VPS'}</Link>
              <a href="#tarifs" className="btn-ghost">Voir les tarifs</a>
            </div>
          </div>

          <div className="hero-stats">
            <div>
              <div className="stat-num display">+20</div>
              <div className="stat-label">Projets déployés</div>
            </div>
            <div>
              <div className="stat-num display">+2</div>
              <div className="stat-label">Agences partenaires</div>
            </div>
            <div>
              <div className="stat-num display">100%</div>
              <div className="stat-label">Automatisé</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <svg width="100%" viewBox="0 0 400 720" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style>{`
        .vps-pulse { animation: vpsPulse 2s ease-in-out infinite; }
        @keyframes vpsPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>
            </defs>

            {/* Section labels */}
            <text x="200" y="20" fontFamily="'DM Mono',monospace" fontSize="20" fill="#9c9c9cff" letterSpacing="1" textAnchor="middle">VOTRE VPS</text>

            {/* VPS cards TOP */}
            {[
              { x: 25, logo: "https://international.eco.de/wp-content/uploads/2018/02/hetzner-logo-clear-space.png", name: "Hetzner" },
              { x: 145, logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/DigitalOcean_logo.svg", name: "DigitalOcean" },
              { x: 265, logo: "https://www.lws-hosting.ch/img/logo_lws.png", name: "LWS" },
            ].map(({ x, logo, name }) => (
              <g key={name}>
                <rect x={x} y="40" width="110" height="85" rx="10" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
                <rect x={x + 35} y="52" width="40" height="40" rx="8" fill="#222" />
                <image x={x + 39} y="56" width="32" height="32" href={logo} preserveAspectRatio="xMidYMid meet" />
                <text x={x + 55} y="110" fontFamily="'Manrope',sans-serif" fontSize="12" fill="white" fontWeight="700" textAnchor="middle">{name}</text>
              </g>
            ))}

            {/* Connector lines TOP → CENTER */}
            {[80, 200, 320].map((cx, i) => (
              <path key={i} d={`M ${cx} 125 C ${cx} 200 200 240 200 300`} fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
            ))}

            {/* CENTER AGENT */}
            <rect x="145" y="300" width="110" height="90" rx="14" fill="#1a2a3a" stroke="#378ADD" strokeWidth="1.5" />
            <image x="175" y="310" width="50" height="50" href={logoBlackBg} preserveAspectRatio="xMidYMid meet" />
            <text x="200" y="375" fontFamily="'Bebas Neue',sans-serif" fontSize="16" fill="white" textAnchor="middle" letterSpacing="1">VPSly</text>

            {/* Connector lines CENTER → BOTTOM */}
            {[80, 140, 200, 260, 320].map((cx, i) => (
              <path key={i} d={`M 200 390 C 200 450 ${cx} 500 ${cx} 560`} fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
            ))}

            {/* APP cards BOTTOM */}
            {[
              { x: 20, y: 560, name: "CRM", sub: "crm.tg" },
              { x: 95, y: 560, name: "SaaS", sub: "app.io" },
              { x: 170, y: 560, name: "API", sub: "api.com" },
              { x: 245, y: 560, name: "Web", sub: "site.tg" },
              { x: 320, y: 560, name: "Blog", sub: "blog.tg" },
            ].map(({ x, y, name, sub }) => (
              <g key={name}>
                <rect x={x} y={y} width="60" height="70" rx="8" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
                <circle cx={x + 30} cy={y + 15} r="4" fill="#4CAF50" className="vps-pulse" />
                <text x={x + 30} y={y + 40} fontFamily="'Manrope',sans-serif" fontSize="10" fill="white" fontWeight="700" textAnchor="middle">{name}</text>
                <text x={x + 30} y={y + 55} fontFamily="'DM Mono',monospace" fontSize="8" fill="#555" textAnchor="middle">{sub}</text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="section-problem">
        <div className="sp-left">
          <div className="section-label" style={{ color: "#555" }}>Le problème</div>
          <div className="big-num display">04</div>
          <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7, marginTop: "1rem", maxWidth: "36ch" }}>Problèmes qui te ralentissent souvent</p>
          <div className="problem-list">
            {[
              "Vercel vous facture des sommes imprévues qui explosent votre budget.",
              "Vous déployez à la main. Pull, SSH, Nginx, erreurs, recommencer.",
              "Vous avez essayé une alternative self-host. Deux jours de config pour un résultat instable.",
              "Vous gérez 5 projets sur le même VPS. Tout est mélangé.",
            ].map((t, i) => (
              <div key={i} className="problem-item">
                <span className="p-cross mono">✕</span>
                <span className="p-text">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="sp-right">
          <div className="section-label">La solution</div>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 5vw, 72px)", lineHeight: 1, color: "var(--black)", marginBottom: "0.5rem" }} className="display">
            Ce que VPSly fait<br />à votre place.
          </h3>
          <p style={{ fontSize: 14, color: "var(--gray)", lineHeight: 1.7, maxWidth: "38ch", marginBottom: "0.5rem" }}>
            VPSly s'installe sur votre VPS et connecte tout depuis un dashboard centralisé.
          </p>
          <div className="solution-list">
            {[
              { t: "Push → Live", d: "Votre app en ligne après chaque commit." },
              { t: "HTTPS automatique", d: "SSL généré et renouvelé sans intervention." },
              { t: "Monitoring intégré", d: "CPU, RAM, disque — tout visible en direct." },
              { t: "Backups automatiques", d: "Générer des sauvegardes de votre application." },
            ].map((item, i) => (
              <div key={i} className="solution-item">
                <span className="s-num mono">0{i + 1}</span>
                <div>
                  <div className="s-title">{item.t}</div>
                  <div className="s-desc">{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section-features" id="produit">
        <div className="feat-header">
          <div>
            <div className="section-label">Fonctionnalités</div>
            <h2 className="display" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 6vw, 80px)", lineHeight: 1 }}>
              Tout ce dont vous avez besoin<br />
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--gray)", maxWidth: "28ch", lineHeight: 1.7, fontWeight: 500 }}>
            Pas de configuration complexe. Pas de CLI cryptique. VPSly s'occupe de tout.
          </p>
        </div>
        <div className="feat-grid">
          {features.map((f, i) => (
            <div key={i} className="feat-item">
              <div className="feat-num mono">0{i + 1}</div>
              <div className="feat-icon">
                {f.icon}
              </div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-text">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* POUR QUI */}
      <section className="section-audience" id="pour-qui">
        <div className="aud-item">
          <div className="aud-tag mono">Pour qui — 01</div>
          <h3 className="aud-h display">Développeurs<br />& Agences</h3>
          <p className="aud-desc">Freelance ou agence web gérant des projets Laravel, Node.js, React pour plusieurs clients. Tu as besoin de déployer vite et souvent.</p>
          <div className="aud-metrics">
            <div>
              <div className="aud-metric-num display">3×</div>
              <div className="aud-metric-label">Plus rapide</div>
            </div>
            <div>
              <div className="aud-metric-num display">60%</div>
              <div className="aud-metric-label">Moins cher</div>
            </div>
          </div>
        </div>
        <div className="aud-item">
          <div className="aud-tag mono">Pour qui — 02</div>
          <h3 className="aud-h display">Entrepreneurs<br />Digitaux</h3>
          <p className="aud-desc">Tu diriges une équipe et tu veux un contrôle total sur tes mises en production. Centralise tes projets, collabore efficacement et garde la main sur ton infrastructure.</p>
          <div className="aud-metrics">
            <div>
              <div className="aud-metric-num display">10+</div>
              <div className="aud-metric-label">Clients / VPS</div>
            </div>
            <div>
              <div className="aud-metric-num display">Souveraineté</div>
              <div className="aud-metric-label">des données</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section-pricing" id="tarifs">
        <div className="pricing-header">
          <div>
            <h2 className="display">Tarifs simples.</h2>
            <p style={{ color: '#555', fontSize: '11px', marginTop: '0.5rem', textTransform: 'uppercase' }} className="mono">
              * Les serveurs ne sont pas fournis. Vous connectez vos propres VPS.
            </p>
          </div>
          <div className="toggle-row">
            <button className={`toggle-btn mono ${!isAnnual ? "active" : ""}`} onClick={() => setIsAnnual(false)}>Mensuel</button>
            <button className={`toggle-btn mono ${isAnnual ? "active" : ""}`} onClick={() => setIsAnnual(true)}>Annuel</button>
          </div>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`plan-card ${plan.popular ? "popular" : ""}`}>
              <div className="plan-tag mono">{plan.tag}</div>
              <div className="plan-name display">{plan.name}</div>
              <div className="plan-price display">{plan.price}</div>
              <div className="plan-period mono">{plan.period}</div>
              <div className="plan-divider" />
              <div className="plan-features">
                {plan.features.map((f, i) => {
                  const isHeader = f.startsWith('SECTION:');
                  const label = isHeader ? f.replace('SECTION:', '') : f;
                  return (
                    <div key={i} className={`plan-feat ${isHeader ? 'plan-feat-header' : ''}`} style={isHeader ? { marginTop: '0.5rem', marginBottom: '0.25rem' } : {}}>
                      {!isHeader && <span className="plan-feat-check mono">→</span>}
                      <span className={`plan-feat-text ${isHeader ? 'mono' : ''}`} style={isHeader ? { color: plan.popular ? 'var(--white)' : 'var(--primary)', fontSize: '9px', textTransform: 'uppercase', opacity: 0.8 } : {}}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <a href={plan.id === 'pro' ? "https://wa.me/22879012470" : "#"} className="plan-cta mono">
                {plan.id === 'pro' ? "Démarrer (WhatsApp)" : "Démarrer maintenant"}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-cta">
        <div className="cta-left">
          <div className="section-label">Prêt à démarrer</div>
          <h2 className="display">
            Héberge.<br />
            Déploie.<br />
            <em>Garde le</em><br />
            <em>contrôle.</em>
          </h2>
        </div>
        <div className="cta-right">
          <div>
            <div className="section-label" style={{ color: "#333" }}>— Ce que vous gagnez</div>
            <p className="cta-desc">
              Rejoignez les agences et développeurs de l'Afrique qui livrent leurs projets 3× plus vite avec VPSly.
            </p>
            <div className="cta-actions">
              <Link to="/dashboard" className="btn-white">{isLoggedIn ? 'Accéder au Dashboard' : 'Démarrer gratuitement'}</Link>
              <a href="https://wa.me/22879012470" target="_blank" rel="noopener noreferrer" className="btn-outline-white">Discuter sur WhatsApp →</a>
            </div>
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#333", marginTop: "3rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="status-dot" />
            <span style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>Systèmes opérationnels</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand display">VPSly</div>
            <div className="footer-tagline">L'infrastructure cloud pensée pour l'Afrique de l'Ouest.</div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Ressources</h4>
              <a href="#">Documentation</a>
              <a href="https://wa.me/22879012470" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={14} color="var(--primary)" /> WhatsApp
              </a>
              <a href="tel:+22879012470" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} color="var(--primary)" /> +228 79012470
              </a>
              <a href="#">Communauté</a>
            </div>
            <div className="footer-col">
              <h4>Technologies</h4>
              <a href="#">PHP / Laravel</a>
              <a href="#">Node.js / Next.js</a>
              <a href="#">Python / Django</a>
              <a href="#">PostgreSql</a>
              <a href="#">Mysql</a>
              <a href="#">Redis</a>
            </div>
            <div className="footer-col">
              <h4>Légal</h4>
              <Link to="/privacy">Confidentialité</Link>
              <Link to="/terms">CGU</Link>
              <a href="#">Mentions</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy mono">© 2026 VPSly.</span>
          <div className="footer-status">
            <div className="status-dot" />
            <span>Operational</span>
          </div>
        </div>
      </footer>
    </>
  )
}