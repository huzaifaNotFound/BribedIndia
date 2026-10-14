import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'
import { getAllReports } from '../lib/data.js'
import { computeAnalytics } from '../lib/aggregate.js'
import { DEPARTMENT_MAP } from '../lib/constants.js'
import PageHeader from '../components/PageHeader.jsx'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAllReports()
      .then((reports) => {
        if (!active) return
        setData(
          computeAnalytics(reports.filter((r) => r.status === 'verified'))
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading || !data) {
    return (
      <div>
        <PageHeader eyebrow="Analytics" title="Analytics" />
        <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted">Loading…</p>
      </div>
    )
  }

  const topDeptData = data.topDepartments.map((d) => ({
    name: DEPARTMENT_MAP[d.code]?.name || d.code,
    count: d.count,
  }))

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Analytics"
        intro="Verified reports only. Reports filed per month over the last six months, and the five most-reported departments."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="panel p-6">
            <p className="label-upper">Reports filed per month</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthly} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
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
                    contentStyle={{
                      background: '#F5F3EF',
                      border: '1px solid #E0DED8',
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Reports"
                    stroke="#1A1A1A"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel p-6">
            <p className="label-upper">Top 5 departments by reports</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topDeptData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#6F6B64' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tick={{ fontSize: 11, fill: '#1A1A1A' }}
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
                  <Bar dataKey="count" name="Reports" fill="#1A1A1A" barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
