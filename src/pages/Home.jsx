import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllReports } from '../lib/data.js'
import {
  computeStats,
  computeStateAggregates,
  computeStateDetail,
} from '../lib/aggregate.js'
import { TAGLINE, CREDIBILITY_NOTE } from '../lib/constants.js'
import { formatRupees, relativeDate } from '../lib/format.js'
import IndiaMap from '../components/IndiaMap.jsx'
import StatStrip from '../components/StatStrip.jsx'
import StatusTag from '../components/StatusTag.jsx'
import DeptIcon from '../components/DeptIcon.jsx'

function MapLegend({ max }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <span className="label-upper-muted">Fewer reports</span>
      <div
        className="h-2.5 w-56"
        style={{ background: 'linear-gradient(90deg, #F5F3EF 0%, #1A1A1A 100%)' }}
      />
      <span className="label-upper-muted">More reports</span>
      <span className="text-xs text-muted">
        0 – {max.toLocaleString('en-IN')} per state
      </span>
    </div>
  )
}

function HowItWorks() {
  const strips = [
    {
      title: 'Filing a report',
      steps: [
        ['01', 'Anonymous', 'File in 60 seconds, no account.'],
        ['02', 'Structured', 'Select department, describe what happened.'],
        ['03', 'Public', 'Added to the live map instantly.'],
      ],
    },
    {
      title: 'How reports get verified',
      steps: [
        ['01', 'Unverified', 'Every new report starts here.'],
        ['02', 'Pending Review', '3+ matching reports trigger a review.'],
        ['03', 'Verified', 'An admin manually confirms the pattern.'],
      ],
    },
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <h2 className="h-serif text-2xl sm:text-3xl">How It Works</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {strips.map((strip) => (
          <div key={strip.title} className="panel p-6">
            <h3 className="label-upper">{strip.title}</h3>
            <div className="mt-5 space-y-5">
              {strip.steps.map(([num, title, body]) => (
                <div key={num} className="flex gap-4">
                  <span className="h-serif text-xl">{num}</span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 border-l-2 border-accent bg-accent/10 px-4 py-3">
        <p className="text-sm leading-relaxed text-ink">{CREDIBILITY_NOTE}</p>
      </div>
    </section>
  )
}

function InfoPanel({ stateName, detail }) {
  const title = stateName || 'India'
  const blocks = [
    ['Total Reports', detail.stats.total],
    ['Pending Review', detail.stats.pending],
    ['Verified', detail.stats.verified],
  ]
  return (
    <div className="panel p-6">
      <h3 className="h-serif text-2xl">{title}</h3>
      <div className="mt-5 grid grid-cols-3 divide-x divide-line border-y border-line">
        {blocks.map(([label, value]) => (
          <div key={label} className="py-2 first:pr-2 [&:not(:first-child)]:px-2 last:pl-2 sm:py-3 sm:first:pr-3 sm:[&:not(:first-child)]:px-3 sm:last:pl-3">
            <p className="h-serif text-lg sm:text-2xl">{value.toLocaleString('en-IN')}</p>
            <p className="label-upper-muted mt-1 text-[0.55rem] sm:text-[0.6875rem]">{label}</p>
          </div>
        ))}
      </div>
      <p className="label-upper mt-6">Latest Reports</p>
      <div className="mt-2 divide-y divide-line">
        {detail.latest.length === 0 ? (
          <p className="py-3 text-sm text-muted">No reports yet.</p>
        ) : (
          detail.latest.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center border border-line">
                  <DeptIcon code={r.department_code} size={14} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{r.department_code}</p>
                  <p className="text-xs text-muted">{relativeDate(r.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums">{formatRupees(r.bribe_amount)}</span>
                <StatusTag status={r.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [reports, setReports] = useState([])
  const [stateAggregates, setStateAggregates] = useState([])
  const [stats, setStats] = useState({ total: 0, statesCovered: 0, departmentsCovered: 0 })
  const [selectedState, setSelectedState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAllReports()
      .then((reports) => {
        if (!active) return
        setReports(reports)
        setStats(computeStats(reports))
        setStateAggregates(computeStateAggregates(reports))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const detail = computeStateDetail(reports, selectedState)

  const handleSelectState = useCallback((s) => setSelectedState(s), [])

  const maxReports = Math.max(0, ...stateAggregates.map((s) => s.total))

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-10 text-center sm:py-16">
        <p className="label-upper-muted">BribedIndia · Public record of reported bribery</p>
        <h1 className="h-serif mt-3 text-4xl sm:text-5xl md:text-6xl">TRANSPARENCY MAP</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted sm:text-base">
          Explore state-level corruption. Click a state to see verified patterns and
          recent reports.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-muted italic">
          {TAGLINE}
        </p>
      </section>

      {loading ? (
        <p className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted">
          Loading the public record…
        </p>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div>
                <div className="panel p-2 sm:p-4">
                  <IndiaMap
                    stateData={stateAggregates}
                    selectedState={selectedState}
                    onSelectState={handleSelectState}
                  />
                </div>
                <MapLegend max={maxReports} />
              </div>
              <div>
                <InfoPanel stateName={selectedState} detail={detail} />
              </div>
            </div>
          </section>

          <StatStrip stats={stats} />

          <HowItWorks />

          <section className="border-t border-line">
            <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:py-16">
              <h2 className="h-serif text-2xl sm:text-3xl">A file in 60 seconds can start a pattern.</h2>
              <div className="mt-6">
                <Link to="/report" className="btn-primary">
                  Report a Bribe
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
