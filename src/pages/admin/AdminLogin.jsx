import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginAdmin } from '../../lib/data.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const result = await loginAdmin(email, password)
    setBusy(false)
    if (result.error) {
      setError('Invalid email or password.')
      return
    }
    navigate('/admin/dashboard')
  }

  return (
    <section className="mx-auto max-w-sm px-4 py-24">
      <p className="font-serif italic text-xl text-ink">
        <Link to="/">BribedIndia</Link>
      </p>
      <h1 className="h-serif mt-6 text-2xl">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-6">
        <label className="label-upper-muted">Email</label>
        <input
          className="input-field mt-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <label className="label-upper-muted mt-5 block">Password</label>
        <input
          className="input-field mt-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error ? <p className="mt-4 text-sm text-ink">{error}</p> : null}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </section>
  )
}
