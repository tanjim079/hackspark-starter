// ─── PAGE: AVAILABILITY ───────────────────────────────────────────────────────
// Route: /availability
// Calls: GET /rentals/products/:id/availability?from=&to=  via api-gateway :8000

const AvailabilityPage = () => {
  const { t } = useTheme();
  const { checkProduct } = useNav();
  const { token } = useAuth();

  const [productId, setProductId] = React.useState(checkProduct?.id?.toString() || '');
  const [from,      setFrom]      = React.useState('2024-03-01');
  const [to,        setTo]        = React.useState('2024-03-31');
  const [result,    setResult]    = React.useState(null);
  const [loading,   setLoading]   = React.useState(false);
  const [error,     setError]     = React.useState('');

  const API = 'http://localhost:8000';

  const check = async () => {
    if (!productId || !from || !to) { setError('Please fill all fields'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(
        `${API}/rentals/products/${productId}/availability?from=${from}&to=${to}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error('Failed to check availability');
      setResult(await res.json());
    } catch {
      // Demo mock
      setResult({
        productId: Number(productId), from, to,
        available: false,
        busyPeriods: [
          { start: '2024-03-05', end: '2024-03-10' },
          { start: '2024-03-18', end: '2024-03-24' },
        ],
        freeWindows: [
          { start: '2024-03-01', end: '2024-03-04' },
          { start: '2024-03-11', end: '2024-03-17' },
          { start: '2024-03-25', end: '2024-03-31' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Calendar timeline grid ────────────────────────────────────────────────
  const renderTimeline = () => {
    if (!result) return null;
    const fromD    = new Date(from);
    const toD      = new Date(to);
    const totalDays = Math.ceil((toD - fromD) / 86400000) + 1;
    const days = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(fromD);
      d.setDate(d.getDate() + i);
      return d;
    });

    const inPeriod = (date, periods) =>
      periods.some(p => date >= new Date(p.start) && date <= new Date(p.end));

    return (
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textSec, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Timeline
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {days.map((d, i) => {
            const busy = inPeriod(d, result.busyPeriods);
            const free = inPeriod(d, result.freeWindows);
            return (
              <div key={i} title={d.toISOString().split('T')[0]} style={{
                width: 28, height: 28, borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontFamily: 'DM Mono', fontWeight: 500,
                background: busy ? t.error + '22' : free ? t.success + '22' : t.surfaceAlt,
                color:      busy ? t.error : free ? t.success : t.textMuted,
                border: `1px solid ${busy ? t.error + '44' : free ? t.success + '44' : t.border}`,
              }}>
                {d.getDate()}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {[{ color: t.error,   label: 'Busy' }, { color: t.success, label: 'Available' }].map(leg => (
            <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.textSec }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: leg.color + '44', border: `1px solid ${leg.color}66` }} />
              {leg.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Shell title="Availability Checker" subtitle="Check if a product is free for your dates">
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>

        {/* ── Form ── */}
        <Card style={{ padding: 24, alignSelf: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Product ID" value={productId} onChange={setProductId} placeholder="e.g. 42" icon="hash" />
            <Input label="From date"  type="date" value={from} onChange={setFrom} />
            <Input label="To date"    type="date" value={to}   onChange={setTo} />
            {error && <ErrorBox msg={error} />}
            <Btn onClick={check} disabled={loading} size="md" style={{ width: '100%', justifyContent: 'center' }}>
              {loading
                ? <><Spinner size={16} /> Checking…</>
                : <><Icon name="search" size={14} /> Check availability</>}
            </Btn>
          </div>
        </Card>

        {/* ── Results ── */}
        <div>
          {result ? (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Status banner */}
              <div style={{
                padding: '16px 20px', borderRadius: 12,
                background: result.available ? t.successBg : t.errorBg,
                border: `1px solid ${result.available ? t.success + '44' : t.error + '44'}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: result.available ? t.success + '22' : t.error + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={result.available ? 'check' : 'x'} size={18} color={result.available ? t.success : t.error} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: result.available ? t.success : t.error }}>
                    {result.available ? 'Available' : 'Not fully available'}
                  </div>
                  <div style={{ fontSize: 13, color: t.textSec }}>
                    Product #{result.productId} · {result.from} → {result.to}
                  </div>
                </div>
              </div>

              {/* Busy / Free columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Busy periods',  color: t.error,   periods: result.busyPeriods },
                  { label: 'Free windows',  color: t.success, periods: result.freeWindows },
                ].map(col => (
                  <Card key={col.label} style={{ padding: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: col.color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                      {col.label}
                    </div>
                    {col.periods.length === 0 ? (
                      <div style={{ fontSize: 13, color: t.textMuted }}>None</div>
                    ) : col.periods.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < col.periods.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                        <div style={{ flex: 1, fontSize: 13, fontFamily: 'DM Mono', color: t.text }}>{p.start}</div>
                        <Icon name="chevron-right" size={12} color={t.textMuted} />
                        <div style={{ flex: 1, fontSize: 13, fontFamily: 'DM Mono', color: t.text }}>{p.end}</div>
                      </div>
                    ))}
                  </Card>
                ))}
              </div>

              {/* Calendar */}
              <Card style={{ padding: 20 }}>{renderTimeline()}</Card>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: t.textMuted, padding: '80px 0' }}>
              <Icon name="calendar" size={40} />
              <p style={{ fontSize: 14 }}>Enter a product ID and date range to check availability</p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
};

Object.assign(window, { AvailabilityPage });
