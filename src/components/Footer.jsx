import { Link } from 'react-router-dom'
import { SITE_NAME, CREDIBILITY_NOTE } from '../lib/constants.js'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="font-serif italic text-xl text-ink">{SITE_NAME}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{CREDIBILITY_NOTE}</p>
          </div>
          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <p className="label-upper-muted">Platform</p>
              <Link to="/" className="text-ink hover:opacity-70">Reports</Link>
              <Link to="/departments" className="text-ink hover:opacity-70">Departments</Link>
              <Link to="/districts" className="text-ink hover:opacity-70">Districts</Link>
              <Link to="/compare" className="text-ink hover:opacity-70">Compare</Link>
              <Link to="/analytics" className="text-ink hover:opacity-70">Analytics</Link>
              <Link to="/case-studies" className="text-ink hover:opacity-70">Case Study</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="label-upper-muted">Methodology</p>
              <span className="text-muted">Unverified → Pending Review → Verified</span>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-line pt-4 text-xs text-muted">
          BribedIndia is a transparency prototype. Nothing here names an individual or
          claims that any person has been proven guilty.
        </p>
      </div>
    </footer>
  )
}
