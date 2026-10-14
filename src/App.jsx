import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const ReportWizard = lazy(() => import('./pages/ReportWizard.jsx'))
const Departments = lazy(() => import('./pages/Departments.jsx'))
const Districts = lazy(() => import('./pages/Districts.jsx'))
const Compare = lazy(() => import('./pages/Compare.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const CaseStudies = lazy(() => import('./pages/CaseStudies.jsx'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <ScrollToTop />
      <Nav />
      <main className="flex-1">
        <Suspense
          fallback={
            <p className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-muted">
              Loading…
            </p>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportWizard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/districts" element={<Districts />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
