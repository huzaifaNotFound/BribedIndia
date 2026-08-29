import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { getAllReports } from '../lib/data.js'
import { entityStats } from '../lib/aggregate.js'
import { DEPARTMENTS, STATES } from '../lib/constants.js'
import { formatRupees } from '../lib/format.js'
import PageHeader from '../components/PageHeader.jsx'

function StatCard({ title, value }) {
  return (
    <div className="border-t border-line pt-3">
      <p className="h-serif text-2xl">{value}</p>
      <p className="label-upper-muted mt-1">{title}</p>
    </div>
  )
}

export default function Compare() {
  const [reports, setReports] = useState([])
  const [kind, setKind] = useState('states')
  const [a, setA] = useState('Maharashtra')
  const [b, setB] = useState('Bihar')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAllReports()
      .then((r) => {
        if (!active) return
        setReports(r)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const changeKind = (next) => {
    const pool = next === 'states' ? STATES : DEPARTMENTS.map((d) => d.code)
    setKind(next)
    if (!pool.includes(a)) setA(pool[0])
    if (!pool.includes(b)) setB(pool[1])
  }

  const statA = useMemo(
    () => entityStats(reports.filter((r) => r.status === 'verified'), kind, a),
    [reports, kind, a]
  )
  const statB = useMemo(
    () => entityStats(reports.filter((r) => r.status === 'verified'), kind, b),
    [reports, kind, b]
  )

  const barData = [
    { name: a, reports: statA.total },
    { name: b, reports: statB.total },
  ]

  const label = (value) =>
    kind === 'states'
      ? value
      : DEPARTMENTS.find((d) => d.code === value)?.name || value

  const pool = kind === 'states' ? STATES : DEPARTMENTS.map((d) => d.code)

  return (
    <div>
      <PageHeader
        eyebrow="Compare"
        title="Compare"
        intro="Verified reports only. Put two entities side by side. Refusal success % is the share of reports that said they refused to pay."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {[
              ['states', 'Compare states'],
              ['departments', 'Compare departments'],
            ].map(([value, labelText]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeKind(value)}
                className={`label-upper px-4 py-2 border ${
                  kind === value
                    ? 'border-ink bg-ink text-white'
                    : 'border-line text-ink hover:border-ink'
                }`}
              >
                {labelText}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select
              className="input-field w-56"
              value={a}
              onChange={(e) => setA(e.target.value)}
            >
              {pool.map((v) => (
                <option key={v} value={v}>
                  {label(v)}
                </option>
              ))}
            </select>
            <span className="label-upper-muted">vs</span>
            <select
              className="input-field w-56"
              value={b}
              onChange={(e) => setB(e.target.value)}
            >
              {pool.map((v) => (
                <option key={v} value={v}>
                  {label(v)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-muted">Loading…</p>
        ) : (
          <div className="mt-10">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="panel p-6">
                <h3 className="label-upper">{label(a)}</h3>
                <div className="mt-5 space-y-5">
                  <StatCard title="Total Reports" value={statA.total.toLocaleString('en-IN')} />
                  <StatCard title="Avg Bribe" value={formatRupees(statA.avgBribe)} />
                  <StatCard title="Refusal Success %" value={`${statA.refusalSuccess}%`} />
                </div>
              </div>
              <div className="panel p-6">
                <h3 className="label-upper">{label(b)}</h3>
                <div className="mt-5 space-y-5">
                  <StatCard title="Total Reports" value={statB.total.toLocaleString('en-IN')} />
                  <StatCard title="Avg Bribe" value={formatRupees(statB.avgBribe)} />
                  <StatCard title="Refusal Success %" value={`${statB.refusalSuccess}%`} />
                </div>
              </div>
            </div>

            <div className="mt-10">
              <p className="label-upper">Report count</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: '#E0DED8' }}
                      tick={{ fontSize: 11, fill: '#6F6B64' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#6F6B64' }}
                    />
                    <Tooltip
                      cursor={{ fill: '#E0DED8' }}
                      contentStyle={{
                        background: '#F5F3EF',
                        border: '1px solid #E0DED8',
                        borderRadius: 0,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="reports" fill="#1A1A1A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
