// ─── PAGE: ANALYTICS ─────────────────────────────────────────────────────────
// Route: /analytics  (custom extra page)
// Calls:
//   GET /analytics/peak-window?from=&to=     — 7-day peak rental window
//   GET /analytics/surge-days?month=YYYY-MM  — daily surge data
//   GET /rentals/stats?group_by=category     — category rental counts

const MOCK_CATEGORY_STATS = [
  { category: 'ELECTRONICS', rental_count: 38420, avg_discount: 12.4 },
  { category: 'OUTDOOR',     rental_count: 29150, avg_discount: 9.8  },
  { category: 'SPORTS',      rental_count: 24800, avg_discount: 11.2 },
  { category: 'TOOLS',       rental_count: 19340, avg_discount: 8.5  },
  { category: 'VEHICLES',    rental_count: 15600, avg_discount: 14.2 },
  { category: 'CAMERAS',     rental_count: 12400, avg_discount: 10.1 },
  { category: 'MUSIC',       rental_count: 9870,  avg_discount: 7.6  },
  { category: 'FURNITURE',   rental_count: 7200,  avg_discount: 6.3  },
];

const MOCK_SURGE = [
  { date: '2024-03-01', count: 342, nextSurgeDate: '2024-03-04', daysUntil: 3 },
  { date: '2024-03-02', count: 289, nextSurgeDate: '2024-03-04', daysUntil: 2 },
  { date: '2024-03-03', count: 301, nextSurgeDate: '2024-03-04', daysUntil: 1 },
  { date: '2024-03-04', count: 412, nextSurgeDate: '2024-03-11', daysUntil: 7 },
  { date: '2024-03-05', count: 378, nextSurgeDate: '2024-03-11', daysUntil: 6 },
  { date: '2024-03-06', count: 295, nextSurgeDate: '2024-03-11', daysUntil: 5 },
  { date: '2024-03-07', count: 310, nextSurgeDate: '2024-03-11', daysUntil: 4 },
  { date: '2024-03-08', count: 355, nextSurgeDate: '2024-03-11', daysUntil: 3 },
  { date: '2024-03-09', count: 388, nextSurgeDate: '2024-03-11', daysUntil: 2 },
  { date: '2024-03-10', count: 401, nextSurgeDate: '2024-03-11', daysUntil: 1 },
  { date: '2024-03-11', count: 445, nextSurgeDate: null,          daysUntil: null },
];

const MOCK_PEAK = { from: '2024-03-10', to: '2024-03-16', totalRentals: 2847 };

const AnalyticsPage = () => {
  const { t } = useTheme();
  const { token } = useAuth();

  const [catStats,   setCatStats]   = React.useState(MOCK_CATEGORY_STATS);
  const [surgeData,  setSurgeData]  = React.useState(MOCK_SURGE);
  const [peakWindow, setPeakWindow] = React.useState(MOCK_PEAK);
  const [loading,    setLoading]    = React.useState(false);

  const API = 'http://localhost:8000';

  // Attempt to load live data; fall back to mock
  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catRes, surgeRes, peakRes] = await Promise.allSettled([
          fetch(`${API}/analytics/recommendations?date=2024-03-01&limit=8`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/analytics/surge-days?month=2024-03`,               { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/analytics/peak-window?from=2024-01&to=2024-06`,    { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (surgeRes.status === 'fulfilled') {
          const d = await surgeRes.value.json();
          if (d.data) setSurgeData(d.data);
        }
        if (peakRes.status === 'fulfilled') {
          const d = await peakRes.value.json();
          if (d.peakWindow) setPeakWindow(d.peakWindow);
        }
      } catch { /* use mock */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const maxCount = Math.max(...catStats.map(c => c.rental_count));
  const maxSurge = Math.max(...surgeData.map(d => d.count));

  // ── KPI tiles ────────────────────────────────────────────────────────────
  const KPIS = [
    { label: 'Total Rentals',  value: '10M+',       icon: 'package',   delta: 'all time'     },
    { label: 'Peak Day',       value: '445',        icon: 'trending',  delta: 'Mar 11, 2024' },
    { label: 'Top Category',   value: 'ELECTRONICS',icon: 'star',      delta: '38.4K rentals' },
    { label: 'Peak Window',    value: 'Mar 10–16',  icon: 'calendar',  delta: '2,847 rentals' },
  ];

  return (
    <Shell title="Analytics" subtitle="Rental trends, surge days, and category insights">

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {KPIS.map(kpi => (
          <Card key={kpi.label} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={kpi.icon} size={16} color={t.accent} />
              </div>
              <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.textMuted }}>{kpi.delta}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'DM Mono', color: t.text, marginBottom: 2 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: t.textSec }}>{kpi.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ── Category bar chart ── */}
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 20 }}>Rentals by Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {catStats.map(c => (
              <div key={c.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <Badge label={c.category} small />
                  <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: t.textSec }}>{c.rental_count.toLocaleString()}</span>
                </div>
                <div style={{ height: 5, background: t.surfaceAlt, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${(c.rental_count / maxCount) * 100}%`,
                    background: CATEGORY_COLORS[c.category] || t.accent,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Surge bar chart ── */}
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 20 }}>
            Daily Rental Surge — March 2024
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
            {surgeData.map((d, i) => {
              const heightPct = `${Math.round((d.count / maxSurge) * 100)}%`;
              const isMax     = d.count === maxSurge;
              return (
                <div key={i} title={`${d.date}: ${d.count} rentals`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%', height: heightPct,
                    borderRadius: '3px 3px 0 0',
                    background: isMax ? t.accent : (CATEGORY_COLORS.ELECTRONICS + '66'),
                    transition: 'height 0.4s ease',
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, fontFamily: 'DM Mono', color: t.textMuted }}>
            <span>Mar 1</span><span>Mar 11</span>
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: t.accentBg, borderRadius: 8, border: `1px solid ${t.accent}33`, fontSize: 12, color: t.textSec }}>
            <span style={{ color: t.accent, fontWeight: 600 }}>Peak: Mar 11</span> · 445 rentals · Next surge from Mar 4 was 7 days later
          </div>
        </Card>

        {/* ── Peak window banner (full width) ── */}
        <Card style={{ padding: 24, gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="trending" size={16} color={t.accent} />
            Peak 7-Day Rental Window
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ padding: '16px 24px', background: t.accentBg, borderRadius: 12, border: `1px solid ${t.accent}44`, display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 12, color: t.textSec, marginBottom: 4 }}>Window</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono', color: t.accent }}>
                  {peakWindow.from} → {peakWindow.to}
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: t.border }} />
              <div>
                <div style={{ fontSize: 12, color: t.textSec, marginBottom: 4 }}>Total Rentals</div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'DM Mono', color: t.text }}>
                  {peakWindow.totalRentals.toLocaleString()}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: t.textSec, lineHeight: 1.6, maxWidth: 400 }}>
              The 7-day window from <strong style={{ color: t.text }}>March 10–16, 2024</strong> recorded the highest combined rental activity of the quarter — driven by spring season demand across OUTDOOR and SPORTS categories.
            </p>
          </div>
        </Card>

      </div>
    </Shell>
  );
};

Object.assign(window, { AnalyticsPage });
