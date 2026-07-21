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
import VirtualStudioPage from './pages/admin/VirtualStudioPage'
import ProductListPage from './pages/admin/ProductListPage'
import ProductAddPage from './pages/admin/ProductAddPage'
import ProductEditPage from './pages/admin/ProductEditPage'
import BarcodeListPage from './pages/admin/BarcodeListPage'
import AnalyticsDashboardPage from './pages/admin/AnalyticsDashboardPage'
import SessionGalleryPage from './pages/admin/SessionGalleryPage'
import CategoryManagePage from './pages/admin/CategoryManagePage'
import StoreSettingsPage from './pages/admin/StoreSettingsPage'

// Kiosk Pages
import KioskLayout from './pages/kiosk/KioskLayout'
import KioskWelcomeScreen from './pages/kiosk/KioskWelcomeScreen'
import KioskCameraScreen from './pages/kiosk/KioskCameraScreen'
import KioskTryOnScreen from './pages/kiosk/KioskTryOnScreen'
import KioskSummaryScreen from './pages/kiosk/KioskSummaryScreen'

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
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/" replace />
  // Strict block: Super admin cannot access store admin panel
  if (user?.role === 'super_admin') return <Navigate to="/superadmin" replace />
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
          ? (isSuperAdmin ? <Navigate to="/superadmin" replace /> : <Navigate to="/admin" replace />)
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

      {/* ========== CUSTOMER KIOSK ROUTES ========== */}
      <Route element={<ProtectedRoute><KioskLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<KioskWelcomeScreen />} />
        <Route path="/admin/camera" element={<KioskCameraScreen />} />
        <Route path="/admin/tryon" element={<KioskTryOnScreen />} />
        <Route path="/admin/summary" element={<KioskSummaryScreen />} />
      </Route>

      {/* ========== STORE OWNER BACKEND ========== */}
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/manage" element={<DashboardPage />} />
        <Route path="/admin/manage/studio" element={<VirtualStudioPage />} />
        <Route path="/admin/manage/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="/admin/manage/sessions" element={<SessionGalleryPage />} />
        <Route path="/admin/manage/products" element={<ProductListPage />} />
        <Route path="/admin/manage/products/add" element={<ProductAddPage />} />
        <Route path="/admin/manage/products/edit/:id" element={<ProductEditPage />} />
        <Route path="/admin/manage/barcodes" element={<BarcodeListPage />} />
        <Route path="/admin/manage/categories" element={<CategoryManagePage />} />
        <Route path="/admin/manage/settings" element={<StoreSettingsPage />} />
      </Route>

      {/* ========== SUPER ADMIN ROUTES ========== */}
      <Route element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
        <Route path="/superadmin" element={<StoresDashboard />} />
        <Route path="/superadmin/stores" element={<StoresDashboard />} />
        <Route path="/superadmin/stores/new" element={<CreateEditStore />} />
        <Route path="/superadmin/stores/edit/:id" element={<CreateEditStore />} />
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