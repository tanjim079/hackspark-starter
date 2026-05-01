// ─── PAGE: LOGIN ──────────────────────────────────────────────────────────────
// Route: /login  |  Calls: POST /users/login  |  POST /users/google

const LoginPage = () => {
  const { t } = useTheme();
  const { go } = useNav();
  const { login } = useAuth();

  const [email,    setEmail]    = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading,  setLoading]  = React.useState(false);
  const [error,    setError]    = React.useState('');

  const API             = 'http://localhost:8000';
  const GOOGLE_CLIENT_ID = '287896258871-4n9n3f2djd4ifi2qfesnbt1s4th4374k.apps.googleusercontent.com';

  // ── Email / password login ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.token);
      go('products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In callback ───────────────────────────────────────────────
  const handleGoogleCredential = async (credentialResponse) => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/users/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
      login(data.token);
      go('products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Mount Google button ───────────────────────────────────────────────────
  const initGoogle = React.useCallback(() => {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleCredential,
    });
    const el = document.getElementById('google-signin-btn');
    if (el) {
      window.google.accounts.id.renderButton(el, {
        theme: 'filled_black',
        size:  'large',
        width: 344,
        text:  'signin_with',
      });
    }
  }, []);

  React.useEffect(() => {
    if (window.google) {
      initGoogle();
    } else {
      window.addEventListener('googlescriptloaded', initGoogle, { once: true });
    }
    return () => window.removeEventListener('googlescriptloaded', initGoogle);
  }, [initGoogle]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: t.accent + '08', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80,  width: 300, height: 300, borderRadius: '50%', background: t.accent + '06', pointerEvents: 'none' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, fontFamily: 'DM Mono' }}>R</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: t.textSec }}>Sign in to your RentPi account</p>
        </div>

        <Card style={{ padding: 28 }}>
          {error && <ErrorBox msg={error} />}

          {/* Email / password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Email"    type="email"    value={email}    onChange={setEmail}    placeholder="you@example.com" icon="user" />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••"        icon="hash" />
            <Btn onClick={handleSubmit} disabled={loading} size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <><Spinner size={16} /> Signing in…</> : 'Sign in'}
            </Btn>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: t.border }} />
            <span style={{ fontSize: 12, color: t.textSec, whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: t.border }} />
          </div>

          {/* Google Sign-In button (rendered by Google SDK) */}
          <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: t.textSec }}>
            No account?{' '}
            <span onClick={() => go('register')} style={{ color: t.accent, cursor: 'pointer', fontWeight: 500 }}>Create one</span>
          </div>
        </Card>

        <div style={{ marginTop: 16, padding: '10px 14px', background: t.accentBg, borderRadius: 8, border: `1px solid ${t.accent}33`, fontSize: 12, color: t.textSec, textAlign: 'center' }}>
          Connects to <span style={{ fontFamily: 'DM Mono', color: t.accent }}>localhost:8000</span> (api-gateway)
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { LoginPage });
