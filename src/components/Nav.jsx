import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { SITE_NAME } from '../lib/constants.js'

const links = [
  { to: '/', label: 'Reports' },
  { to: '/departments', label: 'Departments' },
  { to: '/districts', label: 'Districts' },
  { to: '/compare', label: 'Compare' },
  { to: '/analytics', label: 'Analytics' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
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

        <div className="flex items-center gap-2">
          <Link to="/report" className="btn-primary px-3 sm:px-6">
            Report a Bribe
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center border border-line text-ink md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="flex flex-col border-t border-line md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `label-upper border-b border-line px-4 py-3 ${
                  isActive ? 'text-ink' : 'text-muted'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
