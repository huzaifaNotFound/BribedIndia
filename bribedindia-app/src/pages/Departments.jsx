import { Fragment, useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { getAllReports } from '../lib/data.js'
import {
  computeDepartments,
  computeDepartmentDetail,
} from '../lib/aggregate.js'
import { DEPARTMENT_MAP } from '../lib/constants.js'
import { formatRupees } from '../lib/format.js'
import PageHeader from '../components/PageHeader.jsx'
import DeptIcon from '../components/DeptIcon.jsx'

function TrendChart({ trend }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: '#E0DED8' }}
            tick={{ fontSize: 10, fill: '#6F6B64' }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: '#6F6B64' }}
          />
          <Tooltip
            contentStyle={{
              background: '#F5F3EF',
              border: '1px solid #E0DED8',
              borderRadius: 0,
              fontSize: 12,
            }}
            labelStyle={{ textTransform: 'capitalize' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#1A1A1A"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ExpandedDetail({ code }) {
  const [detail, setDetail] = useState(null)
  useEffect(() => {
    let active = true
    getAllReports().then((reports) => {
      if (!active) return
      setDetail(
        computeDepartmentDetail(
          reports.filter((r) => r.status === 'verified'),
          code
        )
      )
    })
    return () => {
      active = false
    }
  }, [code])
  if (!detail) {
    return <p className="py-6 text-sm text-muted">Loading…</p>
  }
  return (
    <div className="grid gap-8 py-6 md:grid-cols-2">
      <div>
        <p className="label-upper-muted">Trend over time</p>
        <div className="mt-3">
          <TrendChart trend={detail.trend} />
        </div>
      </div>
      <div>
        <p className="label-upper-muted">Top states by reports</p>
        <div className="mt-3 divide-y divide-line">
          {detail.topStates.map((s) => (
            <div key={s.state} className="flex items-center justify-between py-2">
              <span className="text-sm">{s.state}</span>
              <span className="text-sm tabular-nums">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Departments() {
  const [rows, setRows] = useState([])
  const [sort, setSort] = useState('reports')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAllReports()
      .then((reports) => {
        if (!active) return
        setRows(
          computeDepartments(reports.filter((r) => r.status === 'verified'))
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const sorted = [...rows].sort((a, b) =>
    sort === 'bribes'
      ? (b.avgBribe ?? -1) - (a.avgBribe ?? -1)
      : b.reports - a.reports
  )

  return (
    <div>
      <PageHeader
        eyebrow="Institutions"
        title="Departments"
        intro="Verified reports only. Every department reported to, ranked by report volume. Click a row to see its trend over time and its most-reported states."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex gap-6">
          {[
            ['reports', 'Most Reports'],
            ['bribes', 'Highest Bribes'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSort(value)}
              className={`label-upper pb-1 ${
                sort === value
                  ? 'border-b-2 border-ink text-ink'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 panel">
          {loading ? (
            <p className="p-6 text-sm text-muted">Loading…</p>
          ) : (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="w-14">Rank</th>
                  <th>Department</th>
                  <th className="num">Reports</th>
                  <th className="num">Avg Bribe</th>
                  <th>Most Common</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const dept = DEPARTMENT_MAP[row.code]
                  const isOpen = expanded === row.code
                  return (
                    <Fragment key={row.code}>
                      <tr
                        className="cursor-pointer"
                        onClick={() => setExpanded(isOpen ? null : row.code)}
                      >
                        <td className="text-muted tabular-nums">{row.rank}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center border border-line">
                              <DeptIcon code={row.code} size={16} />
                            </span>
                            <div>
                              <p className="text-sm font-semibold">{dept?.name || row.code}</p>
                              <p className="text-xs text-muted">{dept?.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="num tabular-nums">{row.reports.toLocaleString('en-IN')}</td>
                        <td className="num tabular-nums">{formatRupees(row.avgBribe)}</td>
                        <td className="text-sm text-muted">{row.mostCommon || '—'}</td>
                        <td>
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </td>
                      </tr>
                      {isOpen ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="px-4">
                              <ExpandedDetail code={row.code} />
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
