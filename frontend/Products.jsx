// ─── PAGE: PRODUCTS ───────────────────────────────────────────────────────────
// Route: /products
// Calls: GET /rentals/products?category=&page=&limit=  via api-gateway :8000
//        GET /rentals/products/:id  (product detail modal)

const MOCK_PRODUCTS = [
  { id: 1,  name: 'Pro Drone Kit',        category: 'ELECTRONICS', pricePerDay: 49.99 },
  { id: 2,  name: 'Mountain Bike Elite',  category: 'SPORTS',      pricePerDay: 29.99 },
  { id: 3,  name: 'DSLR Camera Bundle',   category: 'CAMERAS',     pricePerDay: 64.99 },
  { id: 4,  name: 'Power Tool Set',       category: 'TOOLS',       pricePerDay: 24.99 },
  { id: 5,  name: 'Camping Tent Pro',     category: 'OUTDOOR',     pricePerDay: 19.99 },
  { id: 6,  name: 'Electric Guitar',      category: 'MUSIC',       pricePerDay: 34.99 },
  { id: 7,  name: 'Standing Desk',        category: 'FURNITURE',   pricePerDay: 14.99 },
  { id: 8,  name: 'Cargo Van',            category: 'VEHICLES',    pricePerDay: 89.99 },
  { id: 9,  name: 'Laptop Workstation',   category: 'ELECTRONICS', pricePerDay: 44.99 },
  { id: 10, name: 'Kayak Set',            category: 'OUTDOOR',     pricePerDay: 39.99 },
  { id: 11, name: 'DJ Equipment',         category: 'MUSIC',       pricePerDay: 74.99 },
  { id: 12, name: 'Office Projector',     category: 'OFFICE',      pricePerDay: 29.99 },
];

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onView, onCheck }) => {
  const { t } = useTheme();
  return (
    <Card hover onClick={() => onView(product)} style={{ padding: 0, overflow: 'hidden' }}>
      {/* Placeholder image area */}
      <div style={{
        height: 160, background: t.surfaceAlt,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderBottom: `1px solid ${t.border}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ color: t.textMuted, opacity: 0.4 }}><Icon name="package" size={36} /></div>
        <span style={{ fontSize: 10, fontFamily: 'DM Mono', color: t.textMuted, opacity: 0.5 }}>product photo</span>
        {/* Price chip */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: t.bg, border: `1px solid ${t.border}`,
          borderRadius: 7, padding: '4px 9px',
          fontSize: 13, fontWeight: 700, fontFamily: 'DM Mono', color: t.accent,
        }}>
          ${product.pricePerDay}<span style={{ fontSize: 10, fontWeight: 400, color: t.textMuted }}>/day</span>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ marginBottom: 8 }}><Badge label={product.category} small /></div>
        <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 12, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }}>Rent Now</Btn>
          <Btn variant="secondary" size="sm" icon="calendar"
            onClick={e => { e.stopPropagation(); onCheck(product); }}>Check</Btn>
        </div>
      </div>
    </Card>
  );
};

// ── Product Modal (detail view) ───────────────────────────────────────────────
const ProductModal = ({ product, onClose }) => {
  const { t } = useTheme();
  const { go, setCheckProduct } = useNav();
  if (!product) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`,
        width: '100%', maxWidth: 520, boxShadow: t.shadow,
      }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge label={product.category} />
            <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.textMuted }}>#{product.id}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex' }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Image placeholder */}
        <div style={{ height: 200, background: t.surfaceAlt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="package" size={48} color={t.textMuted} />
          <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.textMuted, opacity: 0.6 }}>product photo</span>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 6 }}>{product.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'DM Mono', color: t.accent }}>${product.pricePerDay}</span>
            <span style={{ fontSize: 13, color: t.textSec }}>per day</span>
          </div>

          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Owner ID',   value: product.ownerId ? `#${product.ownerId}` : '—', icon: 'user' },
              { label: 'Category',   value: product.category, icon: 'tag' },
              { label: 'Product ID', value: `#${product.id}`, icon: 'hash' },
            ].map(s => (
              <div key={s.label} style={{ padding: 12, background: t.surfaceAlt, borderRadius: 9, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4, fontFamily: 'DM Mono' }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn size="md" style={{ flex: 1, justifyContent: 'center' }}>Rent this item</Btn>
            <Btn variant="secondary" size="md" icon="calendar"
              onClick={() => { setCheckProduct(product); onClose(); go('availability'); }}>
              Check availability
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Products Page ─────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const { t } = useTheme();
  const { go, setCheckProduct } = useNav();
  const { token } = useAuth();

  const [products,    setProducts]    = React.useState([]);
  const [loading,     setLoading]     = React.useState(true);
  const [error,       setError]       = React.useState('');
  const [category,    setCategory]    = React.useState('');
  const [categories,  setCategories]  = React.useState([]);
  const [page,        setPage]        = React.useState(1);
  const [totalPages,  setTotalPages]  = React.useState(1);
  const [search,      setSearch]      = React.useState('');
  const [selected,    setSelected]    = React.useState(null);

  const LIMIT = 12;
  const API   = 'http://localhost:8000';

  const fetchProducts = React.useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (category) params.set('category', category);
      const res = await fetch(`${API}/rentals/products?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProducts(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      // Fallback to mock data
      let filtered = MOCK_PRODUCTS;
      if (category) filtered = filtered.filter(p => p.category === category);
      setProducts(filtered);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, category, token]);

  React.useEffect(() => {
    setCategories(['ELECTRONICS','VEHICLES','TOOLS','OUTDOOR','SPORTS','MUSIC','FURNITURE','CAMERAS','OFFICE']);
  }, []);

  React.useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const displayed = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const catOptions = [
    { value: '', label: 'All categories' },
    ...categories.map(c => ({ value: c, label: c })),
  ];

  return (
    <Shell
      title="Products"
      subtitle="Browse all rental listings"
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <Input value={search} onChange={setSearch} placeholder="Search products…" icon="search" style={{ width: 220 }} />
          <Select value={category} onChange={v => { setCategory(v); setPage(1); }} options={catOptions} style={{ width: 180 }} />
        </div>
      }
    >
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
              <Skeleton height={160} radius={0} />
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Skeleton width={80} height={20} />
                <Skeleton height={16} />
                <Skeleton width="60%" height={16} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorBox msg={error} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {displayed.map(p => (
              <ProductCard key={p.id} product={p}
                onView={setSelected}
                onCheck={prod => { setCheckProduct(prod); go('availability'); }}
              />
            ))}
          </div>

          {displayed.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: t.textSec }}>
              <Icon name="package" size={40} color={t.textMuted} />
              <p style={{ marginTop: 12 }}>No products found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              <Btn variant="secondary" size="sm" icon="chevron-left"
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} style={{
                  width: 34, height: 34, borderRadius: 7,
                  border: `1px solid ${page === n ? t.accent : t.border}`,
                  background: page === n ? t.accentBg : 'transparent',
                  color: page === n ? t.accent : t.textSec,
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                }}>{n}</button>
              ))}
              {totalPages > 5 && <span style={{ color: t.textMuted }}>… {totalPages}</span>}
              <Btn variant="secondary" size="sm" icon="chevron-right"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            </div>
          )}
        </>
      )}

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </Shell>
  );
};

Object.assign(window, { ProductsPage });
