import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/layout/ScrollToTop'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PageLoader from './components/ui/PageLoader'
import styles from './App.module.css'

// Lazy-loaded public pages
const HomePage       = lazy(() => import('./pages/HomePage'))
const AboutPage      = lazy(() => import('./pages/AboutPage'))
const ProgramsPage   = lazy(() => import('./pages/ProgramsPage'))
const ImpactPage     = lazy(() => import('./pages/ImpactPage'))
const GetInvolvedPage = lazy(() => import('./pages/GetInvolvedPage'))
const NewsPage       = lazy(() => import('./pages/NewsPage'))
const ContactPage    = lazy(() => import('./pages/ContactPage'))

// Lazy-loaded admin pages
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminNews       = lazy(() => import('./pages/admin/AdminNews'))
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions'))

export default function App() {
  return (
    <div className={styles.app}>
      <ScrollToTop />
      <Routes>
        {/* Admin routes (no Navbar/Footer) */}
        <Route path="/admin/login" element={
          <Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/news" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}><AdminNews /></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/submissions" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}><AdminSubmissions /></Suspense>
          </ProtectedRoute>
        } />

        {/* Public routes (with Navbar/Footer) */}
        <Route path="/*" element={
          <div className={styles.publicLayout}>
            <Navbar />
            <main className={styles.main}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/"             element={<HomePage />} />
                  <Route path="/about"        element={<AboutPage />} />
                  <Route path="/programs"     element={<ProgramsPage />} />
                  <Route path="/impact"       element={<ImpactPage />} />
                  <Route path="/get-involved" element={<GetInvolvedPage />} />
                  <Route path="/news"         element={<NewsPage />} />
                  <Route path="/contact"      element={<ContactPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </div>
  )
}
