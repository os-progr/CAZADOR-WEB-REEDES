import { useState, useEffect } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])

  // Monetization State
  const [isPremium, setIsPremium] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  // Check subscription on load (Mock persistence)
  useEffect(() => {
    const sub = localStorage.getItem('hunter_premium')
    if (sub === 'active') setIsPremium(true)
  }, [])

  const addLog = (msg) => {
    setLogs(prev => [...prev, `> ${msg}`])
  }

  const handleAudit = async () => {
    if (!url) return

    // PAYWALL LOGIC: Block if not premium
    if (!isPremium) {
      setShowPaywall(true)
      return
    }

    setLoading(true)
    setResult(null)
    setLogs(['Initiating Hunter Protocol...', 'Establishing secure connection...'])

    try {
      const response = await fetch('http://localhost:3000/api/audit', {
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
    // In a real app, verify backend webhook here
    localStorage.setItem('hunter_premium', 'active')
    setIsPremium(true)
    setShowPaywall(false)
    alert("Payment Verified! Subscription Active for 6 Months.")
  }

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high'
    if (score >= 60) return 'score-med'
    return 'score-low'
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
              {/* Mock QR - In production use real QR image */}
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
          <h1>EL CAZADOR</h1>
          {isPremium && <span className="plan-badge" style={{ marginBottom: 0, fontSize: '0.7rem' }}>PREMIUM ACTIVE</span>}
        </div>
        <p className="subtitle">Forensic Social Media Auditor</p>
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
          </div>
        )}
      </main>
    </div>
  )
}

export default App
