import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DISTRICTS_BY_STATE } from '../src/lib/districts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outJs = path.join(root, 'src', 'lib', 'seedData.js')
const outSql = path.join(root, 'supabase', 'seed_reports.sql')

const DISTRICTS = DISTRICTS_BY_STATE

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260829)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]

const SERVICES = {
  P: ['Traffic challan settlement', 'FIR filing', 'Complaint registration', 'Property dispute case', 'Traffic fine waiver', 'Police verification certificate'],
  R: ['Driving license renewal', 'Vehicle registration', 'Learner license', 'RC transfer', 'Duplicate license', 'Insurance token'],
  MC: ['Building plan approval', 'Property tax assessment', 'Trade license', 'Shop establishment', 'Water connection', 'Garbage clearance'],
  RV: ['Land mutation', 'Patta transfer', 'Encumbrance certificate', 'Survey records', 'Property valuation', 'Land records copy'],
  PC: ['Passport application', 'Passport renewal', 'Police verification'],
  IT: ['Tax refund', 'Assessment notice', 'PAN correction', 'Scrutiny reply'],
  'F&D': ['Drug license', 'Food license renewal', 'Shop inspection', 'Sampling clearance'],
  EB: ['New connection', 'Bill correction', 'Meter replacement', 'Load enhancement'],
  T: ['Court document attestation', 'Bank certificate', 'Hospital records', 'Aadhaar correction'],
}

const DESCRIPTIONS = [
  'Asked to pay an extra amount to get the work done faster.',
  'The file moved only after money changed hands.',
  'Was told there would be a delay unless payment was made.',
  'Had to pay a junior clerk a fixed amount for the approval.',
  'No receipt was given for the additional amount.',
  'The standard process was stalled until a payment was made.',
  'A middleman demanded a cut before forwarding the application.',
  'The official quoted a rate for the service that was not published.',
]

const STATE_COUNTS = {
  'Uttar Pradesh': 61,
  Maharashtra: 52,
  Bihar: 40,
  Karnataka: 38,
  Delhi: 33,
  Rajasthan: 30,
  'West Bengal': 27,
  'Tamil Nadu': 24,
  'Madhya Pradesh': 22,
  Telangana: 20,
  'Andhra Pradesh': 19,
  Gujarat: 18,
  Punjab: 16,
  Haryana: 15,
  Odisha: 13,
  Kerala: 11,
  Jharkhand: 10,
  Assam: 10,
  Chhattisgarh: 8,
  Uttarakhand: 7,
  'Jammu and Kashmir': 6,
  'Himachal Pradesh': 5,
  Tripura: 4,
  Goa: 4,
  Chandigarh: 4,
  Meghalaya: 3,
  Manipur: 3,
  Mizoram: 3,
  Nagaland: 3,
  Sikkim: 2,
  'Arunachal Pradesh': 2,
  Puducherry: 2,
  Ladakh: 2,
  'Andaman and Nicobar Islands': 1,
  Lakshadweep: 1,
  'Dadra and Nagar Haveli and Daman and Diu': 1,
}

const DEPT_WEIGHTS = [
  { code: 'P', w: 340 },
  { code: 'R', w: 240 },
  { code: 'MC', w: 200 },
  { code: 'RV', w: 140 },
  { code: 'PC', w: 30 },
  { code: 'IT', w: 25 },
  { code: 'F&D', w: 15 },
  { code: 'EB', w: 10 },
  { code: 'T', w: 10 },
]
const DEPT_WEIGHT_TOTAL = DEPT_WEIGHTS.reduce((s, d) => s + d.w, 0)

function pickDept() {
  let r = rand() * DEPT_WEIGHT_TOTAL
  for (const d of DEPT_WEIGHTS) {
    r -= d.w
    if (r <= 0) return d.code
  }
  return 'P'
}

const TOTAL = 520
const VERIFIED = 419
const UNVERIFIED = 67
const PENDING = TOTAL - VERIFIED - UNVERIFIED

const PENDING_CLUSTERS = [
  { state: 'Delhi', code: 'R', service: 'Driving license renewal', count: 6 },
  { state: 'Uttar Pradesh', code: 'R', service: 'Vehicle registration', count: 6 },
  { state: 'Maharashtra', code: 'MC', service: 'Building plan approval', count: 6 },
  { state: 'Bihar', code: 'P', service: 'FIR filing', count: 6 },
  { state: 'Karnataka', code: 'RV', service: 'Land mutation', count: 5 },
  { state: 'West Bengal', code: 'P', service: 'Traffic challan settlement', count: 5 },
]

function makeReport(state, status, approx, created, forced) {
  const code = forced ? forced.code : pickDept()
  const service = forced ? forced.service : pick(SERVICES[code])
  const reportType = rand() < 0.78 ? 'paid_bribe' : 'refused_to_pay'
  const hasAmount = reportType === 'paid_bribe' || rand() < 0.6
  const bribeAmount = hasAmount ? Math.round(rand() * rand() * 9000 + rand() * 400 + 200) : null
  const district = forced ? pick(DISTRICTS[forced.state]) : pick(DISTRICTS[state])
  return {
    id: null,
    report_type: reportType,
    department_code: code,
    department_other: code === 'T' ? 'Court document attestation' : null,
    state,
    district,
    service,
    approx_month: approx.getMonth() + 1,
    approx_year: approx.getFullYear(),
    bribe_amount: bribeAmount,
    description: pick(DESCRIPTIONS),
    has_evidence: rand() < 0.08,
    status,
    created_at: created.toISOString(),
  }
}

function buildReports() {
  const reports = []
  const now = Date.now()

  const assignDates = (statusCount, status) => {
    const list = []
    for (let i = 0; i < statusCount; i += 1) {
      const back = Math.floor((1 - Math.pow(rand(), 1.5)) * 425) + 2
      const created = new Date(now - back * 86400000)
      const approx = new Date(created.getTime() - Math.floor(rand() * 45 + 1) * 86400000)
      list.push({ status, created, approx })
    }
    return list
  }

  const verifiedDates = assignDates(VERIFIED, 'verified')
  const unverifiedDates = assignDates(UNVERIFIED, 'unverified')
  const pendingDates = assignDates(PENDING, 'pending_review')

  const stateOrder = Object.keys(STATE_COUNTS)
  let slot = 0
  for (const state of stateOrder) {
    const count = STATE_COUNTS[state]
    for (let i = 0; i < count; i += 1) {
      if (slot < VERIFIED) {
        const d = verifiedDates[slot]
        reports.push(makeReport(state, d.status, d.approx, d.created, null))
      } else if (slot < VERIFIED + UNVERIFIED) {
        const d = unverifiedDates[slot - VERIFIED]
        reports.push(makeReport(state, d.status, d.approx, d.created, null))
      } else {
        const idx = slot - VERIFIED - UNVERIFIED
        const d = pendingDates[idx]
        const cur = PENDING_CLUSTERS[idx % PENDING_CLUSTERS.length]
        const forced = { state: cur.state, code: cur.code, service: cur.service }
        reports.push(makeReport(forced.state, d.status, d.approx, d.created, forced))
      }
      slot += 1
    }
  }
  return reports
}

const reports = buildReports()

function toSqlValue(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return "'" + String(v).replace(/'/g, "''") + "'"
}

let jsLines = '// Generated by scripts/generate-seed.mjs. Do not edit by hand.\nexport const seedReports = [\n'
for (const r of reports) {
  jsLines += '  ' + JSON.stringify(r) + ',\n'
}
jsLines += ']\n'

const sqlHeader = `-- Generated by scripts/generate-seed.mjs. Do not edit by hand.\n-- Insert before demo; 520 reports: 419 verified, 67 unverified, 34 pending_review.\n\ninsert into reports (report_type, department_code, department_other, state, district, service, approx_month, approx_year, bribe_amount, description, has_evidence, status, created_at)\nvalues\n`
const sqlRows = reports.map((r) => {
  const vals = [r.report_type, r.department_code, r.department_other, r.state, r.district, r.service, r.approx_month, r.approx_year, r.bribe_amount, r.description, r.has_evidence, r.status, r.created_at]
  return '(' + vals.map(toSqlValue).join(', ') + ')'
}).join(',\n')

fs.writeFileSync(outJs, jsLines)
fs.writeFileSync(outSql, sqlHeader + sqlRows + ';\n')

console.log(`Wrote ${reports.length} reports`)
console.log(`  verified: ${reports.filter((r) => r.status === 'verified').length}`)
console.log(`  unverified: ${reports.filter((r) => r.status === 'unverified').length}`)
console.log(`  pending_review: ${reports.filter((r) => r.status === 'pending_review').length}`)
console.log(`  states: ${new Set(reports.map((r) => r.state)).size}`)
