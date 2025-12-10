import { useState } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])

  const addLog = (msg) => {
    setLogs(prev => [...prev, `> ${msg}`])
  }

  const handleAudit = async () => {
    if (!url) return
    setLoading(true)
    setResult(null)
    setLogs(['Initiating Hunter Protocol...', 'Establishing secure connection...'])

    try {
      // Direct fetch to the backend (ensure CORS is enabled on server)
      const response = await fetch('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url })
      })

      const data = await response.json()

      if (data.success) {
        addLog('Audit complete. Analyzing forensics...')
        setTimeout(() => {
          setResult(data.result)
          setLoading(false)
        }, 1000) // Small delay for effect
      } else {
        addLog(`Error: ${data.error}`)
        setLoading(false)
      }
    } catch (err) {
      addLog('Connection failed. Server might be offline.')
      setLoading(false)
    }
  }

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high'
    if (score >= 50) return 'score-med'
    return 'score-low'
  }

  return (
    <div className="app-container">
      <header>
        <h1>EL CAZADOR</h1>
        <p className="subtitle">Forensic Social Media Auditor</p>
      </header>

      <main>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Instagram/TikTok Profile URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleAudit} disabled={loading}>
            {loading ? 'HUNTING...' : 'START AUDIT'}
          </button>
        </div>

        {/* Live Console / Status */}
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
            {/* Reality Score Card */}
            <div className="glass-panel">
              <h3>Reality Score</h3>
              <div className={`score-circle ${getScoreClass(result.realityScore)}`}>
                {result.realityScore}%
              </div>
              <p style={{ marginTop: '1rem', color: '#888' }}>
                {result.realityScore > 80 ? 'AUTHENTIC AUDIENCE' : 'SUSPICIOUS ACTIVITY DETECTED'}
              </p>
            </div>

            {/* Metrics Card */}
            <div className="glass-panel" style={{ textAlign: 'left' }}>
              <h3>Forensic Metrics</h3>
              <div className="metric-row">
                <span>Total Followers</span>
                <span className="metric-value">{result.metrics.totalFollowers}</span>
              </div>
              <div className="metric-row">
                <span>Estimated Real</span>
                <span className="metric-value">{result.metrics.estimatedReal}</span>
              </div>
              <div className="metric-row">
                <span>Suspicion Rate</span>
                <span className="metric-value" style={{ color: 'var(--danger)' }}>{result.metrics.suspicionRate}</span>
              </div>
            </div>

            {/* Anomalies Card */}
            <div className="glass-panel" style={{ textAlign: 'left', gridColumn: 'span 2' }}>
              <h3 style={{ color: 'var(--danger)' }}>⚠ Detected Anomalies</h3>
              <ul style={{ paddingLeft: '1.2rem' }}>
                {result.suspicionFlags.map((flag, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
