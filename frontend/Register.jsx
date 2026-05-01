// ─── PAGE: REGISTER ───────────────────────────────────────────────────────────
// Route: /register  |  Calls: POST /users/register via api-gateway :8000

const RegisterPage = () => {
  const { t } = useTheme();
  const { go } = useNav();
  const { login } = useAuth();

  const [name,     setName]     = React.useState('');
  const [email,    setEmail]    = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm,  setConfirm]  = React.useState('');
  const [loading,  setLoading]  = React.useState(false);
  const [error,    setError]    = React.useState('');

  const API = 'http://localhost:8000';

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name || !email || !password) { setError('Please fill all fields'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      login(data.token);
      go('products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: t.accent + '06', pointerEvents: 'none' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, fontFamily: 'DM Mono' }}>R</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 14, color: t.textSec }}>Join RentPi and start renting</p>
        </div>

        <Card style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <ErrorBox msg={error} />}
            <Input label="Full name" value={name} onChange={setName} placeholder="Alex Johnson" icon="user" />
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              <Input label="Confirm" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" />
            </div>
            <Btn onClick={handleSubmit} disabled={loading} size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <><Spinner size={16} /> Creating account…</> : 'Create account'}
            </Btn>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: t.textSec }}>
            Already have one?{' '}
            <span onClick={() => go('login')} style={{ color: t.accent, cursor: 'pointer', fontWeight: 500 }}>Sign in</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { RegisterPage });
