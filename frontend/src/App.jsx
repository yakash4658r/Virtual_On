import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ToastProvider from './components/common/Toast'
import { useAuth } from './hooks/useAuth'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import MirrorLayout from './layouts/MirrorLayout'
import SuperAdminLayout from './layouts/SuperAdminLayout'

// Super Admin Pages
import StoresDashboard from './pages/superadmin/StoresDashboard'
import CreateEditStore from './pages/superadmin/CreateEditStore'
import DeviceRegistration from './pages/superadmin/DeviceRegistration'
import GlobalAnalytics from './pages/superadmin/GlobalAnalytics'

// Public Pages (Repurposed as Entry)
import MirrorEntryPage from './pages/public/MirrorEntryPage'

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage'
import ProductListPage from './pages/admin/ProductListPage'
import ProductAddPage from './pages/admin/ProductAddPage'
import ProductEditPage from './pages/admin/ProductEditPage'
import BarcodeListPage from './pages/admin/BarcodeListPage'
import TryOnHistoryPage from './pages/admin/TryOnHistoryPage'
import AnalyticsDashboardPage from './pages/admin/AnalyticsDashboardPage'
import SessionGalleryPage from './pages/admin/SessionGalleryPage'
import DeviceManagePage from './pages/admin/DeviceManagePage'
import CategoryManagePage from './pages/admin/CategoryManagePage'
import StoreSettingsPage from './pages/admin/StoreSettingsPage'

// Mirror Kiosk Pages
import WelcomeScreen from './pages/mirror/WelcomeScreen'
import BarcodeSearchScreen from './pages/mirror/BarcodeSearchScreen'
import SareeDetailScreen from './pages/mirror/SareeDetailScreen'
import CameraScreen from './pages/mirror/CameraScreen'
import PhotoPreviewScreen from './pages/mirror/PhotoPreviewScreen'
import ProcessingScreen from './pages/mirror/ProcessingScreen'
import ResultScreen from './pages/mirror/ResultScreen'

import './App.css'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

// SuperAdmin Protected Route
function SuperAdminRoute({ children }) {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated || !isSuperAdmin) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { isAuthenticated, isSuperAdmin } = useAuth()

  return (
    <Routes>
      {/* Root Entry Route */}
      <Route path="/" element={
        isAuthenticated 
          ? (isSuperAdmin ? <Navigate to="/superadmin" replace /> : <Navigate to={`/mirror/${localStorage.getItem('deviceId') || 'default'}`} replace />)
          : <MirrorEntryPage />
      } />

      {/* ========== MIRROR KIOSK ROUTES (Protected by Store Admin Role) ========== */}
      <Route path="/mirror/:deviceId" element={<ProtectedRoute><MirrorLayout /></ProtectedRoute>}>
        <Route index element={<WelcomeScreen />} />
        <Route path="search" element={<BarcodeSearchScreen />} />
        <Route path="saree" element={<SareeDetailScreen />} />
        <Route path="camera" element={<CameraScreen />} />
        <Route path="preview" element={<PhotoPreviewScreen />} />
        <Route path="processing" element={<ProcessingScreen />} />
        <Route path="result" element={<ResultScreen />} />
      </Route>

      {/* ========== ADMIN ROUTES ========== */}
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="/admin/sessions" element={<SessionGalleryPage />} />
        <Route path="/admin/devices" element={<DeviceManagePage />} />
        <Route path="/admin/products" element={<ProductListPage />} />
        <Route path="/admin/products/add" element={<ProductAddPage />} />
        <Route path="/admin/products/edit/:id" element={<ProductEditPage />} />
        <Route path="/admin/barcodes" element={<BarcodeListPage />} />
        <Route path="/admin/tryon-history" element={<TryOnHistoryPage />} />
        <Route path="/admin/categories" element={<CategoryManagePage />} />
        <Route path="/admin/settings" element={<StoreSettingsPage />} />
      </Route>

      {/* ========== SUPER ADMIN ROUTES ========== */}
      <Route element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
        <Route path="/superadmin" element={<StoresDashboard />} />
        <Route path="/superadmin/stores" element={<StoresDashboard />} />
        <Route path="/superadmin/stores/new" element={<CreateEditStore />} />
        <Route path="/superadmin/devices" element={<DeviceRegistration />} />
        <Route path="/superadmin/analytics" element={<GlobalAnalytics />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastProvider />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App