import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  Activity, ArrowDownRight, ArrowUpRight, AudioWaveform, BarChart3, Bell,
  CalendarDays, Check, ChevronDown, CircleHelp, Clapperboard, Command,
  Compass, CreditCard, FileText, Flame, Gauge, LayoutDashboard, Lightbulb,
  LogOut, Menu, Plus, Search, Settings, ShieldCheck, Sparkles, Target,
  TrendingUp, WandSparkles, X, Zap,
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

type Section = 'Dashboard' | 'Account Audit' | 'Viral Radar' | 'AI Strategy' | 'Video Analyzer' | 'Script Writer' | 'Content Calendar' | 'Projects' | 'Billing' | 'Settings'
const nav: { label: Section; icon: typeof LayoutDashboard; group: string }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, group: 'WORKSPACE' },
  { label: 'Account Audit', icon: Gauge, group: 'WORKSPACE' },
  { label: 'Viral Radar', icon: Flame, group: 'WORKSPACE' },
  { label: 'AI Strategy', icon: Lightbulb, group: 'CREATE' },
  { label: 'Video Analyzer', icon: Clapperboard, group: 'CREATE' },
  { label: 'Script Writer', icon: FileText, group: 'CREATE' },
  { label: 'Content Calendar', icon: CalendarDays, group: 'MANAGE' },
  { label: 'Projects', icon: Compass, group: 'MANAGE' },
  { label: 'Billing', icon: CreditCard, group: 'ACCOUNT' },
  { label: 'Settings', icon: Settings, group: 'ACCOUNT' },
]

function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy(true); setMessage('')
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (result.error) setMessage(result.error.message)
    else if (mode === 'signup' && !result.data.session) setMessage('Revisá tu correo para confirmar la cuenta y luego iniciá sesión.')
  }
  return <main className="auth-shell"><div className="auth-art"><div className="brand"><span className="brand-mark"><Sparkles size={19}/></span> vyral</div><div className="art-copy"><span className="eyebrow">CONTENT INTELLIGENCE PLATFORM</span><h1>Dejá de publicar<br/>a ciegas<span className="gradient-text">.</span></h1><p>Entendé qué funciona, detectá oportunidades y convertí ideas en contenido con estrategia.</p><div className="art-stats"><div><strong>01</strong><span>Analizá</span></div><div><strong>02</strong><span>Descubrí</span></div><div><strong>03</strong><span>Creá</span></div></div></div><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/></div><section className="auth-panel"><div className="auth-card"><div className="mobile-brand brand"><span className="brand-mark"><Sparkles size={19}/></span> vyral</div><span className="eyebrow">TU PRÓXIMO NIVEL EMPIEZA ACÁ</span><h2>{mode === 'signup' ? 'Creá tu cuenta' : 'Qué bueno verte'}</h2><p className="muted">{mode === 'signup' ? 'Empezá a construir contenido con intención.' : 'Ingresá para continuar con tu workspace.'}</p><form onSubmit={submit}><label>Correo electrónico</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required/><label>Contraseña</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} required/><button className="primary full" disabled={busy}>{busy ? 'Un momento…' : mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'} <ArrowUpRight size={17}/></button></form>{message && <div className="notice">{message}</div>}<p className="switch-auth">{mode === 'signup' ? '¿Ya tenés cuenta?' : '¿Todavía no tenés cuenta?'} <button onClick={()=>{setMode(mode==='signup'?'login':'signup');setMessage('')}}>{mode === 'signup' ? 'Iniciá sesión' : 'Registrate'}</button></p><div className="secure-note"><ShieldCheck size={15}/> Acceso seguro con Supabase Auth</div></div></section></main>
}

function AppShell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [active, setActive] = useState<Section>('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAudit, setShowAudit] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')
  const email = session.user.email || 'Tu cuenta'
  const groups = [...new Set(nav.map(n=>n.group))]
  const current = nav.find(n=>n.label===active)!
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen?'sidebar-open':''}`}><div className="side-brand"><div className="brand"><span className="brand-mark"><Sparkles size={18}/></span> vyral</div><button className="icon-btn mobile-close" onClick={()=>setMenuOpen(false)}><X size={18}/></button></div><div className="workspace-switch"><div className="workspace-avatar">V</div><div><strong>Mi workspace</strong><small>Plan inicial</small></div><ChevronDown size={15}/></div><nav>{groups.map(group=><div className="nav-group" key={group}><span className="nav-caption">{group}</span>{nav.filter(n=>n.group===group).map(item=><button key={item.label} className={`nav-link ${active===item.label?'selected':''}`} onClick={()=>{setActive(item.label);setMenuOpen(false)}}><item.icon size={17}/><span>{item.label}</span>{item.label==='Viral Radar'&&<span className="nav-new">NEW</span>}</button>)}</div>)}</nav><div className="sidebar-bottom"><div className="help-card"><CircleHelp size={17}/><div><strong>¿Necesitás ayuda?</strong><small>Explorá la guía de Vyral</small></div></div><div className="user-row"><div className="user-avatar">{email.charAt(0).toUpperCase()}</div><div className="user-info"><strong>{email.split('@')[0]}</strong><small>{email}</small></div><button className="icon-btn" onClick={onLogout} title="Cerrar sesión"><LogOut size={16}/></button></div></div></aside>
    {menuOpen&&<button className="mobile-scrim" onClick={()=>setMenuOpen(false)} aria-label="Cerrar menú"/>}
    <main className="main-area"><header className="topbar"><div className="top-left"><button className="icon-btn menu-toggle" onClick={()=>setMenuOpen(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div></div><div className="top-actions"><div className="command-search"><Search size={15}/><span>Buscar en Vyral</span><kbd>⌘ K</kbd></div><button className="icon-btn notification"><Bell size={18}/><i/></button><div className="top-avatar">{email.charAt(0).toUpperCase()}</div></div></header>
    <div className="page-content">{active==='Dashboard'?<><div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> TU CENTRO DE CONTROL</div><h1>Buen día, <span>{email.split('@')[0]}</span> <span className="wave">✦</span></h1><p className="muted">Tu contenido merece una estrategia, no solamente suerte.</p></div><button className="primary" onClick={()=>setShowAudit(true)}><Plus size={17}/> Nuevo análisis</button></div><div className="hero-card"><div className="hero-glow"/><div className="hero-content"><span className="hero-tag"><Sparkles size={13}/> VYR﻿AL INTELLIGENCE</span><h2>Las ideas correctas<br/>cambian el <em>juego.</em></h2><p>Analizá tu presencia, encontrá patrones ganadores y creá contenido que conecte con tu audiencia.</p><button className="hero-button" onClick={()=>setActive('Account Audit')}>Explorar Account Audit <ArrowUpRight size={16}/></button></div><div className="hero-visual"><div className="visual-ring ring-a"/><div className="visual-ring ring-b"/><div className="visual-core"><AudioWaveform size={42}/></div><div className="float-chip chip-top"><TrendingUp size={15}/> Data-driven</div><div className="float-chip chip-bottom"><Zap size={14}/> Ideas en acción</div></div></div><div className="section-heading"><div><h3>Tu actividad</h3><p>El resumen de tu workspace</p></div><span className="period-pill">Desde el inicio <ChevronDown size={13}/></span></div><div className="metric-grid"><div className="metric-card"><div className="metric-top"><span>Análisis realizados</span><span className="metric-icon purple"><BarChart3 size={17}/></span></div><strong>—</strong><small><span className="metric-neutral">Sin actividad todavía</span></small></div><div className="metric-card"><div className="metric-top"><span>Ideas generadas</span><span className="metric-icon blue"><WandSparkles size={17}/></span></div><strong>—</strong><small><span className="metric-neutral">Tu creatividad empieza acá</span></small></div><div className="metric-card"><div className="metric-top"><span>Estructuras guardadas</span><span className="metric-icon orange"><Activity size={17}/></span></div><strong>—</strong><small><span className="metric-neutral">Descubrí patrones virales</span></small></div><div className="metric-card"><div className="metric-top"><span>Créditos disponibles</span><span className="metric-icon green"><Command size={17}/></span></div><strong>—</strong><small><span className="metric-neutral">Sistema de créditos pendiente</span></small></div></div><div className="section-heading quick-heading"><div><h3>Empezá por acá</h3><p>Herramientas para pasar de intuición a estrategia</p></div></div><div className="quick-grid"><button className="quick-card" onClick={()=>setActive('Account Audit')}><div className="quick-icon qi-purple"><Gauge size={19}/></div><div><strong>Auditá tu cuenta</strong><p>Encontrá oportunidades en tu perfil.</p></div><ArrowUpRight size={17}/></button><button className="quick-card" onClick={()=>setActive('Viral Radar')}><div className="quick-icon qi-orange"><Flame size={19}/></div><div><strong>Explorá tendencias</strong><p>Detectá formatos y temas en crecimiento.</p></div><ArrowUpRight size={17}/></button><button className="quick-card" onClick={()=>setActive('Script Writer')}><div className="quick-icon qi-blue"><FileText size={19}/></div><div><strong>Escribí un guion</strong><p>Transformá una idea en una pieza clara.</p></div><ArrowUpRight size={17}/></button></div></>:<div className="module-page"><div className="module-icon"><current.icon size={24}/></div><span className="eyebrow">VYR﻿AL WORKSPACE</span><h1>{active}</h1><p className="muted">{active==='Account Audit'?'Entendé qué comunica tu perfil y dónde están tus oportunidades de crecimiento.':active==='Viral Radar'?'Encontrá tendencias relevantes para tu nicho, plataforma e idioma.':active==='Script Writer'?'Convertí ideas en guiones originales con hooks, desarrollo y CTA.':'Organizá tu estrategia de contenido desde un solo lugar.'}</p>{active==='Account Audit'?<div className="tool-panel"><label>URL pública de tu perfil</label><div className="url-entry"><input value={profileUrl} onChange={e=>setProfileUrl(e.target.value)} placeholder="https://www.instagram.com/tuusuario/"/><button className="primary" onClick={()=>setShowAudit(true)} disabled={!profileUrl.trim()}>Preparar análisis <ArrowUpRight size={16}/></button></div><small>El análisis real se habilitará al conectar el proveedor de datos sociales. No necesitás compartir tu contraseña.</small></div>:null}<div className="coming-card"><div className="coming-symbol"><Sparkles size={20}/></div><div><strong>Estamos preparando esta herramienta</strong><p>La interfaz ya está lista. La conexión con IA y fuentes de datos se implementará en la siguiente etapa.</p></div><span className="status-pill">En preparación</span></div></div>}</div>
    </main>{showAudit&&<div className="modal-backdrop" onClick={()=>setShowAudit(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="icon-btn modal-close" onClick={()=>setShowAudit(false)}><X size={18}/></button><div className="modal-symbol"><Target size={22}/></div><span className="eyebrow">ACCOUNT AUDIT</span><h2>Tu análisis empieza acá</h2><p className="muted">La recepción de perfiles está preparada, pero el proveedor que obtiene datos públicos de Instagram y TikTok todavía no está conectado. Por eso aún no vamos a simular resultados.</p>{profileUrl&&<div className="url-preview">{profileUrl}</div>}<button className="primary full" onClick={()=>{setShowAudit(false);setActive('Account Audit')}}>Entendido</button></div></div>}</div>
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)})
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,next)=>setSession(next))
    return ()=>subscription.unsubscribe()
  }, [])
  if (!isSupabaseConfigured) return <div className="config-screen"><div className="brand"><span className="brand-mark"><Sparkles size={19}/></span> vyral</div><h1>Un último paso de configuración.</h1><p>Agregá las variables <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en el entorno de Cloudflare Pages para activar el acceso.</p></div>
  if (loading) return <div className="loading-screen"><div className="brand"><span className="brand-mark"><Sparkles size={19}/></span> vyral</div><div className="loader"/></div>
  return session ? <AppShell session={session} onLogout={()=>supabase?.auth.signOut()}/> : <AuthScreen/>
}