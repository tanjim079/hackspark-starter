// ─── PAGE: CHAT ───────────────────────────────────────────────────────────────
// Route: /chat
// Calls:
//   GET  /chat/sessions            — list all sessions
//   GET  /chat/:sessionId/history  — load session messages
//   POST /chat                     — send message { sessionId, message }

const MOCK_SESSIONS = [
  { sessionId: 'sess1', name: 'Electronics rental trends',  lastMessageAt: '2024-06-15T10:05:00Z' },
  { sessionId: 'sess2', name: 'Outdoor gear availability',  lastMessageAt: '2024-06-14T09:20:00Z' },
  { sessionId: 'sess3', name: 'Peak rental periods 2024',   lastMessageAt: '2024-06-12T14:30:00Z' },
];

const MOCK_HISTORY = {
  sess1: [
    { role: 'user',      content: 'Which category had the most rentals?',        timestamp: '2024-06-15T10:01:00Z' },
    { role: 'assistant', content: '**ELECTRONICS** led all categories with 38,420 rentals, followed by OUTDOOR (29,150) and SPORTS (24,800).', timestamp: '2024-06-15T10:01:02Z' },
    { role: 'user',      content: 'What was the peak rental month?',              timestamp: '2024-06-15T10:03:00Z' },
    { role: 'assistant', content: 'The peak rental month was **March 2024**. The 7-day window March 10–16 recorded 2,847 total rentals — the highest consecutive streak of the year.', timestamp: '2024-06-15T10:03:03Z' },
  ],
  sess2: [
    { role: 'user',      content: 'Is product #88 available in April?',           timestamp: '2024-06-14T09:18:00Z' },
    { role: 'assistant', content: 'Product #88 has busy periods April 4–9 and April 17–23. Free windows: April 1–3, April 10–16, April 24–30.', timestamp: '2024-06-14T09:18:04Z' },
  ],
};

const DEMO_REPLIES = [
  'Based on historical data, **ELECTRONICS** remains the top rented category with over 38,000 rentals recorded.',
  'The peak rental window this year was **March 10–16**, with 2,847 combined rentals platform-wide.',
  'For that product, the next available window appears to be **April 5–12** based on current bookings.',
  'Seasonal recommendations for today include outdoor gear and sports equipment — historically popular this time of year.',
];

const ChatPage = () => {
  const { t } = useTheme();
  const { token } = useAuth();

  const [sessions,       setSessions]       = React.useState(MOCK_SESSIONS);
  const [activeSession,  setActiveSession]  = React.useState(null);
  const [messages,       setMessages]       = React.useState([]);
  const [input,          setInput]          = React.useState('');
  const [typing,         setTyping]         = React.useState(false);
  const [loadingSessions,setLoadingSessions] = React.useState(false);

  const chatRef = React.useRef(null);
  const API     = 'http://localhost:8000';

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  // Load session list
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res  = await fetch(`${API}/chat/sessions`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSessions(data.sessions || MOCK_SESSIONS);
    } catch {
      setSessions(MOCK_SESSIONS);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Load history for a session
  const loadHistory = async (sessionId) => {
    try {
      const res  = await fetch(`${API}/chat/${sessionId}/history`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMessages(data.messages || MOCK_HISTORY[sessionId] || []);
    } catch {
      setMessages(MOCK_HISTORY[sessionId] || []);
    }
  };

  React.useEffect(() => { loadSessions(); }, []);

  const newChat = () => {
    const id = `sess_${Date.now()}`;
    setActiveSession(id);
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm RentPi's AI assistant. Ask me anything about rental trends, product availability, categories, or pricing.",
      timestamp: new Date().toISOString(),
    }]);
  };

  const selectSession = (session) => {
    setActiveSession(session.sessionId);
    loadHistory(session.sessionId);
  };

  const send = async () => {
    if (!input.trim() || typing) return;
    const msg    = input.trim();
    const sessId = activeSession || `sess_${Date.now()}`;
    if (!activeSession) setActiveSession(sessId);

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date().toISOString() }]);
    setTyping(true);

    try {
      const res  = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId: sessId, message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.message, timestamp: new Date().toISOString() }]);
      setTyping(false);
    } catch {
      // Simulate response in demo mode
      setTimeout(() => {
        const reply = DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
        setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }]);
        setTyping(false);
      }, 1100);
    }
  };

  const formatTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  // Render simple bold markdown
  const renderMsg = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div style={{ paddingTop: 56, height: '100vh', background: t.bg, display: 'flex' }}>

      {/* ── Session sidebar ── */}
      <div style={{ width: 280, flexShrink: 0, borderRight: `1px solid ${t.border}`, background: t.surface, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${t.border}` }}>
          <Btn onClick={newChat} icon="plus" style={{ width: '100%', justifyContent: 'center' }}>New Chat</Btn>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, padding: '8px 10px 6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Recent sessions
          </div>

          {loadingSessions
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ padding: '10px 10px', margin: '2px 0' }}>
                  <Skeleton height={14} style={{ marginBottom: 6 }} />
                  <Skeleton width="60%" height={11} />
                </div>
              ))
            : sessions.map(s => (
                <div key={s.sessionId} onClick={() => selectSession(s)} style={{
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer', margin: '2px 0',
                  background: activeSession === s.sessionId ? t.accentBg : 'transparent',
                  border: `1px solid ${activeSession === s.sessionId ? t.accent + '44' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: activeSession === s.sessionId ? t.accent : t.text, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, fontFamily: 'DM Mono' }}>
                    {new Date(s.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))
          }
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
        {activeSession ? (
          <>
            {/* Chat header */}
            <div style={{ padding: '14px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="message-circle" size={16} color={t.accent} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>
                  {sessions.find(s => s.sessionId === activeSession)?.name || 'New conversation'}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted }}>RentPi AI Assistant</div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.2s ease' }}>
                  <div style={{
                    maxWidth: '72%', padding: '11px 16px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? t.accent : t.surfaceAlt,
                    color:      msg.role === 'user' ? '#fff' : t.text,
                    border: `1px solid ${msg.role === 'user' ? 'transparent' : t.border}`,
                    fontSize: 14, lineHeight: 1.55,
                  }} dangerouslySetInnerHTML={{ __html: renderMsg(msg.content) }} />
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, padding: '0 4px' }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ padding: '12px 16px', background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: '14px 14px 14px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: t.textMuted, animation: `blink 1.4s infinite ${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input row */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask about rentals, availability, trends…"
                  disabled={typing} rows={1}
                  style={{
                    flex: 1, padding: '11px 14px', background: t.surfaceAlt,
                    border: `1px solid ${t.border}`, borderRadius: 10,
                    fontSize: 14, color: t.text, fontFamily: 'DM Sans',
                    resize: 'none', outline: 'none', lineHeight: 1.4,
                  }}
                />
                <button onClick={send} disabled={typing || !input.trim()} style={{
                  width: 40, height: 40, borderRadius: 10, border: 'none',
                  background: input.trim() ? t.accent : t.surfaceAlt,
                  color: input.trim() ? '#fff' : t.textMuted,
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0,
                }}>
                  {typing ? <Spinner size={16} /> : <Icon name="send" size={16} />}
                </button>
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, textAlign: 'center' }}>
                Shift+Enter for new line · Enter to send
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: t.textMuted }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="message-circle" size={32} color={t.accent} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 6 }}>RentPi Assistant</div>
              <div style={{ fontSize: 14, color: t.textSec, marginBottom: 20 }}>Ask questions about rentals, availability, and trends</div>
              <Btn onClick={newChat} icon="plus">Start new chat</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { ChatPage });
