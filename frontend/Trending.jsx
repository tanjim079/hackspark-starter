// ─── PAGE: TRENDING ───────────────────────────────────────────────────────────
// Route: /trending
// Calls: GET /analytics/recommendations?date=TODAY&limit=6  via api-gateway :8000

const MOCK_TRENDING = [
  { productId: 1042, name: 'Elite Tent Pro #1042',    category: 'OUTDOOR',     score: 24 },
  { productId: 88,   name: 'Pro Kayak #88',           category: 'SPORTS',      score: 19 },
  { productId: 341,  name: 'DSLR Camera Bundle #341', category: 'CAMERAS',     score: 17 },
  { productId: 55,   name: 'Mountain Bike #55',       category: 'SPORTS',      score: 15 },
  { productId: 720,  name: 'Power Drill Set #720',    category: 'TOOLS',       score: 12 },
  { productId: 193,  name: 'DJ Controller #193',      category: 'MUSIC',       score: 11 },
];

const TrendingPage = () => {
  const { t } = useTheme();
  const { token } = useAuth();

  const [recs,    setRecs]    = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState('');

  const today = new Date().toISOString().split('T')[0];
  const API   = 'http://localhost:8000';

  const fetchTrending = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/analytics/recommendations?date=${today}&limit=6`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('No data');
      const data = await res.json();
      setRecs(data.recommendations?.length ? data.recommendations : MOCK_TRENDING);
    } catch {
      setRecs(MOCK_TRENDING);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchTrending(); }, []);

  const displayed = recs.length ? recs : MOCK_TRENDING;
  const maxScore  = Math.max(...displayed.map(r => r.score));

  return (
    <Shell
      title="Trending Today"
      subtitle={`Seasonal picks for ${today}`}
      actions={<Btn variant="secondary" icon="refresh-cw" onClick={fetchTrending}>Refresh</Btn>}
    >
      {/* Context banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '10px 16px', background: t.accentBg, border: `1px solid ${t.accent}33`, borderRadius: 10, width: 'fit-content' }}>
        <Icon name="calendar" size={14} color={t.accent} />
        <span style={{ fontSize: 13, color: t.accent, fontFamily: 'DM Mono' }}>{today}</span>
        <span style={{ fontSize: 13, color: t.textSec }}>— based on historical rentals ±7 days</span>
      </div>

      {loading ? (
        /* Skeleton grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Skeleton width={80} height={20} />
                <Skeleton width={40} height={20} />
              </div>
              <Skeleton height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={14} />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorBox msg={error} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {displayed.map((r, i) => (
            <Card key={r.productId} hover style={{ padding: '20px 22px' }}>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.textMuted, width: 20 }}>#{i + 1}</span>
                  <Badge label={r.category} small />
                </div>
                {/* Score pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, background: t.accent + '22', border: `1px solid ${t.accent}44` }}>
                  <Icon name="trending" size={11} color={t.accent} />
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'DM Mono', color: t.accent }}>{r.score}</span>
                </div>
              </div>

              <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 4, lineHeight: 1.3 }}>{r.name}</div>
              <div style={{ fontSize: 12, fontFamily: 'DM Mono', color: t.textMuted, marginBottom: 14 }}>ID #{r.productId}</div>

              {/* Score bar */}
              <div style={{ height: 3, background: t.surfaceAlt, borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ height: '100%', borderRadius: 999, width: `${(r.score / maxScore) * 100}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.accent}88)` }} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }}>Rent Now</Btn>
                <Btn variant="secondary" size="sm" icon="eye">Details</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
};

Object.assign(window, { TrendingPage });
