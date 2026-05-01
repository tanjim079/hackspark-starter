// ─── PAGE: PROFILE ────────────────────────────────────────────────────────────
// Route: /profile  (custom extra page)
// Calls:
//   GET /users/me                           — current user info
//   GET /users/:id/discount                 — security score + discount tier
//   GET /rentals/users/:id/top-categories   — top rented categories

const ProfilePage = () => {
  const { t } = useTheme();
  const { token } = useAuth();

  const [user,     setUser]     = React.useState(null);
  const [discount, setDiscount] = React.useState(null);
  const [topCats,  setTopCats]  = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);

  const API = 'http://localhost:8000';

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        const u   = await res.json();
        setUser(u);

        // Parallel: discount + top categories
        await Promise.allSettled([
          fetch(`${API}/users/${u.id}/discount`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(setDiscount),
          fetch(`${API}/rentals/users/${u.id}/top-categories?k=5`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => setTopCats(d.topCategories || [])),
        ]);
      } catch {
        // Demo fallback
        setUser({ name: 'Demo User', email: 'demo@rentpi.com', id: 42 });
        setDiscount({ securityScore: 78, discountPercent: 15 });
        setTopCats([
          { category: 'ELECTRONICS', rentalCount: 14 },
          { category: 'OUTDOOR',     rentalCount: 9  },
          { category: 'TOOLS',       rentalCount: 6  },
          { category: 'SPORTS',      rentalCount: 4  },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <Shell title="Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} height={100} radius={12} />)}
        </div>
      </Shell>
    );
  }

  const scoreColor = discount?.securityScore >= 80 ? t.success
                   : discount?.securityScore >= 60 ? t.accent
                   : t.warning;

  const maxCat = Math.max(...(topCats.length ? topCats.map(c => c.rentalCount) : [1]));

  const TIERS = [
    { range: '80–100', lo: 80,  hi: 100, discount: '20%', label: 'Elite'    },
    { range: '60–79',  lo: 60,  hi: 79,  discount: '15%', label: 'Gold'     },
    { range: '40–59',  lo: 40,  hi: 59,  discount: '10%', label: 'Silver'   },
    { range: '20–39',  lo: 20,  hi: 39,  discount: '5%',  label: 'Bronze'   },
    { range: '0–19',   lo: 0,   hi: 19,  discount: '0%',  label: 'Standard' },
  ];

  return (
    <Shell title="My Profile" subtitle="Account details and rental preferences">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar card */}
          <Card style={{ padding: 28, textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
              background: `linear-gradient(135deg, ${t.accent}44, ${t.accent}22)`,
              border: `2px solid ${t.accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: t.accent,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: t.textSec, marginBottom: 16 }}>{user?.email}</div>
            <div style={{ padding: '8px 12px', background: t.surfaceAlt, borderRadius: 8, border: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: t.textSec }}>User ID</span>
              <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: t.text }}>#{user?.id}</span>
            </div>
          </Card>

          {/* Security score */}
          {discount && (
            <Card style={{ padding: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textSec, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Security Score
              </div>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 44, fontWeight: 800, fontFamily: 'DM Mono', color: scoreColor, lineHeight: 1 }}>
                  {discount.securityScore}
                </div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>out of 100</div>
              </div>
              <div style={{ height: 6, background: t.surfaceAlt, borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${discount.securityScore}%`, background: scoreColor, borderRadius: 999, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: t.textSec }}>Loyalty discount</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: t.successBg, borderRadius: 7, border: `1px solid ${t.success}44` }}>
                  <Icon name="percent" size={13} color={t.success} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.success, fontFamily: 'DM Mono' }}>{discount.discountPercent}%</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Top categories */}
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="star" size={16} color={t.accent} />
              Top Rented Categories
            </div>
            {topCats.length === 0 ? (
              <div style={{ color: t.textMuted, fontSize: 14 }}>No rental history yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topCats.map((c, i) => (
                  <div key={c.category}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: t.textMuted, width: 16 }}>#{i + 1}</span>
                        <Badge label={c.category} small />
                      </div>
                      <span style={{ fontSize: 13, fontFamily: 'DM Mono', color: t.text, fontWeight: 600 }}>{c.rentalCount}</span>
                    </div>
                    <div style={{ height: 4, background: t.surfaceAlt, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(c.rentalCount / maxCat) * 100}%`, background: CATEGORY_COLORS[c.category] || t.accent, borderRadius: 999, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Loyalty tiers */}
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="award" size={16} color={t.accent} />
              Loyalty Tiers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TIERS.map(tier => {
                const score  = discount?.securityScore || 0;
                const active = score >= tier.lo && score <= tier.hi;
                return (
                  <div key={tier.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 9,
                    background: active ? t.accentBg : t.surfaceAlt,
                    border: `1px solid ${active ? t.accent + '55' : t.border}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? t.accent : t.text }}>{tier.label}</span>
                      <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.textMuted }}>Score {tier.range}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'DM Mono', color: active ? t.accent : t.textSec }}>{tier.discount}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
};

Object.assign(window, { ProfilePage });
