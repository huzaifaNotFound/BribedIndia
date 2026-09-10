import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Check, RotateCcw } from 'lucide-react'
import {
  getAllReports,
  markReportVerified,
  deleteReport,
  getAdminSession,
  signOutAdmin,
} from '../../lib/data.js'
import { DEPARTMENT_MAP } from '../../lib/constants.js'
import { formatRupees, relativeDate } from '../../lib/format.js'
import StatusTag from '../../components/StatusTag.jsx'
import DeptIcon from '../../components/DeptIcon.jsx'

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All unverified' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending_review', label: 'Pending Review' },
]

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState(null)
  const [verifying, setVerifying] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    const all = await getAllReports()
    // newest first, exclude already-verified
    const pending = all
      .filter((r) => r.status !== 'verified')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setReports(pending)
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
      load().catch(() => {})
    })
    return () => {
      active = false
    }
  }, [navigate])

  const handleVerify = async (report) => {
    setMessage(null)
    setVerifying(report.id)
    try {
      await markReportVerified(report.id)
      await load()
      setMessage(
        `Report verified — ${DEPARTMENT_MAP[report.department_code]?.name || report.department_code}, ${report.state}.`
      )
    } catch {
      setMessage('Could not verify report. Try again.')
    } finally {
      setVerifying(null)
    }
  }

  const handleDelete = async (report) => {
    setMessage(null)
    setDeleting(report.id)
    try {
      await deleteReport(report.id)
      await load()
      setMessage('Report deleted.')
    } catch {
      setMessage('Could not delete report. Try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleSignOut = async () => {
    await signOutAdmin()
    navigate('/admin/login')
  }

  const filtered =
    filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  if (checking) {
    return (
      <p className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted">
        Checking session…
      </p>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="h-serif text-2xl sm:text-3xl">Reports to Review</h1>
          <p className="mt-1 text-sm text-muted">
            Newest first · {reports.length} unverified report
            {reports.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            title="Refresh"
            onClick={() => load().catch(() => {})}
            className="flex h-9 w-9 items-center justify-center border border-line text-ink hover:opacity-70"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink hover:opacity-70"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mt-6 flex gap-4 border-b border-line">
        {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`label-upper pb-2 transition-colors ${
              filter === value
                ? 'border-b-2 border-ink text-ink'
                : 'text-muted hover:text-ink'
            }`}
          >
            {label}
            {value === 'all' ? (
              <span className="ml-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[10px] text-white tabular-nums">
                {reports.length}
              </span>
            ) : (
              <span className="ml-1.5 text-[10px] tabular-nums text-muted">
                {reports.filter((r) => r.status === value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Flash message */}
      {message ? (
        <p className="mt-5 border border-ink bg-accent px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      {/* Report list */}
      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="border border-line p-8 text-center">
            <p className="text-sm text-muted">No reports in this category.</p>
          </div>
        ) : (
          filtered.map((report) => (
            <div key={report.id} className="panel p-4 sm:p-5">
              {/* Top row: status + time + verify */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusTag status={report.status} />
                  <span className="text-xs text-muted">
                    {formatDateTime(report.created_at)}
                  </span>
                  <span className="text-xs text-muted opacity-60">
                    · {relativeDate(report.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={verifying === report.id || deleting === report.id}
                    onClick={() => handleVerify(report)}
                    className="btn-primary flex items-center gap-1 px-3 py-1.5 text-[0.65rem] disabled:opacity-40"
                  >
                    {verifying === report.id ? (
                      'Verifying…'
                    ) : (
                      <>
                        <Check size={12} /> Verify
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={verifying === report.id || deleting === report.id}
                    onClick={() => handleDelete(report)}
                    className="flex items-center gap-1 border border-line px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ink hover:border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-40"
                  >
                    {deleting === report.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Department + location */}
              <div className="mt-3 flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-line">
                  <DeptIcon code={report.department_code} size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {DEPARTMENT_MAP[report.department_code]?.name ||
                      report.department_code}
                    {report.department_other
                      ? ` — ${report.department_other}`
                      : ''}
                  </p>
                  <p className="text-xs text-muted">
                    {[report.district, report.state]
                      .filter(Boolean)
                      .join(', ')}
                    {report.service ? ` · ${report.service}` : ''}
                  </p>
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3 text-xs text-muted">
                <span>
                  <span className="font-semibold text-ink">
                    {report.report_type === 'refused_to_pay'
                      ? 'Refused to pay'
                      : 'Paid bribe'}
                  </span>
                </span>
                {report.bribe_amount != null && report.bribe_amount !== '' ? (
                  <span>
                    Amount:{' '}
                    <span className="font-semibold text-ink tabular-nums">
                      {formatRupees(report.bribe_amount)}
                    </span>
                  </span>
                ) : null}
                {report.approx_month && report.approx_year ? (
                  <span>
                    When:{' '}
                    <span className="font-semibold text-ink">
                      {new Date(
                        report.approx_year,
                        report.approx_month - 1
                      ).toLocaleString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                ) : null}
              </div>

              {/* Description */}
              {report.description ? (
                <p className="mt-3 text-sm leading-relaxed text-ink/80 line-clamp-3">
                  {report.description}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>

      <p className="mt-10 text-xs text-muted">
        Public site —{' '}
        <Link to="/" className="underline">
          back to map
        </Link>
      </p>
    </section>
  )
}
