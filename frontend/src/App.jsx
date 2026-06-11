import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'
import * as Sentry from '@sentry/react'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminLayout from './components/admin/AdminLayout'
import ErrorFallback from './components/ErrorFallback'

// ── Wire up Sentry's React Router integration (tracks route-level performance) ─
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.addIntegration(
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: window.__sentryReactUseEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    })
  )
}

// Public pages
const Home           = lazy(() => import('./pages/portfolio/Home'))
const About          = lazy(() => import('./pages/portfolio/About'))
const Education      = lazy(() => import('./pages/portfolio/Education'))
const Projects       = lazy(() => import('./pages/portfolio/Projects'))
const Certifications = lazy(() => import('./pages/portfolio/Certifications'))
const Contact        = lazy(() => import('./pages/portfolio/Contact'))

// Admin pages
const AdminLogin           = lazy(() => import('./pages/admin/Login'))
const AdminDashboard       = lazy(() => import('./pages/admin/Dashboard'))
const ManageProfile        = lazy(() => import('./pages/admin/ManageProfile'))
const ManageProjects       = lazy(() => import('./pages/admin/ManageProjects'))
const ManageCertifications = lazy(() => import('./pages/admin/ManageCertifications'))
const ManageEducation      = lazy(() => import('./pages/admin/ManageEducation'))
const ManageSkills         = lazy(() => import('./pages/admin/ManageSkills'))
const Messages             = lazy(() => import('./pages/admin/Messages'))

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function PortfolioLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => <ErrorFallback error={error} resetError={resetError} />}
      showDialog={false}
    >
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1f36', color: '#e2e8f0', border: '1px solid #7C3AED' },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Portfolio Routes */}
            <Route path="/"               element={<PortfolioLayout><Home /></PortfolioLayout>} />
            <Route path="/about"          element={<PortfolioLayout><About /></PortfolioLayout>} />
            <Route path="/education"      element={<PortfolioLayout><Education /></PortfolioLayout>} />
            <Route path="/projects"       element={<PortfolioLayout><Projects /></PortfolioLayout>} />
            <Route path="/certifications" element={<PortfolioLayout><Certifications /></PortfolioLayout>} />
            <Route path="/contact"        element={<PortfolioLayout><Contact /></PortfolioLayout>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard"      element={<AdminDashboard />} />
              <Route path="profile"        element={<ManageProfile />} />
              <Route path="projects"       element={<ManageProjects />} />
              <Route path="certifications" element={<ManageCertifications />} />
              <Route path="education"      element={<ManageEducation />} />
              <Route path="skills"         element={<ManageSkills />} />
              <Route path="messages"       element={<Messages />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  )
}
