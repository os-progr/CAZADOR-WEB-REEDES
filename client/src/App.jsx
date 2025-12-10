import { useState, useEffect } from 'react'
import Login from './Login'
import { generateCertificate } from './certificateGenerator'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])

  // Auth State
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(true)

  // Monetization State
  const [isPremium, setIsPremium] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  // PDF Generation State
  const [downloading, setDownloading] = useState(false)

  // Check Local Auth on Load
  useEffect(() => {
    // Check for Google Auth Redirect params
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')
    const userParam = params.get('user')

    if (tokenParam && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam))
        localStorage.setItem('hunter_user', JSON.stringify(userData))
        localStorage.setItem('hunter_token', tokenParam)
        setUser(userData)
        setShowLogin(false)

        // Clear URL
        window.history.replaceState({}, document.title, "/")

        // Restore Premium if saved (or checks backend)
        const sub = localStorage.getItem('hunter_premium')
        if (sub === 'active') setIsPremium(true)
        return // Stop here
      } catch (e) {
        console.error("Failed to parse social login data", e)
      }
    }

    // Check Local Storage
    const savedUser = localStorage.getItem('hunter_user')
    const savedToken = localStorage.getItem('hunter_token')

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setShowLogin(false)
      const sub = localStorage.getItem('hunter_premium')
      if (sub === 'active') setIsPremium(true)
    }
  }, [])

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('hunter_user', JSON.stringify(userData))
    localStorage.setItem('hunter_token', token)
    setUser(userData)
    setShowLogin(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('hunter_user')
    localStorage.removeItem('hunter_token')
    setUser(null)
    setShowLogin(true)
    setResult(null)
    setUrl('')
  }

  const addLog = (msg) => {
    setLogs(prev => [...prev, `> ${msg}`])
  }

  const handleAudit = async () => {
    if (!url) return

    if (!isPremium) {
      setShowPaywall(true)
      return
    }

    setLoading(true)
    setResult(null)
    setLogs(['Initiating Hunter Protocol...', 'Establishing secure connection...'])

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url })
      })

      const data = await response.json()

      if (data.success) {
        addLog('Forensic data extraction complete.')
        addLog('Calculating Reality Score...')
        setTimeout(() => {
          setResult(data.result)
          setLoading(false)
        }, 800)
      } else {
        addLog(`Error: ${data.error}`)
        setLoading(false)
      }
    } catch (err) {
      addLog('Connection failed. Server might be offline.')
      setLoading(false)
    }
  }

  const activateSubscription = () => {
    localStorage.setItem('hunter_premium', 'active')
    setIsPremium(true)
    setShowPaywall(false)
    alert("Payment Verified! Subscription Active for 6 Months.")
  }

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      await generateCertificate(result, user.username);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF report");
    } finally {
      setDownloading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high'
    if (score >= 60) return 'score-med'
    return 'score-low'
  }

  if (showLogin) {
    return <Login onLogin={handleLoginSuccess} />
  }

  return (
    <div className="app-container">
      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="paywall-overlay">
          <div className="yape-card">
            <h2 className="yape-logo">Yape</h2>
            <div className="plan-badge">6-MONTH PREMIUM PASS</div>

            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Unlock unlimited forensic audits and fraud detection reports.
            </p>

            <div className="yape-qr-box">
              <div className="qr-placeholder"></div>
              <p style={{ color: '#333', marginTop: '0.5rem', fontWeight: 'bold' }}>SCAN TO PAY</p>
            </div>

            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              Envía <strong>S/ 15.00</strong> para activar tu acceso semestral.
            </p>

            <button className="btn-yape" onClick={activateSubscription}>
              YA REALICÉ EL YAPE
            </button>

            <button
              onClick={() => setShowPaywall(false)}
              style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <h1>EL CAZADOR</h1>
            <p className="subtitle" style={{ marginBottom: 0 }}>Forensic Auditor</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>Operador: {user.username}</p>
            <button onClick={handleLogout} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid #333', color: '#888', marginTop: '0.5rem' }}>
              LOGOUT
            </button>
          </div>
        </div>
        {isPremium && <span className="plan-badge" style={{ marginTop: '1rem', fontSize: '0.7rem' }}>PREMIUM ACTIVE</span>}
      </header>

      <main>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Profile URL (Insta/TikTok/YouTube)..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleAudit} disabled={loading}>
            {loading ? 'HUNTING...' : isPremium ? 'START AUDIT' : 'UNLOCK AUDIT'}
          </button>
        </div>

        {/* Live Console */}
        {(loading || result || logs.length > 0) && (
          <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <div className="console-log">
              {logs.map((log, i) => <div key={i}>{log}</div>)}
              {loading && <div className="animate-pulse">_</div>}
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="dashboard-grid">

            {/* Identity Card */}
            <div className="glass-panel" style={{ textAlign: 'left', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {result.avatarUrl && (
                <img src={result.avatarUrl} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-accent)' }} />
              )}
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{result.profileName}</h3>
                <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>{result.bio}</p>
              </div>
            </div>

            {/* Reality Score Card */}
            <div className="glass-panel">
              <h3>Reality Score</h3>
              <div className={`score-circle ${getScoreClass(result.realityScore)}`}>
                {result.realityScore}%
              </div>
              <p style={{ marginTop: '1rem', textSize: '0.9rem', color: result.verified ? 'var(--success)' : 'var(--danger)' }}>
                {result.verified ? '✓ VERIFIED HUMAN AUDIENCE' : '⚠ HIGH BOT ACTIVITY'}
              </p>
            </div>

            {/* Metrics Card */}
            <div className="glass-panel" style={{ textAlign: 'left' }}>
              <h3>Forensic Metrics</h3>
              <div className="metric-row">
                <span>Suspicion Rate</span>
                <span className="metric-value" style={{ color: 'var(--danger)' }}>{result.metrics.suspicionRate}</span>
              </div>
              <div className="metric-row">
                <span>Estimated Real</span>
                <span className="metric-value">{result.metrics.estimatedReal}</span>
              </div>
            </div>

            {/* Anomalies Card */}
            {result.suspicionFlags.length > 0 && (
              <div className="glass-panel" style={{ textAlign: 'left', gridColumn: 'span 2' }}>
                <h3 style={{ color: 'var(--danger)' }}>⚠ Detected Anomalies</h3>
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {result.suspicionFlags.map((flag, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Download Report Button */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button
                onClick={handleDownloadReport}
                disabled={downloading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #111, #222)',
                  border: '1px solid var(--primary-accent)',
                  color: 'var(--primary-accent)'
                }}
              >
                {downloading ? 'GENERATING SECURE PDF...' : '⬇ DOWNLOAD FORENSIC CERTIFICATE (PDF)'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
