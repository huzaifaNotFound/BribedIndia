import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Check } from 'lucide-react'
import {
  getAllReports,
  markClusterVerified,
  getAdminSession,
  signOutAdmin,
} from '../../lib/data.js'
import { computePendingClusters } from '../../lib/aggregate.js'
import { DEPARTMENT_MAP, CREDIBILITY_NOTE } from '../../lib/constants.js'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [clusters, setClusters] = useState([])
  const [message, setMessage] = useState(null)

  const refresh = async () => {
    const reports = await getAllReports()
    setClusters(computePendingClusters(reports))
  }

  useEffect(() => {
    let active = true
    getAdminSession().then((session) => {
      if (!active) return
      if (!session) {
        navigate('/admin/login', { replace: true })
        return
      }
      setChecking(false)
      refresh().catch(() => {})
    })
    return () => {
      active = false
    }
  }, [navigate])

  const handleVerify = async (cluster) => {
    setMessage(null)
    try {
      await markClusterVerified(
        cluster.department_code,
        cluster.state,
        cluster.service
      )
      await refresh()
      setMessage('Cluster marked as verified.')
    } catch {
      setMessage('Could not update cluster. Try again.')
    }
  }

  const handleSignOut = async () => {
    await signOutAdmin()
    navigate('/admin/login')
  }

  if (checking) {
    return <p className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted">Checking session…</p>
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="h-serif text-3xl">Pending Review Clusters</h1>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink hover:opacity-70"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">{CREDIBILITY_NOTE}</p>

      {message ? (
        <p className="mt-6 border border-ink bg-accent px-3 py-2 text-sm">{message}</p>
      ) : null}

      <div className="mt-6 space-y-6">
        {clusters.length === 0 ? (
          <p className="border border-line p-6 text-sm text-muted">
            No pending clusters. When 3+ matching reports appear in a 90-day window, they
            will show up here.
          </p>
        ) : (
          clusters.map((cluster) => (
            <div key={`${cluster.department_code}-${cluster.state}-${cluster.service}`} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    {DEPARTMENT_MAP[cluster.department_code]?.name || cluster.department_code}{' '}
                    · {cluster.state}
                  </p>
                  <p className="mt-1 text-sm text-muted">{cluster.service}</p>
                  <p className="mt-2 text-xs text-muted">
                    {cluster.report_count} reports in this cluster
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleVerify(cluster)}
                >
                  <Check size={14} /> Mark Cluster as Verified
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-10 text-xs text-muted">
        Public site — <Link to="/" className="underline">back to map</Link>
      </p>
    </section>
  )
}
