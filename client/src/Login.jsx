import { useState } from 'react'

export default function Login({ onLogin }) {
    const [view, setView] = useState('login') // 'login', 'register', 'reset'
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        recovery_key: '',
        new_password: ''
    })
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMsg('')
        setLoading(true)

        let endpoint = '/api/auth/login'
        let payload = { email: formData.email, password: formData.password }

        if (view === 'register') {
            endpoint = '/api/auth/register'
            payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                recovery_key: formData.recovery_key
            }
        } else if (view === 'reset') {
            endpoint = '/api/auth/reset-password'
            payload = {
                email: formData.email,
                recovery_key: formData.recovery_key,
                new_password: formData.new_password
            }
        }

        const url = `${endpoint}`

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            if (view === 'reset') {
                setSuccessMsg('Recovery Successful. Please Login with new key.')
                setView('login')
                setFormData({ ...formData, password: '' }) // clear password field
            } else {
                onLogin(data.user, data.token)
            }

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const renderForm = () => {
        if (view === 'reset') {
            return (
                <>
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="text" name="recovery_key" placeholder="Recovery Key (Secret Word)" value={formData.recovery_key} onChange={handleChange} required />
                    <input type="password" name="new_password" placeholder="New Password" value={formData.new_password} onChange={handleChange} required />
                </>
            )
        }
        return (
            <>
                {view === 'register' && (
                    <>
                        <input type="text" name="username" placeholder="Codename (Username)" value={formData.username} onChange={handleChange} required />
                        <input type="text" name="recovery_key" placeholder="Secret Recovery Word (REQUIRED)" value={formData.recovery_key} onChange={handleChange} required />
                    </>
                )}
                <input type="email" name="email" placeholder="Secure Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Access Key (Password)" value={formData.password} onChange={handleChange} required />
            </>
        )
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100%'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>EL CAZADOR</h1>
                <p style={{ color: '#8b9bb4', marginBottom: '2rem' }}>
                    {view === 'login' ? 'Identity Verification' : view === 'register' ? 'New Agent Registration' : 'Account Recovery Protocol'}
                </p>

                {error && <div style={{ background: 'rgba(255, 0, 85, 0.2)', border: '1px solid #ff0055', color: '#ff0055', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>⚠ {error}</div>}

                {successMsg && <div style={{ background: 'rgba(0, 255, 157, 0.2)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>✓ {successMsg}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {renderForm()}
                    <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'PROCESSING...' : (view === 'login' ? 'AUTHENTICATE' : view === 'register' ? 'INITIALIZE AGENT' : 'RESET ACCESS KEY')}
                    </button>

                    {(view === 'login' || view === 'register') && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0 0.5rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                                <span style={{ padding: '0 10px', fontSize: '0.8rem', color: '#888' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                            </div>
                            <button
                                type="button"
                                onClick={() => window.location.href = '/api/auth/google'}
                                style={{
                                    background: '#fff',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    fontWeight: '600',
                                    border: 'none',
                                    padding: '0.8rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    marginTop: '0.5rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f1f1f1'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"></path>
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"></path>
                                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"></path>
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.272C4.672 5.142 6.656 3.58 9 3.58z" fill="#EA4335"></path>
                                </svg>
                                Sign in with Google
                            </button>
                        </>
                    )}
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
                    {view === 'login' && (
                        <>
                            Don't have clearance? <span onClick={() => setView('register')} style={{ color: 'var(--primary-accent)', cursor: 'pointer', fontWeight: 'bold' }}>Request Access</span>
                            <br /><br />
                            <span onClick={() => setView('reset')} style={{ fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Lost Access Key?</span>
                        </>
                    )}
                    {(view === 'register' || view === 'reset') && (
                        <>
                            Already an agent? <span onClick={() => setView('login')} style={{ color: 'var(--primary-accent)', cursor: 'pointer', fontWeight: 'bold' }}>Login</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
