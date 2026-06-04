import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminLayout from './components/admin/AdminLayout'

// Public pages
const Home = lazy(() => import('./pages/portfolio/Home'))
const About = lazy(() => import('./pages/portfolio/About'))
const Education = lazy(() => import('./pages/portfolio/Education'))
const Projects = lazy(() => import('./pages/portfolio/Projects'))
const Certifications = lazy(() => import('./pages/portfolio/Certifications'))
const Contact = lazy(() => import('./pages/portfolio/Contact'))

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const ManageProfile = lazy(() => import('./pages/admin/ManageProfile'))
const ManageProjects = lazy(() => import('./pages/admin/ManageProjects'))
const ManageCertifications = lazy(() => import('./pages/admin/ManageCertifications'))
const ManageEducation = lazy(() => import('./pages/admin/ManageEducation'))
const ManageSkills = lazy(() => import('./pages/admin/ManageSkills'))
const Messages = lazy(() => import('./pages/admin/Messages'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
          <Route path="/" element={<PortfolioLayout><Home /></PortfolioLayout>} />
          <Route path="/about" element={<PortfolioLayout><About /></PortfolioLayout>} />
          <Route path="/education" element={<PortfolioLayout><Education /></PortfolioLayout>} />
          <Route path="/projects" element={<PortfolioLayout><Projects /></PortfolioLayout>} />
          <Route path="/certifications" element={<PortfolioLayout><Certifications /></PortfolioLayout>} />
          <Route path="/contact" element={<PortfolioLayout><Contact /></PortfolioLayout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<ManageProfile />} />
            <Route path="projects" element={<ManageProjects />} />
            <Route path="certifications" element={<ManageCertifications />} />
            <Route path="education" element={<ManageEducation />} />
            <Route path="skills" element={<ManageSkills />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
