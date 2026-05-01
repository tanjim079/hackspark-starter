// ─── TWEAKS PANEL ─────────────────────────────────────────────────────────────
// Floating settings panel — loaded first, no theme dependency

function useTweaks(defaults) {
  const [tweaks, setTweaks] = React.useState(() => {
    try {
      const stored = localStorage.getItem('rentpi_tweaks');
      return stored ? { ...defaults, ...JSON.parse(stored) } : { ...defaults };
    } catch { return { ...defaults }; }
  });

  const setTweak = (key, value) => {
    setTweaks(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem('rentpi_tweaks', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return { tweaks, setTweak };
}

function TweaksPanel({ title, children }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        title="Settings"
        style={{
          position: 'fixed', bottom: 72, right: 24, zIndex: 1000,
          width: 40, height: 40, borderRadius: '50%',
          background: '#0d1220', border: '1px solid #1e2d45',
          color: '#64748b', cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', transition: 'all 0.2s',
        }}
      >⚙</button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 120, right: 24, zIndex: 1000,
          width: 220, background: '#0d1220', border: '1px solid #1e2d45',
          borderRadius: 12, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
            {title}
          </div>
          {children}
        </div>
      )}
    </>
  );
}

function TweakSection({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: '#334155', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function TweakRadio({ label, value, onChange, options }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 5 }}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, padding: '5px 4px', borderRadius: 6, fontSize: 11, fontWeight: 500,
              cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
              background: value === opt.value ? '#22d3ee18' : 'transparent',
              borderColor: value === opt.value ? '#22d3ee88' : '#1e2d45',
              color: value === opt.value ? '#22d3ee' : '#64748b',
            }}
          >{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

function TweakSelect({ label, value, onChange, options }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '5px 8px', borderRadius: 6, fontSize: 12,
          background: '#080d1a', border: '1px solid #1e2d45',
          color: '#e2e8f0', cursor: 'pointer', outline: 'none',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

Object.assign(window, { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect });
