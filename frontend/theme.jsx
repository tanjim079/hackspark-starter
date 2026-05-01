// ─── RENTPI THEME & SHARED DESIGN SYSTEM ────────────────────────────────────
// Provides: ThemeCtx, AuthCtx, NavCtx, useTheme, useAuth, useNav
// Also exports: Icon, Badge, Btn, Input, Select, Card, Spinner, Skeleton, ErrorBox, Shell

const { createContext, useContext, useState } = React;

// ── Theme tokens ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: '#080d1a', bgAlt: '#0d1326', surface: '#111827', surfaceAlt: '#1a2235',
    border: 'rgba(255,255,255,0.07)', borderHover: 'rgba(255,255,255,0.14)',
    text: '#f0f4ff', textSec: '#8892a4', textMuted: '#4a5568',
    accent: '#22d3ee', accentBg: 'rgba(34,211,238,0.1)', accentHover: 'rgba(34,211,238,0.15)',
    success: '#10b981', warning: '#f59e0b', error: '#ef4444',
    successBg: 'rgba(16,185,129,0.1)', warningBg: 'rgba(245,158,11,0.1)', errorBg: 'rgba(239,68,68,0.1)',
    shadow: '0 4px 24px rgba(0,0,0,0.4)',
    shimmer: 'linear-gradient(90deg, #111827 25%, #1a2235 50%, #111827 75%)',
  },
  light: {
    bg: '#faf8f5', bgAlt: '#f3f0eb', surface: '#ffffff', surfaceAlt: '#fdf9f6',
    border: 'rgba(0,0,0,0.08)', borderHover: 'rgba(0,0,0,0.16)',
    text: '#1a1410', textSec: '#6b5e52', textMuted: '#a89880',
    accent: '#e85d04', accentBg: 'rgba(232,93,4,0.08)', accentHover: 'rgba(232,93,4,0.14)',
    success: '#059669', warning: '#d97706', error: '#dc2626',
    successBg: 'rgba(5,150,105,0.08)', warningBg: 'rgba(217,119,6,0.08)', errorBg: 'rgba(220,38,38,0.08)',
    shadow: '0 4px 24px rgba(0,0,0,0.08)',
    shimmer: 'linear-gradient(90deg, #ffffff 25%, #f3f0eb 50%, #ffffff 75%)',
  },
};

const ACCENT_HUES = {
  cyan:    { dark: '#22d3ee', light: '#e85d04' },
  violet:  { dark: '#a78bfa', light: '#7c3aed' },
  emerald: { dark: '#34d399', light: '#059669' },
};

// ── Contexts ──────────────────────────────────────────────────────────────────
const ThemeCtx = createContext(null);
const AuthCtx  = createContext(null);
const NavCtx   = createContext(null);

const useTheme = () => useContext(ThemeCtx);
const useAuth  = () => useContext(AuthCtx);
const useNav   = () => useContext(NavCtx);

// ── Category colors ───────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  ELECTRONICS: '#3b82f6', VEHICLES: '#8b5cf6', TOOLS: '#f59e0b',
  OUTDOOR: '#10b981', SPORTS: '#06b6d4', MUSIC: '#ec4899',
  FURNITURE: '#f97316', CAMERAS: '#84cc16', OFFICE: '#6366f1',
  DEFAULT: '#6b7280',
};

// ── Icon ──────────────────────────────────────────────────────────────────────
const ICON_PATHS = {
  home:            <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  package:         <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  calendar:        <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  'message-circle':<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
  user:            <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  'bar-chart':     <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  trending:        <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  logout:          <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  search:          <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  'chevron-right': <polyline points="9 18 15 12 9 6"/>,
  'chevron-left':  <polyline points="15 18 9 12 15 6"/>,
  'chevron-down':  <polyline points="6 9 12 15 18 9"/>,
  plus:            <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  send:            <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  x:               <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  sun:             <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
  moon:            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>,
  'refresh-cw':    <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
  clock:           <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  tag:             <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
  eye:             <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  star:            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  trash:           <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
  check:           <polyline points="20 6 9 17 4 12"/>,
  'alert-circle':  <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  award:           <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  percent:         <><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></>,
  hash:            <><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>,
  filter:          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
};

const Icon = ({ name, size = 18, color = 'currentColor', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {ICON_PATHS[name] || <circle cx="12" cy="12" r="10"/>}
  </svg>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ width = '100%', height = 20, radius = 6, style = {} }) => {
  const { t } = useTheme();
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: t.shimmer, backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite', ...style,
    }} />
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, small }) => {
  const { t } = useTheme();
  const color = CATEGORY_COLORS[label] || CATEGORY_COLORS.DEFAULT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '2px 7px' : '3px 9px',
      borderRadius: 999, fontSize: small ? 10 : 11,
      fontWeight: 600, letterSpacing: '0.04em', fontFamily: "'DM Mono', monospace",
      background: color + '22', color, border: `1px solid ${color}33`,
    }}>
      {label}
    </span>
  );
};

// ── Button ────────────────────────────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, style = {}, icon }) => {
  const { t, theme } = useTheme();
  const [hov, setHov] = useState(false);
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 13 },
    md: { padding: '9px 18px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 15 },
  };
  const variants = {
    primary:   { background: t.accent, color: theme === 'dark' ? '#080d1a' : '#fff', border: 'none', opacity: hov ? 0.88 : 1 },
    secondary: { background: hov ? t.surfaceAlt : t.surface, color: t.text, border: `1px solid ${t.border}` },
    ghost:     { background: hov ? t.accentHover : 'transparent', color: t.accent, border: `1px solid ${hov ? t.accent + '55' : 'transparent'}` },
    danger:    { background: hov ? t.errorBg : 'transparent', color: t.error, border: `1px solid ${hov ? t.error + '55' : t.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s', outline: 'none',
        opacity: disabled ? 0.5 : 1,
        ...sizes[size], ...variants[variant], ...style,
      }}>
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
};

// ── Input ─────────────────────────────────────────────────────────────────────
const Input = ({ label, type = 'text', value, onChange, placeholder, icon, error, style = {} }) => {
  const { t } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none' }}>
            <Icon name={icon} size={15} />
          </div>
        )}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: icon ? '10px 12px 10px 38px' : '10px 14px',
            background: t.surfaceAlt,
            border: `1px solid ${error ? t.error : focused ? t.accent : t.border}`,
            borderRadius: 8, fontSize: 14, color: t.text,
            fontFamily: 'DM Sans', outline: 'none', transition: 'border-color 0.15s',
          }} />
      </div>
      {error && <span style={{ fontSize: 12, color: t.error }}>{error}</span>}
    </div>
  );
};

// ── Select ────────────────────────────────────────────────────────────────────
const Select = ({ label, value, onChange, options, style = {} }) => {
  const { t } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '10px 36px 10px 14px',
            background: t.surfaceAlt, border: `1px solid ${t.border}`,
            borderRadius: 8, fontSize: 14, color: t.text,
            fontFamily: 'DM Sans', outline: 'none', cursor: 'pointer', appearance: 'none',
          }}>
          {options.map(o => <option key={o.value} value={o.value} style={{ background: t.surface }}>{o.label}</option>)}
        </select>
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: t.textMuted }}>
          <Icon name="chevron-down" size={15} />
        </div>
      </div>
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, onClick, hover = false }) => {
  const { t } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: t.surface, borderRadius: 12,
        border: `1px solid ${hov && hover ? t.borderHover : t.border}`,
        boxShadow: hov && hover ? t.shadow : 'none',
        transition: 'all 0.2s', cursor: onClick ? 'pointer' : 'default',
        transform: hov && hover ? 'translateY(-2px)' : 'none',
        ...style,
      }}>
      {children}
    </div>
  );
};

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ size = 20 }) => {
  const { t } = useTheme();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${t.border}`,
      borderTop: `2px solid ${t.accent}`,
      animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
};

// ── ErrorBox ──────────────────────────────────────────────────────────────────
const ErrorBox = ({ msg }) => {
  const { t } = useTheme();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', background: t.errorBg,
      border: `1px solid ${t.error}33`, borderRadius: 10,
      color: t.error, fontSize: 14,
    }}>
      <Icon name="alert-circle" size={16} />
      {msg}
    </div>
  );
};

// ── Shell (page wrapper) ──────────────────────────────────────────────────────
const Shell = ({ children, title, subtitle, actions }) => {
  const { t } = useTheme();
  return (
    <div style={{ paddingTop: 56, minHeight: '100vh', background: t.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 60px' }}>
        {(title || actions) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
            <div>
              {title && <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', marginBottom: 4 }}>{title}</h1>}
              {subtitle && <p style={{ fontSize: 14, color: t.textSec }}>{subtitle}</p>}
            </div>
            {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
          </div>
        )}
        <div className="fade-in">{children}</div>
      </div>
    </div>
  );
};

// ── Navbar ────────────────────────────────────────────────────────────────────
const NAV_PAGES = [
  { id: 'products',     label: 'Products',   icon: 'package' },
  { id: 'availability', label: 'Availability', icon: 'calendar' },
  { id: 'chat',         label: 'Assistant',  icon: 'message-circle' },
  { id: 'trending',     label: 'Trending',   icon: 'trending' },
  { id: 'analytics',   label: 'Analytics',  icon: 'bar-chart' },
  { id: 'profile',      label: 'Profile',    icon: 'user' },
];

const Navbar = () => {
  const { t, theme, toggleTheme } = useTheme();
  const { page, go } = useNav();
  const { user, logout } = useAuth();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: t.bg + 'ee', backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => go('products')}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent}99)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: theme === 'dark' ? '#080d1a' : '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'DM Mono' }}>R</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, color: t.text, letterSpacing: '-0.02em' }}>RentPi</span>
      </div>

      {/* Nav links */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV_PAGES.map(p => (
            <button key={p.id} onClick={() => go(p.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: page === p.id ? t.accentBg : 'transparent',
              color: page === p.id ? t.accent : t.textSec,
              fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, transition: 'all 0.15s',
            }}>
              <Icon name={p.icon} size={14} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={toggleTheme} style={{
          width: 34, height: 34, borderRadius: 8, border: `1px solid ${t.border}`,
          background: 'transparent', cursor: 'pointer', color: t.textSec,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
        }}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
        </button>
        {user && (
          <>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: t.accentBg, border: `1px solid ${t.accent}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.accent, fontSize: 12, fontWeight: 700,
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 7, border: `1px solid ${t.border}`,
              background: 'transparent', cursor: 'pointer', color: t.textSec,
              fontFamily: 'DM Sans', fontSize: 13, transition: 'all 0.15s',
            }}>
              <Icon name="logout" size={14} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

// ── Export all to window ──────────────────────────────────────────────────────
Object.assign(window, {
  THEMES, ACCENT_HUES, CATEGORY_COLORS,
  ThemeCtx, AuthCtx, NavCtx,
  useTheme, useAuth, useNav,
  Icon, Skeleton, Badge, Btn, Input, Select, Card, Spinner, ErrorBox, Shell, Navbar,
});
