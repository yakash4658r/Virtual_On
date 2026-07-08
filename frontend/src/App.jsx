import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ToastProvider from './components/common/Toast'
import { useAuth } from './hooks/useAuth'

// Layouts
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

// Public Pages
import HomePage from './pages/public/HomePage'
import CatalogPage from './pages/public/CatalogPage'
import ProductDetailPage from './pages/public/ProductDetailPage'
import CartPage from './pages/public/CartPage'
import TryOnPage from './pages/public/TryOnPage'
import TryOnResultPage from './pages/public/TryOnResultPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage'
import ProductListPage from './pages/admin/ProductListPage'
import ProductAddPage from './pages/admin/ProductAddPage'
import ProductEditPage from './pages/admin/ProductEditPage'
import BarcodeListPage from './pages/admin/BarcodeListPage'
import TryOnHistoryPage from './pages/admin/TryOnHistoryPage'
import CategoryManagePage from './pages/admin/CategoryManagePage'
import StoreSettingsPage from './pages/admin/StoreSettingsPage'

import './App.css'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected customer routes */}
        <Route path="/cart" element={
          <ProtectedRoute><CartPage /></ProtectedRoute>
        } />
        <Route path="/tryon" element={
          <ProtectedRoute><TryOnPage /></ProtectedRoute>
        } />
        <Route path="/tryon/result/:sessionId" element={
          <ProtectedRoute><TryOnResultPage /></ProtectedRoute>
        } />
      </Route>

      {/* Admin routes with AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/products" element={<ProductListPage />} />
        <Route path="/admin/products/add" element={<ProductAddPage />} />
        <Route path="/admin/products/edit/:id" element={<ProductEditPage />} />
        <Route path="/admin/barcodes" element={<BarcodeListPage />} />
        <Route path="/admin/tryon-history" element={<TryOnHistoryPage />} />
        <Route path="/admin/categories" element={<CategoryManagePage />} />
        <Route path="/admin/settings" element={<StoreSettingsPage />} />
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