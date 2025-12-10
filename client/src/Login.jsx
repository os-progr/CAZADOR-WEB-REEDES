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

        const url = `http://localhost:3000${endpoint}`

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
