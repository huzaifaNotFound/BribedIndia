import { seedReports } from './seedData.js'
import { normalizeService } from './format.js'
import { RATE_LIMIT } from './constants.js'

const REPORTS_KEY = 'bribedindia_reports_v1'
const SESSION_KEY = 'bribedindia_client_session'
const SUBMISSIONS_KEY = 'bribedindia_submissions_v1'

function makeId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getClientSession() {
  let session = localStorage.getItem(SESSION_KEY)
  if (!session) {
    session = makeId()
    localStorage.setItem(SESSION_KEY, session)
  }
  return session
}

function load() {
  const raw = localStorage.getItem(REPORTS_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
  return null
}

function persist(reports) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
}

export function getReports() {
  const stored = load()
  if (stored) return stored
  const seeded = seedReports.map((r) => ({
    ...r,
    id: r.id || makeId(),
    created_at: r.created_at || new Date().toISOString(),
  }))
  persist(seeded)
  return seeded
}

export function submitDemoReport(payload) {
  const submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]')
  const cutoff = Date.now() - RATE_LIMIT.windowMinutes * 60000
  const recent = submissions.filter((t) => t > cutoff)
  if (recent.length >= RATE_LIMIT.maxSubmissions) {
    return { error: 'rate_limited' }
  }
  recent.push(Date.now())
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(recent))

  const reports = getReports()
  const report = {
    id: makeId(),
    report_type: payload.report_type,
    department_code: payload.department_code,
    department_other: payload.department_other || null,
    state: payload.state,
    district: payload.district || null,
    service: payload.service || null,
    approx_month: payload.approx_month,
    approx_year: payload.approx_year,
    bribe_amount: payload.bribe_amount ?? null,
    description: payload.description || null,
    has_evidence: false,
    status: 'unverified',
    created_at: new Date().toISOString(),
  }
  reports.push(report)
  recomputeClusters(reports)
  persist(reports)
  return { report, error: null }
}

function recomputeClusters(reports) {
  const windowStart = Date.now() - 90 * 86400000
  const groups = new Map()
  for (const r of reports) {
    if (r.status !== 'unverified') continue
    const key = `${r.department_code}|${r.state}|${normalizeService(r.service || '')}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  }
  for (const group of groups.values()) {
    if (group.length < 3) continue
    const sorted = group
      .map((r) => new Date(r.created_at).getTime())
      .sort((a, b) => a - b)
    const withinWindow =
      sorted.length >= 3 &&
      sorted.some((t, i) => i + 2 < sorted.length && sorted[i + 2] - t <= 90 * 86400000)
    if (withinWindow && sorted[0] >= windowStart) {
      for (const r of group) r.status = 'pending_review'
    }
  }
}

export function markClusterVerifiedDemo(departmentCode, state, service) {
  const reports = getReports()
  for (const r of reports) {
    if (
      r.status === 'pending_review' &&
      r.department_code === departmentCode &&
      r.state === state &&
      normalizeService(r.service || '') === normalizeService(service)
    ) {
      r.status = 'verified'
    }
  }
  persist(reports)
}
