import { normalizeService } from './format.js'

function groupBy(reports, keyFn) {
  const map = new Map()
  for (const r of reports) {
    const key = keyFn(r)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }
  return map
}

function avgBribe(rs) {
  const withAmount = rs.filter((r) => r.bribe_amount != null && r.bribe_amount !== '')
  if (withAmount.length === 0) return null
  return (
    withAmount.reduce((s, r) => s + Number(r.bribe_amount), 0) / withAmount.length
  )
}

export function computeStats(reports) {
  return {
    total: reports.length,
    statesCovered: new Set(reports.map((r) => r.state)).size,
    departmentsCovered: new Set(reports.map((r) => r.department_code)).size,
  }
}

export function computeStateAggregates(reports) {
  const out = []
  for (const [state, rs] of groupBy(reports, (r) => r.state)) {
    out.push({
      state,
      total: rs.length,
      verified: rs.filter((r) => r.status === 'verified').length,
      pending: rs.filter((r) => r.status === 'pending_review').length,
      unverified: rs.filter((r) => r.status === 'unverified').length,
    })
  }
  out.sort((a, b) => b.total - a.total)
  return out
}

export function computeStateDetail(reports, state) {
  const rs = reports.filter((r) => r.state === state)
  const latest = [...rs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
  return {
    stats: {
      total: rs.length,
      pending: rs.filter((r) => r.status === 'pending_review').length,
      verified: rs.filter((r) => r.status === 'verified').length,
    },
    latest,
  }
}

export function computeDepartments(reports) {
  const out = []
  for (const [code, rs] of groupBy(reports, (r) => r.department_code)) {
    const serviceCounts = new Map()
    for (const r of rs) {
      const s = r.service || ''
      serviceCounts.set(s, (serviceCounts.get(s) || 0) + 1)
    }
    let mostCommon = null
    let max = 0
    for (const [s, c] of serviceCounts) {
      if (c > max) {
        max = c
        mostCommon = s
      }
    }
    out.push({
      code,
      reports: rs.length,
      avgBribe: avgBribe(rs),
      mostCommon,
    })
  }
  out.sort((a, b) => b.reports - a.reports)
  return out.map((d, i) => ({ ...d, rank: i + 1 }))
}

export function computeDepartmentDetail(reports, code) {
  const rs = reports.filter((r) => r.department_code === code)
  const byMonth = new Map()
  for (const r of rs) {
    const key = `${r.approx_year}-${String(r.approx_month).padStart(2, '0')}`
    byMonth.set(key, (byMonth.get(key) || 0) + 1)
  }
  const trend = [...byMonth.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => (a.month < b.month ? -1 : 1))

  const stateCounts = new Map()
  for (const r of rs) {
    stateCounts.set(r.state, (stateCounts.get(r.state) || 0) + 1)
  }
  const topStates = [...stateCounts.entries()]
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return { trend, topStates }
}

export function computeDistricts(reports) {
  const out = []
  for (const [, rs] of groupBy(
    reports,
    (r) => `${r.district || 'Unknown'}||${r.state}`
  )) {
    out.push({
      district: rs[0] ? rs[0].district || 'Unknown' : 'Unknown',
      state: rs[0] ? rs[0].state : '',
      reports: rs.length,
      avgBribe: avgBribe(rs),
    })
  }
  out.sort((a, b) => b.reports - a.reports)
  return out.map((d, i) => ({ ...d, rank: i + 1 }))
}

export function computeAnalytics(reports) {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-US', { month: 'short' }),
    })
  }
  const byMonth = new Map()
  for (const r of reports) {
    const d = new Date(r.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth.set(key, (byMonth.get(key) || 0) + 1)
  }
  const monthly = months.map((m) => ({
    month: m.label,
    count: byMonth.get(m.key) || 0,
  }))

  const deptCounts = new Map()
  for (const r of reports) {
    deptCounts.set(r.department_code, (deptCounts.get(r.department_code) || 0) + 1)
  }
  const topDepartments = [...deptCounts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return { monthly, topDepartments }
}

export function entityStats(reports, kind, value) {
  const byState = kind === 'state' || kind === 'states'
  const rs = reports.filter((r) =>
    byState ? r.state === value : r.department_code === value
  )
  const refused = rs.filter((r) => r.report_type === 'refused_to_pay')
  const bribeTotal = rs.reduce(
    (s, r) => s + (r.bribe_amount != null ? Number(r.bribe_amount) : 0),
    0
  )
  return {
    label: value,
    total: rs.length,
    avgBribe: avgBribe(rs),
    refusalSuccess:
      rs.length === 0 ? 0 : Math.round((refused.length / rs.length) * 100),
    bribeTotal,
  }
}

export function computePendingClusters(reports) {
  const groups = groupBy(
    reports.filter((r) => r.status === 'pending_review'),
    (r) =>
      `${r.department_code}|${r.state}|${normalizeService(r.service || '')}`
  )
  const out = []
  for (const [key, rs] of groups) {
    if (rs.length < 3) continue
    const [department_code, state, service] = key.split('|')
    out.push({ department_code, state, service, report_count: rs.length })
  }
  out.sort((a, b) => b.report_count - a.report_count)
  return out
}
