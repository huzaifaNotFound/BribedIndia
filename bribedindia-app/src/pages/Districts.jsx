import { useEffect, useState } from 'react'
import { getAllReports } from '../lib/data.js'
import { computeDistricts } from '../lib/aggregate.js'
import { formatRupees } from '../lib/format.js'
import PageHeader from '../components/PageHeader.jsx'

export default function Districts() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAllReports()
      .then((reports) => {
        if (!active) return
        setRows(
          computeDistricts(reports.filter((r) => r.status === 'verified'))
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="Local"
        title="Districts"
        intro="Verified reports only. Districts are reported as free text and are not yet normalized, so the same place can appear under different spellings. We list them as reported, not as an official registry."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mt-6 panel overflow-x-auto">
          {loading ? (
            <p className="p-6 text-sm text-muted">Loading…</p>
          ) : (
            <table className="ledger-table min-w-[560px]">
              <thead>
                <tr>
                  <th className="w-14">Rank</th>
                  <th>District</th>
                  <th>State</th>
                  <th className="num">Reports</th>
                  <th className="num">Avg Bribe</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.district}-${row.state}`}>
                    <td className="text-muted tabular-nums">{row.rank}</td>
                    <td className="font-medium">{row.district}</td>
                    <td className="text-sm text-muted">{row.state}</td>
                    <td className="num tabular-nums">{row.reports.toLocaleString('en-IN')}</td>
                    <td className="num tabular-nums">{formatRupees(row.avgBribe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
