import { Link, NavLink } from 'react-router-dom'
import { SITE_NAME } from '../lib/constants.js'

const links = [
  { to: '/', label: 'Reports' },
  { to: '/departments', label: 'Departments' },
  { to: '/districts', label: 'Districts' },
  { to: '/compare', label: 'Compare' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-serif italic text-xl text-ink">
          {SITE_NAME}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `label-upper pb-1 ${
                  isActive
                    ? 'border-b border-ink text-ink'
                    : 'text-muted hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/report" className="btn-primary">
          Report a Bribe
        </Link>
      </div>
    </header>
  )
}
